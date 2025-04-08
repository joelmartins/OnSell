<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Campaign;
use App\Models\CampaignMessage;
use App\Jobs\ProcessCampaign;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class CampaignController extends Controller
{
    /**
     * Listar todas as campanhas.
     */
    public function index(Request $request)
    {
        $status = $request->status;
        $query = Campaign::query();
        
        if ($status) {
            $query->withStatus($status);
        }
        
        $campaigns = $query->withCount(['campaignMessages', 'campaignMessages as sent_count' => function($query) {
                $query->where('status', 'sent');
            }, 'campaignMessages as delivered_count' => function($query) {
                $query->where('status', 'delivered');
            }, 'campaignMessages as read_count' => function($query) {
                $query->where('status', 'read');
            }, 'campaignMessages as failed_count' => function($query) {
                $query->where('status', 'failed');
            }])
            ->orderBy('created_at', 'desc')
            ->get();
        
        return response()->json([
            'success' => true,
            'data' => $campaigns
        ]);
    }

    /**
     * Obter detalhes de uma campanha específica.
     */
    public function show($id)
    {
        $campaign = Campaign::withCount(['campaignMessages', 'campaignMessages as sent_count' => function($query) {
                $query->where('status', 'sent');
            }, 'campaignMessages as delivered_count' => function($query) {
                $query->where('status', 'delivered');
            }, 'campaignMessages as read_count' => function($query) {
                $query->where('status', 'read');
            }, 'campaignMessages as failed_count' => function($query) {
                $query->where('status', 'failed');
            }])
            ->findOrFail($id);
        
        return response()->json([
            'success' => true,
            'data' => $campaign
        ]);
    }

    /**
     * Criar uma nova campanha.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'status' => 'required|string|in:draft,scheduled,in_progress,paused,completed,cancelled',
            'scheduled_at' => 'nullable|date',
            'target_audience' => 'required|array',
            'messages' => 'required|array',
            'settings' => 'nullable|array',
        ]);

        try {
            DB::beginTransaction();
            
            $campaign = Campaign::create([
                'name' => $request->name,
                'description' => $request->description,
                'status' => $request->status,
                'scheduled_at' => $request->scheduled_at,
                'target_audience' => $request->target_audience,
                'messages' => $request->messages,
                'settings' => $request->settings,
            ]);
            
            // Preparar mensagens da campanha
            $stats = ProcessCampaign::prepareMessages($campaign);
            
            DB::commit();
            
            return response()->json([
                'success' => true,
                'message' => 'Campanha criada com sucesso',
                'data' => [
                    'campaign' => $campaign,
                    'stats' => $stats
                ]
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            
            Log::error('Erro ao criar campanha: ' . $e->getMessage(), [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Erro ao criar campanha: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Atualizar uma campanha existente.
     */
    public function update(Request $request, $id)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'status' => 'required|string|in:draft,scheduled,in_progress,paused,completed,cancelled',
            'scheduled_at' => 'nullable|date',
            'target_audience' => 'required|array',
            'messages' => 'required|array',
            'settings' => 'nullable|array',
        ]);

        try {
            DB::beginTransaction();
            
            $campaign = Campaign::findOrFail($id);
            
            // Se não estiver em draft, não permitir atualizar configurações importantes
            if ($campaign->status !== 'draft' && $request->status === 'draft') {
                return response()->json([
                    'success' => false,
                    'message' => 'Não é possível voltar uma campanha para o status de rascunho'
                ], 400);
            }
            
            $campaign->update([
                'name' => $request->name,
                'description' => $request->description,
                'status' => $request->status,
                'scheduled_at' => $request->scheduled_at,
                'target_audience' => $request->target_audience,
                'messages' => $request->messages,
                'settings' => $request->settings,
            ]);
            
            // Se ainda estiver em draft, pode reprocessar as mensagens
            $stats = [];
            if ($campaign->status === 'draft') {
                // Remover mensagens existentes
                $campaign->campaignMessages()->delete();
                
                // Preparar novas mensagens
                $stats = ProcessCampaign::prepareMessages($campaign);
            }
            
            DB::commit();
            
            return response()->json([
                'success' => true,
                'message' => 'Campanha atualizada com sucesso',
                'data' => [
                    'campaign' => $campaign,
                    'stats' => $stats
                ]
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            
            Log::error('Erro ao atualizar campanha: ' . $e->getMessage(), [
                'campaign_id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Erro ao atualizar campanha: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Iniciar uma campanha.
     */
    public function start($id)
    {
        try {
            $campaign = Campaign::findOrFail($id);
            
            if (!$campaign->isScheduled() && !$campaign->isPaused()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Campanha não pode ser iniciada. Status atual: ' . $campaign->status
                ], 400);
            }
            
            if ($campaign->isPaused()) {
                $campaign->resume();
                $message = 'Campanha retomada com sucesso';
            } else {
                $campaign->start();
                $message = 'Campanha iniciada com sucesso';
            }
            
            // Disparar o job de processamento
            ProcessCampaign::dispatch($campaign->id);
            
            return response()->json([
                'success' => true,
                'message' => $message,
                'data' => $campaign
            ]);
        } catch (\Exception $e) {
            Log::error('Erro ao iniciar campanha: ' . $e->getMessage(), [
                'campaign_id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Erro ao iniciar campanha: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Pausar uma campanha.
     */
    public function pause($id)
    {
        try {
            $campaign = Campaign::findOrFail($id);
            
            if (!$campaign->isInProgress()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Campanha não pode ser pausada. Status atual: ' . $campaign->status
                ], 400);
            }
            
            $campaign->pause();
            
            return response()->json([
                'success' => true,
                'message' => 'Campanha pausada com sucesso',
                'data' => $campaign
            ]);
        } catch (\Exception $e) {
            Log::error('Erro ao pausar campanha: ' . $e->getMessage(), [
                'campaign_id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Erro ao pausar campanha: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Cancelar uma campanha.
     */
    public function cancel($id)
    {
        try {
            $campaign = Campaign::findOrFail($id);
            
            if ($campaign->isCompleted() || $campaign->status === 'cancelled') {
                return response()->json([
                    'success' => false,
                    'message' => 'Campanha não pode ser cancelada. Status atual: ' . $campaign->status
                ], 400);
            }
            
            $campaign->cancel();
            
            // Cancelar todas as mensagens pendentes
            $campaign->campaignMessages()
                ->where('status', 'scheduled')
                ->update(['status' => 'failed', 'metadata->reason' => 'campaign_cancelled']);
            
            return response()->json([
                'success' => true,
                'message' => 'Campanha cancelada com sucesso',
                'data' => $campaign
            ]);
        } catch (\Exception $e) {
            Log::error('Erro ao cancelar campanha: ' . $e->getMessage(), [
                'campaign_id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Erro ao cancelar campanha: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Excluir uma campanha.
     */
    public function destroy($id)
    {
        try {
            $campaign = Campaign::findOrFail($id);
            
            if ($campaign->status !== 'draft' && $campaign->status !== 'cancelled' && !$campaign->isCompleted()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Não é possível excluir uma campanha em andamento ou agendada'
                ], 400);
            }
            
            // Excluir mensagens associadas
            $campaign->campaignMessages()->delete();
            
            // Excluir a campanha
            $campaign->delete();
            
            return response()->json([
                'success' => true,
                'message' => 'Campanha excluída com sucesso'
            ]);
        } catch (\Exception $e) {
            Log::error('Erro ao excluir campanha: ' . $e->getMessage(), [
                'campaign_id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Erro ao excluir campanha: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obter estatísticas da campanha.
     */
    public function stats($id)
    {
        try {
            $campaign = Campaign::withCount(['campaignMessages', 'campaignMessages as sent_count' => function($query) {
                    $query->where('status', 'sent');
                }, 'campaignMessages as delivered_count' => function($query) {
                    $query->where('status', 'delivered');
                }, 'campaignMessages as read_count' => function($query) {
                    $query->where('status', 'read');
                }, 'campaignMessages as failed_count' => function($query) {
                    $query->where('status', 'failed');
                }, 'campaignMessages as scheduled_count' => function($query) {
                    $query->where('status', 'scheduled');
                }])
                ->findOrFail($id);
            
            // Calcular percentuais
            $stats = [
                'total' => $campaign->campaign_messages_count,
                'sent' => $campaign->sent_count,
                'delivered' => $campaign->delivered_count,
                'read' => $campaign->read_count,
                'failed' => $campaign->failed_count,
                'scheduled' => $campaign->scheduled_count,
                'percentages' => [
                    'sent' => $campaign->campaign_messages_count > 0 ? 
                        round(($campaign->sent_count / $campaign->campaign_messages_count) * 100, 2) : 0,
                    'delivered' => $campaign->campaign_messages_count > 0 ? 
                        round(($campaign->delivered_count / $campaign->campaign_messages_count) * 100, 2) : 0,
                    'read' => $campaign->campaign_messages_count > 0 ? 
                        round(($campaign->read_count / $campaign->campaign_messages_count) * 100, 2) : 0,
                    'failed' => $campaign->campaign_messages_count > 0 ? 
                        round(($campaign->failed_count / $campaign->campaign_messages_count) * 100, 2) : 0,
                ]
            ];
            
            return response()->json([
                'success' => true,
                'data' => [
                    'campaign' => $campaign,
                    'stats' => $stats
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Erro ao obter estatísticas da campanha: ' . $e->getMessage(), [
                'campaign_id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Erro ao obter estatísticas: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obter mensagens de uma campanha.
     */
    public function messages(Request $request, $id)
    {
        try {
            $campaign = Campaign::findOrFail($id);
            
            $status = $request->status;
            $query = $campaign->campaignMessages()->with(['contact']);
            
            if ($status) {
                $query->where('status', $status);
            }
            
            $messages = $query->paginate(20);
            
            return response()->json([
                'success' => true,
                'data' => $messages
            ]);
        } catch (\Exception $e) {
            Log::error('Erro ao obter mensagens da campanha: ' . $e->getMessage(), [
                'campaign_id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Erro ao obter mensagens: ' . $e->getMessage()
            ], 500);
        }
    }
} 