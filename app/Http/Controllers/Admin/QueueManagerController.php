<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class QueueManagerController extends Controller
{
    /**
     * Exibe a tela de gerenciamento de filas
     */
    public function index()
    {
        // Buscar jobs na fila
        $pendingJobs = DB::table('jobs')
            ->select(DB::raw('queue, count(*) as count, min(available_at) as next_job'))
            ->groupBy('queue')
            ->get()
            ->map(function ($queue) {
                return [
                    'queue' => $queue->queue,
                    'count' => $queue->count,
                    'next_job' => $queue->next_job ? date('d/m/Y H:i:s', $queue->next_job) : null,
                ];
            });

        // Buscar jobs que falharam
        $failedJobs = DB::table('failed_jobs')
            ->orderBy('failed_at', 'desc')
            ->limit(50)
            ->get()
            ->map(function ($job) {
                return [
                    'id' => $job->id,
                    'uuid' => $job->uuid,
                    'connection' => $job->connection,
                    'queue' => $job->queue,
                    'failed_at' => $job->failed_at,
                    'exception' => substr($job->exception, 0, 200) . (strlen($job->exception) > 200 ? '...' : ''),
                    'payload' => json_decode($job->payload, true),
                ];
            });

        // Buscar status dos jobs em batch
        $batches = DB::table('job_batches')
            ->orderBy('created_at', 'desc')
            ->limit(20)
            ->get()
            ->map(function ($batch) {
                return [
                    'id' => $batch->id,
                    'name' => $batch->name,
                    'total_jobs' => $batch->total_jobs,
                    'pending_jobs' => $batch->pending_jobs,
                    'failed_jobs' => $batch->failed_jobs,
                    'created_at' => date('d/m/Y H:i:s', $batch->created_at),
                    'finished_at' => $batch->finished_at ? date('d/m/Y H:i:s', $batch->finished_at) : null,
                    'cancelled_at' => $batch->cancelled_at ? date('d/m/Y H:i:s', $batch->cancelled_at) : null,
                    'progress' => $batch->total_jobs > 0 
                        ? round(($batch->total_jobs - $batch->pending_jobs) / $batch->total_jobs * 100) 
                        : 0,
                    'status' => $this->getBatchStatus($batch),
                ];
            });

        // Estatísticas gerais
        $stats = [
            'total_pending' => DB::table('jobs')->count(),
            'total_failed' => DB::table('failed_jobs')->count(),
            'total_batches' => DB::table('job_batches')->count(),
            'active_batches' => DB::table('job_batches')
                ->whereNull('finished_at')
                ->whereNull('cancelled_at')
                ->count(),
        ];

        return Inertia::render('Admin/Settings/QueueManager', [
            'pendingJobs' => $pendingJobs,
            'failedJobs' => $failedJobs,
            'batches' => $batches,
            'stats' => $stats,
        ]);
    }

    /**
     * Limpa todos os jobs falhos
     */
    public function flushFailed()
    {
        Artisan::call('queue:flush');
        
        return back()->with('success', 'Todos os jobs falhos foram removidos.');
    }

    /**
     * Tenta executar novamente um job que falhou
     */
    public function retryFailed(Request $request)
    {
        $id = $request->input('id');
        
        if ($id) {
            Artisan::call('queue:retry', ['id' => [$id]]);
            return back()->with('success', 'Job enviado para reprocessamento.');
        } else {
            Artisan::call('queue:retry all');
            return back()->with('success', 'Todos os jobs falhos foram enviados para reprocessamento.');
        }
    }

    /**
     * Cancela todos os jobs pendentes de uma fila
     */
    public function purgeQueue(Request $request)
    {
        $queue = $request->input('queue', 'default');
        
        DB::table('jobs')->where('queue', $queue)->delete();
        
        return back()->with('success', "Fila '$queue' foi limpa.");
    }

    /**
     * Reinicia o worker de filas
     */
    public function restartWorker()
    {
        // No ambiente de produção, isso pode variar dependendo da configuração
        // Por exemplo, isso pode enviar um sinal ao supervisor para reiniciar
        Artisan::call('queue:restart');
        
        return back()->with('success', 'Worker de filas reiniciado.');
    }

    /**
     * Obtém o status de um batch
     */
    private function getBatchStatus($batch)
    {
        if ($batch->cancelled_at) {
            return 'Cancelado';
        }
        
        if ($batch->finished_at) {
            if ($batch->failed_jobs > 0) {
                return 'Concluído com falhas';
            }
            return 'Concluído';
        }
        
        if ($batch->pending_jobs > 0) {
            return 'Em execução';
        }
        
        return 'Aguardando';
    }

    /**
     * Força o processamento imediato dos jobs pendentes
     */
    public function forceProcess(Request $request)
    {
        $queue = $request->input('queue', 'default');
        $count = $request->input('count', 5);
        
        // Limita a quantidade de jobs para evitar timeout
        $count = min($count, 20);
        
        // Executa o comando para processar os jobs imediatamente
        // --once processa apenas um job por worker
        // --stop-when-empty para quando não houver mais jobs
        Artisan::call('queue:work', [
            '--queue' => $queue,
            '--once' => true,
            '--tries' => 1,
            '--stop-when-empty' => true,
        ]);
        
        // Para processar múltiplos jobs, chamamos o comando várias vezes
        $processed = 1;
        for ($i = 1; $i < $count; $i++) {
            // Verifica se ainda há jobs na fila
            $pendingCount = DB::table('jobs')->where('queue', $queue)->count();
            if ($pendingCount === 0) {
                break;
            }
            
            Artisan::call('queue:work', [
                '--queue' => $queue,
                '--once' => true,
                '--tries' => 1,
                '--stop-when-empty' => true,
            ]);
            
            $processed++;
        }
        
        return back()->with('success', "Processamento forçado de {$processed} job(s) na fila '{$queue}'.");
    }
} 