<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Automation;
use App\Models\AutomationNode;
use App\Models\AutomationEdge;
use App\Models\AutomationLog;
use App\Models\Contact;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Services\AutomationService;

class AutomationController extends Controller
{
    protected $automationService;

    public function __construct(AutomationService $automationService)
    {
        $this->automationService = $automationService;
    }

    /**
     * Listar todas as automações.
     */
    public function index()
    {
        $automations = Automation::orderBy('created_at', 'desc')->get();
        
        return response()->json([
            'success' => true,
            'data' => $automations
        ]);
    }

    /**
     * Obter detalhes de uma automação específica, incluindo nós e arestas.
     */
    public function show($id)
    {
        $automation = Automation::with(['nodes', 'edges'])->findOrFail($id);
        
        return response()->json([
            'success' => true,
            'data' => $automation
        ]);
    }

    /**
     * Criar uma nova automação.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'trigger_type' => 'required|string|in:new_lead,form_submitted,tag_applied,status_changed,contact_created,opportunity_created,manual',
            'trigger_config' => 'nullable|array',
            'json_structure' => 'required|array',
            'nodes' => 'required|array',
            'edges' => 'nullable|array',
        ]);

        try {
            DB::beginTransaction();
            
            // Criar a automação
            $automation = Automation::create([
                'name' => $request->name,
                'description' => $request->description,
                'trigger_type' => $request->trigger_type,
                'trigger_config' => $request->trigger_config,
                'json_structure' => $request->json_structure,
                'active' => $request->active ?? false,
            ]);
            
            // Criar os nós
            foreach ($request->nodes as $nodeData) {
                AutomationNode::create([
                    'automation_id' => $automation->id,
                    'node_id' => $nodeData['id'],
                    'type' => $nodeData['type'],
                    'name' => $nodeData['name'] ?? null,
                    'config' => $nodeData['config'] ?? null,
                    'position_x' => $nodeData['position']['x'] ?? 0,
                    'position_y' => $nodeData['position']['y'] ?? 0,
                ]);
            }
            
            // Criar as arestas
            if (!empty($request->edges)) {
                foreach ($request->edges as $edgeData) {
                    AutomationEdge::create([
                        'automation_id' => $automation->id,
                        'edge_id' => $edgeData['id'],
                        'source_node_id' => $edgeData['source'],
                        'target_node_id' => $edgeData['target'],
                        'source_handle' => $edgeData['sourceHandle'] ?? null,
                        'target_handle' => $edgeData['targetHandle'] ?? null,
                        'label' => $edgeData['label'] ?? null,
                        'config' => $edgeData['config'] ?? null,
                    ]);
                }
            }
            
            DB::commit();
            
            return response()->json([
                'success' => true,
                'message' => 'Automação criada com sucesso',
                'data' => $automation->load(['nodes', 'edges'])
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            
            Log::error('Erro ao criar automação: ' . $e->getMessage(), [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Erro ao criar automação: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Atualizar uma automação existente.
     */
    public function update(Request $request, $id)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'trigger_type' => 'required|string|in:new_lead,form_submitted,tag_applied,status_changed,contact_created,opportunity_created,manual',
            'trigger_config' => 'nullable|array',
            'json_structure' => 'required|array',
            'nodes' => 'required|array',
            'edges' => 'nullable|array',
        ]);

        try {
            DB::beginTransaction();
            
            $automation = Automation::findOrFail($id);
            
            // Atualizar a automação
            $automation->update([
                'name' => $request->name,
                'description' => $request->description,
                'trigger_type' => $request->trigger_type,
                'trigger_config' => $request->trigger_config,
                'json_structure' => $request->json_structure,
                'active' => $request->active ?? $automation->active,
            ]);
            
            // Remover nós e arestas existentes
            $automation->nodes()->delete();
            $automation->edges()->delete();
            
            // Recriar os nós
            foreach ($request->nodes as $nodeData) {
                AutomationNode::create([
                    'automation_id' => $automation->id,
                    'node_id' => $nodeData['id'],
                    'type' => $nodeData['type'],
                    'name' => $nodeData['name'] ?? null,
                    'config' => $nodeData['config'] ?? null,
                    'position_x' => $nodeData['position']['x'] ?? 0,
                    'position_y' => $nodeData['position']['y'] ?? 0,
                ]);
            }
            
            // Recriar as arestas
            if (!empty($request->edges)) {
                foreach ($request->edges as $edgeData) {
                    AutomationEdge::create([
                        'automation_id' => $automation->id,
                        'edge_id' => $edgeData['id'],
                        'source_node_id' => $edgeData['source'],
                        'target_node_id' => $edgeData['target'],
                        'source_handle' => $edgeData['sourceHandle'] ?? null,
                        'target_handle' => $edgeData['targetHandle'] ?? null,
                        'label' => $edgeData['label'] ?? null,
                        'config' => $edgeData['config'] ?? null,
                    ]);
                }
            }
            
            DB::commit();
            
            return response()->json([
                'success' => true,
                'message' => 'Automação atualizada com sucesso',
                'data' => $automation->load(['nodes', 'edges'])
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            
            Log::error('Erro ao atualizar automação: ' . $e->getMessage(), [
                'automation_id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Erro ao atualizar automação: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Ativar ou desativar uma automação.
     */
    public function toggleActive(Request $request, $id)
    {
        $request->validate([
            'active' => 'required|boolean',
        ]);

        try {
            $automation = Automation::findOrFail($id);
            
            if ($request->active) {
                $automation->activate();
                $message = 'Automação ativada com sucesso';
            } else {
                $automation->deactivate();
                $message = 'Automação desativada com sucesso';
            }
            
            return response()->json([
                'success' => true,
                'message' => $message,
                'data' => $automation
            ]);
        } catch (\Exception $e) {
            Log::error('Erro ao alterar status da automação: ' . $e->getMessage(), [
                'automation_id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Erro ao alterar status da automação: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Excluir uma automação.
     */
    public function destroy($id)
    {
        try {
            $automation = Automation::findOrFail($id);
            $automation->delete();
            
            return response()->json([
                'success' => true,
                'message' => 'Automação excluída com sucesso'
            ]);
        } catch (\Exception $e) {
            Log::error('Erro ao excluir automação: ' . $e->getMessage(), [
                'automation_id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Erro ao excluir automação: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Executar uma automação manualmente para um contato específico.
     */
    public function executeManually(Request $request, $id)
    {
        $request->validate([
            'contact_id' => 'required|integer|exists:contacts,id',
            'opportunity_id' => 'nullable|integer|exists:opportunities,id',
        ]);

        try {
            $automation = Automation::findOrFail($id);
            $contact = Contact::findOrFail($request->contact_id);
            
            // Preparar contexto
            $contextData = [
                'manual_execution' => true,
                'executed_by' => auth()->id(),
                'executed_at' => now()->format('Y-m-d H:i:s'),
            ];
            
            // Obter oportunidade, se houver
            $opportunity = null;
            if ($request->opportunity_id) {
                $opportunity = \App\Models\Opportunity::find($request->opportunity_id);
            }
            
            // Iniciar a automação
            $this->automationService->startAutomationFlow($automation, $contact, $contextData, $opportunity);
            
            return response()->json([
                'success' => true,
                'message' => 'Automação iniciada manualmente com sucesso',
                'data' => [
                    'automation_id' => $automation->id,
                    'contact_id' => $contact->id,
                    'opportunity_id' => $opportunity?->id
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Erro ao executar automação manualmente: ' . $e->getMessage(), [
                'automation_id' => $id,
                'contact_id' => $request->contact_id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Erro ao executar automação: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obter logs de execução de uma automação.
     */
    public function logs($id)
    {
        $automation = Automation::findOrFail($id);
        
        $logs = AutomationLog::with(['contact'])
            ->where('automation_id', $id)
            ->orderBy('created_at', 'desc')
            ->paginate(20);
        
        return response()->json([
            'success' => true,
            'data' => $logs
        ]);
    }
} 