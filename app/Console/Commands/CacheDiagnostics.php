<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Redis;

class CacheDiagnostics extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'cache:diagnostics {--flush : Limpar todos os caches}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Diagnóstico e manutenção de caches do sistema';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('===== Diagnóstico de Cache e Sessão =====');
        
        // Mostrar informações de configuração de cache
        $this->info("\nConfiguração de cache:");
        $cacheConfig = Config::get('cache');
        $this->table(
            ['Parâmetro', 'Valor'],
            [
                ['Driver Default', $cacheConfig['default']],
                ['Store', json_encode($cacheConfig['stores'][$cacheConfig['default']])],
                ['Prefix', $cacheConfig['prefix']],
            ]
        );
        
        // Mostrar informações de configuração de sessão
        $this->info("\nConfiguração de sessão:");
        $sessionConfig = Config::get('session');
        $this->table(
            ['Parâmetro', 'Valor'],
            [
                ['Driver', $sessionConfig['driver']],
                ['Lifetime (minutos)', $sessionConfig['lifetime']],
                ['Expire on Close', $sessionConfig['expire_on_close'] ? 'Sim' : 'Não'],
                ['Path', $sessionConfig['path']],
                ['Domain', $sessionConfig['domain'] ?? 'Não configurado'],
                ['Secure', $sessionConfig['secure'] ? 'Sim' : 'Não'],
                ['HTTP Only', $sessionConfig['http_only'] ? 'Sim' : 'Não'],
                ['Same Site', $sessionConfig['same_site'] ?? 'Não configurado'],
                ['Store', $sessionConfig['store'] ?? 'Não configurado (usa o driver padrão)'],
                ['Cookie Name', $sessionConfig['cookie']],
                ['Lottery', implode('/', $sessionConfig['lottery'])],
                ['Connection (se DB)', $sessionConfig['connection'] ?? 'Não configurado'],
                ['Table (se DB)', $sessionConfig['table']],
            ]
        );
        
        // Checar se o diretório de sessões existe
        if ($sessionConfig['driver'] === 'file') {
            $sessionPath = storage_path('framework/sessions');
            $this->info("\nDiretório de sessões ({$sessionPath}):");
            
            if (file_exists($sessionPath)) {
                $files = count(glob($sessionPath . '/*'));
                $this->info("- Diretório existe e contém {$files} arquivos de sessão");
                
                // Mostrar alguns arquivos de sessão como exemplo se existirem
                $sessionFiles = glob($sessionPath . '/*', GLOB_NOSORT);
                if (!empty($sessionFiles)) {
                    $this->info("\nExemplos de sessões armazenadas:");
                    $samples = array_slice($sessionFiles, 0, 3);
                    
                    foreach ($samples as $sessionFile) {
                        if (file_exists($sessionFile)) {
                            $fileName = basename($sessionFile);
                            $content = @file_get_contents($sessionFile);
                            $size = filesize($sessionFile);
                            $lastModified = date('Y-m-d H:i:s', filemtime($sessionFile));
                            
                            $this->info("Arquivo: {$fileName}");
                            $this->info("Tamanho: {$size} bytes");
                            $this->info("Última modificação: {$lastModified}");
                            $this->info("Conteúdo: " . (empty($content) ? "Vazio" : "Contém dados (serializado)"));
                            $this->line("------");
                        }
                    }
                }
            } else {
                $this->error("- Diretório de sessões não existe em {$sessionPath}!");
            }
        } elseif ($sessionConfig['driver'] === 'redis') {
            $this->info("\nVerificando conexão Redis:");
            try {
                $redis = Redis::connection();
                $ping = $redis->ping();
                $this->info("- Conexão Redis OK: " . ($ping === true || $ping === "PONG" ? "Resposta PONG" : $ping));
            } catch (\Exception $e) {
                $this->error("- Erro de conexão com Redis: " . $e->getMessage());
            }
        }
        
        // Estado do framework
        $this->info("\nVerificando diretórios de estado do Framework:");
        $frameworkDirs = [
            'Cache' => storage_path('framework/cache'),
            'Views' => storage_path('framework/views'),
            'Sessions' => storage_path('framework/sessions'),
        ];
        
        foreach ($frameworkDirs as $name => $dir) {
            if (file_exists($dir)) {
                $files = count(glob($dir . '/*'));
                $this->info("- {$name}: Diretório OK ({$files} arquivos)");
            } else {
                $this->error("- {$name}: Diretório não existe em {$dir}!");
            }
        }
        
        // Diagnóstico completo
        if ($this->option('flush')) {
            $this->info("\n===== Limpeza de Cache e Sessão =====");
            
            if ($this->confirm("Confirma a limpeza dos caches e sessões?")) {
                // Limpar cache
                $this->info("Limpando cache...");
                Cache::flush();
                
                // Limpar arquivos de sessão
                if ($sessionConfig['driver'] === 'file') {
                    $sessionPath = storage_path('framework/sessions');
                    $this->info("Limpando arquivos de sessão...");
                    
                    $sessionFiles = glob($sessionPath . '/*');
                    $count = 0;
                    foreach ($sessionFiles as $file) {
                        if (is_file($file) && unlink($file)) {
                            $count++;
                        }
                    }
                    $this->info("- {$count} arquivos de sessão removidos");
                }
                
                // Limpar visualizações compiladas
                $this->info("Limpando visualizações compiladas...");
                $this->call('view:clear');
                
                $this->info("\nLimpeza concluída com sucesso!");
            } else {
                $this->info("Operação de limpeza cancelada.");
            }
        }
        
        return 0;
    }
}
