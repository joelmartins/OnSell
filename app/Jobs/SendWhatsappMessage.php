<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use App\Models\CampaignMessage;
use App\Models\Interaction;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Stancl\Tenancy\Tenancy;

class SendWhatsappMessage implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $phone;
    protected $message;
    protected $media;
    protected $contactId;
    protected $campaignMessageId;
    
    // Max tentativas e tempo de espera entre tentativas
    public $tries = 3;
    public $backoff = 60;

    /**
     * Create a new job instance.
     */
    public function __construct(string $phone, string $message, array $media = [], ?int $contactId = null, ?int $campaignMessageId = null)
    {
        $this->phone = $phone;
        $this->message = $message;
        $this->media = $media;
        $this->contactId = $contactId;
        $this->campaignMessageId = $campaignMessageId;
        
        // Se estamos em um contexto tenant, armazenar o ID do tenant para uso posterior
        if (app()->has('tenancy')) {
            $this->tenant = tenant()->getTenantKey();
        }
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        try {
            // Se temos um tenant armazenado, inicializá-lo
            if (isset($this->tenant) && app()->has('tenancy')) {
                app(Tenancy::class)->initialize($this->tenant);
            }
            
            // Normalizar o número de telefone para formato internacional
            $phone = $this->normalizePhone($this->phone);
            
            // Se o número não for válido, lançar uma exceção
            if (!$phone) {
                throw new \Exception("Número de telefone inválido: {$this->phone}");
            }
            
            // Integração com API de WhatsApp (aqui usaremos uma simulação)
            $result = $this->sendToWhatsappApi($phone, $this->message, $this->media);
            
            // Registrar a interação, se tivermos um ID de contato
            if ($this->contactId) {
                Interaction::create([
                    'contact_id' => $this->contactId,
                    'type' => 'outbound',
                    'channel' => 'whatsapp',
                    'content' => $this->message,
                    'metadata' => [
                        'media' => $this->media,
                        'phone' => $phone,
                        'api_response' => $result
                    ]
                ]);
            }
            
            // Atualizar a mensagem de campanha, se tivermos um ID
            if ($this->campaignMessageId) {
                $campaignMessage = CampaignMessage::find($this->campaignMessageId);
                
                if ($campaignMessage) {
                    $campaignMessage->markAsSent([
                        'api_response' => $result
                    ]);
                }
            }
            
            Log::info("Mensagem WhatsApp enviada com sucesso", [
                'phone' => $phone,
                'contact_id' => $this->contactId,
                'campaign_message_id' => $this->campaignMessageId
            ]);
        } catch (\Exception $e) {
            Log::error("Erro ao enviar mensagem WhatsApp: " . $e->getMessage(), [
                'phone' => $this->phone,
                'contact_id' => $this->contactId,
                'campaign_message_id' => $this->campaignMessageId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            // Marcar a mensagem de campanha como falha, se tivermos um ID
            if ($this->campaignMessageId) {
                $campaignMessage = CampaignMessage::find($this->campaignMessageId);
                
                if ($campaignMessage) {
                    $campaignMessage->markAsFailed([
                        'error' => $e->getMessage()
                    ]);
                }
            }
            
            throw $e;
        }
    }
    
    /**
     * Normalizar um número de telefone para formato internacional.
     *
     * @param string $phone
     * @return string|false
     */
    protected function normalizePhone(string $phone)
    {
        // Remover todos os caracteres não numéricos
        $phone = preg_replace('/[^0-9]/', '', $phone);
        
        // Se o número já começar com +, manter como está
        if (substr($phone, 0, 1) === '+') {
            return $phone;
        }
        
        // Adicionar o código do país se não tiver
        if (strlen($phone) <= 11) {
            // Brasil +55
            $phone = '55' . $phone;
        }
        
        // Adicionar o + no início
        return '+' . $phone;
    }
    
    /**
     * Enviar mensagem para a API de WhatsApp.
     * 
     * Aqui está sendo simulado, mas deve ser substituído pela integração real.
     *
     * @param string $phone
     * @param string $message
     * @param array $media
     * @return array
     */
    protected function sendToWhatsappApi(string $phone, string $message, array $media = []): array
    {
        // Esta é uma simulação. Na implementação real, você conectaria com a API
        // Por exemplo, usando a biblioteca oficial, Z-API, Evolution API, etc.
        
        // Exemplo com HTTP:
        // $response = Http::withHeaders([
        //     'Authorization' => 'Bearer ' . config('whatsapp.api_token')
        // ])->post(config('whatsapp.api_url') . '/send-message', [
        //     'phone' => $phone,
        //     'message' => $message,
        //     'media' => $media
        // ]);
        
        // return $response->json();
        
        // Simulação:
        $messageId = 'msg_' . uniqid();
        
        return [
            'success' => true,
            'message_id' => $messageId,
            'timestamp' => now()->timestamp,
            'status' => 'sent'
        ];
    }
} 