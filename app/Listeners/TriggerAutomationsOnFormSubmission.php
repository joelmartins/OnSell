<?php

namespace App\Listeners;

use App\Events\FormSubmitted;
use App\Services\AutomationService;
use Illuminate\Support\Facades\Log;

class TriggerAutomationsOnFormSubmission
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
    public function handle(FormSubmitted $event): void
    {
        try {
            Log::info('Formulário submetido, disparando automações', [
                'form_id' => $event->form->id,
                'form_name' => $event->form->name,
                'contact_id' => $event->contact->id,
                'submission_id' => $event->submission->id
            ]);
            
            // Preparar dados de contexto para a automação
            $contextData = [
                'form_id' => $event->form->id,
                'form_name' => $event->form->name,
                'submission_id' => $event->submission->id,
                'form_data' => $event->formData,
                'landing_page_id' => $event->form->landing_page_id ?? null
            ];
            
            // Disparar as automações com o trigger 'form_submitted'
            $this->automationService->triggerAutomation('form_submitted', $event->contact, $contextData);
        } catch (\Exception $e) {
            Log::error('Erro ao disparar automações para submissão de formulário: ' . $e->getMessage(), [
                'form_id' => $event->form->id,
                'contact_id' => $event->contact->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
        }
    }
} 