<?php

namespace App\Console\Commands;

use App\Models\Client;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class ShowTrashedClients extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'clients:show-trashed 
                           {--agency_id= : Filtrar por ID da agência}
                           {--days= : Filtrar clientes excluídos nos últimos X dias}
                           {--restore= : ID do cliente para restaurar}
                           {--restore-all : Restaurar todos os clientes listados}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Mostrar clientes excluídos por soft delete e restaurar se solicitado';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        // Verificar se é para restaurar um cliente específico
        if ($this->option('restore')) {
            return $this->restoreClient($this->option('restore'));
        }
        
        // Iniciar a query
        $query = Client::onlyTrashed();
        
        // Filtrar por agência
        if ($this->option('agency_id')) {
            $agencyId = $this->option('agency_id');
            $query->where('agency_id', $agencyId);
            $this->info("Filtrando por agência ID: {$agencyId}");
        }
        
        // Filtrar por data de exclusão
        if ($this->option('days')) {
            $days = $this->option('days');
            $cutoffDate = Carbon::now()->subDays($days);
            $query->where('deleted_at', '>=', $cutoffDate);
            $this->info("Mostrando clientes excluídos nos últimos {$days} dias (após {$cutoffDate->format('d/m/Y')})");
        }
        
        $clients = $query->get();
        
        if ($clients->isEmpty()) {
            $this->info('Nenhum cliente excluído por soft delete encontrado.');
            return 0;
        }
        
        $this->info("Encontrados {$clients->count()} clientes excluídos (soft delete).");
        
        $headers = ['ID', 'Nome', 'Email', 'Agência ID', 'Status', 'Excluído em', 'Dias desde exclusão'];
        
        $rows = $clients->map(function ($client) {
            $deletedDays = Carbon::parse($client->deleted_at)->diffInDays(Carbon::now());
            return [
                $client->id,
                $client->name,
                $client->email ?? 'N/A',
                $client->agency_id,
                $client->is_active ? 'Ativo' : 'Inativo',
                $client->deleted_at->format('d/m/Y H:i:s'),
                $deletedDays,
            ];
        });
        
        $this->table($headers, $rows);
        
        // Verificar se é para restaurar todos
        if ($this->option('restore-all')) {
            if ($this->confirm('Tem certeza que deseja restaurar todos os ' . $clients->count() . ' clientes listados?')) {
                $successCount = 0;
                
                foreach ($clients as $client) {
                    try {
                        // Log antes da restauração
                        Log::channel('audit')->info('Iniciando restauração de cliente excluído', [
                            'client_id' => $client->id,
                            'client_name' => $client->name,
                            'agency_id' => $client->agency_id,
                            'command' => 'clients:show-trashed'
                        ]);
                        
                        // Restaurar o cliente
                        $client->restore();
                        $successCount++;
                        
                        $this->info("Cliente ID {$client->id} ({$client->name}) restaurado com sucesso.");
                        
                        // Log após a restauração
                        Log::channel('audit')->info('Cliente restaurado com sucesso', [
                            'client_id' => $client->id,
                            'client_name' => $client->name,
                            'agency_id' => $client->agency_id,
                            'command' => 'clients:show-trashed'
                        ]);
                    } catch (\Exception $e) {
                        $this->error("Erro ao restaurar cliente ID {$client->id}: {$e->getMessage()}");
                        
                        Log::channel('audit')->error('Erro ao restaurar cliente', [
                            'client_id' => $client->id,
                            'client_name' => $client->name,
                            'agency_id' => $client->agency_id,
                            'error' => $e->getMessage(),
                            'command' => 'clients:show-trashed'
                        ]);
                    }
                }
                
                $this->info("Restauração concluída. {$successCount} de {$clients->count()} clientes foram restaurados.");
            } else {
                $this->info('Operação de restauração cancelada pelo usuário.');
            }
        } else {
            $this->info('Para restaurar um cliente específico, use --restore=ID');
            $this->info('Para restaurar todos os clientes listados, use --restore-all');
        }
        
        return 0;
    }
    
    /**
     * Restaura um cliente específico pelo ID
     */
    private function restoreClient($clientId)
    {
        $client = Client::onlyTrashed()->find($clientId);
        
        if (!$client) {
            $this->error("Cliente ID {$clientId} não encontrado ou não está excluído.");
            return 1;
        }
        
        $this->info("Cliente encontrado: ID {$client->id}, Nome {$client->name}");
        
        if ($this->confirm("Tem certeza que deseja restaurar o cliente {$client->name}?")) {
            try {
                // Log antes da restauração
                Log::channel('audit')->info('Iniciando restauração de cliente específico', [
                    'client_id' => $client->id,
                    'client_name' => $client->name,
                    'agency_id' => $client->agency_id,
                    'command' => 'clients:show-trashed'
                ]);
                
                // Restaurar o cliente
                $client->restore();
                
                $this->info("Cliente ID {$client->id} ({$client->name}) restaurado com sucesso.");
                
                // Log após a restauração
                Log::channel('audit')->info('Cliente restaurado com sucesso', [
                    'client_id' => $client->id,
                    'client_name' => $client->name,
                    'agency_id' => $client->agency_id,
                    'command' => 'clients:show-trashed'
                ]);
                
                return 0;
            } catch (\Exception $e) {
                $this->error("Erro ao restaurar cliente ID {$client->id}: {$e->getMessage()}");
                
                Log::channel('audit')->error('Erro ao restaurar cliente específico', [
                    'client_id' => $client->id,
                    'client_name' => $client->name,
                    'agency_id' => $client->agency_id,
                    'error' => $e->getMessage(),
                    'command' => 'clients:show-trashed'
                ]);
                
                return 1;
            }
        } else {
            $this->info('Operação de restauração cancelada pelo usuário.');
            return 0;
        }
    }
}
