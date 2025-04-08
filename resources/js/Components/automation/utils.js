/**
 * Gera um ID único para um nó
 * @returns {string} ID único com prefixo 'node_'
 */
export const createNodeId = () => `node_${Math.random().toString(36).substr(2, 9)}`;

/**
 * Gera um ID único para uma aresta
 * @returns {string} ID único com prefixo 'edge_'
 */
export const createEdgeId = () => `edge_${Math.random().toString(36).substr(2, 9)}`;

/**
 * Lista de tipos de condição disponíveis
 */
export const conditionTypes = [
  { value: 'contact', label: 'Contato' },
  { value: 'opportunity', label: 'Oportunidade' },
  { value: 'context', label: 'Contexto' }
];

/**
 * Lista de campos de contato disponíveis para condições
 */
export const contactFields = [
  { value: 'name', label: 'Nome' },
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Telefone' },
  { value: 'company', label: 'Empresa' },
  { value: 'title', label: 'Cargo' },
  { value: 'created_at', label: 'Data de Criação' },
  { value: 'tags', label: 'Tags' }
];

/**
 * Lista de campos de oportunidade disponíveis para condições
 */
export const opportunityFields = [
  { value: 'title', label: 'Título' },
  { value: 'value', label: 'Valor' },
  { value: 'stage_id', label: 'Estágio' },
  { value: 'created_at', label: 'Data de Criação' },
  { value: 'updated_at', label: 'Data de Atualização' }
];

/**
 * Lista de operadores disponíveis para condições
 */
export const conditionOperators = [
  { value: 'equals', label: 'Igual a' },
  { value: 'not_equals', label: 'Diferente de' },
  { value: 'contains', label: 'Contém' },
  { value: 'greater_than', label: 'Maior que' },
  { value: 'less_than', label: 'Menor que' },
  { value: 'is_empty', label: 'Está vazio' },
  { value: 'is_not_empty', label: 'Não está vazio' }
];

/**
 * Lista de tipos de ação disponíveis
 */
export const actionTypes = [
  { value: 'send_whatsapp', label: 'Enviar WhatsApp' },
  { value: 'add_tag', label: 'Adicionar Tag' },
  { value: 'move_pipeline', label: 'Mover no Pipeline' },
  { value: 'create_task', label: 'Criar Tarefa' }
];

/**
 * Lista de gatilhos disponíveis para automações
 */
export const triggerTypes = [
  { value: 'form_submitted', label: 'Formulário Submetido' },
  { value: 'contact_created', label: 'Contato Criado' },
  { value: 'opportunity_created', label: 'Oportunidade Criada' },
  { value: 'status_changed', label: 'Status da Oportunidade Alterado' },
  { value: 'tag_applied', label: 'Tag Aplicada' },
  { value: 'manual', label: 'Manual (API)' }
];

/**
 * Converte um array de nós e arestas do React Flow para o formato do backend
 * @param {Array} nodes - Array de nós do React Flow
 * @param {Array} edges - Array de arestas do React Flow
 * @returns {Object} - Objeto com nós e arestas no formato esperado pelo backend
 */
export const convertFlowToBackendFormat = (nodes, edges) => {
  const formattedNodes = nodes.map(node => ({
    node_id: node.id,
    type: node.type,
    name: node.data.label,
    config: getNodeConfig(node),
    position_x: node.position.x,
    position_y: node.position.y
  }));

  const formattedEdges = edges.map(edge => ({
    edge_id: edge.id,
    source_node_id: edge.source,
    target_node_id: edge.target,
    source_handle: edge.sourceHandle,
    target_handle: edge.targetHandle,
    label: edge.label,
    config: getEdgeConfig(edge)
  }));

  return {
    nodes: formattedNodes,
    edges: formattedEdges
  };
};

/**
 * Extrai a configuração de um nó com base no seu tipo
 * @param {Object} node - Nó do React Flow
 * @returns {Object} - Configuração do nó
 */
