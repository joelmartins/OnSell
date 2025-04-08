<?php

namespace App\Listeners;

use App\Events\ContactCreated;
use App\Services\AutomationService;
use Illuminate\Support\Facades\Log;

class TriggerAutomationsOnContactCreated
{
    protected $automationService;

    /**
     * Create the event listener.
     */
    public function __construct(AutomationService $automationService)
    {
        $this->automationService = $automationService;
    }

    /**
     * Handle the event.
     */
    public function handle(ContactCreated $event): void
    {
        try {
            Log::info('Novo contato criado, disparando automações', [
                'contact_id' => $event->contact->id,
                'contact_name' => $event->contact->name,
                'contact_email' => $event->contact->email,
                'source' => $event->source
            ]);
            
            // Preparar dados de contexto para a automação
            $contextData = [
                'source' => $event->source,
                'created_at' => $event->contact->created_at->format('Y-m-d H:i:s')
            ];
            
            // Disparar as automações com o trigger 'contact_created'
            $this->automationService->triggerAutomation('contact_created', $event->contact, $contextData);
        } catch (\Exception $e) {
            Log::error('Erro ao disparar automações para novo contato: ' . $e->getMessage(), [
                'contact_id' => $event->contact->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
        }
    }
} 