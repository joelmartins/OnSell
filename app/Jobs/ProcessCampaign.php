<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use App\Models\Campaign;
use App\Models\CampaignMessage;
use App\Models\Contact;
use App\Models\MessageTemplate;
use App\Services\MessageService;
use Illuminate\Support\Facades\Log;
use Stancl\Tenancy\Tenancy;

class ProcessCampaign implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $campaignId;
    protected $batchSize = 100;
    
    // Max tentativas e tempo de espera entre tentativas
    public $tries = 3;
    public $backoff = 60;

    /**
     * Create a new job instance.
     */
    public function __construct(int $campaignId)
    {
        $this->campaignId = $campaignId;
        
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
            
            $campaign = Campaign::find($this->campaignId);
            
            if (!$campaign) {
                Log::error("Campanha não encontrada", [
                    'campaign_id' => $this->campaignId
                ]);
                return;
            }
            
            // Verificar se a campanha está pronta para ser processada
            if (!$campaign->isScheduled() && !$campaign->isInProgress()) {
                Log::info("Campanha não está em estado processável (status: {$campaign->status})", [
                    'campaign_id' => $this->campaignId,
                    'status' => $campaign->status
                ]);
                return;
            }
            
            // Se a campanha estiver agendada, iniciá-la
            if ($campaign->isScheduled()) {
                $campaign->start();
            }
            
            // Processar a campanha em lotes
            $this->processCampaignInBatches($campaign);
            
            // Verificar se a campanha foi totalmente processada
            $pendingMessages = $campaign->campaignMessages()->scheduled()->count();
            
            if ($pendingMessages === 0) {
                $campaign->complete();
                
                Log::info("Campanha concluída com sucesso", [
                    'campaign_id' => $this->campaignId
                ]);
            } else {
                // Se ainda há mensagens pendentes, agendar novo processamento
                self::dispatch($this->campaignId)->delay(now()->addMinutes(5));
                
                Log::info("Campanha continua em processamento, há mensagens pendentes", [
                    'campaign_id' => $this->campaignId,
                    'pending_messages' => $pendingMessages
                ]);
            }
        } catch (\Exception $e) {
            Log::error("Erro ao processar campanha: " . $e->getMessage(), [
                'campaign_id' => $this->campaignId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            throw $e;
        }
    }
    
    /**
     * Processar a campanha em lotes.
     *
     * @param Campaign $campaign
     * @return void
     */
    protected function processCampaignInBatches(Campaign $campaign): void
    {
        // Buscar mensagens agendadas para envio agora
        $messages = $campaign->campaignMessages()
            ->shouldSend()
            ->take($this->batchSize)
            ->get();
        
        if ($messages->isEmpty()) {
            Log::info("Nenhuma mensagem para enviar no momento", [
                'campaign_id' => $campaign->id
            ]);
            return;
        }
        
        Log::info("Enviando lote de mensagens", [
            'campaign_id' => $campaign->id,
            'batch_size' => $messages->count()
        ]);
        
        // Preparar as mensagens para envio
        $messagesToSend = [];
        
        foreach ($messages as $message) {
            $messagesToSend[] = [
                'id' => $message->id,
                'contact_id' => $message->contact_id,
                'channel' => $message->channel,
                'content' => $message->content,
                'media' => $message->media
            ];
        }
        
        // Enviar as mensagens
        $messageService = app(MessageService::class);
        $results = $messageService->sendCampaignBatch($messagesToSend);
        
        Log::info("Resultado do envio de lote", [
            'campaign_id' => $campaign->id,
            'total' => $results['total'],
            'success' => $results['success'],
            'failed' => $results['failed']
        ]);
    }
    
    /**
     * Preparar as mensagens da campanha para todos os contatos do público-alvo.
     * Este método é usado quando a campanha é criada ou atualizada.
     *
     * @param Campaign $campaign
     * @return array Estatísticas sobre as mensagens criadas
     */
    public static function prepareMessages(Campaign $campaign): array
    {
        $stats = [
            'created' => 0,
            'updated' => 0,
            'skipped' => 0,
            'total' => 0
        ];
        
        // Se a campanha não tem configuração de público-alvo ou mensagens, pular
        if (empty($campaign->target_audience) || empty($campaign->messages)) {
            return $stats;
        }
        
        // Buscar contatos que correspondem ao público-alvo
        $targetAudience = $campaign->target_audience;
        $contactsQuery = Contact::query();
        
        // Aplicar filtros do público-alvo
        if (!empty($targetAudience['filters'])) {
            foreach ($targetAudience['filters'] as $filter) {
                $field = $filter['field'] ?? null;
                $operator = $filter['operator'] ?? 'equals';
                $value = $filter['value'] ?? null;
                
                if ($field && isset($value)) {
                    switch ($operator) {
                        case 'equals':
                            $contactsQuery->where($field, $value);
                            break;
                        case 'not_equals':
                            $contactsQuery->where($field, '!=', $value);
                            break;
                        case 'contains':
                            $contactsQuery->where($field, 'LIKE', "%{$value}%");
                            break;
                        case 'greater_than':
                            $contactsQuery->where($field, '>', $value);
                            break;
                        case 'less_than':
                            $contactsQuery->where($field, '<', $value);
                            break;
                        case 'is_empty':
                            $contactsQuery->whereNull($field)->orWhere($field, '');
                            break;
                        case 'is_not_empty':
                            $contactsQuery->whereNotNull($field)->where($field, '!=', '');
                            break;
                    }
                }
            }
        }
        
        // Limitar o número de contatos, se especificado
        $limit = $targetAudience['limit'] ?? null;
        if ($limit) {
            $contactsQuery->limit($limit);
        }
        
        // Buscar os contatos
        $contacts = $contactsQuery->get();
        $stats['total'] = $contacts->count();
        
        if ($contacts->isEmpty()) {
            return $stats;
        }
        
        // Para cada contato, preparar as mensagens da campanha
        foreach ($contacts as $contact) {
            // Para cada mensagem configurada na campanha
            foreach ($campaign->messages as $index => $messageConfig) {
                $channel = $messageConfig['channel'] ?? 'whatsapp';
                $content = '';
                $media = [];
                $messageTemplateId = $messageConfig['message_template_id'] ?? null;
                $variables = [];
                
                // Calcular o agendamento da mensagem
                $delay = $messageConfig['delay_minutes'] ?? 0;
                $scheduledAt = $campaign->scheduled_at ?? now();
                $scheduledAt = $scheduledAt->copy()->addMinutes($delay);
                
                // Se tiver um template, processar o conteúdo
                if ($messageTemplateId) {
                    $template = MessageTemplate::find($messageTemplateId);
                    
                    if ($template) {
                        // Preparar variáveis de contexto
                        $variables = [
                            'nome' => $contact->name,
                            'email' => $contact->email,
                            'telefone' => $contact->phone,
                            'empresa' => $contact->company,
                            'cargo' => $contact->title
                        ];
                        
                        // Processar o conteúdo do template com as variáveis
                        $content = $template->processContent($variables);
                        
                        // Se o template tiver mídia, adicionar
                        if ($template->media) {
                            $media = $template->media;
                        }
                    }
                } else {
                    // Usar conteúdo direto
                    $content = $messageConfig['content'] ?? '';
                    
                    // Processar variáveis no conteúdo
                    $variables = [
                        'nome' => $contact->name,
                        'email' => $contact->email,
                        'telefone' => $contact->phone,
                        'empresa' => $contact->company,
                        'cargo' => $contact->title
                    ];
                    
                    foreach ($variables as $key => $value) {
                        $content = str_replace('{{' . $key . '}}', $value, $content);
                    }
                    
                    // Remover variáveis não processadas
                    $content = preg_replace('/\{\{[^}]+\}\}/', '', $content);
                    
                    // Adicionar mídia, se houver
                    if (!empty($messageConfig['media'])) {
                        $media = $messageConfig['media'];
                    }
                }
                
                // Verificar se já existe uma mensagem para este contato nesta campanha
                $existingMessage = CampaignMessage::where('campaign_id', $campaign->id)
                    ->where('contact_id', $contact->id)
                    ->where('status', 'scheduled')
                    ->where('channel', $channel)
                    ->first();
                
                if ($existingMessage) {
                    // Atualizar a mensagem existente
                    $existingMessage->update([
                        'message_template_id' => $messageTemplateId,
                        'content' => $content,
                        'variables_used' => $variables,
                        'media' => $media,
                        'scheduled_at' => $scheduledAt
                    ]);
                    
                    $stats['updated']++;
                } else {
                    // Criar nova mensagem
                    CampaignMessage::create([
                        'campaign_id' => $campaign->id,
                        'contact_id' => $contact->id,
                        'message_template_id' => $messageTemplateId,
                        'channel' => $channel,
                        'status' => 'scheduled',
                        'content' => $content,
                        'variables_used' => $variables,
                        'media' => $media,
                        'scheduled_at' => $scheduledAt
                    ]);
                    
                    $stats['created']++;
                }
            }
        }
        
        return $stats;
    }
} 