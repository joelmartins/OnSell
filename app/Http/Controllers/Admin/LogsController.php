<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use OwenIt\Auditing\Models\Audit;
use Carbon\Carbon;

class LogsController extends Controller
{
    /**
     * Exibe a página de logs
     */
    public function index()
    {
        // Registra a visualização da página
        Log::channel('audit')->info('Acessou a página de logs do sistema', [
            'user_id' => Auth::id(),
            'email' => Auth::user()->email,
            'ip' => request()->ip()
        ]);
        
        return inertia('Admin/Settings/Logs');
    }
    
    /**
     * Obtém os logs do sistema com base nos filtros
     */
    public function getLogs(Request $request)
    {
        // Validar os filtros
        $validator = Validator::make($request->all(), [
            'type' => ['nullable', 'string'],
            'level' => ['nullable', 'string'],
            'dateFrom' => ['nullable', 'date'],
            'dateTo' => ['nullable', 'date'],
            'search' => ['nullable', 'string'],
            'page' => ['nullable', 'integer', 'min:1'],
            'per_page' => ['nullable', 'integer', 'min:10', 'max:100'],
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Parâmetros de filtro inválidos',
                'errors' => $validator->errors()
            ], 422);
        }
        
        // Registrar pesquisa
        Log::channel('audit')->info('Pesquisou logs do sistema', [
            'user_id' => Auth::id(),
            'email' => Auth::user()->email,
            'ip' => request()->ip(),
            'filters' => $request->all()
        ]);
        
        // Definir valores padrão
        $type = $request->input('type', 'all');
        $level = $request->input('level', 'all');
        $dateFrom = $request->input('dateFrom');
        $dateTo = $request->input('dateTo');
        $search = $request->input('search');
        $perPage = $request->input('per_page', 25);
        $page = $request->input('page', 1);
        
