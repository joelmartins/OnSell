<?php

namespace App\Http\Controllers;

use App\Models\SalesIntelligence;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use OpenAI\Laravel\Facades\OpenAI;
use Illuminate\Support\Facades\Log;

class SalesIntelligenceController extends Controller
{
    private function getImpersonationIds()
    {
        $impersonating = session()->get('impersonate.target');
        if ($impersonating) {
            return [
                $impersonating['agency_id'] ?? $impersonating['id'] ?? null,
                $impersonating['client_id'] ?? $impersonating['id'] ?? null,
                $impersonating['type'] ?? null
            ];
        }
        return [
            Auth::user()->agency_id ?? null,
            Auth::user()->client_id ?? null,
            null
        ];
    }

    // Exibe o formulário de diagnóstico
    public function showForm(Request $request)
    {
        list($agencyId, $clientId) = $this->getImpersonationIds();
        
        \Log::info('SalesIntelligence Debug', [
            'agency_id' => $agencyId,
            'client_id' => $clientId
        ]);
        
        // Primeiro tenta buscar com agencyId e clientId
        $existing = SalesIntelligence::where('client_id', $clientId)
            ->when($agencyId, function($query) use ($agencyId) {
                $query->where('agency_id', $agencyId);
            })
            ->first();
        
        // Debug para ver o que está acontecendo
        if (!$existing) {
            \Log::warning('SalesIntelligence dados não encontrados para client_id=' . $clientId);
            
            // Verificar se existe QUALQUER registro
            $allRecords = SalesIntelligence::all();
            \Log::info('Total de registros SalesIntelligence: ' . $allRecords->count());
            
            if ($allRecords->count() > 0) {
                \Log::info('Primeiro registro encontrado:', $allRecords->first()->toArray());
            }
        }
            
        \Log::info('SalesIntelligence existing data', [
            'existing' => $existing ? true : false,
            'data' => $existing
        ]);
            
        return Inertia::render('Client/SalesIntelligence/Diagnosis', [
            'existing' => $existing,
        ]);
    }

    // Salva respostas do cliente
    public function storeAnswers(Request $request)
    {
        list($agencyId, $clientId) = $this->getImpersonationIds();
        
        \Log::info('SalesIntelligence storeAnswers', [
            'agency_id' => $agencyId,
            'client_id' => $clientId,
            'request_data' => $request->all()
        ]);
        
        $validated = $request->validate([
            'customer_answers' => 'required|array',
        ]);
        
        // Verificar se precisamos associar com uma agência
        $data = ['client_id' => $clientId];
        
        // Apenas adicionar agency_id se existir uma agência válida
        if ($agencyId) {
            // Verificar se a agência existe
            $agencyExists = \App\Models\Agency::find($agencyId);
            if ($agencyExists) {
                $data['agency_id'] = $agencyId;
            }
        }
        
        // Buscar dados existentes para não perder informações já salvas
        $existing = SalesIntelligence::where('client_id', $clientId)
            ->when($agencyId && isset($data['agency_id']), function($query) use ($agencyId) {
                $query->where('agency_id', $agencyId);
            })
            ->first();
            
        // Mesclar dados existentes com novos dados
        $customerAnswers = [];
        if ($existing && is_array($existing->customer_answers)) {
            $customerAnswers = $existing->customer_answers;
        }
        
        // Mesclar os novos dados com os existentes
        $customerAnswers = array_merge($customerAnswers, $validated['customer_answers']);
        
        \Log::info('SalesIntelligence merged data', [
            'existing' => $existing ? true : false,
            'merged_data' => $customerAnswers
        ]);
        
        $salesIntelligence = SalesIntelligence::updateOrCreate(
            $data,
            [
                'customer_answers' => $customerAnswers,
            ]
        );
        
        return redirect()->back()->with('success', 'Respostas salvas com sucesso!');
    }

    // Exibe dados existentes (para dashboard ou revisão)
    public function show(Request $request)
    {
        $agencyId = Auth::user()->agency_id ?? null;
        $clientId = Auth::user()->client_id ?? null;
        $data = SalesIntelligence::where('agency_id', $agencyId)
            ->where('client_id', $clientId)
            ->first();
        return Inertia::render('Client/SalesIntelligence/Show', [
            'data' => $data,
        ]);
    }

