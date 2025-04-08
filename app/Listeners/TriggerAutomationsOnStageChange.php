<?php

namespace App\Listeners;

use App\Events\OpportunityStageChanged;
use App\Services\AutomationService;
use Illuminate\Support\Facades\Log;

class TriggerAutomationsOnStageChange
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
    public function handle(OpportunityStageChanged $event): void
    {
        try {
            Log::info('Oportunidade mudou de estágio, disparando automações', [
                'opportunity_id' => $event->opportunity->id,
                'contact_id' => $event->opportunity->contact_id,
                'old_stage_id' => $event->oldStage?->id,
                'old_stage_name' => $event->oldStage?->name,
                'new_stage_id' => $event->newStage->id,
                'new_stage_name' => $event->newStage->name
            ]);
            
            // Buscar o contato relacionado à oportunidade
            $contact = $event->opportunity->contact;
            
            if (!$contact) {
                Log::warning('Contato não encontrado para a oportunidade', [
                    'opportunity_id' => $event->opportunity->id
                ]);
                return;
            }
            
            // Preparar dados de contexto para a automação
            $contextData = [
                'opportunity_id' => $event->opportunity->id,
                'pipeline_id' => $event->opportunity->pipeline_id,
                'from_status' => $event->oldStage?->id,
                'to_status' => $event->newStage->id,
                'old_stage_name' => $event->oldStage?->name,
                'new_stage_name' => $event->newStage->name
            ];
            
            // Disparar as automações com o trigger 'status_changed'
            $this->automationService->triggerAutomation('status_changed', $contact, $contextData, $event->opportunity);
        } catch (\Exception $e) {
            Log::error('Erro ao disparar automações para mudança de estágio: ' . $e->getMessage(), [
                'opportunity_id' => $event->opportunity->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
        }
    }
} 