const getNodeConfig = (node) => {
  switch (node.type) {
    case 'trigger':
      return {
        triggerType: node.data.triggerType,
        triggerConfig: node.data.triggerConfig || {}
      };
    case 'action':
      return {
        actionType: node.data.actionType,
        message: node.data.message,
        message_template_id: node.data.messageTemplateId,
        media_urls: node.data.mediaUrls || [],
        tag: node.data.tag,
        stage_id: node.data.stageId,
        task_title: node.data.taskTitle,
        task_description: node.data.taskDescription,
        task_due_date: node.data.taskDueDate
      };
    case 'condition':
      return {
        conditionType: node.data.conditionType,
        conditionField: node.data.conditionField,
        conditionOperator: node.data.conditionOperator,
        conditionValue: node.data.conditionValue
      };
    case 'delay':
      return {
        delayMinutes: node.data.delayMinutes || 5
      };
    default:
      return {};
  }
};

/**
 * Extrai a configuração de uma aresta
 * @param {Object} edge - Aresta do React Flow
 * @returns {Object} - Configuração da aresta
 */
const getEdgeConfig = (edge) => {
  // Para arestas que saem de nós condicionais, adicionar a condição (true/false)
  if (edge.sourceHandle === 'true' || edge.sourceHandle === 'false') {
    return {
      condition: {
        path: edge.sourceHandle
      }
    };
  }
  return {};
};

/**
 * Converte dados do backend para o formato do React Flow
 * @param {Object} data - Dados do backend
 * @returns {Object} - Objeto com nós e arestas no formato do React Flow
 */
export const convertBackendToFlowFormat = (data) => {
  if (!data || !data.nodes || !data.edges) {
    return { nodes: [], edges: [] };
  }

  const nodes = data.nodes.map(node => ({
    id: node.node_id,
    type: node.type,
    position: { x: node.position_x, y: node.position_y },
    data: getReactFlowNodeData(node)
  }));

  const edges = data.edges.map(edge => ({
    id: edge.edge_id,
    source: edge.source_node_id,
    target: edge.target_node_id,
    sourceHandle: edge.source_handle,
    targetHandle: edge.target_handle,
    label: edge.label,
    style: { stroke: '#888' },
    markerEnd: {
      type: MarkerType.ArrowClosed,
    },
    ...(edge.config && edge.config.condition && {
      labelBgStyle: { 
        fill: edge.config.condition.path === 'true' ? '#10b981' : '#ef4444' 
      },
      labelBgPadding: [8, 4]
    })
  }));

  return { nodes, edges };
};

/**
 * Obtém os dados para um nó do React Flow a partir dos dados do backend
 * @param {Object} node - Nó do backend
 * @returns {Object} - Dados para o nó do React Flow
 */
const getReactFlowNodeData = (node) => {
  const baseData = {
    label: node.name,
    expanded: true
  };

  switch (node.type) {
    case 'trigger':
      return {
        ...baseData,
        triggerType: node.config?.triggerType || 'form_submitted',
        triggerConfig: node.config?.triggerConfig || {}
      };
    case 'action':
      return {
        ...baseData,
        actionType: node.config?.actionType || 'send_whatsapp',
        message: node.config?.message,
        messageTemplateId: node.config?.message_template_id,
        mediaUrls: node.config?.media_urls || [],
        tag: node.config?.tag,
        stageId: node.config?.stage_id,
        taskTitle: node.config?.task_title,
        taskDescription: node.config?.task_description,
        taskDueDate: node.config?.task_due_date
      };
    case 'condition':
      return {
        ...baseData,
        conditionType: node.config?.conditionType || 'contact',
        conditionField: node.config?.conditionField || 'name',
        conditionOperator: node.config?.conditionOperator || 'equals',
        conditionValue: node.config?.conditionValue || ''
      };
    case 'delay':
      return {
        ...baseData,
        delayMinutes: node.config?.delayMinutes || 5
      };
    default:
      return baseData;
  }
}; 