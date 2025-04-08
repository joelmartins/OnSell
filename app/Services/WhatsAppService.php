<?php

namespace App\Services;

use App\Models\Client;
use App\Models\Interaction;
use App\Models\Contact;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\Client\RequestException;

class WhatsAppService
{
    /**
     * Enviar mensagem para o WhatsApp via Evolution API
     */
    public function sendMessage(Contact $contact, string $message, Client $client): ?Interaction
    {
        try {
            // Verificar se o contato tem WhatsApp
            if (!$contact->whatsapp) {
                Log::error('Tentativa de enviar mensagem para contato sem WhatsApp', [
                    'contact_id' => $contact->id,
                    'client_id' => $client->id,
                ]);
                return null;
            }

            // Obter as credenciais do cliente
            $instanceName = $this->getInstanceName($client);
            $apiKey = $this->getApiKey($client);
            $baseUrl = $this->getBaseUrl();

            if (!$instanceName || !$apiKey || !$baseUrl) {
                Log::error('Cliente sem configuração de WhatsApp', [
                    'client_id' => $client->id,
                ]);
                return null;
            }

            // Formatar número do WhatsApp
            $whatsappNumber = $this->formatWhatsAppNumber($contact->whatsapp);

            // Preparar payload para a Evolution API
            $payload = [
                'number' => $whatsappNumber,
                'options' => [
                    'delay' => 1200,
                    'presence' => 'composing',
                ],
                'textMessage' => [
                    'text' => $message
                ]
            ];

            // Enviar mensagem via Evolution API
            $response = Http::withHeaders([
                'apikey' => $apiKey,
                'Content-Type' => 'application/json'
            ])->post("{$baseUrl}/message/sendText/{$instanceName}", $payload);

            // Processar resposta
            if ($response->successful()) {
                $responseData = $response->json();
                
                // Verificar se a mensagem foi enviada com sucesso
                if ($responseData['success'] ?? false) {
                    // Criar um registro da interação
                    return Interaction::create([
                        'contact_id' => $contact->id,
                        'channel' => 'whatsapp',
                        'direction' => 'out',
                        'content' => $message,
                        'metadata' => json_encode([
                            'message_id' => $responseData['key']['id'] ?? null,
                            'response' => $responseData,
                        ]),
                        'external_id' => $responseData['key']['id'] ?? null,
                        'is_read' => true,
                    ]);
                } else {
                    Log::error('Evolution API retornou erro', [
                        'contact_id' => $contact->id,
                        'client_id' => $client->id,
                        'response' => $responseData,
                    ]);
                    return null;
                }
            } else {
                Log::error('Falha ao enviar mensagem WhatsApp via Evolution API', [
                    'contact_id' => $contact->id,
                    'client_id' => $client->id,
                    'error' => $response->body(),
                    'status' => $response->status(),
                ]);
                return null;
            }
        } catch (RequestException $e) {
            Log::error('Exceção ao enviar mensagem WhatsApp', [
                'contact_id' => $contact->id,
                'client_id' => $client->id,
                'error' => $e->getMessage(),
            ]);
            return null;
        }
    }

