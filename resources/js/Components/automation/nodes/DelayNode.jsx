"use client";

import { useState, useEffect } from 'react';
import { Handle, Position, useUpdateNodeInternals } from 'reactflow';
import { Clock, Crosshair } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/Components/ui/collapsible';
import { Slider } from '@/Components/ui/slider';

export default function DelayNode({ id, data, selected }) {
  const [delayMinutes, setDelayMinutes] = useState(data.delayMinutes || 5);
  const [isCollapsed, setIsCollapsed] = useState(!data.expanded);
  const updateNodeInternals = useUpdateNodeInternals();

  // Atualizar internos do nó quando as configurações mudarem
  useEffect(() => {
    updateNodeInternals(id);
    
    // Atualizar dados do nó quando as configurações mudarem
    data.delayMinutes = delayMinutes;
  }, [delayMinutes, id, updateNodeInternals]);

  // Formatar o tempo de atraso para exibição
  const formatDelayTime = (minutes) => {
    if (minutes < 60) {
      return `${minutes} minutos`;
    } else if (minutes === 60) {
      return '1 hora';
    } else if (minutes % 60 === 0) {
      return `${minutes / 60} horas`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return `${hours} hora${hours > 1 ? 's' : ''} e ${remainingMinutes} minuto${remainingMinutes > 1 ? 's' : ''}`;
    }
  };

  return (
    <div className={`transition-all duration-300 ${selected ? 'ring-2 ring-blue-500 ring-opacity-50' : ''}`}>
      <Card className="w-[280px] bg-orange-50 shadow-sm border-orange-200">
        <CardHeader className="p-3 flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-sm font-medium flex items-center">
            <Clock className="w-4 h-4 mr-2 text-orange-600" />
            Atraso: {data.label || formatDelayTime(delayMinutes)}
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
                  <label className="text-xs font-medium mb-1">Nome do Atraso (opcional)</label>
                  <Input 
                    placeholder="Atraso" 
                    value={data.label || ''} 
                    onChange={(e) => data.label = e.target.value}
                    size="sm"
                    className="text-xs"
                  />
                </div>
                
                <div className="flex flex-col">
                  <label className="text-xs font-medium mb-1">Tempo de Espera (minutos)</label>
                  <div className="flex items-center gap-2">
                    <Input 
                      type="number" 
                      min="1" 
                      max="1440" 
                      value={delayMinutes} 
                      onChange={(e) => setDelayMinutes(Number(e.target.value))}
                      size="sm"
                      className="text-xs w-20"
                    />
                    <div className="flex-1">
                      <Slider
                        min={1}
                        max={180}
                        step={1}
                        value={[delayMinutes]}
                        onValueChange={(value) => setDelayMinutes(value[0])}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="pt-2 border-t border-dashed border-orange-200">
                  <p className="text-xs text-center font-medium text-orange-600">
                    Aguardar {formatDelayTime(delayMinutes)} antes de continuar o fluxo
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 text-center">
                    O contato passará para o próximo passo após este período
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
        className="h-3 w-3 bg-orange-500"
        id="input"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="h-3 w-3 bg-orange-500"
        id="output"
      />
    </div>
  );
} 