    // Emotional Mapping
    public function emotional(Request $request)
    {
        list($agencyId, $clientId) = $this->getImpersonationIds();
        
        // Primeiro tenta buscar com agencyId e clientId
        $existing = SalesIntelligence::where('client_id', $clientId)
            ->when($agencyId, function($query) use ($agencyId) {
                $query->where('agency_id', $agencyId);
            })
            ->first();
            
        return Inertia::render('Client/SalesIntelligence/EmotionalMapping', [
            'existing' => $existing,
        ]);
    }

    // Access Strategy
    public function access(Request $request)
    {
        list($agencyId, $clientId) = $this->getImpersonationIds();
        
        // Primeiro tenta buscar com agencyId e clientId
        $existing = SalesIntelligence::where('client_id', $clientId)
            ->when($agencyId, function($query) use ($agencyId) {
                $query->where('agency_id', $agencyId);
            })
            ->first();
            
        return Inertia::render('Client/SalesIntelligence/AccessStrategy', [
            'existing' => $existing,
        ]);
    }

    // Intelligence Map
    public function map(Request $request)
    {
        list($agencyId, $clientId) = $this->getImpersonationIds();
        
        // Log detalhado para diagnóstico
        \Log::info('SalesIntelligence map() - IDs obtidos:', [
            'agency_id' => $agencyId,
            'client_id' => $clientId,
            'auth_user_id' => Auth::id(),
            'auth_user_agency_id' => Auth::user()->agency_id,
            'auth_user_client_id' => Auth::user()->client_id,
            'is_impersonating' => session()->has('impersonate.target'),
            'impersonating_data' => session()->get('impersonate.target'),
            'request_ip' => $request->ip(),
            'request_path' => $request->path(),
        ]);
        
        if (!$clientId) {
            \Log::error('SalesIntelligence map() - client_id não encontrado!');
            // Caso de segurança - criar um objeto vazio para não retornar null
            $existing = new SalesIntelligence();
            $existing->customer_answers = [];
            return Inertia::render('Client/SalesIntelligence/IntelligenceMap', [
                'existing' => $existing,
            ]);
        }
        
        // Primeiro tenta buscar com agencyId e clientId
        $existing = SalesIntelligence::where('client_id', $clientId)
            ->when($agencyId, function($query) use ($agencyId) {
                $query->where('agency_id', $agencyId);
            })
            ->first();
            
        // Log se não encontrou dados
        if (!$existing) {
            \Log::warning('SalesIntelligence map() - Dados não encontrados para client_id='.$clientId);
            
            // Tentar buscar sem agencyId
            $alternativeExisting = SalesIntelligence::where('client_id', $clientId)->first();
            if ($alternativeExisting) {
                \Log::info('SalesIntelligence map() - Dados encontrados ignorando agency_id', [
                    'record_id' => $alternativeExisting->id,
                    'record_agency_id' => $alternativeExisting->agency_id,
                    'record_client_id' => $alternativeExisting->client_id,
                ]);
                $existing = $alternativeExisting;
            } else {
                // Verificar se há registros para esse cliente em geral
                $allClientRecords = SalesIntelligence::where('client_id', $clientId)->get();
                \Log::info('SalesIntelligence map() - Total de registros para client_id='.$clientId.': '.$allClientRecords->count());
                
                // Verificar se existe QUALQUER registro na tabela
                $allRecords = SalesIntelligence::all();
                \Log::info('SalesIntelligence map() - Total de registros SalesIntelligence: '.$allRecords->count());
                
                // Criar um registro vazio para o cliente atual
                \Log::info('SalesIntelligence map() - Criando registro vazio para client_id='.$clientId);
                $existing = new SalesIntelligence();
                $existing->client_id = $clientId;
                if ($agencyId) {
                    $existing->agency_id = $agencyId;
                }
                $existing->customer_answers = [];
                // Não salvar aqui, apenas criar um objeto para a view
            }
        } else {
            \Log::info('SalesIntelligence map() - Dados encontrados:', [
                'record_id' => $existing->id,
                'record_agency_id' => $existing->agency_id,
                'record_client_id' => $existing->client_id,
                'has_customer_answers' => !empty($existing->customer_answers),
                'has_ai_analysis' => !empty($existing->ai_analysis),
            ]);
        }
            
        return Inertia::render('Client/SalesIntelligence/IntelligenceMap', [
            'existing' => $existing,
        ]);
    }

