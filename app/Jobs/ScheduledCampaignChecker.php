<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use App\Models\Campaign;
use Illuminate\Support\Facades\Log;
use Stancl\Tenancy\Tenancy;

class ScheduledCampaignChecker implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Create a new job instance.
     */
    public function __construct()
    {
        // Este job não precisa de parâmetros pois apenas verifica campanhas agendadas
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        // Este job deve ser executado em todos os tenants
        if (app()->has('tenancy')) {
            $tenancy = app(Tenancy::class);
            $tenants = \Stancl\Tenancy\Models\Tenant::all();
            
            // Verificar cada tenant
            foreach ($tenants as $tenant) {
                $tenancy->initialize($tenant);
                $this->checkScheduledCampaigns();
            }
            
            // Restaurar para o tenant central (se necessário)
            $tenancy->end();
        } else {
            // Se não estiver usando multi-tenancy, verificar diretamente
            $this->checkScheduledCampaigns();
        }
    }
    
    /**
     * Verificar campanhas agendadas e disparar processamento se necessário.
     *
     * @return void
     */
    protected function checkScheduledCampaigns(): void
    {
        try {
            // Buscar campanhas que devem iniciar agora
            $campaigns = Campaign::shouldStart()->get();
            
            if ($campaigns->isEmpty()) {
                return;
            }
            
            Log::info("Verificando campanhas agendadas", [
                'count' => $campaigns->count()
            ]);
            
            foreach ($campaigns as $campaign) {
                // Disparar o job de processamento
                ProcessCampaign::dispatch($campaign->id);
                
                Log::info("Campanha agendada iniciada", [
                    'campaign_id' => $campaign->id,
                    'name' => $campaign->name
                ]);
            }
        } catch (\Exception $e) {
            Log::error("Erro ao verificar campanhas agendadas: " . $e->getMessage(), [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
        }
    }
} 