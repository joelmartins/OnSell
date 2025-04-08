<?php

namespace App\Services;

use App\Models\Automation;
use App\Models\AutomationLog;
use App\Models\AutomationNode;
use App\Models\Contact;
use App\Models\Opportunity;
use Illuminate\Support\Facades\Log;

class AutomationService
{
    /**
     * Disparar uma automação para um contato com base no tipo de gatilho.
     *
     * @param string $triggerType
     * @param Contact $contact
     * @param array $contextData
     * @param Opportunity|null $opportunity
     * @return void
     */
    public function triggerAutomation(string $triggerType, Contact $contact, array $contextData = [], ?Opportunity $opportunity = null)
    {
        // Buscar todas as automações ativas com este tipo de gatilho
        $automations = Automation::byTriggerType($triggerType)->get();

        foreach ($automations as $automation) {
            // Verificar se precisa de configurações específicas de trigger
            if ($this->shouldTriggerAutomation($automation, $triggerType, $contextData)) {
                $this->startAutomationFlow($automation, $contact, $contextData, $opportunity);
            }
        }
    }

    /**
     * Verificar se uma automação deve ser disparada com base nas configurações do gatilho.
     *
     * @param Automation $automation
     * @param string $triggerType
     * @param array $contextData
     * @return bool
     */
    protected function shouldTriggerAutomation(Automation $automation, string $triggerType, array $contextData): bool
    {
        // Se não houver configuração específica de trigger, sempre dispara
        if (empty($automation->trigger_config)) {
            return true;
        }

        $triggerConfig = $automation->trigger_config;

        // Verificar regras específicas por tipo de trigger
        switch ($triggerType) {
            case 'form_submitted':
                // Verificar se o formulário corresponde
                if (isset($triggerConfig['form_id']) && isset($contextData['form_id'])) {
                    return $triggerConfig['form_id'] == $contextData['form_id'];
                }
                break;

            case 'tag_applied':
                // Verificar se a tag corresponde
                if (isset($triggerConfig['tag']) && isset($contextData['tag'])) {
                    return $triggerConfig['tag'] == $contextData['tag'];
                }
                break;

            case 'status_changed':
                // Verificar se o status corresponde
                if (isset($triggerConfig['from_status']) && isset($contextData['from_status'])) {
                    if ($triggerConfig['from_status'] != $contextData['from_status']) {
                        return false;
                    }
                }
                
                if (isset($triggerConfig['to_status']) && isset($contextData['to_status'])) {
                    return $triggerConfig['to_status'] == $contextData['to_status'];
                }
                break;
        }

        return true;
    }

