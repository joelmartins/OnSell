<?php

namespace App\Console\Commands;

use App\Models\Client;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class FixClientSoftDelete extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'clients:fix-soft-delete {--force : Força a exclusão definitiva dos clientes}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Verifica e corrige problemas com soft delete de clientes';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Verificando status do soft delete de clientes...');

        // 1. Verificar se há clientes com deleted_at não nulo mas que ainda aparecem nas consultas
        $this->info('Verificando clientes com problemas de soft delete...');
        
        // Verificar diretamente no banco usando queries brutas
        $problemClients = DB::table('clients')
            ->whereNotNull('deleted_at')
            ->get();
        
        if ($problemClients->isEmpty()) {
            $this->info('Não foram encontrados clientes excluídos no banco de dados.');
            return 0;
        }
        
        $this->info("Encontrados {$problemClients->count()} clientes com soft delete.");
        
        // Listar os clientes com problema
        $headers = ['ID', 'Nome', 'Email', 'Agência ID', 'Excluído em'];
        
        $rows = $problemClients->map(function ($client) {
            return [
                $client->id,
                $client->name,
                $client->email ?? 'N/A',
                $client->agency_id,
                $client->deleted_at,
            ];
        });
        
        $this->table($headers, $rows);
        
        // Verificar se precisa forçar a exclusão definitiva
        if ($this->option('force')) {
            if ($this->confirm('Tem certeza que deseja excluir permanentemente os clientes listados?')) {
                $this->info('Excluindo permanentemente os clientes...');
                
                foreach ($problemClients as $client) {
                    // Forçar a exclusão definitiva
                    $deleted = DB::table('clients')
                        ->where('id', $client->id)
                        ->delete();
                    
                    $this->info("Cliente ID {$client->id} excluído: " . ($deleted ? 'Sim' : 'Não'));
                }
                
                $this->info('Operação concluída!');
            }
        } else {
            $this->info('Para excluir definitivamente os clientes, execute o comando com a opção --force');
        }
        
        return 0;
    }
}
