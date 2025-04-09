"use client";

import { useEffect, useState } from 'react';
import { useForm as useHookForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { router, usePage } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Textarea } from '@/Components/ui/textarea';
import { Switch } from '@/Components/ui/switch';
import { Separator } from '@/Components/ui/separator';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/Components/ui/form';
import { Save, Building2, User, Star } from 'lucide-react';
import { CurrencyInput } from '@/Components/ui/currency-input';
import { PhoneInput } from '@/Components/ui/phone-input';

// Esquema condicional que se adapta com base no tipo de plano (agência ou cliente)
const formSchema = z.object({
  name: z.string().min(3, { message: 'Nome deve ter pelo menos 3 caracteres' }),
  description: z.string().min(10, { message: 'Descrição deve ter pelo menos 10 caracteres' }),
  price: z.string().min(1, { message: 'Preço é obrigatório' }),
  is_active: z.boolean().default(true),
  is_featured: z.boolean().default(false),
  monthly_leads: z.coerce.number().int().optional(),
  total_leads: z.coerce.number().int().optional(),
  max_landing_pages: z.coerce.number().int().optional(),
  max_pipelines: z.coerce.number().int().optional(),
  features: z.object({
    users: z.coerce.number().int().min(1, { message: 'Deve permitir pelo menos 1 usuário/cliente' }),
    integrations: z.coerce.number().int().min(0),
    for_agency: z.boolean().default(false)
  }),
  is_agency_plan: z.boolean().default(false),
  max_clients: z.coerce.number().int().optional(),
  period: z.string().min(1, { message: 'Período é obrigatório' }),
});

