<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Models\SalesIntelligence;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

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
            $intelligence = SalesIntelligence::where('agency_id', auth()->user()->agency_id)
                ->where('user_id', auth()->id())
                ->first();

            if (!$intelligence) {
                $intelligence = new SalesIntelligence();
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
} 