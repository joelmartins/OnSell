"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { router } from '@inertiajs/react';

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
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  email: z.string().email('E-mail inválido').optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  document: z.string().optional().or(z.literal('')),
  description: z.string().optional().or(z.literal('')),
  is_active: z.boolean().default(true),
  plan_id: z.string().optional().or(z.literal('')),
  
  // Campos do usuário (opcional)
  create_user: z.boolean().default(false),
  user_name: z.string().min(3, 'Nome do usuário deve ter pelo menos 3 caracteres').optional(),
  user_email: z.string().email('E-mail do usuário inválido').optional(),
  user_password: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres').optional(),
}).refine((data) => {
  // Se create_user for true, os campos do usuário são obrigatórios
  if (data.create_user) {
    return !!data.user_name && !!data.user_email && !!data.user_password;
  }
  return true;
}, {
  message: "Preencha todos os campos do usuário",
  path: ["user_name"],
});

export default function ClientForm({ client = null, plans = [], mode = 'create' }) {
  const [createUser, setCreateUser] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Configurar valores padrão com base no modo (criar ou editar)
  const defaultValues = {
    name: client?.name || '',
    email: client?.email || '',
    phone: client?.phone || '',
    document: client?.document || '',
    description: client?.description || '',
    is_active: client?.is_active !== undefined ? client?.is_active : true,
    plan_id: client?.plan_id ? client.plan_id.toString() : 'none',
    create_user: false,
    user_name: '',
    user_email: '',
    user_password: '',
  };

  const form = useForm({
    resolver: zodResolver(clientSchema),
    defaultValues,
  });

  // Atualizar estado de createUser quando o checkbox é alterado
  const watchCreateUser = form.watch('create_user');
  if (watchCreateUser !== createUser) {
    setCreateUser(watchCreateUser);
  }

  // Função para submeter o formulário
  const onSubmit = (data) => {
    setSubmitting(true);
    
    // Ajustar o valor do plan_id
    const formData = { ...data };
    if (formData.plan_id === 'none') {
      formData.plan_id = '';
    }
    
    if (mode === 'create') {
      router.post(route('agency.clients.store'), formData, {
        onSuccess: () => {
          toast.success('Cliente criado com sucesso!');
          router.visit(route('agency.clients.index'));
        },
        onError: (errors) => {
          toast.error('Ocorreu um erro ao criar o cliente');
          setSubmitting(false);
          
          // Definir erros no formulário
          Object.keys(errors).forEach(key => {
            form.setError(key, { 
              type: 'manual', 
              message: errors[key] 
            });
          });
        },
      });
    } else if (mode === 'edit' && client) {
      router.put(route('agency.clients.update', client.id), formData, {
        onSuccess: () => {
          toast.success('Cliente atualizado com sucesso!');
          router.visit(route('agency.clients.index'));
        },
        onError: (errors) => {
          toast.error('Ocorreu um erro ao atualizar o cliente');
          setSubmitting(false);
          
          // Definir erros no formulário
          Object.keys(errors).forEach(key => {
            form.setError(key, { 
              type: 'manual', 
              message: errors[key] 
            });
          });
        },
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um plano" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">Sem plano</SelectItem>
                        {plans.map((plan) => (
                          <SelectItem key={plan.id} value={plan.id.toString()}>
                            {plan.name} - R$ {parseFloat(plan.price).toFixed(2)}/{plan.period === 'monthly' ? 'mês' : 'ano'}
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
            <Button type="submit" disabled={submitting}>
              <Save className="mr-2 h-4 w-4" />
              {submitting ? 'Salvando...' : 'Salvar'}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
} 