    /**
     * Iniciar o fluxo de automação para um contato.
     *
     * @param Automation $automation
     * @param Contact $contact
     * @param array $contextData
     * @param Opportunity|null $opportunity
     * @return void
     */
    public function startAutomationFlow(Automation $automation, Contact $contact, array $contextData = [], ?Opportunity $opportunity = null)
    {
        try {
            // Encontrar o nó de trigger (início do fluxo)
            $triggerNode = $automation->nodes()->where('type', 'trigger')->first();

            if (!$triggerNode) {
                Log::error("Automação {$automation->id} não tem nó de trigger");
                return;
            }

            // Criar um log para esta execução
            $log = AutomationLog::create([
                'automation_id' => $automation->id,
                'contact_id' => $contact->id,
                'opportunity_id' => $opportunity?->id,
                'node_id' => $triggerNode->node_id,
                'status' => 'pending',
                'context' => array_merge($contextData, [
                    'contact' => $contact->only(['id', 'name', 'email', 'phone']),
                    'opportunity' => $opportunity ? $opportunity->only(['id', 'title', 'value']) : null,
                ]),
            ]);

            // Processar o nó inicial
            dispatch(new \App\Jobs\ProcessAutomationNode(
                $automation->id,
                $triggerNode->node_id,
                $contact->id,
                $log->id,
                $opportunity?->id
            ));
        } catch (\Exception $e) {
            Log::error("Erro ao iniciar fluxo de automação: " . $e->getMessage(), [
                'automation_id' => $automation->id,
                'contact_id' => $contact->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
        }
    }

    /**
     * Processar um nó específico na automação.
     *
     * @param Automation $automation
     * @param string $nodeId
     * @param Contact $contact
     * @param AutomationLog $log
     * @param Opportunity|null $opportunity
     * @return void
     */
    public function processNode(Automation $automation, string $nodeId, Contact $contact, AutomationLog $log, ?Opportunity $opportunity = null)
    {
        try {
            // Atualizar o log para indicar que estamos processando este nó
            $log->update([
                'node_id' => $nodeId,
                'status' => 'running',
                'started_at' => now(),
            ]);

            // Buscar o nó
            $node = $automation->nodes()->where('node_id', $nodeId)->first();

            if (!$node) {
                throw new \Exception("Nó {$nodeId} não encontrado na automação {$automation->id}");
            }

            // Processar o nó com base no tipo
            $result = $this->executeNodeAction($node, $contact, $log->context, $opportunity);

            // Se o nó for do tipo delay, terminamos aqui (o job será reagendado)
            if ($node->type === 'delay') {
                return;
            }

            // Atualizar o log para indicar sucesso
            $log->markAsCompleted($result);

            // Buscar os próximos nós
            $nextNodes = $this->findNextNodes($automation, $node, $result);

            // Processar os próximos nós
            foreach ($nextNodes as $nextNode) {
                dispatch(new \App\Jobs\ProcessAutomationNode(
                    $automation->id,
                    $nextNode,
                    $contact->id,
                    $log->id,
                    $opportunity?->id
                ));
            }
        } catch (\Exception $e) {
            // Atualizar o log para indicar falha
            $log->markAsFailed($e->getMessage());

            Log::error("Erro ao processar nó na automação: " . $e->getMessage(), [
                'automation_id' => $automation->id,
                'node_id' => $nodeId,
                'contact_id' => $contact->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
        }
    }

    /**
     * Executar a ação do nó com base no tipo.
     *
     * @param AutomationNode $node
     * @param Contact $contact
     * @param array $context
     * @param Opportunity|null $opportunity
     * @return array
     */
    protected function executeNodeAction(AutomationNode $node, Contact $contact, array $context, ?Opportunity $opportunity = null): array
    {
        $result = [];

        switch ($node->type) {
            case 'trigger':
                // Nós de trigger não precisam executar nenhuma ação
                $result = ['success' => true];
                break;

            case 'action':
                // Executar a ação com base na configuração do nó
                $actionType = $node->config['action_type'] ?? null;
                
                if ($actionType) {
                    $result = $this->executeAction($actionType, $node->config, $contact, $context, $opportunity);
                }
                break;

            case 'condition':
                // Avaliar a condição
                $result = $this->evaluateCondition($node->config, $contact, $context, $opportunity);
                break;

            case 'delay':
                // Calcular o atraso e reagendar o job
                $delayMinutes = $node->config['delay_minutes'] ?? 5;
                
                // Reagendar este mesmo nó para ser executado após o atraso
                dispatch(new \App\Jobs\ProcessAutomationNode(
                    $node->automation_id,
                    $node->node_id,
                    $contact->id,
                    AutomationLog::where('automation_id', $node->automation_id)
                        ->where('contact_id', $contact->id)
                        ->latest()
                        ->first()->id,
                    $opportunity?->id
                ))->delay(now()->addMinutes($delayMinutes));
                
                $result = ['delayed' => true, 'delay_minutes' => $delayMinutes];
                break;
        }

        return $result;
    }

    /**
     * Executar uma ação específica.
     *
     * @param string $actionType
     * @param array $config
     * @param Contact $contact
     * @param array $context
     * @param Opportunity|null $opportunity
     * @return array
     */
    protected function executeAction(string $actionType, array $config, Contact $contact, array $context, ?Opportunity $opportunity = null): array
    {
        $result = ['success' => true, 'action_type' => $actionType];

        switch ($actionType) {
            case 'send_whatsapp':
                // Enviar WhatsApp
                $messageService = app(MessageService::class);
                $result = $messageService->sendWhatsapp($contact, $config, $context);
                break;

            case 'add_tag':
                // Adicionar tag ao contato
                $tag = $config['tag'] ?? null;
                if ($tag) {
                    // Lógica para adicionar tag
                    $result['tag'] = $tag;
                }
                break;

            case 'move_pipeline':
                // Mover no pipeline
                if ($opportunity) {
                    $stageId = $config['stage_id'] ?? null;
                    if ($stageId) {
                        $opportunity->update(['stage_id' => $stageId]);
                        $result['moved_to_stage'] = $stageId;
                    }
                }
                break;

            case 'create_task':
                // Criar tarefa
                // Implementação da lógica para criar tarefa
                $result['task_created'] = true;
                break;

            default:
                $result = ['success' => false, 'error' => "Tipo de ação desconhecido: {$actionType}"];
                break;
        }

        return $result;
    }

    /**
     * Avaliar uma condição.
     *
     * @param array $config
     * @param Contact $contact
     * @param array $context
     * @param Opportunity|null $opportunity
     * @return array
     */
    protected function evaluateCondition(array $config, Contact $contact, array $context, ?Opportunity $opportunity = null): array
    {
        $conditionType = $config['condition_type'] ?? null;
        $conditionValue = $config['condition_value'] ?? null;
        $conditionField = $config['condition_field'] ?? null;
        $conditionOperator = $config['condition_operator'] ?? 'equals';

        $result = ['condition_met' => false];

        if (!$conditionType || !$conditionField) {
            return $result;
        }

        $fieldValue = null;

        // Obter o valor do campo com base no tipo de condição
        switch ($conditionType) {
            case 'contact':
                $fieldValue = $contact->{$conditionField} ?? null;
                break;

            case 'opportunity':
                if ($opportunity) {
                    $fieldValue = $opportunity->{$conditionField} ?? null;
                }
                break;

            case 'context':
                $fieldValue = $context[$conditionField] ?? null;
                break;
        }

        // Avaliar a condição
        switch ($conditionOperator) {
            case 'equals':
                $result['condition_met'] = $fieldValue == $conditionValue;
                break;

            case 'not_equals':
                $result['condition_met'] = $fieldValue != $conditionValue;
                break;

            case 'contains':
                $result['condition_met'] = is_string($fieldValue) && strpos($fieldValue, $conditionValue) !== false;
                break;

            case 'greater_than':
                $result['condition_met'] = $fieldValue > $conditionValue;
                break;

            case 'less_than':
                $result['condition_met'] = $fieldValue < $conditionValue;
                break;

            case 'is_empty':
                $result['condition_met'] = empty($fieldValue);
                break;

            case 'is_not_empty':
                $result['condition_met'] = !empty($fieldValue);
                break;
        }

        return $result;
    }

    /**
     * Encontrar os próximos nós a serem processados.
     *
     * @param Automation $automation
     * @param AutomationNode $currentNode
     * @param array $result
     * @return array
     */
    protected function findNextNodes(Automation $automation, AutomationNode $currentNode, array $result): array
    {
        $edges = \App\Models\AutomationEdge::where('automation_id', $automation->id)
            ->where('source_node_id', $currentNode->node_id)
            ->get();

        $nextNodes = [];

        foreach ($edges as $edge) {
            $shouldFollow = true;

            // Verificar se há uma condição na edge
            if ($edge->hasCondition()) {
                $condition = $edge->getCondition();
                
                // Para nós de condição, verificar se a condição foi atendida
                if ($currentNode->type === 'condition') {
                    $conditionMet = $result['condition_met'] ?? false;
                    
                    // Se esta edge é para o caminho "true" mas a condição não foi atendida, ou vice-versa
                    if (($condition['path'] === 'true' && !$conditionMet) || 
                        ($condition['path'] === 'false' && $conditionMet)) {
                        $shouldFollow = false;
                    }
                }
            }

            if ($shouldFollow) {
                $nextNodes[] = $edge->target_node_id;
            }
        }

        return $nextNodes;
    }
} 