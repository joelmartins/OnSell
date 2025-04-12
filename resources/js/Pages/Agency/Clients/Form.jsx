"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { router } from '@inertiajs/react';
import axios from 'axios';

import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Textarea } from '@/Components/ui/textarea';
import { Switch } from '@/Components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/Components/ui/card';
import { Label } from '@/Components/ui/label';
import { Separator } from '@/Components/ui/separator';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/Components/ui/form';
import { Save, ArrowLeft } from 'lucide-react';
import { toast } from 'react-toastify';

// Esquema de validação
const clientSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().optional(),
  phone: z.string().optional(),
  document: z.string().optional(),
  description: z.string().optional(),
  is_active: z.boolean().default(true),
  plan_id: z.any(), // Aceitar qualquer valor para plan_id
  
  // Campos do usuário (opcional)
  create_user: z.boolean().default(false),
  user_name: z.string().optional(),
  user_email: z.string().email('E-mail do usuário inválido').optional(),
  user_password: z.string().optional(),
}).superRefine((data, ctx) => {
  // Se create_user for true, os campos do usuário são obrigatórios
  if (data.create_user) {
    if (!data.user_name) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Nome do usuário é obrigatório",
        path: ["user_name"],
      });
    }
    if (!data.user_email) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "E-mail do usuário é obrigatório",
        path: ["user_email"],
      });
    }
    if (!data.user_password) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Senha do usuário é obrigatória",
        path: ["user_password"],
      });
    }
  }
});

