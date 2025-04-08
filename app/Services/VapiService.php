<?php

namespace App\Services;

use App\Models\Client;
use App\Models\Contact;
use App\Models\Interaction;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\Client\RequestException;

class VapiService
{
    /**
     * URL base da API VAPI
     */
    protected function getBaseUrl(): string
    {
        return config('services.vapi.url', 'https://api.vapi.com/v1');
    }
    
    /**
     * Chave API da VAPI
     */
    protected function getApiKey(): string
    {
        return config('services.vapi.key', '');
    }
    
    /**
     * URL de webhook da VAPI
     */
    protected function getWebhookUrl(): string
    {
        return config('services.vapi.webhook_url', '');
    }
    
    /**
     * Criar um assistente de voz para o cliente
     */
    public function createAssistant(string $name, string $welcomeMessage, Client $client): array
    {
        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->getApiKey(),
                'Content-Type' => 'application/json'
            ])->post("{$this->getBaseUrl()}/assistants", [
                'name' => $name,
                'first_message' => $welcomeMessage,
                'metadata' => [
                    'client_id' => $client->id,
                    'tenant' => tenant('id')
                ],
                'webhook_url' => $this->getWebhookUrl(),
                'webhook_events' => [
                    'call.completed', 
                    'call.started'
                ]
            ]);
            
            if ($response->successful()) {
                $data = $response->json();
                
                // Armazenar ID do assistente nas configurações do cliente
                $client->updateSettings(['vapi_assistant_id' => $data['id']]);
                
                return [
                    'success' => true,
                    'assistant_id' => $data['id'],
                    'data' => $data
                ];
            }
            
            Log::error('Falha ao criar assistente na VAPI', [
                'client_id' => $client->id,
                'error' => $response->body(),
                'status' => $response->status()
            ]);
            
            return [
                'success' => false,
                'error' => $response->body(),
                'status' => $response->status()
            ];
        } catch (RequestException $e) {
            Log::error('Exceção ao criar assistente na VAPI', [
                'client_id' => $client->id,
                'error' => $e->getMessage()
            ]);
            
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }
    
    /**
     * Obter informações do assistente
     */
    public function getAssistant(string $assistantId): array
    {
        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->getApiKey(),
                'Content-Type' => 'application/json'
            ])->get("{$this->getBaseUrl()}/assistants/{$assistantId}");
            
            if ($response->successful()) {
                return [
                    'success' => true,
                    'data' => $response->json()
                ];
            }
            
            Log::error('Falha ao obter assistente na VAPI', [
                'assistant_id' => $assistantId,
                'error' => $response->body(),
                'status' => $response->status()
            ]);
            
            return [
                'success' => false,
                'error' => $response->body(),
                'status' => $response->status()
            ];
        } catch (RequestException $e) {
            Log::error('Exceção ao obter assistente na VAPI', [
                'assistant_id' => $assistantId,
                'error' => $e->getMessage()
            ]);
            
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }
    
    /**
     * Atualizar assistente
     */
    public function updateAssistant(string $assistantId, array $data): array
    {
        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->getApiKey(),
                'Content-Type' => 'application/json'
            ])->patch("{$this->getBaseUrl()}/assistants/{$assistantId}", $data);
            
            if ($response->successful()) {
                return [
                    'success' => true,
                    'data' => $response->json()
                ];
            }
            
            Log::error('Falha ao atualizar assistente na VAPI', [
                'assistant_id' => $assistantId,
                'error' => $response->body(),
                'status' => $response->status()
            ]);
            
            return [
                'success' => false,
                'error' => $response->body(),
                'status' => $response->status()
            ];
        } catch (RequestException $e) {
            Log::error('Exceção ao atualizar assistente na VAPI', [
                'assistant_id' => $assistantId,
                'error' => $e->getMessage()
            ]);
            
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }
    
    /**
     * Iniciar chamada para um contato
     */
    public function startCall(Contact $contact, string $assistantId, array $contextData = []): array
    {
        try {
            // Formatar o número de telefone
            $phoneNumber = $this->formatPhoneNumber($contact->phone);
            
            $payload = [
                'assistant_id' => $assistantId,
                'to' => $phoneNumber,
                'metadata' => array_merge($contextData, [
                    'contact_id' => $contact->id,
                    'client_id' => $contact->client_id
                ])
            ];
            
            // Se houver variáveis de contexto, adicionar
            if (!empty($contextData['variables'])) {
                $payload['variables'] = $contextData['variables'];
            }
            
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->getApiKey(),
                'Content-Type' => 'application/json'
            ])->post("{$this->getBaseUrl()}/calls", $payload);
            
            if ($response->successful()) {
                $data = $response->json();
                
                // Criar registro de interação
                $interaction = Interaction::create([
                    'contact_id' => $contact->id,
                    'channel' => 'phone',
                    'direction' => 'out',
                    'content' => 'Ligação iniciada pelo sistema',
                    'metadata' => json_encode([
                        'call_id' => $data['id'],
                        'assistant_id' => $assistantId,
                        'response' => $data,
                    ]),
                    'external_id' => $data['id'],
                    'is_read' => true,
                ]);
                
                return [
                    'success' => true,
                    'call_id' => $data['id'],
                    'interaction_id' => $interaction->id,
                    'data' => $data
                ];
            }
            
            Log::error('Falha ao iniciar chamada na VAPI', [
                'contact_id' => $contact->id,
                'assistant_id' => $assistantId,
                'error' => $response->body(),
                'status' => $response->status()
            ]);
            
            return [
                'success' => false,
                'error' => $response->body(),
                'status' => $response->status()
            ];
        } catch (RequestException $e) {
            Log::error('Exceção ao iniciar chamada na VAPI', [
                'contact_id' => $contact->id,
                'assistant_id' => $assistantId,
                'error' => $e->getMessage()
            ]);
            
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }
    
    /**
     * Obter informações de uma chamada
     */
    public function getCallInfo(string $callId): array
    {
        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->getApiKey(),
                'Content-Type' => 'application/json'
            ])->get("{$this->getBaseUrl()}/calls/{$callId}");
            
            if ($response->successful()) {
                return [
                    'success' => true,
                    'data' => $response->json()
                ];
            }
            
            Log::error('Falha ao obter informações da chamada na VAPI', [
                'call_id' => $callId,
                'error' => $response->body(),
                'status' => $response->status()
            ]);
            
            return [
                'success' => false,
                'error' => $response->body(),
                'status' => $response->status()
            ];
        } catch (RequestException $e) {
            Log::error('Exceção ao obter informações da chamada na VAPI', [
                'call_id' => $callId,
                'error' => $e->getMessage()
            ]);
            
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }
    
    /**
     * Processar webhook da VAPI
     */
    public function handleWebhook(array $payload): ?Interaction
    {
        try {
            // Verificar tipo de evento
            $eventType = $payload['event'] ?? null;
            
            if (!$eventType) {
                return null;
            }
            
            // Extrair dados relevantes
            $callId = $payload['call_id'] ?? null;
            $metadata = $payload['metadata'] ?? [];
            
            if (!$callId || empty($metadata)) {
                return null;
            }
            
            // Obter IDs do contato e cliente
            $contactId = $metadata['contact_id'] ?? null;
            
            if (!$contactId) {
                return null;
            }
            
            // Buscar contato
            $contact = Contact::find($contactId);
            
            if (!$contact) {
                Log::error('Contato não encontrado para webhook da VAPI', [
                    'contact_id' => $contactId,
                    'call_id' => $callId
                ]);
                return null;
            }
            
            // Determinar conteúdo com base no tipo de evento
            $content = match($eventType) {
                'call.started' => 'Ligação iniciada',
                'call.completed' => 'Ligação finalizada: ' . ($payload['disposition'] ?? 'desconhecido'),
                default => 'Evento de ligação: ' . $eventType
            };
            
            // Buscar interação existente ou criar nova
            $interaction = Interaction::where('external_id', $callId)
                ->where('contact_id', $contact->id)
                ->first();
            
            if ($interaction) {
                // Atualizar interação existente
                $interaction->update([
                    'content' => $content,
                    'metadata' => json_encode(array_merge(
                        json_decode($interaction->metadata, true) ?? [],
                        ['webhook' => $payload]
                    ))
                ]);
            } else {
                // Criar nova interação
                $interaction = Interaction::create([
                    'contact_id' => $contact->id,
                    'channel' => 'phone',
                    'direction' => 'in',
                    'content' => $content,
                    'metadata' => json_encode([
                        'call_id' => $callId,
                        'webhook' => $payload,
                    ]),
                    'external_id' => $callId,
                    'is_read' => false,
                ]);
            }
            
            return $interaction;
        } catch (\Exception $e) {
            Log::error('Erro ao processar webhook da VAPI', [
                'error' => $e->getMessage(),
                'payload' => json_encode($payload),
            ]);
            return null;
        }
    }
    
    /**
     * Formatar número de telefone para o padrão E.164
     */
    protected function formatPhoneNumber(string $number): string
    {
        // Remover caracteres não numéricos
        $number = preg_replace('/\D/', '', $number);
        
        // Se começar com 0, remover
        if (substr($number, 0, 1) === '0') {
            $number = substr($number, 1);
        }
        
        // Se não tiver o código do país, adicionar o Brasil (+55)
        if (strlen($number) <= 11) {
            $number = '+55' . $number;
        } elseif (substr($number, 0, 2) === '55') {
            $number = '+' . $number;
        } elseif (substr($number, 0, 1) !== '+') {
            $number = '+' . $number;
        }
        
        return $number;
    }
} 