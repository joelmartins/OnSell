<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class WebhookTestController extends Controller
{
    /**
     * Registra os dados recebidos de um webhook para testes
     */
    public function testReceive(Request $request)
    {
        // Obtém todos os dados da requisição
        $data = $request->all();
        
        // Obtém cabeçalhos importantes
        $headers = [
            'content-type' => $request->header('content-type'),
            'user-agent' => $request->header('user-agent'),
            'x-forwarded-for' => $request->header('x-forwarded-for'),
            'x-webhook-id' => $request->header('webhook-id'),
            'x-webhook-source' => $request->header('webhook-source')
        ];
        
        // Registra os dados no log
        Log::channel('webhook')->info('Requisição de webhook de teste recebida', [
            'method' => $request->method(),
            'path' => $request->path(),
            'headers' => $headers,
            'data' => $data,
            'ip' => $request->ip(),
        ]);
        
        // Retorna uma resposta de sucesso
        return response()->json([
            'success' => true,
            'message' => 'Webhook recebido e registrado',
            'timestamp' => now()->toIso8601String(),
            'request_id' => uniqid('webhook_'),
        ]);
    }
    
    /**
     * Página para visualizar webhooks recebidos
     */
    public function viewWebhooks()
    {
        // Esta é uma página simples para verificar se há webhooks registrados
        // Em um ambiente de produção, você teria um painel mais elaborado
        
        // Aqui apenas verificaremos se o arquivo de log existe e mostraremos seu conteúdo
        $logPath = storage_path('logs/webhook.log');
        $logs = [];
        
        if (file_exists($logPath)) {
            // Lê as últimas 50 linhas do arquivo de log
            $lines = array_slice(file($logPath), -50);
            
            foreach ($lines as $line) {
                if (trim($line)) {
                    $logs[] = $line;
                }
            }
            
            // Inverte para mostrar os mais recentes primeiro
            $logs = array_reverse($logs);
        }
        
        return view('webhook-test', [
            'webhooks' => $logs
        ]);
    }
} 