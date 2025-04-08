"use client";

import { useEffect } from 'react';
import { useForm as useHookForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { router } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Textarea } from '@/Components/ui/textarea';
import { Switch } from '@/Components/ui/switch';
import { Separator } from '@/Components/ui/separator';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/Components/ui/form';
import { Save } from 'lucide-react';

const formSchema = z.object({
  name: z.string().min(3, { message: 'Nome deve ter pelo menos 3 caracteres' }),
  description: z.string().min(10, { message: 'Descrição deve ter pelo menos 10 caracteres' }),
  price: z.string().min(1, { message: 'Preço é obrigatório' }),
  is_active: z.boolean().default(true),
  features: z.object({
    leads: z.coerce.number().int().min(1, { message: 'Deve permitir pelo menos 1 lead' }),
    pipelines: z.coerce.number().int().min(1, { message: 'Deve permitir pelo menos 1 pipeline' }),
    integrations: z.coerce.number().int().min(0),
    users: z.coerce.number().int().min(1, { message: 'Deve permitir pelo menos 1 usuário' }),
  }),
});

export default function PlanForm({ plan, isEditing = false }) {
  const form = useHookForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      price: 'R$ 97,00',
      is_active: true,
      features: {
        leads: 500,
        pipelines: 1,
        integrations: 1,
        users: 2
      }
    },
  });

  useEffect(() => {
    if (plan) {
      form.reset({
        name: plan.name || '',
        description: plan.description || '',
        price: plan.price || '',
        is_active: plan.is_active,
        features: {
          leads: plan.features?.leads || 500,
          pipelines: plan.features?.pipelines || 1,
          integrations: plan.features?.integrations || 1,
          users: plan.features?.users || 2
        }
      });
    }
  }, [plan]);

  function onSubmit(values) {
    if (isEditing) {
      router.put(route('admin.plans.update', plan.id), values);
    } else {
      router.post(route('admin.plans.store'), values);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome do Plano</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Plano Starter" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Preço</FormLabel>
                <FormControl>
                  <Input placeholder="R$ 97,00" {...field} />
                </FormControl>
                <FormDescription>
                  Formato: R$ 0,00 (use vírgula como separador decimal)
                </FormDescription>
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
                <Textarea 
                  placeholder="Descreva brevemente os benefícios do plano..." 
                  className="resize-none" 
                  rows={3} 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Separator />
        
        <h3 className="text-lg font-medium">Recursos Incluídos</h3>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="features.leads"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quantidade de Leads</FormLabel>
                <FormControl>
                  <Input type="number" min="1" {...field} />
                </FormControl>
                <FormDescription>
                  Número máximo de contatos permitidos
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="features.pipelines"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pipelines</FormLabel>
                <FormControl>
                  <Input type="number" min="1" {...field} />
                </FormControl>
                <FormDescription>
                  Número de pipelines de vendas permitidos
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="features.users"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Usuários</FormLabel>
                <FormControl>
                  <Input type="number" min="1" {...field} />
                </FormControl>
                <FormDescription>
                  Número de usuários permitidos na conta
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="features.integrations"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Integrações</FormLabel>
                <FormControl>
                  <Input type="number" min="0" {...field} />
                </FormControl>
                <FormDescription>
                  Número de integrações externas permitidas
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Separator />

        <FormField
          control={form.control}
          name="is_active"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Plano ativo</FormLabel>
                <FormDescription>
                  Quando ativado, o plano estará disponível para assinatura
                </FormDescription>
              </div>
            </FormItem>
          )}
        />

        <div className="flex justify-end">
          <Button type="submit" className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            {isEditing ? 'Atualizar Plano' : 'Criar Plano'}
          </Button>
        </div>
      </form>
    </Form>
  );
} 