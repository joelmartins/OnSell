<?php

namespace App\Services;

use App\Models\Contact;
use App\Models\MessageTemplate;
use App\Jobs\SendWhatsappMessage;
use Illuminate\Support\Facades\Log;

class MessageService
{
    /**
     * Enviar uma mensagem WhatsApp para um contato.
     *
     * @param Contact $contact
     * @param array $config
     * @param array $context
     * @return array
     */
    public function sendWhatsapp(Contact $contact, array $config, array $context = []): array
    {
        try {
            if (empty($contact->phone)) {
                return [
                    'success' => false,
                    'error' => 'Contato não possui telefone'
                ];
            }

            $content = null;
            $templateId = $config['message_template_id'] ?? null;
            $mediaUrls = $config['media_urls'] ?? [];
            
            // Se tiver um template configurado, usar ele
            if ($templateId) {
                $template = MessageTemplate::find($templateId);
                
                if ($template) {
                    // Preparar variáveis de contexto
                    $variables = $this->prepareVariables($contact, $context);
                    
                    // Processar o conteúdo do template com as variáveis
                    $content = $template->processContent($variables);
                    
                    // Se o template tiver mídia, adicionar aos URLs
                    if ($template->media) {
                        $mediaUrls = array_merge($mediaUrls, $template->media);
                    }
                }
            } else {
                // Usar conteúdo direto se não tiver template
                $content = $config['message'] ?? null;
                
                if ($content) {
                    // Preparar variáveis de contexto
                    $variables = $this->prepareVariables($contact, $context);
                    
                    // Substituir variáveis no conteúdo
                    foreach ($variables as $key => $value) {
                        $content = str_replace('{{' . $key . '}}', $value, $content);
                    }
                    
                    // Remover variáveis não processadas
                    $content = preg_replace('/\{\{[^}]+\}\}/', '', $content);
                }
            }

            if (empty($content)) {
                return [
                    'success' => false,
                    'error' => 'Conteúdo da mensagem vazio'
                ];
            }

            // Agendar o envio da mensagem
            // Delay opcional para envio (em minutos)
            $delayMinutes = $config['delay_minutes'] ?? 0;
            
            SendWhatsappMessage::dispatch(
                $contact->phone,
                $content,
                $mediaUrls,
                $contact->id
            )->delay(now()->addMinutes($delayMinutes));

            return [
                'success' => true,
                'message' => 'Mensagem agendada para envio',
                'phone' => $contact->phone,
                'delay_minutes' => $delayMinutes,
                'content_preview' => mb_substr($content, 0, 50) . (mb_strlen($content) > 50 ? '...' : '')
            ];
        } catch (\Exception $e) {
            Log::error("Erro ao enviar WhatsApp: " . $e->getMessage(), [
                'contact_id' => $contact->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return [
                'success' => false,
                'error' => 'Erro ao enviar WhatsApp: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Preparar variáveis para substituição em templates.
     *
     * @param Contact $contact
     * @param array $context
     * @return array
     */
    protected function prepareVariables(Contact $contact, array $context = []): array
    {
        $contactData = [
            'nome' => $contact->name,
            'email' => $contact->email,
            'telefone' => $contact->phone,
            'empresa' => $contact->company,
            'cargo' => $contact->title
        ];

        // Adicionar dados da oportunidade, se disponível
        $opportunity = $context['opportunity'] ?? null;
        $opportunityData = [];
        
        if ($opportunity) {
            $opportunityData = [
                'oportunidade_titulo' => $opportunity['title'] ?? '',
                'oportunidade_valor' => $opportunity['value'] ?? '',
                'oportunidade_data' => isset($opportunity['created_at']) ? date('d/m/Y', strtotime($opportunity['created_at'])) : ''
            ];
        }

        // Adicionar dados do formulário, se disponível
        $formData = [];
        
        if (isset($context['form_data']) && is_array($context['form_data'])) {
            foreach ($context['form_data'] as $key => $value) {
                $formData['formulario_' . $key] = $value;
            }
        }

        // Mesclar todos os dados
        return array_merge($contactData, $opportunityData, $formData);
    }

    /**
     * Enviar um lote de mensagens para uma campanha.
     *
     * @param array $messages Lista de mensagens para enviar
     * @return array
     */
    public function sendCampaignBatch(array $messages): array
    {
        $results = [
            'total' => count($messages),
            'success' => 0,
            'failed' => 0,
            'failures' => []
        ];

        foreach ($messages as $message) {
            try {
                $contact = Contact::find($message['contact_id']);
                
                if (!$contact) {
                    $results['failed']++;
                    $results['failures'][] = [
                        'message_id' => $message['id'],
                        'error' => 'Contato não encontrado'
                    ];
                    continue;
                }

                if ($message['channel'] === 'whatsapp') {
                    SendWhatsappMessage::dispatch(
                        $contact->phone,
                        $message['content'],
                        $message['media'] ?? [],
                        $contact->id,
                        $message['id']
                    );
                    
                    $results['success']++;
                }
                // Outros canais podem ser implementados aqui
            } catch (\Exception $e) {
                Log::error("Erro ao enviar mensagem de campanha: " . $e->getMessage(), [
                    'message_id' => $message['id'],
                    'error' => $e->getMessage()
                ]);
                
                $results['failed']++;
                $results['failures'][] = [
                    'message_id' => $message['id'],
                    'error' => $e->getMessage()
                ];
            }
        }

        return $results;
    }
} 