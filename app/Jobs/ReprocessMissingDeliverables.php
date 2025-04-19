<?php

namespace App\Jobs;

use App\Models\IntelligenceAnswer;
use App\Models\IntelligenceDeliverable;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use OpenAI;

class ReprocessMissingDeliverables implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $clientId;
    protected $forceRegenerate;
    
    // Configuração para garantir execução confiável
    public $tries = 3;
    public $backoff = 10;
    public $timeout = 300; // 5 minutos

    /**
     * Create a new job instance.
     */
    public function __construct($clientId, $forceRegenerate = false)
    {
        $this->clientId = $clientId;
        $this->forceRegenerate = $forceRegenerate;
    }

    /**
     * Execute the job.
     */
    public function handle()
    {
        // Obter dados do formulário
        $answer = IntelligenceAnswer::where('client_id', $this->clientId)->first();
        
        if (!$answer) {
            Log::error('Reprocessamento falhou: Respostas não encontradas para cliente ' . $this->clientId);
            return;
        }

        $inputData = $answer->answers;
        
        // Tipos de entregáveis a serem processados
        $types = [
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

        // Verificar quais entregáveis estão vazios ou precisam ser regerados
        $reprocessTypes = [];
        
        foreach ($types as $type) {
            $deliverable = IntelligenceDeliverable::where('client_id', $this->clientId)
                ->where('type', $type)
                ->first();
            
            // Se forceRegenerate=true, processa todos; caso contrário, apenas os vazios
            if ($this->forceRegenerate || !$deliverable || !$deliverable->output_markdown) {
                $reprocessTypes[] = $type;
            }
        }
        
        Log::info('Iniciando reprocessamento de entregáveis para cliente ' . $this->clientId, [
            'types_to_reprocess' => $reprocessTypes,
            'force_regenerate' => $this->forceRegenerate
        ]);

        // Processar cada tipo com delay para evitar sobrecarga na API
        foreach ($reprocessTypes as $index => $type) {
            try {
                Log::info("Reprocessando entregável {$type} (" . ($index + 1) . "/" . count($reprocessTypes) . ") para cliente {$this->clientId}");
                
                // Construir o prompt apropriado para o tipo
                $prompt = $this->buildPrompt($type, $inputData);
                
                // Gerar conteúdo via OpenAI
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
                
                if (empty($content)) {
                    throw new \Exception("Conteúdo vazio recebido da API para o tipo {$type}");
                }
                
                // Salvar o conteúdo gerado
                IntelligenceDeliverable::updateOrCreate(
                    ['client_id' => $this->clientId, 'type' => $type],
                    [
                        'prompt' => $prompt,
                        'input_data' => $inputData,
                        'output_markdown' => $content,
                        'version' => 1,
                    ]
                );
                
                Log::info("Entregável {$type} reprocessado com sucesso para cliente {$this->clientId}");
                
                // Delay para evitar taxa limite da API
                if ($index < count($reprocessTypes) - 1) {
                    sleep(2);
                }
            } catch (\OpenAI\Exceptions\ErrorException $e) {
                // Log específico para erros da API OpenAI
                Log::error("Erro da API OpenAI ao reprocessar entregável {$type} para cliente {$this->clientId}: " . $e->getMessage(), [
                    'code' => $e->getCode(),
                    'type' => $type
                ]);
            } catch (\Exception $e) {
                Log::error("Erro ao reprocessar entregável {$type} para cliente {$this->clientId}: " . $e->getMessage(), [
                    'file' => $e->getFile(),
                    'line' => $e->getLine(),
                    'type' => $type
                ]);
            }
        }
        
        Log::info('Reprocessamento finalizado para cliente ' . $this->clientId, [
            'types_processed' => $reprocessTypes,
            'count' => count($reprocessTypes)
        ]);
    }

    /**
     * Gera o prompt específico para cada tipo de entregável
     */
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