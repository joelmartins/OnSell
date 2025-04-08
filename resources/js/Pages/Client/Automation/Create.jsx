"use client";

import { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import ClientLayout from '@/Layouts/ClientLayout';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Button } from '@/Components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/Components/ui/select';
import { Label } from '@/Components/ui/label';
import { ChevronLeft, Save } from 'lucide-react';
import { toast } from 'react-toastify';
import FlowEditor from '@/Components/automation/FlowEditor';
import { convertFlowToBackendFormat, triggerTypes } from '@/Components/automation/utils';

export default function CreateAutomation({ auth }) {
  const { data, setData, post, processing, errors } = useForm({
    name: '',
    description: '',
    trigger_type: 'form_submitted',
    trigger_config: {},
    nodes: [],
    edges: [],
    active: false,
  });

  const [flowKey, setFlowKey] = useState(`flow-${Date.now()}`);
  
  // Ao mudar o tipo de gatilho, resetamos o flow editor
  const handleTriggerTypeChange = (value) => {
    setData({
      ...data,
      trigger_type: value,
      trigger_config: {},
      // Mantenha os nós e arestas, apenas o nó trigger será atualizado no componente editor
    });
    
    // Reset do editor para que ele recrie o nó de gatilho
    setFlowKey(`flow-${value}-${Date.now()}`);
  };

  const handleSaveFlow = (flowData) => {
    // Converter dados do React Flow para o formato esperado pelo backend
    const { nodes, edges } = flowData;
    
    // Atualizar o formulário
    setData({
      ...data,
      nodes,
      edges,
      trigger_type: flowData.trigger_type,
      trigger_config: flowData.trigger_config
    });
    
    // Criar o fluxo de automação
    handleSubmit();
  };

  const handleSubmit = () => {
    // Validar dados
    if (!data.name.trim()) {
      toast.error('O nome do fluxo de automação é obrigatório');
      return;
    }

    if (data.nodes.length === 0) {
      toast.error('O fluxo precisa ter pelo menos um nó');
      return;
    }

    // Converter para o formato esperado pelo backend
    const { nodes: flowNodes, edges: flowEdges } = convertFlowToBackendFormat(data.nodes, data.edges);
    
    // Criar o objeto de automação
    const automation = {
      name: data.name,
      description: data.description,
      trigger_type: data.trigger_type,
      trigger_config: data.trigger_config,
      nodes: flowNodes,
      edges: flowEdges,
      active: false, // Automação começa inativa
      json_structure: {
        nodes: data.nodes,
        edges: data.edges
      }
    };

    // Enviar para o servidor
    post(route('client.automation.store'), automation, {
      onSuccess: () => {
        toast.success('Fluxo de automação criado com sucesso!');
        router.visit(route('client.automation.index'));
      },
      onError: (errors) => {
        console.error(errors);
        toast.error('Erro ao criar fluxo de automação');
      }
    });
  };

  return (
    <ClientLayout title="Criar Fluxo de Automação">
      <Head title="Criar Fluxo de Automação" />

      <div className="mb-5 flex items-center justify-between">
        <Button 
          variant="ghost" 
          className="gap-1" 
          onClick={() => router.visit(route('client.automation.index'))}
        >
          <ChevronLeft className="h-4 w-4" /> Voltar
        </Button>
        
        <Button 
          onClick={handleSubmit} 
          disabled={processing}
          className="gap-1"
        >
          <Save className="h-4 w-4" /> Salvar Fluxo
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-5">
        {/* Informações básicas */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle>Informações do Fluxo</CardTitle>
          </CardHeader>
          <CardContent className="pb-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="name">Nome do Fluxo</Label>
                <Input
                  id="name"
                  placeholder="Ex: Qualificação de Leads"
                  value={data.name}
                  onChange={(e) => setData('name', e.target.value)}
                />
                {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
              </div>
              
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="trigger_type">Tipo de Gatilho</Label>
                <Select 
                  value={data.trigger_type} 
                  onValueChange={handleTriggerTypeChange}
                >
                  <SelectTrigger id="trigger_type">
                    <SelectValue placeholder="Selecione o tipo de gatilho" />
                  </SelectTrigger>
                  <SelectContent>
                    {triggerTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.trigger_type && <p className="text-sm text-red-500">{errors.trigger_type}</p>}
              </div>
            </div>
            
            <div className="mt-4">
              <Label htmlFor="description">Descrição (opcional)</Label>
              <Input
                id="description"
                placeholder="Descreva o objetivo deste fluxo de automação"
                value={data.description}
                onChange={(e) => setData('description', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Editor de fluxo */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle>Editor de Fluxo</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <FlowEditor
              key={flowKey}
              onSave={handleSaveFlow}
              triggerType={data.trigger_type}
              triggerConfig={data.trigger_config}
            />
          </CardContent>
          <CardFooter className="pt-3">
            <p className="text-xs text-muted-foreground">
              Arraste os nós para criar seu fluxo. Conecte-os para definir a sequência de execução.
            </p>
          </CardFooter>
        </Card>
      </div>
    </ClientLayout>
  );
} 