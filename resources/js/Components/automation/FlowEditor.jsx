"use client";

import { useCallback, useRef, useState, useEffect } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Panel,
  MarkerType
} from 'reactflow';
import 'reactflow/dist/style.css';
import { toast } from 'react-toastify';
import { Button } from '@/Components/ui/button';
import { 
  Save, 
  Play, 
  PowerOff, 
  Plus, 
  Trash2,
  ZoomIn, 
  ZoomOut
} from 'lucide-react';
import TriggerNode from './nodes/TriggerNode';
import ActionNode from './nodes/ActionNode';
import ConditionNode from './nodes/ConditionNode';
import DelayNode from './nodes/DelayNode';
import { createNodeId } from './utils';

// Definição dos tipos de nós customizados
const nodeTypes = {
  trigger: TriggerNode,
  action: ActionNode,
  condition: ConditionNode,
  delay: DelayNode,
};

export default function FlowEditor({ 
  initialNodes = [], 
  initialEdges = [], 
  onSave, 
  isEditing = false, 
  isActive = false,
  onToggleActive,
  onDelete,
  onExecute,
  triggerType = 'form_submitted',
  triggerConfig = {}
}) {
  const reactFlowWrapper = useRef(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [selectedEdge, setSelectedEdge] = useState(null);
  const [isDirty, setIsDirty] = useState(false);

  // Monitorar alterações para atualizar o estado "dirty"
  useEffect(() => {
    if (isEditing && (nodes.length > 0 || edges.length > 0)) {
      setIsDirty(true);
    }
  }, [nodes, edges]);

  // Configurar os nodes iniciais
  useEffect(() => {
    if (initialNodes.length === 0 && !isEditing) {
      // Adicionar o nó trigger inicial se não estiver editando uma automação existente
      const triggerNode = {
        id: createNodeId(),
        type: 'trigger',
        position: { x: 250, y: 50 },
        data: { 
          label: 'Início do Fluxo',
          triggerType,
          triggerConfig,
          expanded: true
        },
      };
      setNodes([triggerNode]);
    }
  }, []);

  // Função para adicionar uma conexão (edge)
  const onConnect = useCallback(
    (params) => {
      // Verificar se a conexão é válida (evitar ciclos)
      const sourceNode = nodes.find(node => node.id === params.source);
      const targetNode = nodes.find(node => node.id === params.target);
      
      if (sourceNode.type === 'trigger' && targetNode.type === 'trigger') {
        toast.error('Não é possível conectar um gatilho a outro gatilho');
        return;
      }

      // Para nós condicionais, adicionar etiqueta baseada no handle
      if (sourceNode.type === 'condition') {
        if (params.sourceHandle === 'true') {
          params.label = 'Sim';
          params.labelBgStyle = { fill: '#10b981' };
          params.labelBgPadding = [8, 4];
        } else if (params.sourceHandle === 'false') {
          params.label = 'Não';
          params.labelBgStyle = { fill: '#ef4444' };
          params.labelBgPadding = [8, 4];
        }
      }

      const newEdge = {
        ...params,
        markerEnd: {
          type: MarkerType.ArrowClosed,
        },
        style: { stroke: '#888' },
      };

      setEdges((eds) => addEdge(newEdge, eds));
      setIsDirty(true);
    },
    [nodes]
  );

  // Função para adicionar um novo nó
  const onAddNode = (nodeType) => {
    const newNodeId = createNodeId();
    const position = {
      x: Math.random() * 300 + 50,
      y: Math.random() * 300 + 50,
    };

    let newNode = {
      id: newNodeId,
      type: nodeType,
      position,
      data: { label: '', expanded: true },
    };

    // Configurar dados específicos para cada tipo de nó
    switch (nodeType) {
      case 'action':
        newNode.data.label = 'Nova Ação';
        newNode.data.actionType = 'send_whatsapp';
        break;
      case 'condition':
        newNode.data.label = 'Nova Condição';
        newNode.data.conditionType = 'contact';
        newNode.data.conditionField = 'name';
        newNode.data.conditionOperator = 'equals';
        newNode.data.conditionValue = '';
        break;
      case 'delay':
        newNode.data.label = 'Atraso';
        newNode.data.delayMinutes = 5;
        break;
      default:
        break;
    }

    setNodes((nds) => nds.concat(newNode));
    setIsDirty(true);
  };

  // Função para remover nó ou edge selecionado
  const onRemoveSelected = () => {
    if (selectedNode) {
      // Não permitir remover o nó trigger se for o único
      if (selectedNode.type === 'trigger' && nodes.filter(n => n.type === 'trigger').length <= 1) {
        toast.error('Um fluxo precisa ter pelo menos um gatilho de início');
        return;
      }
      
      setNodes((nds) => nds.filter((node) => node.id !== selectedNode.id));
      setEdges((eds) => eds.filter((edge) => edge.source !== selectedNode.id && edge.target !== selectedNode.id));
      setSelectedNode(null);
      setIsDirty(true);
    }
    
    if (selectedEdge) {
      setEdges((eds) => eds.filter((edge) => edge.id !== selectedEdge.id));
      setSelectedEdge(null);
      setIsDirty(true);
    }
  };

  // Funções para gerenciar a seleção
  const onNodeClick = (event, node) => {
    setSelectedNode(node);
    setSelectedEdge(null);
  };

  const onEdgeClick = (event, edge) => {
    setSelectedEdge(edge);
    setSelectedNode(null);
  };

  const onPaneClick = () => {
    setSelectedNode(null);
    setSelectedEdge(null);
  };

  // Função para salvar o fluxo
  const handleSave = () => {
    if (!isDirty) {
      toast.info('Não há alterações para salvar');
      return;
    }

    // Verificar se há pelo menos um nó de trigger
    const hasStartTrigger = nodes.some(node => node.type === 'trigger');
    if (!hasStartTrigger) {
      toast.error('O fluxo precisa ter pelo menos um gatilho de início');
      return;
    }

    const flowData = {
      nodes: nodes.map(node => ({
        id: node.id,
        type: node.type,
        position: node.position,
        data: node.data,
      })),
      edges,
      trigger_type: triggerType,
      trigger_config: triggerConfig,
    };

    onSave(flowData);
    setIsDirty(false);
  };
  
  const flowKey = `flow-${triggerType}-${Date.now()}`;

  return (
    <div className="h-[80vh] w-full border rounded-lg" ref={reactFlowWrapper}>
      <ReactFlow
        key={flowKey}
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        onInit={setReactFlowInstance}
        onNodeClick={onNodeClick}
        onEdgeClick={onEdgeClick}
        onPaneClick={onPaneClick}
        deleteKeyCode={null} // Desativar deleção pelo teclado para centralizar no botão
      >
        <Background />
        <Controls />
        <MiniMap />
        
        {/* Painel de ferramentas */}
        <Panel position="top-right" className="bg-white p-2 rounded shadow-md">
          <div className="flex flex-col gap-2">
            <Button onClick={() => handleSave()} disabled={!isDirty} size="sm" variant="outline" className="w-full">
              <Save className="mr-2 h-4 w-4" />
              Salvar
            </Button>
            
            {isEditing && (
              <>
                <Button 
                  onClick={() => onToggleActive(!isActive)} 
                  size="sm" 
                  variant={isActive ? "destructive" : "default"}
                  className="w-full"
                >
                  {isActive ? (
                    <>
                      <PowerOff className="mr-2 h-4 w-4" />
                      Desativar
                    </>
                  ) : (
                    <>
                      <Play className="mr-2 h-4 w-4" />
                      Ativar
                    </>
                  )}
                </Button>
                
                <Button 
                  onClick={() => onExecute()} 
                  size="sm" 
                  variant="outline"
                  className="w-full"
                >
                  <Play className="mr-2 h-4 w-4" />
                  Executar
                </Button>
                
                <Button 
                  onClick={() => onDelete()} 
                  size="sm" 
                  variant="destructive"
                  className="w-full"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Excluir
                </Button>
              </>
            )}
          </div>
        </Panel>
        
        {/* Painel de adição de nós */}
        <Panel position="top-left" className="bg-white p-2 rounded shadow-md">
          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium mb-1">Adicionar Nós</p>
            <div className="flex gap-1">
              <Button onClick={() => onAddNode('action')} size="sm" variant="outline">
                <Plus className="mr-1 h-3 w-3" />
                Ação
              </Button>
              <Button onClick={() => onAddNode('condition')} size="sm" variant="outline">
                <Plus className="mr-1 h-3 w-3" />
                Condição
              </Button>
              <Button onClick={() => onAddNode('delay')} size="sm" variant="outline">
                <Plus className="mr-1 h-3 w-3" />
                Atraso
              </Button>
            </div>
            
            {(selectedNode || selectedEdge) && (
              <Button onClick={onRemoveSelected} size="sm" variant="destructive" className="mt-2">
                <Trash2 className="mr-1 h-3 w-3" />
                Remover Selecionado
              </Button>
            )}
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
} 