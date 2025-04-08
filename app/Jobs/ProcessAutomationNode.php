<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use App\Models\Automation;
use App\Models\AutomationLog;
use App\Models\Contact;
use App\Models\Opportunity;
use App\Services\AutomationService;
use Illuminate\Support\Facades\Log;
use Stancl\Tenancy\Tenancy;

class ProcessAutomationNode implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $automationId;
    protected $nodeId;
    protected $contactId;
    protected $logId;
    protected $opportunityId;
    
    // Max tentativas e tempo de espera entre tentativas
    public $tries = 3;
    public $backoff = 60;

    /**
     * Create a new job instance.
     */
    public function __construct(int $automationId, string $nodeId, int $contactId, int $logId, ?int $opportunityId = null)
    {
        $this->automationId = $automationId;
        $this->nodeId = $nodeId;
        $this->contactId = $contactId;
        $this->logId = $logId;
        $this->opportunityId = $opportunityId;
        
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
            
            $automation = Automation::find($this->automationId);
            $contact = Contact::find($this->contactId);
            $log = AutomationLog::find($this->logId);
            $opportunity = $this->opportunityId ? Opportunity::find($this->opportunityId) : null;

            if (!$automation || !$contact || !$log) {
                Log::error("Dados não encontrados para processar nó de automação", [
                    'automation_id' => $this->automationId,
                    'contact_id' => $this->contactId,
                    'log_id' => $this->logId,
                    'node_id' => $this->nodeId
                ]);
                return;
            }

            $automationService = app(AutomationService::class);
            $automationService->processNode($automation, $this->nodeId, $contact, $log, $opportunity);
        } catch (\Exception $e) {
            Log::error("Erro ao processar nó de automação: " . $e->getMessage(), [
                'automation_id' => $this->automationId,
                'contact_id' => $this->contactId,
                'log_id' => $this->logId,
                'node_id' => $this->nodeId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            // Marcar o log como falha
            if (isset($log)) {
                $log->markAsFailed($e->getMessage());
            }
            
            throw $e;
        }
    }
} 