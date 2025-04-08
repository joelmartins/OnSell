<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Services\EvolutionApiService;
use App\Services\VapiService;
use App\Services\WhatsAppService;
use App\Models\Client;

class WebhookController extends Controller
{
    protected $evolutionApiService;
    protected $vapiService;
    protected $whatsAppService;
    
    public function __construct(
        EvolutionApiService $evolutionApiService,
        VapiService $vapiService,
        WhatsAppService $whatsAppService
    ) {
        $this->evolutionApiService = $evolutionApiService;
        $this->vapiService = $vapiService;
        $this->whatsAppService = $whatsAppService;
    }
    
    /**
     * Receber webhook da Evolution API (WhatsApp)
     */
    public function whatsapp(Request $request)
    {
        try {
            $payload = $request->all();
            
            Log::debug('Webhook da Evolution API recebido', [
                'payload' => json_encode($payload)
            ]);
            
            // Obter ID do cliente a partir dos dados do webhook
            $instanceName = $payload['instance']['id'] ?? null;
            
            if (!$instanceName) {
                return response()->json(['success' => false, 'message' => 'Instance ID not provided']);
            }
            
            // Buscar cliente com base no nome da instância
            // Isso depende da sua lógica de associação de instâncias a clientes
            $client = Client::where('settings->whatsapp_instance', $instanceName)->first();
            
            if (!$client) {
                Log::warning('Cliente não encontrado para instância de WhatsApp', [
                    'instance' => $instanceName
                ]);
                return response()->json(['success' => false, 'message' => 'Client not found']);
            }
            
            // Processar o webhook
            $interaction = $this->whatsAppService->handleWebhook($payload, $client);
            
            if ($interaction) {
                return response()->json([
                    'success' => true,
                    'interaction_id' => $interaction->id
                ]);
            }
            
            return response()->json(['success' => true, 'message' => 'Webhook processed without interaction']);
        } catch (\Exception $e) {
            Log::error('Erro ao processar webhook da Evolution API', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Error processing webhook: ' . $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Receber webhook da VAPI (Telefonia)
     */
    public function vapi(Request $request)
    {
        try {
            $payload = $request->all();
            
            Log::debug('Webhook da VAPI recebido', [
                'payload' => json_encode($payload)
            ]);
            
            // Processar o webhook
            $interaction = $this->vapiService->handleWebhook($payload);
            
            if ($interaction) {
                return response()->json([
                    'success' => true,
                    'interaction_id' => $interaction->id
                ]);
            }
            
            return response()->json(['success' => true, 'message' => 'Webhook processed without interaction']);
        } catch (\Exception $e) {
            Log::error('Erro ao processar webhook da VAPI', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Error processing webhook: ' . $e->getMessage()
            ], 500);
        }
    }
} 