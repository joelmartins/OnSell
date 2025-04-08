<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;
use App\Jobs\ScheduledCampaignChecker;
use App\Jobs\ProcessPendingMessages;

class Kernel extends ConsoleKernel
{
    /**
     * Define the application's command schedule.
     */
    protected function schedule(Schedule $schedule): void
    {
        // Verificar campanhas agendadas a cada 5 minutos
        $schedule->job(new ScheduledCampaignChecker)->everyFiveMinutes();
        
        // Processar mensagens pendentes a cada minuto
        $schedule->job(new ProcessPendingMessages)->everyMinute();
        
        // Garantir que a fila está sendo processada
        $schedule->command('queue:work --stop-when-empty --tries=3')->everyMinute();
    }

    /**
     * Register the commands for the application.
     */
    protected function commands(): void
    {
        $this->load(__DIR__.'/Commands');

        require base_path('routes/console.php');
    }
} 