"use client";

import { useState, useEffect } from 'react';
import { Handle, Position, useUpdateNodeInternals } from 'reactflow';
import { Split, Crosshair } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/Components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/Components/ui/collapsible';

import { 
  conditionTypes,
  contactFields,
  opportunityFields,
  conditionOperators,
} from '../utils';

export default function ConditionNode({ id, data, selected }) {
  const [conditionType, setConditionType] = useState(data.conditionType || 'contact');
  const [conditionField, setConditionField] = useState(data.conditionField || 'name');
  const [conditionOperator, setConditionOperator] = useState(data.conditionOperator || 'equals');
  const [conditionValue, setConditionValue] = useState(data.conditionValue || '');
  const [isCollapsed, setIsCollapsed] = useState(!data.expanded);
  const updateNodeInternals = useUpdateNodeInternals();

  // Atualizar internos do nó quando as configurações mudarem
  useEffect(() => {
    updateNodeInternals(id);
    
    // Atualizar dados do nó quando as configurações mudarem
    data.conditionType = conditionType;
    data.conditionField = conditionField;
    data.conditionOperator = conditionOperator;
    data.conditionValue = conditionValue;
  }, [conditionType, conditionField, conditionOperator, conditionValue, id, updateNodeInternals]);

  // Obter campos disponíveis para o tipo de condição selecionado
  const getAvailableFields = () => {
    switch (conditionType) {
      case 'contact':
        return contactFields;
      case 'opportunity':
        return opportunityFields;
      case 'context':
        return [
          { value: 'form_id', label: 'ID do Formulário' },
          { value: 'source', label: 'Origem' },
        ];
      default:
        return [];
    }
  };

  // Resetar o campo quando o tipo de condição muda
  const handleConditionTypeChange = (value) => {
    setConditionType(value);
    // Selecionar o primeiro campo disponível para o novo tipo
    const availableFields = getAvailableFields();
    if (availableFields.length > 0) {
      setConditionField(availableFields[0].value);
    } else {
      setConditionField('');
    }
  };

  return (
    <div className={`transition-all duration-300 ${selected ? 'ring-2 ring-blue-500 ring-opacity-50' : ''}`}>
      <Card className="w-[280px] bg-purple-50 shadow-sm border-purple-200">
        <CardHeader className="p-3 flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-sm font-medium flex items-center">
            <Split className="w-4 h-4 mr-2 text-purple-600" />
            Condição: {data.label || 'Nova Condição'}
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
                  <label className="text-xs font-medium mb-1">Nome da Condição</label>
                  <Input 
                    placeholder="Nova Condição" 
                    value={data.label || ''} 
                    onChange={(e) => data.label = e.target.value}
                    size="sm"
                    className="text-xs"
                  />
                </div>
                
                <div className="flex flex-col">
                  <label className="text-xs font-medium mb-1">Tipo</label>
                  <Select 
                    value={conditionType} 
                    onValueChange={handleConditionTypeChange}
                  >
                    <SelectTrigger className="text-xs h-8">
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent className="text-xs">
                      {conditionTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex flex-col">
                  <label className="text-xs font-medium mb-1">Campo</label>
                  <Select 
                    value={conditionField} 
                    onValueChange={setConditionField}
                  >
                    <SelectTrigger className="text-xs h-8">
                      <SelectValue placeholder="Selecione o campo" />
                    </SelectTrigger>
                    <SelectContent className="text-xs">
                      {getAvailableFields().map((field) => (
                        <SelectItem key={field.value} value={field.value}>
                          {field.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex flex-col">
                  <label className="text-xs font-medium mb-1">Operador</label>
                  <Select 
                    value={conditionOperator} 
                    onValueChange={setConditionOperator}
                  >
                    <SelectTrigger className="text-xs h-8">
                      <SelectValue placeholder="Selecione o operador" />
                    </SelectTrigger>
                    <SelectContent className="text-xs">
                      {conditionOperators.map((op) => (
                        <SelectItem key={op.value} value={op.value}>
                          {op.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Mostrar o campo de valor apenas se o operador não for is_empty ou is_not_empty */}
                {conditionOperator !== 'is_empty' && conditionOperator !== 'is_not_empty' && (
                  <div className="flex flex-col">
                    <label className="text-xs font-medium mb-1">Valor</label>
                    <Input 
                      placeholder="Valor para comparação" 
                      value={conditionValue} 
                      onChange={(e) => setConditionValue(e.target.value)}
                      size="sm"
                      className="text-xs"
                    />
                  </div>
                )}

                <div className="pt-2 border-t border-dashed border-purple-200 text-xs text-muted-foreground">
                  <p>Se <span className="font-medium">{conditionType === 'contact' ? 'o contato' : conditionType === 'opportunity' ? 'a oportunidade' : 'o contexto'}</span> {' '}
                  <span className="font-medium">{getAvailableFields().find(f => f.value === conditionField)?.label || conditionField}</span> {' '}
                  <span className="font-medium">{conditionOperators.find(op => op.value === conditionOperator)?.label || conditionOperator}</span> {' '}
                  {conditionOperator !== 'is_empty' && conditionOperator !== 'is_not_empty' && 
                    <span className="font-medium">"{conditionValue}"</span>
                  }
                  </p>
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
        className="h-3 w-3 bg-purple-500"
        id="input"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="h-3 w-3 bg-green-500"
        id="true"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="h-3 w-3 bg-red-500"
        id="false"
      />

      {/* Legendas para os handles */}
      <div className="absolute -right-5 top-1/2 transform -translate-y-1/2 text-xs text-green-600 font-medium">
        Sim
      </div>
      <div className="absolute bottom-0 left-1/2 transform translate-y-1/2 -translate-x-1/2 text-xs text-red-600 font-medium">
        Não
      </div>
    </div>
  );
} 