        try {
            // Inicializar array para armazenar logs
            $allLogs = [];
            
            // 1. Obter logs de auditoria do banco de dados
            $auditQuery = Audit::query()->with('user');
            
            // Aplicar filtros
            if ($search) {
                $auditQuery->where(function ($query) use ($search) {
                    $query->where('event', 'like', "%{$search}%")
                          ->orWhere('auditable_type', 'like', "%{$search}%")
                          ->orWhere('user_id', 'like', "%{$search}%")
                          ->orWhere('url', 'like', "%{$search}%")
                          ->orWhere('ip_address', 'like', "%{$search}%")
                          ->orWhere('user_agent', 'like', "%{$search}%");
                });
            }
            
            if ($dateFrom) {
                $auditQuery->whereDate('created_at', '>=', $dateFrom);
            }
            
            if ($dateTo) {
                $auditQuery->whereDate('created_at', '<=', $dateTo);
            }
            
            // Obter resultados e formatar
            $auditLogs = $auditQuery->orderBy('created_at', 'desc')->get();
            
            foreach ($auditLogs as $audit) {
                $username = $audit->user ? $audit->user->name . ' (' . $audit->user->email . ')' : 'Sistema';
                
                $allLogs[] = [
                    'date' => $audit->created_at,
                    'message' => "Ação '{$audit->event}' em {$audit->auditable_type} #{$audit->auditable_id}",
                    'user' => $username,
                    'ip' => $audit->ip_address,
                    'type' => 'audit',
                    'level' => 'info',
                    'details' => json_encode([
                        'old_values' => $audit->old_values,
                        'new_values' => $audit->new_values,
                        'url' => $audit->url,
                        'user_agent' => $audit->user_agent,
                        'tags' => $audit->tags,
                    ])
                ];
            }
            
            // 2. Obter logs de arquivos
            $logFiles = [];
            $logPath = storage_path('logs');
            
            if (File::isDirectory($logPath)) {
                $logFiles = File::files($logPath);
            }
            
            foreach ($logFiles as $file) {
                $fileName = pathinfo($file, PATHINFO_FILENAME);
                $fileType = 'system';
                
                // Determinar o tipo de log com base no nome do arquivo
                if (Str::contains($fileName, 'laravel')) {
                    $fileType = 'system';
                } elseif (Str::contains($fileName, 'audit')) {
                    $fileType = 'audit';
                } elseif (Str::contains($fileName, 'auth')) {
                    $fileType = 'auth';
                } elseif (Str::contains($fileName, 'debug')) {
                    $fileType = 'debug';
                } elseif (Str::contains($fileName, 'user')) {
                    $fileType = 'user';
                }
                
                // Pular se estiver filtrando por tipo e não corresponder
                if ($type !== 'all' && $fileType !== $type) {
                    continue;
                }
                
                // Ler o conteúdo do arquivo
                $content = File::get($file);
                
                // Regex para extrair entradas de log
                $pattern = '/\[(\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2}\.?(\d*)?(?:[\+-]\d{4})?)\](.*?)(?=\[\d{4}-\d{2}-\d{2}|$)/s';
                preg_match_all($pattern, $content, $matches, PREG_SET_ORDER);
                
                foreach ($matches as $match) {
                    $dateStr = $match[1];
                    $message = trim($match[3]);
                    
                    // Ignorar entradas vazias
                    if (empty($message)) {
                        continue;
                    }
                    
                    // Extrair nível de log (info, error, etc)
                    $logLevel = 'info';
                    if (preg_match('/(emergency|alert|critical|error|warning|notice|info|debug)/', $message, $levelMatch)) {
                        $logLevel = strtolower($levelMatch[1]);
                    }
                    
                    // Pular se estiver filtrando por nível e não corresponder
                    if ($level !== 'all' && $logLevel !== $level) {
                        continue;
                    }
                    
                    // Extrair informações do usuário (procurar user_id, email, nome, etc)
                    $userInfo = '-';
                    preg_match_all('/(user_id|email)["\s:=>\[]+([^"\]\s,}]+)/i', $message, $userMatches, PREG_SET_ORDER);
                    if (!empty($userMatches)) {
                        $userParts = [];
                        foreach ($userMatches as $userMatch) {
                            $userParts[] = $userMatch[2];
                        }
                        $userInfo = implode(' | ', array_unique($userParts));
                    }
                    
                    // Extrair endereço IP
                    $ipAddress = '-';
                    if (preg_match('/(ip_address|ip)["\s:=>\[]+([0-9\.]+)/i', $message, $ipMatch)) {
                        $ipAddress = $ipMatch[2];
                    }
                    
                    // Remover dados técnicos da mensagem para torná-la mais legível
                    $cleanMessage = $message;
                    if (preg_match('/production\.(INFO|ERROR|WARNING|DEBUG|NOTICE|CRITICAL|ALERT|EMERGENCY):(.*?)(\{.*)/s', $message, $msgMatch)) {
                        $cleanMessage = trim($msgMatch[2]);
                        $logLevel = strtolower($msgMatch[1]);
                    }
                    
                    // Aplicar filtro de pesquisa, se especificado
                    if ($search && !Str::contains(strtolower($message), strtolower($search)) && 
                        !Str::contains(strtolower($userInfo), strtolower($search)) && 
                        !Str::contains(strtolower($ipAddress), strtolower($search))) {
                        continue;
                    }
                    
                    // Aplicar filtro de data, se especificado
                    $logDate = Carbon::parse($dateStr);
                    if ($dateFrom && $logDate->format('Y-m-d') < $dateFrom) {
                        continue;
                    }
                    
                    if ($dateTo && $logDate->format('Y-m-d') > $dateTo) {
                        continue;
                    }
                    
                    // Adicionar ao array de resultados
                    $allLogs[] = [
                        'date' => $logDate->toDateTimeString(),
                        'message' => $cleanMessage ?: $message,
                        'user' => $userInfo,
                        'ip' => $ipAddress,
                        'type' => $fileType,
                        'level' => $logLevel,
                        'details' => $message
                    ];
                }
            }
            
            // Ordenar logs por data (mais recentes primeiro)
            usort($allLogs, function($a, $b) {
                return strtotime($b['date']) - strtotime($a['date']);
            });
            
            // Implementar paginação manual
            $total = count($allLogs);
            $lastPage = ceil($total / $perPage);
            
            $offset = ($page - 1) * $perPage;
            $paginatedLogs = array_slice($allLogs, $offset, $perPage);
            
            return response()->json([
                'success' => true,
                'data' => [
                    'data' => $paginatedLogs,
                    'total' => $total,
                    'per_page' => $perPage,
                    'current_page' => $page,
                    'last_page' => $lastPage
                ]
            ]);
            
        } catch (\Exception $e) {
            Log::error('Erro ao obter logs: ' . $e->getMessage(), [
                'exception' => $e->getTraceAsString(),
                'user_id' => Auth::id(),
                'ip' => request()->ip()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Erro ao obter logs: ' . $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Exporta logs para um arquivo
     */
    public function exportLogs(Request $request)
    {
        // Validar os filtros
        $validator = Validator::make($request->all(), [
            'type' => ['nullable', 'string'],
            'level' => ['nullable', 'string'],
            'dateFrom' => ['nullable', 'date'],
            'dateTo' => ['nullable', 'date'],
            'search' => ['nullable', 'string'],
            'format' => ['nullable', 'string', Rule::in(['csv', 'json'])]
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Parâmetros de exportação inválidos',
                'errors' => $validator->errors()
            ], 422);
        }
        
        // Registrar exportação
        Log::channel('audit')->info('Exportou logs do sistema', [
            'user_id' => Auth::id(),
            'email' => Auth::user()->email,
            'ip' => request()->ip(),
            'filters' => $request->all()
        ]);
        
        // Obter os mesmos logs que seriam exibidos na interface
        $logsResponse = $this->getLogs($request);
        $logs = json_decode($logsResponse->getContent(), true)['data']['data'] ?? [];
        
        $format = $request->input('format', 'csv');
        $fileName = 'logs_' . Carbon::now()->format('Y-m-d_H-i-s');
        
        if ($format === 'csv') {
            $csv = "Data,Mensagem,Usuario,IP,Tipo,Nivel\n";
            
            foreach ($logs as $log) {
                // Escapar campos para evitar problemas com delimitadores
                $date = str_replace(',', ' ', $log['date']);
                $message = str_replace([',', "\n", "\r"], [' ', ' ', ''], $log['message']);
                $user = str_replace(',', ' ', $log['user'] ?? '-');
                $ip = str_replace(',', ' ', $log['ip'] ?? '-');
                $type = str_replace(',', ' ', $log['type'] ?? '-');
                $level = str_replace(',', ' ', $log['level'] ?? '-');
                
                $csv .= "{$date},{$message},{$user},{$ip},{$type},{$level}\n";
            }
            
            return response($csv)
                ->header('Content-Type', 'text/csv')
                ->header('Content-Disposition', "attachment; filename={$fileName}.csv");
                
        } else { // json
            return response()->json($logs)
                ->header('Content-Disposition', "attachment; filename={$fileName}.json");
        }
    }
    
    /**
     * Limpa logs antigos
     */
    public function clearOldLogs(Request $request)
    {
        // Validar solicitação
        $validator = Validator::make($request->all(), [
            'days' => ['required', 'integer', 'min:1', 'max:365'],
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Parâmetros de limpeza inválidos',
                'errors' => $validator->errors()
            ], 422);
        }
        
        $days = $request->input('days', 30);
        $cutoffDate = Carbon::now()->subDays($days);
        
        // Registrar ação
        Log::channel('audit')->info("Limpou logs do sistema mais antigos que {$days} dias", [
            'user_id' => Auth::id(),
            'email' => Auth::user()->email,
            'ip' => request()->ip(),
            'cutoff_date' => $cutoffDate->toDateString()
        ]);
        
        try {
            // 1. Limpar registros do banco de dados
            $deletedCount = Audit::where('created_at', '<', $cutoffDate)->delete();
            
            // 2. Limpar arquivos de log antigos
            $logPath = storage_path('logs');
            $filesDeleted = 0;
            
            if (File::isDirectory($logPath)) {
                $logFiles = File::files($logPath);
                
                foreach ($logFiles as $file) {
                    $filename = pathinfo($file, PATHINFO_FILENAME);
                    
                    // Pular o arquivo de log atual
                    if (Str::contains($filename, Carbon::now()->format('Y-m-d'))) {
                        continue;
                    }
                    
                    // Verificar se o arquivo é mais antigo que o limite
                    if (File::lastModified($file) < $cutoffDate->timestamp) {
                        File::delete($file);
                        $filesDeleted++;
                    }
                }
            }
            
            return response()->json([
                'success' => true,
                'message' => "Logs antigos removidos com sucesso",
                'data' => [
                    'db_records_deleted' => $deletedCount,
                    'files_deleted' => $filesDeleted
                ]
            ]);
            
        } catch (\Exception $e) {
            Log::error('Erro ao limpar logs antigos: ' . $e->getMessage(), [
                'exception' => $e->getTraceAsString(),
                'user_id' => Auth::id(),
                'ip' => request()->ip()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Erro ao limpar logs antigos: ' . $e->getMessage()
            ], 500);
        }
    }
} 