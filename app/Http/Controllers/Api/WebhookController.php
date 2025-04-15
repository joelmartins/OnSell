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

    /**
     * Receber webhook do Stripe (pagamentos recorrentes)
     */
    public function stripe(Request $request)
    {
        $payload = $request->getContent();
        $sigHeader = $request->header('Stripe-Signature');
        $secret = config('services.stripe.webhook_secret') ?? env('STRIPE_WEBHOOK_SECRET');

        try {
            $event = \Stripe\Webhook::constructEvent(
                $payload,
                $sigHeader,
                $secret
            );
        } catch (\UnexpectedValueException $e) {
            \Log::error('Stripe webhook: payload inválido', ['error' => $e->getMessage()]);
            return response('Invalid payload', 400);
        } catch (\Stripe\Exception\SignatureVerificationException $e) {
            \Log::error('Stripe webhook: assinatura inválida', ['error' => $e->getMessage()]);
            return response('Invalid signature', 400);
        }

        switch ($event->type) {
            case 'checkout.session.completed':
                $session = $event->data->object;
                $customerId = $session->customer ?? null;
                if ($customerId) {
                    $user = \App\Models\User::where('stripe_id', $customerId)->first();
                    if ($user) {
                        if ($user->client) {
                            $user->client->is_active = true;
                            $user->client->save();
                            \Log::info('Cliente ativado via Stripe', ['client_id' => $user->client->id, 'user_id' => $user->id]);
                        } elseif ($user->agency) {
                            $user->agency->is_active = true;
                            $user->agency->save();
                            \Log::info('Agência ativada via Stripe', ['agency_id' => $user->agency->id, 'user_id' => $user->id]);
                        }
                    } else {
                        \Log::warning('Usuário não encontrado para stripe_id', ['stripe_id' => $customerId]);
                    }
                } else {
                    \Log::warning('customer_id não encontrado no session Stripe', ['session_id' => $session->id]);
                }
                break;
            case 'customer.subscription.deleted':
                $subscription = $event->data->object;
                $customerId = $subscription->customer ?? null;
                if ($customerId) {
                    $user = \App\Models\User::where('stripe_id', $customerId)->first();
                    if ($user) {
                        if ($user->client) {
                            $user->client->is_active = false;
                            $user->client->save();
                            \Log::info('Cliente desativado via Stripe (assinatura cancelada)', ['client_id' => $user->client->id, 'user_id' => $user->id]);
                        } elseif ($user->agency) {
                            $user->agency->is_active = false;
                            $user->agency->save();
                            \Log::info('Agência desativada via Stripe (assinatura cancelada)', ['agency_id' => $user->agency->id, 'user_id' => $user->id]);
                        }
                    } else {
                        \Log::warning('Usuário não encontrado para stripe_id (cancelamento)', ['stripe_id' => $customerId]);
                    }
                } else {
                    \Log::warning('customer_id não encontrado no subscription Stripe (cancelamento)', ['subscription_id' => $subscription->id]);
                }
                break;
            case 'invoice.payment_failed':
                // Futuro: notificar usuário sobre falha de pagamento
                break;
        }

        return response('Webhook recebido', 200);
    }
} 