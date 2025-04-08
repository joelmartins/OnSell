"use client";

import { useState, useEffect } from 'react';
import { Handle, Position, useUpdateNodeInternals } from 'reactflow';
import { Zap, Crosshair } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Textarea } from '@/Components/ui/textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/Components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/Components/ui/collapsible';

import { 
  actionTypes,
} from '../utils';

export default function ActionNode({ id, data, selected }) {
  const [actionType, setActionType] = useState(data.actionType || 'send_whatsapp');
  const [isCollapsed, setIsCollapsed] = useState(!data.expanded);
  const updateNodeInternals = useUpdateNodeInternals();

  // Atualizar internos do nó quando as configurações mudarem
  useEffect(() => {
    updateNodeInternals(id);
    data.actionType = actionType;
  }, [actionType, id, updateNodeInternals]);

  const handleActionTypeChange = (value) => {
    setActionType(value);
  };

  // Renderizar campos específicos baseados no tipo de ação
  const renderActionConfig = () => {
    switch (actionType) {
      case 'send_whatsapp':
        return (
          <div className="space-y-3">
            <div className="flex flex-col">
              <label className="text-xs font-medium mb-1">ID do Template (opcional)</label>
              <Input 
                placeholder="ID do template" 
                value={data.messageTemplateId || ''} 
                onChange={(e) => data.messageTemplateId = e.target.value}
                size="sm"
                className="text-xs"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Deixe em branco para usar o conteúdo personalizado abaixo.
              </p>
            </div>
            
            <div className="flex flex-col">
              <label className="text-xs font-medium mb-1">Conteúdo da Mensagem</label>
              <Textarea 
                placeholder="Digite a mensagem que será enviada..." 
                value={data.message || ''} 
                onChange={(e) => data.message = e.target.value}
                className="text-xs h-24 resize-none"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Você pode usar variáveis como {{nome}}, {{email}}, etc.
              </p>
            </div>
          </div>
        );
      case 'add_tag':
        return (
          <div className="space-y-3">
            <div className="flex flex-col">
              <label className="text-xs font-medium mb-1">Tag</label>
              <Input 
                placeholder="Nome da tag" 
                value={data.tag || ''} 
                onChange={(e) => data.tag = e.target.value}
                size="sm"
                className="text-xs"
              />
            </div>
          </div>
        );
      case 'move_pipeline':
        return (
          <div className="space-y-3">
            <div className="flex flex-col">
              <label className="text-xs font-medium mb-1">ID do Estágio</label>
              <Input 
                placeholder="ID do estágio no pipeline" 
                value={data.stageId || ''} 
                onChange={(e) => data.stageId = e.target.value}
                size="sm"
                className="text-xs"
              />
            </div>
          </div>
        );
      case 'create_task':
        return (
          <div className="space-y-3">
            <div className="flex flex-col">
              <label className="text-xs font-medium mb-1">Título da Tarefa</label>
              <Input 
                placeholder="Título da tarefa" 
                value={data.taskTitle || ''} 
                onChange={(e) => data.taskTitle = e.target.value}
                size="sm"
                className="text-xs"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-xs font-medium mb-1">Descrição</label>
              <Textarea 
                placeholder="Descrição da tarefa" 
                value={data.taskDescription || ''} 
                onChange={(e) => data.taskDescription = e.target.value}
                className="text-xs h-16 resize-none"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-xs font-medium mb-1">Data de Vencimento</label>
              <Input 
                type="date" 
                value={data.taskDueDate || ''} 
                onChange={(e) => data.taskDueDate = e.target.value}
                size="sm"
                className="text-xs"
              />
            </div>
          </div>
        );
      default:
        return (
          <p className="text-xs text-muted-foreground">
            Configure as opções para esta ação.
          </p>
        );
    }
  };

  return (
    <div className={`transition-all duration-300 ${selected ? 'ring-2 ring-blue-500 ring-opacity-50' : ''}`}>
      <Card className="w-[280px] bg-blue-50 shadow-sm border-blue-200">
        <CardHeader className="p-3 flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-sm font-medium flex items-center">
            <Zap className="w-4 h-4 mr-2 text-blue-600" />
            Ação: {data.label || 'Nova Ação'}
          </CardTitle>
          <CollapsibleTrigger
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="rounded-full hover:bg-black/5 p-1"
          >
            <Crosshair className="h-4 w-4 text-muted-foreground" />
          </CollapsibleTrigger>
        </CardHeader>
        
        <Collapsible open={!isCollapsed} className="w-full">
          <CollapsibleContent>
            <CardContent className="p-3 pt-0">
              <div className="space-y-3">
                <div className="flex flex-col">
                  <label className="text-xs font-medium mb-1">Nome da Ação</label>
                  <Input 
                    placeholder="Nova Ação" 
                    value={data.label || ''} 
                    onChange={(e) => data.label = e.target.value}
                    size="sm"
                    className="text-xs"
                  />
                </div>
                
                <div className="flex flex-col">
                  <label className="text-xs font-medium mb-1">Tipo de Ação</label>
                  <Select 
                    value={actionType} 
                    onValueChange={handleActionTypeChange}
                  >
                    <SelectTrigger className="text-xs h-8">
                      <SelectValue placeholder="Selecione o tipo de ação" />
                    </SelectTrigger>
                    <SelectContent className="text-xs">
                      {actionTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="pt-2 border-t border-dashed border-blue-200">
                  <p className="text-xs font-medium mb-2">Configuração da Ação</p>
                  {renderActionConfig()}
                </div>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Handles para conexões */}
      <Handle
        type="target"
        position={Position.Left}
        className="h-3 w-3 bg-blue-500"
        id="input"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="h-3 w-3 bg-blue-500"
        id="output"
      />
    </div>
  );
} 