<?php

namespace App\Console\Commands;

use App\Models\Client;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ForceDeleteClients extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'clients:force-delete {--days=30 : Excluir clientes apagados há mais de X dias}
                           {--client_id= : ID específico do cliente para excluir permanentemente}
                           {--agency_id= : Filtrar por ID da agência}
                           {--all : Excluir permanentemente todos os clientes soft-deleted}
                           {--dry-run : Simular a operação sem excluir os dados}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Exclui permanentemente clientes que foram removidos via soft delete';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        if (!$this->option('client_id') && !$this->option('agency_id') && !$this->option('all')) {
            $this->error('É necessário especificar pelo menos um dos parâmetros: --client_id, --agency_id ou --all');
            return 1;
        }
        
        // Iniciar a query base
        $query = Client::onlyTrashed();
        
        // Aplicar filtros
        if ($this->option('client_id')) {
            $query->where('id', $this->option('client_id'));
        }
        
        if ($this->option('agency_id')) {
            $query->where('agency_id', $this->option('agency_id'));
        }
        
        // Filtrar por data de exclusão
        if (!$this->option('all') && !$this->option('client_id')) {
            $days = $this->option('days');
            $cutoffDate = Carbon::now()->subDays($days);
            $query->where('deleted_at', '<', $cutoffDate);
            
            $this->info("Buscando clientes excluídos há mais de {$days} dias (antes de {$cutoffDate->format('d/m/Y')})");
        }
        
        // Obter os clientes a serem excluídos
        $clients = $query->get();
        
        if ($clients->isEmpty()) {
            $this->info('Nenhum cliente encontrado para exclusão permanente.');
            return 0;
        }
        
        $this->info("Encontrados {$clients->count()} clientes para exclusão permanente.");
        
        // Mostrar lista de clientes
        $headers = ['ID', 'Nome', 'Email', 'Agência ID', 'Excluído em'];
        
        $rows = $clients->map(function ($client) {
            return [
                $client->id,
                $client->name,
                $client->email ?? 'N/A',
                $client->agency_id,
                $client->deleted_at->format('d/m/Y H:i:s'),
            ];
        });
        
        $this->table($headers, $rows);
        
        // Verificar se é apenas simulação
        if ($this->option('dry-run')) {
            $this->info('Modo de simulação ativado. Nenhum dado foi excluído.');
            return 0;
        }
        
        // Confirmar exclusão permanente
        if (!$this->confirm('Tem certeza que deseja excluir permanentemente estes clientes?')) {
            $this->info('Operação cancelada pelo usuário.');
            return 0;
        }
        
        // Realizar exclusão permanente
        $count = 0;
        foreach ($clients as $client) {
            try {
                // Log antes da exclusão permanente
                Log::channel('audit')->info('Iniciando exclusão permanente de cliente', [
                    'client_id' => $client->id,
                    'client_name' => $client->name,
                    'agency_id' => $client->agency_id,
                    'command' => 'clients:force-delete'
                ]);
                
                // Excluir permanentemente
                $client->forceDelete();
                
                // Incrementar contador
                $count++;
                
                // Feedback para o console
                $this->info("Cliente ID {$client->id} ({$client->name}) excluído permanentemente.");
                
                // Log após a exclusão
                Log::channel('audit')->info('Cliente excluído permanentemente', [
                    'client_id' => $client->id,
                    'client_name' => $client->name,
                    'agency_id' => $client->agency_id,
                    'command' => 'clients:force-delete'
                ]);
            } catch (\Exception $e) {
                $this->error("Erro ao excluir cliente ID {$client->id}: {$e->getMessage()}");
                
                Log::channel('audit')->error('Erro ao excluir permanentemente cliente', [
                    'client_id' => $client->id,
                    'client_name' => $client->name,
                    'agency_id' => $client->agency_id,
                    'error' => $e->getMessage(),
                    'command' => 'clients:force-delete'
                ]);
            }
        }
        
        $this->info("Operação concluída. {$count} clientes foram excluídos permanentemente.");
        
        return 0;
    }
}
