<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Models\IntelligenceAnswer;
use App\Models\SalesIntelligence as IntelligenceDeliverable;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use OpenAI\Laravel\Facades\OpenAI;
use App\Jobs\GenerateAllDeliverables;

class SalesIntelligenceController extends Controller
{
    /**
     * Processa a análise de IA com base nas respostas do cliente
     */
    public function processAIAnalysis(Request $request)
    {
        Log::channel('sales_intelligence')->info('Requisição recebida para processar AI', [
            'user_id' => auth()->id(),
            'agency_id' => auth()->user()->agency_id,
            'request_data' => $request->all(),
        ]);

        try {
            // Validação dos dados de entrada
            $validated = $request->validate([
                'customer_answers' => 'required|array',
                'customer_answers.product' => 'sometimes|string',
                'customer_answers.decision_role' => 'sometimes|string',
            ]);

            // Obter o registro existente ou criar um novo
            $intelligence = IntelligenceDeliverable::where('client_id', auth()->user()->client_id)
                ->where('agency_id', auth()->user()->agency_id)
                ->where('user_id', auth()->id())
                ->first();

            if (!$intelligence) {
                $intelligence = new IntelligenceDeliverable();
                $intelligence->client_id = auth()->user()->client_id;
                $intelligence->agency_id = auth()->user()->agency_id;
                $intelligence->user_id = auth()->id();
            }

            // Salvar ou atualizar as respostas do cliente
            $intelligence->customer_answers = $validated['customer_answers'];
            $intelligence->save();

            // Verificar se temos dados suficientes para análise de IA
            $customerAnswers = $validated['customer_answers'];
            if (empty($customerAnswers['product']) || empty($customerAnswers['decision_role'])) {
                return redirect()->back()->with([
                    'error' => 'Dados insuficientes para análise. Preencha pelo menos o produto e o papel do decisor.'
                ]);
            }

            // Construir o prompt para o OpenAI
            $product = $customerAnswers['product'] ?? 'produto não especificado';
            $decisionRole = $customerAnswers['decision_role'] ?? 'papel não especificado';
            
            $emotional = isset($customerAnswers['emotional']) ? json_encode($customerAnswers['emotional']) : '{}';
            $access = isset($customerAnswers['access']) ? json_encode($customerAnswers['access']) : '{}';
            
            $userInputs = "
            Produto: {$product}
            Papel do Decisor: {$decisionRole}
            Emocionais: {$emotional}
            Acesso: {$access}
            ";
            
            $prompt = "\n            Você é um especialista em inteligência de vendas e psicologia de decisão. Com base nos dados do cliente abaixo:\n            \n            {$userInputs}\n            \n            Forneça uma análise em formato JSON estruturado com os seguintes campos:\n            - profile: perfil psicológico do decisor (analítico, expressivo, amigável ou condutor) com base no papel e nas respostas emocionais\n            - communication_tone: tom de comunicação recomendado para este perfil\n            - summary: resumo conciso do perfil e do approach recomendado\n            - emotional_triggers: array com 3-5 gatilhos emocionais que podem influenciar positivamente a decisão\n            - objections: array com 3-5 objeções prováveis que este tipo de decisor pode levantar\n            - copy_anchors: array com 3-5 frases ou abordagens de copy que podem ressoar com este perfil\n            \n            IMPORTANTE: Responda ESTRITAMENTE com um bloco markdown ```json contendo apenas o JSON válido, sem explicações, comentários ou qualquer texto fora do bloco. Se faltar alguma informação, faça suposições razoáveis e preencha o campo.\n            ";
            
            // Log do prompt antes de enviar para debug
            Log::channel('sales_intelligence')->debug('Prompt para OpenAI:', ['prompt' => $prompt]);
            
            // Fazer requisição para o OpenAI
            $openai = app(\OpenAI\Client::class);
            
            $completion = $openai->chat()->create([
                'model' => 'gpt-4-turbo-preview',
                'messages' => [
                    ['role' => 'system', 'content' => 'Você é um assistente especializado em inteligência de vendas e psicologia de decisão.'],
                    ['role' => 'user', 'content' => $prompt],
                ],
                'temperature' => 0.7,
                'response_format' => ['type' => 'json_object'],
            ]);
            
            $content = $completion->choices[0]->message->content;

            // Extrair JSON de dentro do bloco markdown ```json ... ```
            if (preg_match('/```json(.*?)```/is', $content, $matches)) {
                $content = trim($matches[1]);
            } else {
                // fallback: remover blocos markdown simples
                $content = preg_replace('/^```json|```$/m', '', trim($content));
                $content = trim($content);
            }
            // Remover quebras de linha e espaços extras
            $content = preg_replace('/\r?\n/', " ", $content);
            $content = trim($content);
            // Remover todas as barras invertidas (escapes)
            $content = str_replace('\\', '', $content);
            // Substituir aspas escapadas por aspas normais
            $content = str_replace('\"', '"', $content);
            // Tentar decodificar
            $aiAnalysis = json_decode($content, true);
            // Se ainda falhar, logar erro detalhado
            if (!$aiAnalysis || json_last_error() !== JSON_ERROR_NONE) {
                Log::channel('sales_intelligence')->error('Erro ao decodificar JSON da resposta do OpenAI (parser robusto FINAL)', [
                    'content' => $content,
                    'json_error' => json_last_error_msg()
                ]);
                return redirect()->back()->with([
                    'error' => 'Erro ao processar resposta da IA. Formato inválido recebido.'
                ]);
            }
            // Garantir que os campos esperados sejam arrays
            foreach (['emotional_triggers', 'objections', 'copy_anchors'] as $field) {
                if (isset($aiAnalysis[$field]) && !is_array($aiAnalysis[$field])) {
                    // Tentar converter string para array
                    $aiAnalysis[$field] = preg_split('/,|\n|\r/', $aiAnalysis[$field]);
                    $aiAnalysis[$field] = array_map('trim', $aiAnalysis[$field]);
                    $aiAnalysis[$field] = array_filter($aiAnalysis[$field]);
                }
            }
            
            // Salvar a análise de IA no banco de dados
            $intelligence->ai_analysis = $aiAnalysis;
            $intelligence->save();
            
            Log::channel('sales_intelligence')->info('Análise de IA processada com sucesso', [
                'user_id' => auth()->id(),
                'intelligence_id' => $intelligence->id
            ]);
            
            // Sempre retornar redirect com flash data para Inertia
            return redirect()->back()->with([
                'success' => true,
                'message' => 'Análise de IA gerada com sucesso!',
                'ai_analysis' => $aiAnalysis
            ]);
            
        } catch (\OpenAI\Exceptions\ErrorException $e) {
            Log::channel('sales_intelligence')->error('Erro na API do OpenAI', [
                'user_id' => auth()->id(),
                'exception' => [
                    'message' => $e->getMessage(),
                    'code' => $e->getCode(),
                ]
            ]);
            
            return redirect()->back()->with([
                'error' => 'Erro na comunicação com a IA: ' . $e->getMessage()
            ]);
        } catch (\Exception $e) {
            Log::channel('sales_intelligence')->error('Erro ao processar análise de IA', [
                'user_id' => auth()->id(),
                'exception' => [
                    'message' => $e->getMessage(),
                    'file' => $e->getFile(),
                    'line' => $e->getLine(),
                    'trace' => $e->getTraceAsString(),
                ]
            ]);
            
            return redirect()->back()->with([
                'error' => 'Erro ao processar análise de IA: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Retorna o client_id considerando impersonação
     */
    private function getImpersonatedClientId()
    {
        $impersonating = session()->get('impersonate.target');
        if ($impersonating && isset($impersonating['client_id'])) {
            return $impersonating['client_id'];
        }
        return Auth::user()->client_id;
    }

    // Exibe o formulário de perguntas, preenchendo com respostas anteriores se existirem
    public function showForm(Request $request)
    {
        $clientId = $this->getImpersonatedClientId();
        $existing = \App\Models\IntelligenceAnswer::where('client_id', $clientId)->first();
        return Inertia::render('Client/SalesIntelligence/index', [
            'existing' => $existing,
        ]);
    }

    public function emotional(Request $request)
    {
        return redirect()->route('client.salesintelligence.diagnosis');
    }

    public function access(Request $request)
    {
        return redirect()->route('client.salesintelligence.diagnosis');
    }

    public function map(Request $request)
    {
        return redirect()->route('client.salesintelligence.diagnosis');
    }

    // Salva respostas do formulário
    public function storeAnswers(Request $request)
    {
        $clientId = $this->getImpersonatedClientId();
        $validated = $request->validate([
            'answers' => 'required|array',
        ]);
        $answer = IntelligenceAnswer::updateOrCreate(
            ['client_id' => $clientId],
            [
                'answers' => $validated['answers'],
            ]
        );
        // Disparar job para gerar todos os entregáveis
        GenerateAllDeliverables::dispatch($clientId, $validated['answers']);
        return response()->json(['success' => true, 'id' => $answer->id]);
    }

    // Lista todos os entregáveis do cliente
    public function listDeliverables(Request $request)
    {
        $clientId = $this->getImpersonatedClientId();
        $tipos = [
            'product_definition',
            'icp_profile',
            'decision_maker',
            'mental_triggers',
            'common_objections',
            'barriers_and_breaks',
            'prospection_strategies',
            'sales_scripts',
            'copy_anchors',
            'communication_pattern',
        ];
        $dbDeliverables = IntelligenceDeliverable::where('client_id', $clientId)->get()->keyBy('type');
        $deliverables = [];
        foreach ($tipos as $type) {
            if (isset($dbDeliverables[$type])) {
                $deliverables[] = $dbDeliverables[$type];
            } else {
                $deliverables[] = [
                    'type' => $type,
                    'output_markdown' => '',
                ];
            }
        }
        return Inertia::render('Client/SalesIntelligence/Deliverables', [
            'deliverables' => $deliverables,
        ]);
    }

    // Gera entregável IA (prompt específico por tipo)
    public function generateDeliverable(Request $request, $type)
    {
        $clientId = $this->getImpersonatedClientId();
        $answer = IntelligenceAnswer::where('client_id', $clientId)->first();
        if (!$answer) {
            return response()->json(['error' => 'Respostas do formulário não encontradas.'], 422);
        }
        $inputData = $answer->answers;
        $prompt = $this->buildPrompt($type, $inputData);
        $result = OpenAI::chat()->create([
            'model' => 'gpt-4-turbo-preview',
            'messages' => [
                ['role' => 'system', 'content' => 'Você é um especialista em vendas B2B e copywriting.'],
                ['role' => 'user', 'content' => $prompt],
            ],
            'temperature' => 0.7,
            'max_tokens' => 800,
        ]);
        $content = $result['choices'][0]['message']['content'] ?? null;
        // Salvar como markdown
        $deliverable = IntelligenceDeliverable::updateOrCreate(
            ['client_id' => $clientId, 'type' => $type],
            [
                'prompt' => $prompt,
                'input_data' => $inputData,
                'output_markdown' => $content,
                'version' => 1,
            ]
        );
        return response()->json(['success' => true, 'deliverable' => $deliverable]);
    }

    // Salva edição manual do entregável (markdown)
    public function saveDeliverable(Request $request, $type)
    {
        $clientId = $this->getImpersonatedClientId();
        $validated = $request->validate([
            'output_markdown' => 'required|string',
        ]);
        $deliverable = IntelligenceDeliverable::where('client_id', $clientId)->where('type', $type)->firstOrFail();
        $deliverable->output_markdown = $validated['output_markdown'];
        $deliverable->save();
        return response()->json(['success' => true]);
    }

    // Gera o prompt específico para cada tipo de entregável
    private function buildPrompt($type, $inputData)
    {
        switch ($type) {
            case 'product_definition':
                return "Gere uma definição de produto/serviço em markdown, incluindo:\n- Headline de venda curta\n- Descrição completa\n- Transformação prometida\n- Prova/autoridade (número de clientes, anos de mercado, prêmios, cases)\n\nUse os dados a seguir:\n" . json_encode($inputData, JSON_UNESCAPED_UNICODE);
            case 'icp_profile':
                return "Gere o perfil do ICP (cliente ideal) em markdown, incluindo:\n- Segmento de mercado\n- Porte da empresa\n- Localização\n- Momento da empresa\n- Motivadores de compra\n- Características emocionais\n\nUse os dados a seguir:\n" . json_encode($inputData, JSON_UNESCAPED_UNICODE);
            case 'decision_maker':
                return "Gere o perfil do tomador de decisão em markdown, incluindo:\n- Cargo/função\n- Medos e frustrações\n- Sonhos e desejos\n- Comportamento na decisão (impulsivo, analítico, relacional, cético)\n\nUse os dados a seguir:\n" . json_encode($inputData, JSON_UNESCAPED_UNICODE);
            case 'mental_triggers':
                return "Liste os principais gatilhos mentais prioritários para vendas deste contexto, em markdown, incluindo:\n- Autoridade\n- Prova social\n- Escassez\n- Urgência\n- Antecipação\n- Garantia\n\nUse os dados a seguir:\n" . json_encode($inputData, JSON_UNESCAPED_UNICODE);
            case 'common_objections':
                return "Crie uma tabela markdown com as objeções mais comuns e estratégias de contorno, exemplo:\n| Objeção | Estratégia de Contorno |\n|---------|-----------------------|\n| Está caro | Ancoragem de valor + comparação de custo-benefício |\n| Preciso pensar | Reforçar valor emocional + pergunta de objeção |\n...\n\nUse os dados a seguir:\n" . json_encode($inputData, JSON_UNESCAPED_UNICODE);
            case 'barriers_and_breaks':
                return "Liste barreiras emocionais e lógicas, e estratégias de quebra, em markdown:\n- Barreiras emocionais (ex: medo de errar, ser enganado, ser julgado)\n- Barreiras lógicas (ex: preço, eficácia, suporte)\n- Estratégias de quebra (storytelling, provas reais, garantias)\n\nUse os dados a seguir:\n" . json_encode($inputData, JSON_UNESCAPED_UNICODE);
            case 'prospection_strategies':
                return "Gere estratégias de prospecção em markdown:\n- Mensagem inicial\n- Follow-up 1 (reforço de valor)\n- Follow-up 2 (urgência)\n- Ligação de qualificação\n- Técnicas para vencer gatekeepers\n\nUse os dados a seguir:\n" . json_encode($inputData, JSON_UNESCAPED_UNICODE);
            case 'sales_scripts':
                return "Gere scripts comerciais em markdown:\n- Elevator pitch (30 segundos)\n- Script de ligação comercial\n- Script de fechamento\n\nUse os dados a seguir:\n" . json_encode($inputData, JSON_UNESCAPED_UNICODE);
            case 'copy_anchors':
                return "Gere copys âncoras em markdown:\n- Problema\n- Transformação\n- Oferta direta\n- Prova social\n- Urgência\n\nUse os dados a seguir:\n" . json_encode($inputData, JSON_UNESCAPED_UNICODE);
            case 'communication_pattern':
                return "Gere um padrão de comunicação em markdown:\n- Tom de voz (profissional, próximo, confiante, empático)\n- Tipo de linguagem (simples e direta)\n- Sugestão de padrão visual (cores, fontes)\n\nUse os dados a seguir:\n" . json_encode($inputData, JSON_UNESCAPED_UNICODE);
            default:
                return "Gere um entregável de inteligência de vendas do tipo $type em markdown. Use os dados:\n" . json_encode($inputData, JSON_UNESCAPED_UNICODE);
        }
    }
} 