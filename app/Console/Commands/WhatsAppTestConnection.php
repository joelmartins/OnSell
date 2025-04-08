<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\EvolutionApiService;

class WhatsAppTestConnection extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'whatsapp:test-connection {--instance=default : Nome da instância da Evolution API}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Testa a conexão com a Evolution API (WhatsApp)';

    /**
     * Execute the console command.
     */
    public function handle(EvolutionApiService $evolutionApiService)
    {
        $this->info('Testando conexão com a Evolution API...');
        
        $instanceName = $this->option('instance');
        
        $this->info("Verificando status da instância: {$instanceName}");
        
        $result = $evolutionApiService->checkInstanceStatus($instanceName);
        
        if ($result['success']) {
            $this->info('✅ Conexão estabelecida com sucesso!');
            $this->info('Status da instância: ' . $result['status']);
            
            if ($result['connected']) {
                $this->info('✅ Instância está conectada ao WhatsApp.');
            } else {
                $this->warn('⚠️ Instância não está conectada ao WhatsApp.');
                
                $this->info('Gerando QR Code para conexão...');
                $qrResult = $evolutionApiService->getQrCode($instanceName);
                
                if ($qrResult['success']) {
                    $this->info('✅ QR Code gerado com sucesso:');
                    $this->line($qrResult['qrcode'] ?? 'QR Code não disponível em formato de texto');
                    
                    if (isset($qrResult['base64'])) {
                        $this->info('QR Code (base64) disponível. Você pode gerar uma imagem a partir deste código.');
                    }
                } else {
                    $this->error('❌ Falha ao gerar QR Code: ' . ($qrResult['error'] ?? 'Erro desconhecido'));
                }
            }
        } else {
            $this->error('❌ Falha na conexão: ' . ($result['error'] ?? 'Erro desconhecido'));
            
            $this->info('Tentando iniciar a instância...');
            $startResult = $evolutionApiService->startInstance($instanceName);
            
            if ($startResult['success']) {
                $this->info('✅ Instância iniciada com sucesso!');
                $this->info('Tente executar o comando novamente para verificar o status.');
            } else {
                $this->error('❌ Falha ao iniciar instância: ' . ($startResult['error'] ?? 'Erro desconhecido'));
            }
        }
        
        return 0;
    }
} 