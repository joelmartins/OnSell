"use client";

import { useState, useEffect } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import ClientLayout from '@/Layouts/ClientLayout';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Button } from '@/Components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/Components/ui/dialog';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/Components/ui/select';
import { Label } from '@/Components/ui/label';
import { ChevronLeft, Save, Play, Trash } from 'lucide-react';
import { toast } from 'react-toastify';
import FlowEditor from '@/Components/automation/FlowEditor';
import { convertFlowToBackendFormat, convertBackendToFlowFormat, triggerTypes } from '@/Components/automation/utils';

export default function EditAutomation({ auth, automation, nodes = [], edges = [] }) {
  const { data, setData, put, processing, errors, delete: destroy } = useForm({
    id: automation.id,
    name: automation.name,
    description: automation.description || '',
    trigger_type: automation.trigger_type,
    trigger_config: automation.trigger_config || {},
    nodes: [],
    edges: [],
    active: automation.active || false,
  });

  const [initialNodes, setInitialNodes] = useState([]);
  const [initialEdges, setInitialEdges] = useState([]);
  const [flowKey, setFlowKey] = useState(`flow-${automation.id}-${Date.now()}`);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmExecute, setConfirmExecute] = useState(false);
  const [contactId, setContactId] = useState('');

  // Converter os dados recebidos para o formato do React Flow
  useEffect(() => {
    if (automation && automation.json_structure) {
      // Se tiver json_structure, usar diretamente
      const flowData = typeof automation.json_structure === 'string' 
        ? JSON.parse(automation.json_structure) 
        : automation.json_structure;
      
      setInitialNodes(flowData.nodes || []);
      setInitialEdges(flowData.edges || []);
    } else if (nodes.length > 0 || edges.length > 0) {
      // Tentar converter pelo formato de nós e arestas separados
      const { nodes: flowNodes, edges: flowEdges } = convertBackendToFlowFormat({ nodes, edges });
      setInitialNodes(flowNodes);
      setInitialEdges(flowEdges);
    }
  }, [automation, nodes, edges]);

  // Ao mudar o tipo de gatilho, resetamos o flow editor
  const handleTriggerTypeChange = (value) => {
    setData({
      ...data,
      trigger_type: value,
      trigger_config: {},
    });
    
    // Reset do editor com o novo tipo de gatilho
    setFlowKey(`flow-${automation.id}-${value}-${Date.now()}`);
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
    
    // Atualizar o fluxo de automação
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
    const automationData = {
      name: data.name,
      description: data.description,
      trigger_type: data.trigger_type,
      trigger_config: data.trigger_config,
      nodes: flowNodes,
      edges: flowEdges,
      active: data.active,
      json_structure: {
        nodes: data.nodes,
        edges: data.edges
      }
    };

    // Enviar para o servidor
    put(route('client.automation.update', automation.id), automationData, {
      onSuccess: () => {
        toast.success('Fluxo de automação atualizado com sucesso!');
      },
      onError: (errors) => {
        console.error(errors);
        toast.error('Erro ao atualizar fluxo de automação');
      }
    });
  };

  const handleToggleActive = (active) => {
    put(route('client.automation.toggle', automation.id), { active }, {
      onSuccess: () => {
        setData('active', active);
        toast.success(active ? 'Automação ativada com sucesso!' : 'Automação desativada com sucesso!');
      },
      onError: () => {
        toast.error('Erro ao alterar status da automação');
      }
    });
  };

  const handleDeleteAutomation = () => {
    destroy(route('client.automation.destroy', automation.id), {
      onSuccess: () => {
        toast.success('Automação excluída com sucesso!');
        router.visit(route('client.automation.index'));
      },
      onError: () => {
        toast.error('Erro ao excluir automação');
      },
      onFinish: () => {
        setConfirmDelete(false);
      }
    });
  };

  const handleExecuteAutomation = () => {
    if (!contactId || isNaN(contactId)) {
      toast.error('ID do contato inválido');
      return;
    }

    post(route('client.automation.execute', automation.id), { contact_id: contactId }, {
      onSuccess: () => {
        toast.success('Automação executada para o contato!');
        setConfirmExecute(false);
        setContactId('');
      },
      onError: () => {
        toast.error('Erro ao executar automação');
      }
    });
  };

  return (
    <ClientLayout title={`Editar: ${automation.name}`}>
      <Head title={`Editar: ${automation.name}`} />

      <div className="mb-5 flex items-center justify-between">
        <Button 
          variant="ghost" 
          className="gap-1" 
          onClick={() => router.visit(route('client.automation.index'))}
        >
          <ChevronLeft className="h-4 w-4" /> Voltar
        </Button>
        
        <div className="flex gap-2">
          <Button 
            variant="destructive" 
            className="gap-1" 
            onClick={() => setConfirmDelete(true)}
          >
            <Trash className="h-4 w-4" /> Excluir
          </Button>
          
          <Button 
            variant="outline" 
            className="gap-1" 
            onClick={() => setConfirmExecute(true)}
          >
            <Play className="h-4 w-4" /> Executar
          </Button>
          
          <Button 
            onClick={handleSubmit} 
            disabled={processing}
            className="gap-1"
          >
            <Save className="h-4 w-4" /> Salvar
          </Button>
        </div>
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
            
            <div className="mt-4 flex items-center">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${data.active ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                <span className="text-sm font-medium">Status: {data.active ? 'Ativo' : 'Inativo'}</span>
              </div>
              <Button 
                variant={data.active ? "destructive" : "default"} 
                size="sm" 
                className="ml-auto"
                onClick={() => handleToggleActive(!data.active)}
              >
                {data.active ? 'Desativar' : 'Ativar'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Editor de fluxo */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle>Editor de Fluxo</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {initialNodes.length > 0 && (
              <FlowEditor
                key={flowKey}
                initialNodes={initialNodes}
                initialEdges={initialEdges}
                onSave={handleSaveFlow}
                isEditing={true}
                isActive={data.active}
                onToggleActive={handleToggleActive}
                onDelete={() => setConfirmDelete(true)}
                onExecute={() => setConfirmExecute(true)}
                triggerType={data.trigger_type}
                triggerConfig={data.trigger_config}
              />
            )}
          </CardContent>
          <CardFooter className="pt-3">
            <p className="text-xs text-muted-foreground">
              Arraste os nós para criar seu fluxo. Conecte-os para definir a sequência de execução.
            </p>
          </CardFooter>
        </Card>
      </div>

      {/* Diálogo para confirmar exclusão */}
      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir esta automação? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex items-center justify-end gap-2">
            <Button variant="outline" onClick={() => setConfirmDelete(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteAutomation} disabled={processing}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo para executar automação */}
      <Dialog open={confirmExecute} onOpenChange={setConfirmExecute}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Executar automação</DialogTitle>
            <DialogDescription>
              Escolha um contato para executar esta automação manualmente.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <Label htmlFor="contact_id">ID do Contato</Label>
            <Input
              id="contact_id"
              placeholder="Digite o ID do contato"
              value={contactId}
              onChange={(e) => setContactId(e.target.value)}
            />
          </div>
          <DialogFooter className="flex items-center justify-end gap-2">
            <Button variant="outline" onClick={() => setConfirmExecute(false)}>
              Cancelar
            </Button>
            <Button onClick={handleExecuteAutomation} disabled={processing || !contactId}>
              Executar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ClientLayout>
  );
} 