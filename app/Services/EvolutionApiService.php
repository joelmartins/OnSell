<?php

namespace App\Services;

use App\Models\Client;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\Client\RequestException;

class EvolutionApiService
{
    /**
     * URL base da Evolution API
     */
    protected function getBaseUrl(): string
    {
        return config('services.evolution_api.url', 'http://localhost:8080');
    }
    
    /**
     * Chave API global da Evolution API
     */
    protected function getApiKey(): string
    {
        return config('services.evolution_api.key', '');
    }
    
    /**
     * Nome da instância padrão
     */
    protected function getDefaultInstance(): string
    {
        return config('services.evolution_api.default_instance', 'default');
    }
    
    /**
     * URL de webhook para receber as mensagens
     */
    protected function getWebhookUrl(): string
    {
        return config('services.evolution_api.webhook_url', '');
    }

    /**
     * Inicia uma nova instância na Evolution API
     */
    public function startInstance(string $instanceName = null): array
    {
        $instanceName = $instanceName ?? $this->getDefaultInstance();
        
        try {
            $response = Http::withHeaders([
                'apikey' => $this->getApiKey(),
                'Content-Type' => 'application/json'
            ])->post("{$this->getBaseUrl()}/instance/create", [
                'instanceName' => $instanceName,
                'integration' => 'baileys',
                'webhook' => [
                    'url' => $this->getWebhookUrl(),
                    'enabled' => true,
                ],
                'webhook_by_events' => false,
                'events' => [
                    'messages' => true,
                    'qr' => true,
                    'connection' => true
                ]
            ]);
            
            if ($response->successful()) {
                return [
                    'success' => true,
                    'data' => $response->json(),
                    'instance' => $instanceName
                ];
            }
            
            Log::error('Falha ao iniciar instância na Evolution API', [
                'instance' => $instanceName,
                'error' => $response->body(),
                'status' => $response->status()
            ]);
            
            return [
                'success' => false,
                'error' => $response->body(),
                'status' => $response->status()
            ];
        } catch (RequestException $e) {
            Log::error('Exceção ao iniciar instância na Evolution API', [
                'instance' => $instanceName,
                'error' => $e->getMessage()
            ]);
            
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }
    
    /**
     * Obtém o QR Code para conexão do WhatsApp
     */
    public function getQrCode(string $instanceName = null): array
    {
        $instanceName = $instanceName ?? $this->getDefaultInstance();
        
        try {
            // Primeiro verificar se a instância existe
            $instanceStatus = $this->checkInstanceStatus($instanceName);
            
            // Se a instância não existir, criá-la
            if (!$instanceStatus['success']) {
                $this->startInstance($instanceName);
            }
            
            $response = Http::withHeaders([
                'apikey' => $this->getApiKey(),
                'Content-Type' => 'application/json'
            ])->get("{$this->getBaseUrl()}/instance/qrcode/{$instanceName}");
            
            if ($response->successful()) {
                $data = $response->json();
                
                if (isset($data['qrcode'])) {
                    return [
                        'success' => true,
                        'qrcode' => $data['qrcode'],
                        'base64' => $data['base64'] ?? null
                    ];
                }
                
                return [
                    'success' => false,
                    'error' => 'QR Code não disponível',
                    'data' => $data
                ];
            }
            
            Log::error('Falha ao obter QR Code na Evolution API', [
                'instance' => $instanceName,
                'error' => $response->body(),
                'status' => $response->status()
            ]);
            
            return [
                'success' => false,
                'error' => $response->body(),
                'status' => $response->status()
            ];
        } catch (RequestException $e) {
            Log::error('Exceção ao obter QR Code na Evolution API', [
                'instance' => $instanceName,
                'error' => $e->getMessage()
            ]);
            
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }
    
    /**
     * Verifica o status da instância
     */
    public function checkInstanceStatus(string $instanceName = null): array
    {
        $instanceName = $instanceName ?? $this->getDefaultInstance();
        
        try {
            $response = Http::withHeaders([
                'apikey' => $this->getApiKey(),
                'Content-Type' => 'application/json'
            ])->get("{$this->getBaseUrl()}/instance/fetchInstances");
            
            if ($response->successful()) {
                $data = $response->json();
                
                // Verifica se a instância existe na lista
                if (isset($data['instances']) && is_array($data['instances'])) {
                    foreach ($data['instances'] as $instance) {
                        if ($instance['instance']['instanceName'] === $instanceName) {
                            return [
                                'success' => true,
                                'status' => $instance['instance']['state'] ?? 'UNKNOWN',
                                'connected' => ($instance['instance']['state'] ?? '') === 'open',
                                'data' => $instance
                            ];
                        }
                    }
                }
                
                // Instância não encontrada
                return [
                    'success' => false,
                    'error' => 'Instância não encontrada',
                    'status' => 'NOT_FOUND'
                ];
            }
            
            Log::error('Falha ao verificar status da instância na Evolution API', [
                'instance' => $instanceName,
                'error' => $response->body(),
                'status' => $response->status()
            ]);
            
            return [
                'success' => false,
                'error' => $response->body(),
                'status' => $response->status()
            ];
        } catch (RequestException $e) {
            Log::error('Exceção ao verificar status da instância na Evolution API', [
                'instance' => $instanceName,
                'error' => $e->getMessage()
            ]);
            
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }
    
    /**
     * Envia uma mensagem de texto
     */
    public function sendTextMessage(string $to, string $message, string $instanceName = null): array
    {
        $instanceName = $instanceName ?? $this->getDefaultInstance();
        
        try {
            $to = $this->formatPhoneNumber($to);
            
            $response = Http::withHeaders([
                'apikey' => $this->getApiKey(),
                'Content-Type' => 'application/json'
            ])->post("{$this->getBaseUrl()}/message/sendText/{$instanceName}", [
                'number' => $to,
                'options' => [
                    'delay' => 1200,
                    'presence' => 'composing',
                ],
                'textMessage' => [
                    'text' => $message
                ]
            ]);
            
            if ($response->successful()) {
                $data = $response->json();
                
                if ($data['success'] ?? false) {
                    return [
                        'success' => true,
                        'message_id' => $data['key']['id'] ?? null,
                        'data' => $data
                    ];
                }
                
                return [
                    'success' => false,
                    'error' => 'Erro ao enviar mensagem',
                    'data' => $data
                ];
            }
            
            Log::error('Falha ao enviar mensagem na Evolution API', [
                'instance' => $instanceName,
                'to' => $to,
                'error' => $response->body(),
                'status' => $response->status()
            ]);
            
            return [
                'success' => false,
                'error' => $response->body(),
                'status' => $response->status()
            ];
        } catch (RequestException $e) {
            Log::error('Exceção ao enviar mensagem na Evolution API', [
                'instance' => $instanceName,
                'to' => $to,
                'error' => $e->getMessage()
            ]);
            
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }
    
    /**
     * Envia uma imagem
     */
    public function sendImage(string $to, string $imageUrl, string $caption = null, string $instanceName = null): array
    {
        $instanceName = $instanceName ?? $this->getDefaultInstance();
        
        try {
            $to = $this->formatPhoneNumber($to);
            
            $payload = [
                'number' => $to,
                'options' => [
                    'delay' => 1200,
                ],
                'imageMessage' => [
                    'image' => $imageUrl
                ]
            ];
            
            if ($caption) {
                $payload['imageMessage']['caption'] = $caption;
            }
            
            $response = Http::withHeaders([
                'apikey' => $this->getApiKey(),
                'Content-Type' => 'application/json'
            ])->post("{$this->getBaseUrl()}/message/sendImage/{$instanceName}", $payload);
            
            if ($response->successful()) {
                $data = $response->json();
                
                if ($data['success'] ?? false) {
                    return [
                        'success' => true,
                        'message_id' => $data['key']['id'] ?? null,
                        'data' => $data
                    ];
                }
                
                return [
                    'success' => false,
                    'error' => 'Erro ao enviar imagem',
                    'data' => $data
                ];
            }
            
            Log::error('Falha ao enviar imagem na Evolution API', [
                'instance' => $instanceName,
                'to' => $to,
                'error' => $response->body(),
                'status' => $response->status()
            ]);
            
            return [
                'success' => false,
                'error' => $response->body(),
                'status' => $response->status()
            ];
        } catch (RequestException $e) {
            Log::error('Exceção ao enviar imagem na Evolution API', [
                'instance' => $instanceName,
                'to' => $to,
                'error' => $e->getMessage()
            ]);
            
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }
    
    /**
     * Configura webhook para uma instância
     */
    public function setWebhook(string $webhookUrl, string $instanceName = null): array
    {
        $instanceName = $instanceName ?? $this->getDefaultInstance();
        
        try {
            $response = Http::withHeaders([
                'apikey' => $this->getApiKey(),
                'Content-Type' => 'application/json'
            ])->post("{$this->getBaseUrl()}/webhook/set/{$instanceName}", [
                'webhook' => $webhookUrl,
                'webhookEvents' => [
                    'messages',
                    'connection',
                    'qr',
                    'status'
                ]
            ]);
            
            if ($response->successful()) {
                $data = $response->json();
                
                if ($data['success'] ?? false) {
                    return [
                        'success' => true,
                        'data' => $data
                    ];
                }
                
                return [
                    'success' => false,
                    'error' => 'Erro ao configurar webhook',
                    'data' => $data
                ];
            }
            
            Log::error('Falha ao configurar webhook na Evolution API', [
                'instance' => $instanceName,
                'webhook' => $webhookUrl,
                'error' => $response->body(),
                'status' => $response->status()
            ]);
            
            return [
                'success' => false,
                'error' => $response->body(),
                'status' => $response->status()
            ];
        } catch (RequestException $e) {
            Log::error('Exceção ao configurar webhook na Evolution API', [
                'instance' => $instanceName,
                'webhook' => $webhookUrl,
                'error' => $e->getMessage()
            ]);
            
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }
    
    /**
     * Desconecta uma instância
     */
    public function logout(string $instanceName = null): array
    {
        $instanceName = $instanceName ?? $this->getDefaultInstance();
        
        try {
            $response = Http::withHeaders([
                'apikey' => $this->getApiKey(),
                'Content-Type' => 'application/json'
            ])->delete("{$this->getBaseUrl()}/instance/logout/{$instanceName}");
            
            if ($response->successful()) {
                $data = $response->json();
                
                if ($data['success'] ?? false) {
                    return [
                        'success' => true,
                        'data' => $data
                    ];
                }
                
                return [
                    'success' => false,
                    'error' => 'Erro ao desconectar instância',
                    'data' => $data
                ];
            }
            
            Log::error('Falha ao desconectar instância na Evolution API', [
                'instance' => $instanceName,
                'error' => $response->body(),
                'status' => $response->status()
            ]);
            
            return [
                'success' => false,
                'error' => $response->body(),
                'status' => $response->status()
            ];
        } catch (RequestException $e) {
            Log::error('Exceção ao desconectar instância na Evolution API', [
                'instance' => $instanceName,
                'error' => $e->getMessage()
            ]);
            
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }
    
    /**
     * Formata o número de telefone para o padrão WhatsApp
     */
    protected function formatPhoneNumber(string $number): string
    {
        // Remover caracteres não numéricos
        $number = preg_replace('/\D/', '', $number);
        
        // Se começar com 0, remover
        if (substr($number, 0, 1) === '0') {
            $number = substr($number, 1);
        }
        
        // Se não tiver o código do país, adicionar o Brasil (55)
        if (strlen($number) <= 11) {
            $number = '55' . $number;
        }
        
        return $number;
    }
} 