<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Client;
use App\Services\WhatsAppService;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Log;

class WhatsAppWebhookController extends Controller
{
    protected WhatsAppService $whatsappService;

    public function __construct(WhatsAppService $whatsappService)
    {
        $this->whatsappService = $whatsappService;
    }

    /**
     * Verificar o webhook do WhatsApp
     */
    public function verify(Request $request, string $domain)
    {
        // Obter os parâmetros de verificação
        $mode = $request->query('hub_mode');
        $challenge = $request->query('hub_challenge');
        $verifyToken = $request->query('hub_verify_token');

        // Encontrar o cliente pelo domínio
        $client = Client::where('domain', $domain)->first();

        if (!$client) {
            Log::warning('Tentativa de verificação de webhook para domínio inexistente', [
                'domain' => $domain,
            ]);
            return response('Invalid domain', 404);
        }

        // Verificar se o modo é subscribe e se o token é válido
        if ($mode === 'subscribe' && $this->whatsappService->verifyWebhook($challenge, $verifyToken, $client)) {
            // Retornar o desafio para confirmar a verificação
            return response($challenge);
        }

        // Retornar erro caso a verificação falhe
        return response('Verification failed', 403);
    }

    /**
     * Receber webhook da Evolution API
     */
    public function handle(Request $request, string $domain)
    {
        try {
            // Encontrar o cliente pelo domínio
            $client = Client::where('domain', $domain)->first();

            if (!$client) {
                Log::warning('Webhook recebido para domínio inexistente', [
                    'domain' => $domain,
                ]);
                return response('Invalid domain', 404);
            }

            // Processar o payload do webhook
            $payload = $request->all();
            
            Log::info('Webhook do WhatsApp recebido via Evolution API', [
                'client_id' => $client->id,
                'domain' => $domain,
                'event' => $payload['event'] ?? 'unknown',
            ]);

            // Se não for um evento de mensagem, apenas confirmamos o recebimento
            if (!isset($payload['event']) || $payload['event'] !== 'messages.upsert') {
                return response('OK', 200);
            }

            // Processar a mensagem
            $interaction = $this->whatsappService->handleWebhook($payload, $client);

            // Se a interação foi processada, podemos implementar lógica de resposta automática
            if ($interaction) {
                // TODO: Implementar processamento com IA e resposta automática
                // Exemplo: disparar um job para processar a mensagem com IA
                // ProcessWhatsAppMessageJob::dispatch($interaction);
            }

            // Confirmar recebimento
            return response('OK', 200);
        } catch (\Exception $e) {
            Log::error('Erro ao processar webhook do WhatsApp', [
                'domain' => $domain,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            
            // Sempre retornar 200 para evitar que a Evolution API reenvie webhooks
            return response('OK', 200);
        }
    }
    
    /**
     * Verificar status da instância
     */
    public function instanceStatus(Request $request, string $domain)
    {
        try {
            $client = Client::where('domain', $domain)->first();

            if (!$client) {
                return response()->json(['success' => false, 'message' => 'Domínio inválido'], 404);
            }

            $result = $this->whatsappService->checkInstanceStatus($client);
            return response()->json($result);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erro ao verificar status: ' . $e->getMessage(),
            ], 500);
        }
    }
    
    /**
     * Iniciar instância
     */
    public function startInstance(Request $request, string $domain)
    {
        try {
            $client = Client::where('domain', $domain)->first();

            if (!$client) {
                return response()->json(['success' => false, 'message' => 'Domínio inválido'], 404);
            }

            $result = $this->whatsappService->startInstance($client);
            return response()->json($result);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erro ao iniciar instância: ' . $e->getMessage(),
            ], 500);
        }
    }
    
    /**
     * Obter QR Code
     */
    public function getQrCode(Request $request, string $domain)
    {
        try {
            $client = Client::where('domain', $domain)->first();

            if (!$client) {
                return response()->json(['success' => false, 'message' => 'Domínio inválido'], 404);
            }

            $result = $this->whatsappService->getQrCode($client);
            return response()->json($result);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erro ao obter QR Code: ' . $e->getMessage(),
            ], 500);
        }
    }
} 