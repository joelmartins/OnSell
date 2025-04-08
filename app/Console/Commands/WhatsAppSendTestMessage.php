<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\EvolutionApiService;

class WhatsAppSendTestMessage extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'whatsapp:send-test-message 
                            {--to= : Número de telefone do destinatário (com código do país)}
                            {--message= : Mensagem a ser enviada}
                            {--instance=default : Nome da instância da Evolution API}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Envia uma mensagem de teste via WhatsApp usando a Evolution API';

    /**
     * Execute the console command.
     */
    public function handle(EvolutionApiService $evolutionApiService)
    {
        $to = $this->option('to');
        $message = $this->option('message');
        $instanceName = $this->option('instance');
        
        if (!$to) {
            $to = $this->ask('Digite o número de telefone do destinatário (com código do país, ex: 5511999999999):');
        }
        
        if (!$message) {
            $message = $this->ask('Digite a mensagem que deseja enviar:');
        }
        
        $this->info('Verificando status da conexão com o WhatsApp...');
        
        $statusResult = $evolutionApiService->checkInstanceStatus($instanceName);
        
        if (!$statusResult['success'] || !($statusResult['connected'] ?? false)) {
            $this->error('❌ Instância não está conectada ao WhatsApp. Conecte-a primeiro antes de enviar mensagens.');
            
            if ($this->confirm('Deseja gerar um QR Code para conectar?', true)) {
                $qrResult = $evolutionApiService->getQrCode($instanceName);
                
                if ($qrResult['success']) {
                    $this->info('✅ QR Code gerado com sucesso:');
                    $this->line($qrResult['qrcode'] ?? 'QR Code não disponível em formato de texto');
                    
                    $this->info('Escaneie o QR Code com seu WhatsApp e tente novamente após conectar.');
                } else {
                    $this->error('❌ Falha ao gerar QR Code: ' . ($qrResult['error'] ?? 'Erro desconhecido'));
                }
            }
            
            return 1;
        }
        
        $this->info('Enviando mensagem...');
        
        $result = $evolutionApiService->sendTextMessage($to, $message, $instanceName);
        
        if ($result['success']) {
            $this->info('✅ Mensagem enviada com sucesso!');
            $this->info('ID da mensagem: ' . ($result['message_id'] ?? 'Não disponível'));
        } else {
            $this->error('❌ Falha ao enviar mensagem: ' . ($result['error'] ?? 'Erro desconhecido'));
        }
        
        return 0;
    }
} 