export default function ClientForm({ client = null, plans = [], mode = 'create' }) {
  const [createUser, setCreateUser] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [planChanging, setPlanChanging] = useState(false);
  const [success, setSuccess] = useState(false);

  // Configurar valores padrão com base no modo (criar ou editar)
  const defaultValues = {
    name: client?.name || '',
    email: client?.email || '',
    phone: client?.phone || '',
    document: client?.document || '',
    description: client?.description || '',
    is_active: client?.is_active !== undefined ? client?.is_active : true,
    plan_id: client?.plan_id ? String(client.plan_id) : 'none',
    // Campos de usuário só são usados na criação, não na edição
    ...(mode === 'create' ? {
      create_user: false,
      user_name: '',
      user_email: '',
      user_password: '',
    } : {})
  };

  console.log('Client initial data:', client);
  console.log('Default values:', defaultValues);

  const form = useForm({
    resolver: zodResolver(clientSchema),
    defaultValues,
  });

  // Atualizar estado de createUser quando o checkbox é alterado
  const watchCreateUser = form.watch('create_user');
  if (watchCreateUser !== createUser) {
    setCreateUser(watchCreateUser);
  }

  const handleManualSubmit = async () => {
    console.log('Manual submit clicked, iniciando submissão simples');
    setSubmitting(true);
    
    try {
      // Obter valores do formulário diretamente
      let data = form.getValues();
      console.log('Valores do formulário:', data);
      
      // Converter plan_id para número se selecionado
      if (data.plan_id && data.plan_id !== 'none') {
        data.plan_id = parseInt(data.plan_id);
      } else if (data.plan_id === 'none') {
        data.plan_id = null;
      }
      
      // Para edição, garantir que campos de usuário não são enviados
      if (mode === 'edit') {
        // Filtrar os dados para enviar apenas campos relevantes
        data = {
          name: data.name,
          email: data.email,
          phone: data.phone,
          document: data.document,
          description: data.description,
          is_active: data.is_active,
          plan_id: data.plan_id
        };
      }
      
      console.log('Dados processados para envio:', data);
      
      // Usar router do Inertia diretamente - maneira mais simples e robusta
      if (mode === 'edit' && client) {
        router.put(route('agency.clients.update', client.id), data, {
          onBefore: () => console.log('Iniciando requisição PUT'),
          onStart: () => toast.info('Enviando dados...'),
          onSuccess: () => {
            setSuccess(true); // Marcar como sucesso
            toast.success('Cliente atualizado com sucesso!', {
              autoClose: false, // Não fechar automaticamente
              toastId: 'client-success' // ID único para evitar duplicação
            });
            
            // Usar um timeout para garantir que o toast seja exibido antes de redirecionar
            setTimeout(() => {
              router.visit(route('agency.clients.index'), {
                preserveScroll: true,
                preserveState: false,
                only: []
              });
            }, 2000); // Esperar 2 segundos antes de redirecionar
          },
          onError: (errors) => {
            console.error('Erros na atualização:', errors);
            toast.error('Erro ao atualizar cliente');
            
            // Mostrar erros específicos de validação
            if (errors && typeof errors === 'object') {
              Object.entries(errors).forEach(([field, message]) => {
                toast.error(`${field}: ${message}`);
              });
            }
            
            setSubmitting(false);
          },
          onFinish: () => console.log('Requisição PUT finalizada')
        });
      } else if (mode === 'create') {
        router.post(route('agency.clients.store'), data, {
          onSuccess: () => {
            setSuccess(true); // Marcar como sucesso
            toast.success('Cliente criado com sucesso!', {
              autoClose: false, // Não fechar automaticamente
              toastId: 'client-success' // ID único para evitar duplicação
            });
            
            // Usar um timeout para garantir que o toast seja exibido antes de redirecionar
            setTimeout(() => {
              router.visit(route('agency.clients.index'), {
                preserveScroll: true,
                preserveState: false,
                only: []
              });
            }, 2000); // Esperar 2 segundos antes de redirecionar
          },
          onError: (errors) => {
            toast.error('Erro ao criar cliente');
            console.error('Erros ao criar:', errors);
            setSubmitting(false);
          }
        });
      }
    } catch (error) {
      console.error('Erro fatal ao processar formulário:', error);
      toast.error('Ocorreu um erro inesperado');
      setSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
        {success && (
          <div className="bg-green-100 border border-green-500 text-green-700 px-4 py-3 rounded mb-4" role="alert">
            <div className="flex items-center">
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <span className="font-semibold">Operação realizada com sucesso!</span>
            </div>
            <div className="mt-1">Você será redirecionado em instantes.</div>
          </div>
        )}
        
        <Card>
          <CardHeader>
            <CardTitle>{mode === 'create' ? 'Novo Cliente' : 'Editar Cliente'}</CardTitle>
            <CardDescription>
              {mode === 'create' 
                ? 'Preencha os dados para criar um novo cliente' 
                : 'Atualize os dados do cliente'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Cliente *</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome do cliente" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-mail</FormLabel>
                    <FormControl>
                      <Input placeholder="Email do cliente" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone</FormLabel>
                    <FormControl>
                      <Input placeholder="Telefone do cliente" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="document"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Documento (CNPJ/CPF)</FormLabel>
                    <FormControl>
                      <Input placeholder="CNPJ ou CPF do cliente" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Input placeholder="Descrição do cliente" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Status</FormLabel>
                      <FormDescription>
                        Cliente ativo na plataforma
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="plan_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Plano</FormLabel>
                    <Select 
                      onValueChange={(value) => {
                        console.log('Changing plan to:', value);
                        setPlanChanging(true);
                        field.onChange(value);
                        setTimeout(() => setPlanChanging(false), 500);
                      }}
                      value={field.value || 'none'}
                      disabled={submitting || planChanging}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um plano" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">Sem plano</SelectItem>
                        {plans.map((plan) => (
                          <SelectItem key={plan.id} value={String(plan.id)}>
                            {plan.name} - {typeof plan.price === 'string' && plan.price.startsWith('R$') 
                              ? plan.price 
                              : `R$ ${typeof plan.price === 'number' 
                                  ? plan.price.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2}) 
                                  : parseFloat(plan.price).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`
                            }/{plan.period === 'monthly' ? 'mês' : 'ano'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Selecione o plano para este cliente
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            {mode === 'create' && (
              <>
                <Separator />
                
                <FormField
                  control={form.control}
                  name="create_user"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>Criar Usuário Administrador</FormLabel>
                        <FormDescription>
                          Criar um usuário administrador para este cliente
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                {createUser && (
                  <div className="space-y-4 border p-4 rounded-lg">
                    <h3 className="text-sm font-medium">Dados do Usuário Administrador</h3>
                    
                    <FormField
                      control={form.control}
                      name="user_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome do Administrador *</FormLabel>
                          <FormControl>
                            <Input placeholder="Nome do administrador" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="user_email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>E-mail do Administrador *</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="admin@exemplo.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="user_password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Senha *</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="Senha segura" {...field} />
                          </FormControl>
                          <FormDescription>
                            Mínimo de 8 caracteres
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" type="button" onClick={() => router.visit(route('agency.clients.index'))}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
            <Button 
              type="button" 
              disabled={submitting} 
              onClick={handleManualSubmit}
            >
              <Save className="mr-2 h-4 w-4" />
              {submitting ? 'Salvando...' : 'Salvar'}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
} 