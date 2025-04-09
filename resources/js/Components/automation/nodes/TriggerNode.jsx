"use client";

import { useState, useEffect } from 'react';
import { Handle, Position, useUpdateNodeInternals } from 'reactflow';
import { ActivityIcon, Crosshair } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/Components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/Components/ui/collapsible';

import { 
  triggerTypes,
} from '../utils';

export default function TriggerNode({ id, data, selected }) {
  const [triggerType, setTriggerType] = useState(data.triggerType || 'form_submitted');
  const [triggerConfig, setTriggerConfig] = useState(data.triggerConfig || {});
  const [isCollapsed, setIsCollapsed] = useState(!data.expanded);
  const updateNodeInternals = useUpdateNodeInternals();

  // Atualizar internos do nó quando as configurações mudarem
  useEffect(() => {
    updateNodeInternals(id);
    
    // Atualizar dados do nó quando as configurações mudarem
    data.triggerType = triggerType;
    data.triggerConfig = triggerConfig;
  }, [triggerType, triggerConfig, id, updateNodeInternals]);

  const handleTriggerTypeChange = (value) => {
    setTriggerType(value);
    // Resetar configurações ao mudar o tipo de gatilho
    setTriggerConfig({});
  };

  const handleConfigChange = (key, value) => {
    setTriggerConfig(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Renderizar campos específicos baseados no tipo de gatilho
  const renderTriggerConfig = () => {
    switch (triggerType) {
      case 'form_submitted':
        return (
          <div className="space-y-2">
            <div className="flex flex-col">
              <label className="text-xs font-medium mb-1">ID do Formulário</label>
              <Input 
                placeholder="Todos os formulários" 
                value={triggerConfig.form_id || ''} 
                onChange={(e) => handleConfigChange('form_id', e.target.value)}
                size="sm"
                className="text-xs"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Deixe em branco para acionar com qualquer formulário.
            </p>
          </div>
        );
      case 'status_changed':
        return (
          <div className="space-y-2">
            <div className="flex flex-col">
              <label className="text-xs font-medium mb-1">De Estágio</label>
              <Input 
                placeholder="Qualquer estágio" 
                value={triggerConfig.from_status || ''} 
                onChange={(e) => handleConfigChange('from_status', e.target.value)}
                size="sm"
                className="text-xs"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-xs font-medium mb-1">Para Estágio</label>
              <Input 
                placeholder="Qualquer estágio" 
                value={triggerConfig.to_status || ''} 
                onChange={(e) => handleConfigChange('to_status', e.target.value)}
                size="sm"
                className="text-xs"
              />
            </div>
          </div>
        );
      case 'tag_applied':
        return (
          <div className="space-y-2">
            <div className="flex flex-col">
              <label className="text-xs font-medium mb-1">Tag</label>
              <Input 
                placeholder="Nome da tag" 
                value={triggerConfig.tag || ''} 
                onChange={(e) => handleConfigChange('tag', e.target.value)}
                size="sm"
                className="text-xs"
              />
            </div>
          </div>
        );
      default:
        return (
          <p className="text-xs text-muted-foreground">
            Este gatilho não requer configuração adicional.
          </p>
        );
    }
  };

  return (
    <div className={`transition-all duration-300 ${selected ? 'ring-2 ring-blue-500 ring-opacity-50' : ''}`}>
      <Card className="w-[280px] bg-amber-50 shadow-sm border-amber-200">
        <CardHeader className="p-3 flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-sm font-medium flex items-center">
            <ActivityIcon className="w-4 h-4 mr-2 text-amber-600" />
            Gatilho: {data.label || 'Início do Fluxo'}
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
                  <label className="text-xs font-medium mb-1">Nome do Gatilho</label>
                  <Input 
                    placeholder="Início do Fluxo" 
                    value={data.label || ''} 
                    onChange={(e) => data.label = e.target.value}
                    size="sm"
                    className="text-xs"
                  />
                </div>
                
                <div className="flex flex-col">
                  <label className="text-xs font-medium mb-1">Tipo de Gatilho</label>
                  <Select 
                    value={triggerType} 
                    onValueChange={handleTriggerTypeChange}
                  >
                    <SelectTrigger className="text-xs h-8">
                      <SelectValue placeholder="Selecione o gatilho" />
                    </SelectTrigger>
                    <SelectContent className="text-xs">
                      {triggerTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="pt-2 border-t border-dashed border-amber-200">
                  <p className="text-xs font-medium mb-2">Configuração do Gatilho</p>
                  {renderTriggerConfig()}
                </div>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Handles para conexões */}
      <Handle
        type="source"
        position={Position.Right}
        className="h-3 w-3 bg-amber-500"
        id="output"
      />
    </div>
  );
} 