    /**
     * Receber webhook da Evolution API
     */
    public function handleWebhook(array $payload, Client $client): ?Interaction
    {
        try {
            // Identificar o tipo de mensagem recebida
            if (!isset($payload['event']) || $payload['event'] !== 'messages.upsert') {
                // Se não for uma mensagem nova, ignorar
                return null;
            }

            // Verificar se há mensagens e se são do tipo certo
            if (!isset($payload['data']['key']['remoteJid']) || !isset($payload['data']['message'])) {
                return null;
            }

            // Extrair dados da mensagem
            $remoteJid = $payload['data']['key']['remoteJid'];
            $fromMe = $payload['data']['key']['fromMe'] ?? false;
            
            // Se a mensagem for enviada por nós, ignorar
            if ($fromMe) {
                return null;
            }
            
            // Extrair número do remetente (remover a parte @s.whatsapp.net)
            $from = preg_replace('/\@.*$/', '', $remoteJid);
            
            // Extrair o conteúdo da mensagem
            $content = $this->extractMessageContent($payload['data']['message']);
            if (empty($content)) {
                Log::info('Mensagem sem conteúdo textual recebida', [
                    'client_id' => $client->id,
                    'message_type' => json_encode(array_keys($payload['data']['message'])),
                ]);
                return null;
            }
            
            $messageId = $payload['data']['key']['id'];

            // Buscar o contato pelo número de WhatsApp
            $contact = Contact::where('client_id', $client->id)
                ->where(function ($query) use ($from) {
                    $query->where('whatsapp', $from)
                        ->orWhere('whatsapp', $this->formatLocalWhatsAppNumber($from));
                })
                ->first();

            // Se o contato não existir, criar um novo
            if (!$contact) {
                $contact = Contact::create([
                    'client_id' => $client->id,
                    'name' => "Contato WhatsApp ($from)",
                    'whatsapp' => $from,
                    'source' => 'whatsapp',
                ]);
            }

            // Criar uma interação
            return Interaction::create([
                'contact_id' => $contact->id,
                'channel' => 'whatsapp',
                'direction' => 'in',
                'content' => $content,
                'metadata' => json_encode([
                    'message_id' => $messageId,
                    'payload' => $payload,
                ]),
                'external_id' => $messageId,
                'is_read' => false,
            ]);
        } catch (\Exception $e) {
            Log::error('Erro ao processar webhook do WhatsApp', [
                'client_id' => $client->id,
                'error' => $e->getMessage(),
                'payload' => json_encode($payload),
            ]);
            return null;
        }
    }

    /**
     * Extrair conteúdo da mensagem de diferentes tipos
     */
    protected function extractMessageContent(array $message): ?string
    {
        // Extrair texto de mensagem de texto
        if (isset($message['conversation']) && !empty($message['conversation'])) {
            return $message['conversation'];
        }
        
        // Extrai texto de mensagem extendida
        if (isset($message['extendedTextMessage']['text']) && !empty($message['extendedTextMessage']['text'])) {
            return $message['extendedTextMessage']['text'];
        }
        
        // Extrai legenda de imagem
        if (isset($message['imageMessage']['caption']) && !empty($message['imageMessage']['caption'])) {
            return $message['imageMessage']['caption'];
        }
        
        // Extrai legenda de vídeo
        if (isset($message['videoMessage']['caption']) && !empty($message['videoMessage']['caption'])) {
            return $message['videoMessage']['caption'];
        }
        
        // Tipos de mensagem não textuais
        if (isset($message['imageMessage'])) {
            return "[Imagem]";
        }
        
        if (isset($message['videoMessage'])) {
            return "[Vídeo]";
        }
        
        if (isset($message['audioMessage'])) {
            return "[Áudio]";
        }
        
        if (isset($message['documentMessage'])) {
            return "[Documento]";
        }
        
        if (isset($message['stickerMessage'])) {
            return "[Sticker]";
        }
        
        return null;
    }

