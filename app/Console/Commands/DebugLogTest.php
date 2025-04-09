<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class DebugLogTest extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'log:debug {message?} {--user_id=} {--email=} {--ip=}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Registra uma mensagem no canal de debug para teste';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $message = $this->argument('message') ?? 'Teste de mensagem de debug padrão';
        $userId = $this->option('user_id');
        $email = $this->option('email');
        $ip = $this->option('ip');
        
        $context = [
            'timestamp' => now()->toDateTimeString(),
            'env' => app()->environment(),
        ];
        
        if ($userId) {
            $context['user_id'] = $userId;
        }
        
        if ($email) {
            $context['email'] = $email;
        }
        
        if ($ip) {
            $context['ip'] = $ip;
        }
        
        // Log no canal de debug
        Log::channel('debug')->debug($message, $context);
        
        // Log no canal de audit
        Log::channel('audit')->info($message, $context);
        
        // Log no canal de system 
        Log::info($message, $context);
        
        $this->info('Mensagens de log registradas com sucesso!');
        $this->info('Pode verificar os arquivos em:');
        $this->line(' - storage/logs/debug-' . now()->format('Y-m-d') . '.log');
        $this->line(' - storage/logs/audit-' . now()->format('Y-m-d') . '.log');
        $this->line(' - storage/logs/laravel-' . now()->format('Y-m-d') . '.log');
        
        return Command::SUCCESS;
    }
}
