<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use App\Models\CampaignMessage;
use App\Services\MessageService;
use Illuminate\Support\Facades\Log;
use Stancl\Tenancy\Tenancy;

class ProcessPendingMessages implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $batchSize = 200;

    /**
     * Create a new job instance.
     */
    public function __construct()
    {
        // Este job não precisa de parâmetros, apenas processa mensagens pendentes
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
            
            // Processar cada tenant
            foreach ($tenants as $tenant) {
                $tenancy->initialize($tenant);
                $this->processPendingMessages();
            }
            
            // Restaurar para o tenant central (se necessário)
            $tenancy->end();
        } else {
            // Se não estiver usando multi-tenancy, processar diretamente
            $this->processPendingMessages();
        }
    }
    
    /**
     * Processar mensagens pendentes.
     *
     * @return void
     */
    protected function processPendingMessages(): void
    {
        try {
            // Buscar mensagens pendentes de envio
            $messages = CampaignMessage::shouldSend()
                ->take($this->batchSize)
                ->get();
            
            if ($messages->isEmpty()) {
                return;
            }
            
            Log::info("Processando mensagens pendentes", [
                'count' => $messages->count()
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
            
            Log::info("Resultado do processamento de mensagens pendentes", [
                'total' => $results['total'],
                'success' => $results['success'],
                'failed' => $results['failed']
            ]);
        } catch (\Exception $e) {
            Log::error("Erro ao processar mensagens pendentes: " . $e->getMessage(), [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
        }
    }
} 