    // Processamento IA das respostas do cliente
    public function processAIAnalysis(Request $request)
    {
        list($agencyId, $clientId) = $this->getImpersonationIds();
        
        \Log::info('SalesIntelligence processAIAnalysis - Request iniciada', [
            'agency_id' => $agencyId,
            'client_id' => $clientId,
            'request_ip' => $request->ip(),
            'request_path' => $request->path(),
            'request_method' => $request->method(),
            'is_ajax' => $request->ajax(),
            'is_json' => $request->isJson(),
            'content_type' => $request->header('Content-Type'),
            'accept' => $request->header('Accept'),
            'has_csrf' => $request->hasHeader('X-CSRF-TOKEN'),
            'csrf_token' => $request->header('X-CSRF-TOKEN'),
            'request_data' => $request->all()
        ]);
        
        try {
            // Validação da requisição
            $validated = $request->validate([
                'customer_answers' => 'required|array',
            ]);
            
            $answers = $validated['customer_answers'];
            
            \Log::info('SalesIntelligence processAIAnalysis - Dados validados:', [
                'tipo' => gettype($answers),
                'array_keys' => is_array($answers) ? array_keys($answers) : 'não é array',
                'conteúdo' => $answers
            ]);
    
            // Montar prompt customizado
            $prompt = "Analise o seguinte contexto de vendas e gere um perfil comportamental do decisor, tom de comunicação ideal, resumo, gatilhos emocionais, objeções prováveis e copy anchors para campanhas. Responda em JSON com as chaves: profile, communication_tone, summary, emotional_triggers, objections, copy_anchors.\n\nRespostas do cliente:" . json_encode($answers, JSON_UNESCAPED_UNICODE);
    
            \Log::info('SalesIntelligence processAIAnalysis - Enviando prompt para OpenAI', [
                'prompt_length' => strlen($prompt),
                'prompt_preview' => substr($prompt, 0, 500) . '...'
            ]);
            
            $result = OpenAI::chat()->create([
                'model' => 'gpt-3.5-turbo',
                'messages' => [
                    ['role' => 'system', 'content' => 'Você é um especialista em vendas B2B e copywriting.'],
                    ['role' => 'user', 'content' => $prompt],
                ],
                'temperature' => 0.7,
                'max_tokens' => 600,
            ]);
            
            $content = $result['choices'][0]['message']['content'] ?? null;
            
            \Log::info('SalesIntelligence processAIAnalysis - Resposta da OpenAI', [
                'content_preview' => $content ? substr($content, 0, 500) . '...' : 'null'
            ]);
            
            $aiResult = json_decode($content, true);
            if (!$aiResult || !is_array($aiResult)) {
                \Log::error('SalesIntelligence processAIAnalysis - OpenAI retornou resposta inválida', [
                    'content' => $content
                ]);
                
                // Verificar se a requisição espera uma resposta JSON (API) ou Inertia
                if ($request->expectsJson() || $request->ajax()) {
                    return response()->json(['success' => false, 'error' => 'Resposta da IA inválida. Tente novamente.'], 500);
                } else {
                    return redirect()->back()->with('error', 'Resposta da IA inválida. Tente novamente.');
                }
            }
            
            // Verificar se precisamos associar com uma agência
            $data = ['client_id' => $clientId];
            
            // Apenas adicionar agency_id se existir uma agência válida
            if ($agencyId) {
                // Verificar se a agência existe
                $agencyExists = \App\Models\Agency::find($agencyId);
                if ($agencyExists) {
                    $data['agency_id'] = $agencyId;
                }
            }
            
            // Salvar o resultado no banco de dados
            $salesIntelligence = SalesIntelligence::updateOrCreate(
                $data,
                [
                    'ai_analysis' => $aiResult,
                ]
            );
            
            \Log::info('SalesIntelligence processAIAnalysis - Análise de IA salva com sucesso', [
                'sales_intelligence_id' => $salesIntelligence->id
            ]);
            
            // Verificar se a requisição espera uma resposta JSON (API) ou Inertia
            if ($request->expectsJson() || $request->ajax()) {
                return response()->json(['success' => true, 'ai_analysis' => $aiResult]);
            } else {
                // Para requisições Inertia, retornar com flash data
                return redirect()->back()->with([
                    'success' => true,
                    'message' => 'Análise de IA gerada com sucesso!',
                    'ai_analysis' => $aiResult
                ]);
            }
            
        } catch (\Exception $e) {
            \Log::error('SalesIntelligence processAIAnalysis - Erro ao processar', [
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);
            
            // Verificar se a requisição espera uma resposta JSON (API) ou Inertia
            if ($request->expectsJson() || $request->ajax()) {
                return response()->json(['success' => false, 'error' => 'Erro ao processar IA: ' . $e->getMessage()], 500);
            } else {
                return redirect()->back()->with('error', 'Erro ao processar IA: ' . $e->getMessage());
            }
        }
    }
} 