export default function PlanForm({ plan, isEditing = false }) {
  const { errors: serverErrors } = usePage().props;
  const [generalError, setGeneralError] = useState(null);

  // Ao carregar o componente, verificar se há erros gerais
  useEffect(() => {
    if (serverErrors && serverErrors.error) {
      setGeneralError(serverErrors.error);
    }
  }, [serverErrors]);

  const form = useHookForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      price: 'R$ 97,00',
      period: 'monthly',
      is_active: true,
      is_featured: false,
      monthly_leads: 500,
      total_leads: 500,
      max_landing_pages: 1,
      max_pipelines: 1,
      features: {
        users: 2,
        integrations: 1,
        for_agency: false
      },
      is_agency_plan: false,
      max_clients: 5
    },
  });

  // Monitora mudanças no campo for_agency
  const isAgencyPlan = form.watch('features.for_agency');

  useEffect(() => {
    if (plan) {
      form.reset({
        name: plan.name || '',
        description: plan.description || '',
        price: plan.price || '',
        is_active: plan.is_active,
        is_featured: plan.is_featured || false,
        monthly_leads: plan.monthly_leads || 500,
        total_leads: plan.total_leads || 500,
        max_landing_pages: plan.max_landing_pages || 1,
        max_pipelines: plan.max_pipelines || 1,
        features: {
          users: plan.features?.users || 2,
          integrations: plan.features?.integrations || 1,
          for_agency: plan.is_agency_plan || false
        },
        is_agency_plan: plan.is_agency_plan || false,
        max_clients: plan.max_clients || 5
      });
    }
  }, [plan]);

  // Quando o tipo de plano muda, atualize o campo is_agency_plan
  useEffect(() => {
    form.setValue('is_agency_plan', isAgencyPlan);
  }, [isAgencyPlan]);

  // Efeito para mostrar os erros do servidor no formulário
  useEffect(() => {
    if (serverErrors) {
      // Mapear os erros do servidor para os campos do formulário
      Object.keys(serverErrors).forEach(key => {
        form.setError(key, {
          type: 'server',
          message: serverErrors[key]
        });
      });
    }
  }, [serverErrors]);

  function onSubmit(values) {
    // Ajustar os valores antes de enviar
    if (values.features.for_agency) {
      // Se for plano de agência, ajustar campos adequadamente
      values.is_agency_plan = true;
      values.max_clients = values.features.users;
      
      // Zerar campos não usados em planos de agência
      values.monthly_leads = null;
      values.total_leads = null;
      values.max_landing_pages = null;
      values.max_pipelines = null;
    } else {
      // Se for plano de cliente
      values.is_agency_plan = false;
      values.max_clients = null;
    }

    if (isEditing) {
      router.put(route('admin.plans.update', plan.id), values, {
        onError: (errors) => {
          // Os erros serão processados pelo useEffect acima
          console.error('Erros de validação:', errors);
        }
      });
    } else {
      router.post(route('admin.plans.store'), values, {
        onError: (errors) => {
          // Os erros serão processados pelo useEffect acima
          console.error('Erros de validação:', errors);
        }
      });
    }
  }

  return (
    <Form {...form}>
      {generalError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6" role="alert">
          <p className="font-medium">Erro ao processar o formulário</p>
          <p>{generalError}</p>
        </div>
      )}
      
      {serverErrors && Object.keys(serverErrors).length > 0 && (
        <div className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded mb-6" role="alert">
          <p className="font-medium">Por favor, corrija os erros abaixo:</p>
          <ul className="list-disc list-inside">
            {Object.keys(serverErrors).map(key => (
              <li key={key}>{serverErrors[key]}</li>
            ))}
          </ul>
        </div>
      )}
      
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
                {serverErrors && serverErrors.name && (
                  <p className="text-sm font-medium text-red-500 mt-1">{serverErrors.name}</p>
                )}
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
                  <CurrencyInput
                    id="price"
                    name="price"
                    placeholder="R$ 0,00"
                    decimalScale={2}
                    value={field.value}
                    onValueChange={(value) => field.onChange(value || '')}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm dark:bg-gray-800 dark:border-gray-700"
                  />
                </FormControl>
                {serverErrors && serverErrors.price && (
                  <p className="text-sm font-medium text-red-500 mt-1">{serverErrors.price}</p>
                )}
                <FormDescription>
                  Formato: R$ 0,00 (use vírgula como separador decimal)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="period"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Período</FormLabel>
                <FormControl>
                  <select 
                    {...field}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm dark:bg-gray-800 dark:border-gray-700"
                  >
                    <option value="">Selecione um período</option>
                    <option value="monthly">Mensal</option>
                    <option value="yearly">Anual</option>
                  </select>
                </FormControl>
                {serverErrors && serverErrors.period && (
                  <p className="text-sm font-medium text-red-500 mt-1">{serverErrors.period}</p>
                )}
                <FormDescription>
                  Período de cobrança do plano
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
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
                {serverErrors && serverErrors.description && (
                  <p className="text-sm font-medium text-red-500 mt-1">{serverErrors.description}</p>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Separator />
        
        <h3 className="text-lg font-medium">Tipo de Plano</h3>

        <FormField
          control={form.control}
          name="features.for_agency"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <div className="flex items-center gap-2">
                  <FormLabel>{field.value ? 'Plano para Agência' : 'Plano para Cliente Final'}</FormLabel>
                  {field.value ? 
                    <Building2 className="h-4 w-4 text-indigo-600" /> : 
                    <User className="h-4 w-4 text-emerald-600" />
                  }
                </div>
                <FormDescription>
                  {field.value 
                    ? 'Este plano será disponibilizado para agências parceiras' 
                    : 'Este plano será disponibilizado para clientes finais'
                  }
                </FormDescription>
              </div>
            </FormItem>
          )}
        />
          
        <Separator />
        
        {/* Limites do Plano - Mostrar apenas para planos de cliente final */}
        {!isAgencyPlan && (
          <>
            <h3 className="text-lg font-medium">Limites do Plano</h3>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="monthly_leads"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Leads Mensais</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" {...field} />
                    </FormControl>
                    <FormDescription>
                      Número máximo de leads que podem ser capturados por mês
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="total_leads"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Leads Totais</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" {...field} />
                    </FormControl>
                    <FormDescription>
                      Capacidade total de armazenamento de leads/contatos
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="max_landing_pages"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Landing Pages</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" {...field} />
                    </FormControl>
                    <FormDescription>
                      Número máximo de landing pages permitidas
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="max_pipelines"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pipelines</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" {...field} />
                    </FormControl>
                    <FormDescription>
                      Número máximo de pipelines de vendas permitidos
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />
          </>
        )}
        
        <h3 className="text-lg font-medium">Recursos Adicionais</h3>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="features.users"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{isAgencyPlan ? 'Clientes' : 'Usuários'}</FormLabel>
                <FormControl>
                  <Input type="number" min="1" {...field} />
                </FormControl>
                <FormDescription>
                  {isAgencyPlan 
                    ? 'Número máximo de clientes que a agência pode gerenciar' 
                    : 'Número de usuários permitidos na conta'
                  }
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {!isAgencyPlan && (
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
          )}
        </div>

        <Separator />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
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
                  <FormLabel>Status do Plano</FormLabel>
                  <FormDescription>
                    {field.value ? 'Plano ativo e disponível para assinatura' : 'Plano inativo (não aparecerá para os usuários)'}
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="is_featured"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <div className="flex items-center gap-2">
                    <FormLabel>
                      {field.value ? 'Plano em Destaque' : 'Plano sem Destaque'}
                    </FormLabel>
                    {field.value && <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />}
                  </div>
                  <FormDescription>
                    {field.value ? 'Este plano será destacado na seção de preços da home' : 'Este plano não aparecerá em destaque na home'}
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" className="mt-4">
          <Save className="mr-2 h-4 w-4" />
          {isEditing ? 'Atualizar Plano' : 'Criar Plano'}
        </Button>
      </form>
    </Form>
  );
} 