    /**
     * Verificar status da instância WhatsApp
     */
    public function checkInstanceStatus(Client $client): array
    {
        try {
            $instanceName = $this->getInstanceName($client);
            $apiKey = $this->getApiKey($client);
            $baseUrl = $this->getBaseUrl();

            if (!$instanceName || !$apiKey || !$baseUrl) {
                return [
                    'success' => false,
                    'message' => 'Configuração incompleta',
                ];
            }

            $response = Http::withHeaders([
                'apikey' => $apiKey
            ])->get("{$baseUrl}/instance/connectionState/{$instanceName}");

            if ($response->successful()) {
                $data = $response->json();
                return [
                    'success' => true,
                    'status' => $data['state'] ?? 'unknown',
                    'connected' => ($data['state'] ?? '') === 'open',
                    'data' => $data,
                ];
            } else {
                return [
                    'success' => false,
                    'message' => 'Falha ao verificar status',
                    'status' => $response->status(),
                ];
            }
        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => 'Erro ao verificar status: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Iniciar instância do WhatsApp
     */
    public function startInstance(Client $client): array
    {
        try {
            $instanceName = $this->getInstanceName($client);
            $apiKey = $this->getApiKey($client);
            $baseUrl = $this->getBaseUrl();

            if (!$instanceName || !$apiKey || !$baseUrl) {
                return [
                    'success' => false,
                    'message' => 'Configuração incompleta',
                ];
            }

            // Inicia a instância
            $response = Http::withHeaders([
                'apikey' => $apiKey
            ])->post("{$baseUrl}/instance/connect/{$instanceName}");

            if ($response->successful()) {
                return [
                    'success' => true,
                    'message' => 'Instância iniciada com sucesso',
                    'data' => $response->json(),
                ];
            } else {
                return [
                    'success' => false,
                    'message' => 'Falha ao iniciar instância',
                    'status' => $response->status(),
                    'response' => $response->body(),
                ];
            }
        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => 'Erro ao iniciar instância: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Obter QR Code para autenticação
     */
    public function getQrCode(Client $client): array
    {
        try {
            $instanceName = $this->getInstanceName($client);
            $apiKey = $this->getApiKey($client);
            $baseUrl = $this->getBaseUrl();

            if (!$instanceName || !$apiKey || !$baseUrl) {
                return [
                    'success' => false,
                    'message' => 'Configuração incompleta',
                ];
            }

            $response = Http::withHeaders([
                'apikey' => $apiKey
            ])->get("{$baseUrl}/instance/qrcode/{$instanceName}");

            if ($response->successful()) {
                $data = $response->json();
                
                if (isset($data['qrcode'])) {
                    return [
                        'success' => true,
                        'qrcode' => $data['qrcode'],
                        'data' => $data,
                    ];
                } else {
                    return [
                        'success' => false,
                        'message' => 'QR Code não disponível',
                        'data' => $data,
                    ];
                }
            } else {
                return [
                    'success' => false,
                    'message' => 'Falha ao obter QR Code',
                    'status' => $response->status(),
                ];
            }
        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => 'Erro ao obter QR Code: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Obter o nome da instância do cliente na Evolution API
     */
    protected function getInstanceName(Client $client): ?string
    {
        // Aqui seria implementada a lógica para buscar o nome da instância no banco
        // Por enquanto, usamos um padrão baseado no ID do cliente
        return 'onsell_client_' . $client->id;
    }

    /**
     * Obter a chave API da Evolution API
     */
    protected function getApiKey(Client $client): ?string
    {
        // Aqui seria implementada a lógica para buscar a chave API no banco
        // Por enquanto, usamos uma chave de exemplo
        return env('EVOLUTION_API_KEY');
    }

    /**
     * Obter a URL base da Evolution API
     */
    protected function getBaseUrl(): string
    {
        return env('EVOLUTION_API_URL', 'http://localhost:8080');
    }

    /**
     * Formatar o número para o formato esperado pelo WhatsApp
     */
    protected function formatWhatsAppNumber(string $number): string
    {
        // Remover todos os caracteres não numéricos
        $cleanNumber = preg_replace('/[^0-9]/', '', $number);
        
        // Se o número não começar com o código do país, adicionar 55 (Brasil)
        if (strlen($cleanNumber) <= 11) {
            $cleanNumber = '55' . $cleanNumber;
        }
        
        return $cleanNumber;
    }

    /**
     * Formatar o número do WhatsApp para formato local
     */
    protected function formatLocalWhatsAppNumber(string $number): string
    {
        // Remover o código do país para que o número seja salvo no formato local
        $cleanNumber = preg_replace('/[^0-9]/', '', $number);
        
        if (strlen($cleanNumber) >= 12 && substr($cleanNumber, 0, 2) === '55') {
            return substr($cleanNumber, 2);
        }
        
        return $cleanNumber;
    }
} 