<?php

namespace App\Http\Controllers\Agency;

use App\Http\Controllers\Controller;
use App\Models\Client;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class ResolveClientIssueController extends Controller
{
    /**
     * Verifica o status de um cliente
     */
    public function checkClientStatus($clientId)
    {
        // Verificar se está impersonando uma agência
        $agencyId = null;
        $impersonating = session()->get('impersonate.target');
        $isImpersonating = !empty($impersonating);
        
        if ($impersonating && $impersonating['type'] === 'agency') {
            // Se está impersonando, usar o ID da agência da sessão
            $agencyId = $impersonating['id'];
        } else {
            // Caso contrário, obter o ID da agência do usuário autenticado
            $agencyId = Auth::user()->agency_id;
        }
        
        // Buscar cliente com Eloquent (respeita soft delete)
        $clientEloquent = Client::find($clientId);
        
        // Buscar cliente incluindo os excluídos por soft delete
        $clientWithTrashed = Client::withTrashed()->find($clientId);
        
        // Buscar cliente diretamente do banco para diagnóstico
        $clientRaw = DB::table('clients')->where('id', $clientId)->first();
        
        $data = [
            'client_id' => $clientId,
            'agency_id' => $agencyId,
            'is_impersonating' => $isImpersonating,
            'client_exists_eloquent' => $clientEloquent !== null,
            'client_exists_with_trashed' => $clientWithTrashed !== null,
            'client_exists_raw' => $clientRaw !== null,
            'client_deleted_at' => $clientWithTrashed ? $clientWithTrashed->deleted_at : null,
            'client_raw_deleted_at' => $clientRaw ? $clientRaw->deleted_at : null,
            'session_data' => session()->all(),
            'impersonating' => $impersonating,
            'client_details' => $clientWithTrashed ? [
                'id' => $clientWithTrashed->id,
                'name' => $clientWithTrashed->name,
                'agency_id' => $clientWithTrashed->agency_id,
                'is_active' => $clientWithTrashed->is_active,
                'created_at' => $clientWithTrashed->created_at,
                'updated_at' => $clientWithTrashed->updated_at,
                'deleted_at' => $clientWithTrashed->deleted_at
            ] : null
        ];
        
        // Registrar informações no log
        Log::channel('audit')->info('Diagnóstico de cliente', $data);
        
        return response()->json([
            'diagnostico' => $data,
            'solucao_recomendada' => $this->getRecommendedSolution($data)
        ]);
    }
    
    /**
     * Corrige o problema salvando o cliente novamente com deleted_at
     */
    public function fixClientIssue($clientId)
    {
        // Verificar se está impersonando uma agência
        $agencyId = null;
        $impersonating = session()->get('impersonate.target');
        
        if ($impersonating && $impersonating['type'] === 'agency') {
            // Se está impersonando, usar o ID da agência da sessão
            $agencyId = $impersonating['id'];
        } else {
            // Caso contrário, obter o ID da agência do usuário autenticado
            $agencyId = Auth::user()->agency_id;
        }
        
        // Buscar cliente incluindo os excluídos por soft delete
        $client = Client::withTrashed()->find($clientId);
        
        if (!$client) {
            return response()->json([
                'success' => false,
                'message' => 'Cliente não encontrado'
            ]);
        }
        
        // Verificar se o cliente pertence à agência
        if ($client->agency_id != $agencyId) {
            return response()->json([
                'success' => false,
                'message' => 'Este cliente não pertence à sua agência'
            ]);
        }
        
        $wasDeleted = !empty($client->deleted_at);
        
        // Salvar em transação para garantir atomicidade
        try {
            DB::beginTransaction();
            
            // Desativar o cliente
            $client->is_active = false;
            
            // Se o cliente já tinha deleted_at, vamos forçar a exclusão real
            if ($wasDeleted) {
                // Forçar a exclusão definitiva
                $client->forceDelete();
                $message = 'Cliente excluído permanentemente com sucesso!';
            } else {
                // Realizar soft delete
                $client->delete();
                $message = 'Cliente marcado como excluído com sucesso!';
            }
            
            DB::commit();
            
            // Log de sucesso
            Log::channel('audit')->info('Cliente corrigido com sucesso', [
                'client_id' => $clientId,
                'was_previously_deleted' => $wasDeleted,
                'action_taken' => $wasDeleted ? 'force_delete' : 'soft_delete',
                'user_id' => Auth::id()
            ]);
            
            return response()->json([
                'success' => true,
                'message' => $message
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            
            // Log de erro
            Log::channel('audit')->error('Erro ao corrigir cliente', [
                'client_id' => $clientId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Erro ao corrigir cliente: ' . $e->getMessage()
            ]);
        }
    }
    
    /**
     * Determina a solução recomendada com base nos dados de diagnóstico
     */
    private function getRecommendedSolution($data)
    {
        if (!$data['client_exists_eloquent'] && !$data['client_exists_raw']) {
            return 'Cliente não existe mais no banco de dados. Não é necessária nenhuma ação adicional.';
        }
        
        if (!$data['client_exists_eloquent'] && $data['client_exists_with_trashed']) {
            return 'Cliente já foi excluído via soft delete, mas ainda aparece por algum motivo. Recomenda-se limpar o cache ou forçar a exclusão permanente.';
        }
        
        if ($data['client_exists_eloquent'] && $data['client_exists_raw'] && empty($data['client_raw_deleted_at'])) {
            return 'Cliente existe no banco de dados e não está marcado como excluído. Recomenda-se executar a exclusão novamente.';
        }
        
        return 'Situação não identificada claramente. Recomenda-se verificar os logs para mais detalhes.';
    }
}
