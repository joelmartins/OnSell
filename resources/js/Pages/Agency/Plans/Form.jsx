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
import { Save, Tag, Star } from 'lucide-react';
import { CurrencyInput } from '@/Components/ui/currency-input';

// Esquema de validação do formulário
const formSchema = z.object({
  name: z.string().min(3, { message: 'Nome deve ter pelo menos 3 caracteres' }),
  description: z.string().min(10, { message: 'Descrição deve ter pelo menos 10 caracteres' }),
  price: z.string().min(1, { message: 'Preço é obrigatório' }),
  period: z.string().min(1, { message: 'Período é obrigatório' }),
  is_active: z.boolean().default(true),
  is_featured: z.boolean().default(false),
  features: z.array(z.string()).optional().default([]),
  monthly_leads: z.coerce.number().int().nullable().optional(),
  max_landing_pages: z.coerce.number().int().nullable().optional(),
  max_pipelines: z.coerce.number().int().nullable().optional(),
  total_leads: z.coerce.number().int().nullable().optional(),
  max_clients: z.coerce.number().int().nullable().optional(),
});

export default function AgencyPlanForm({ plan, isEditing = false }) {
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
      features: [],
      monthly_leads: 500,
      max_landing_pages: 1,
      max_pipelines: 1,
      total_leads: 500,
    },
  });

  // Carrega os dados do plano ao editar
  useEffect(() => {
    if (plan) {
      let planFeatures = [];
      
      // Converter features de objeto ou string JSON para array
      if (plan.features) {
        if (typeof plan.features === 'string') {
          try {
            const featuresObj = JSON.parse(plan.features);
            // Se for um objeto, extrair os valores
            if (typeof featuresObj === 'object' && !Array.isArray(featuresObj)) {
              planFeatures = Object.values(featuresObj);
            } else if (Array.isArray(featuresObj)) {
              planFeatures = featuresObj;
            }
          } catch (e) {
            console.error('Erro ao parsear features:', e);
            planFeatures = [];
          }
        } else if (Array.isArray(plan.features)) {
          planFeatures = plan.features;
        } else if (typeof plan.features === 'object') {
          planFeatures = Object.values(plan.features);
        }
      }
      
      form.reset({
        name: plan.name || '',
        description: plan.description || '',
        price: plan.price || '',
        period: plan.period || 'monthly',
        is_active: plan.is_active !== undefined ? plan.is_active : true,
        is_featured: plan.is_featured !== undefined ? plan.is_featured : false,
        features: planFeatures,
        monthly_leads: plan.monthly_leads || null,
        max_landing_pages: plan.max_landing_pages || null,
        max_pipelines: plan.max_pipelines || null,
        total_leads: plan.total_leads || null,
        max_clients: plan.max_clients || null,
      });
    }
  }, [plan]);

  // Array de recursos do plano
  const [features, setFeatures] = useState(['']);

  // Atualizar features quando o formulário é carregado
  useEffect(() => {
    const formFeatures = form.watch('features');
    if (Array.isArray(formFeatures) && formFeatures.length > 0) {
      setFeatures(formFeatures);
    }
  }, [form.watch('features')]);

  // Adicionar novo recurso
  const addFeature = () => {
    setFeatures([...features, '']);
  };

  // Remover recurso
  const removeFeature = (index) => {
    const newFeatures = [...features];
    newFeatures.splice(index, 1);
    setFeatures(newFeatures);
    form.setValue('features', newFeatures);
  };

  // Atualizar recurso
  const updateFeature = (index, value) => {
    const newFeatures = [...features];
    newFeatures[index] = value;
    setFeatures(newFeatures);
    form.setValue('features', newFeatures);
  };

  function onSubmit(values) {
    // Ajustar os valores antes de enviar
    const formData = {
      ...values,
      features: features.filter(f => f.trim() !== '')
    };

    if (isEditing) {
      router.put(route('agency.plans.update', plan.id), formData, {
        onError: (errors) => {
          console.error('Erros de validação:', errors);
        }
      });
    } else {
      router.post(route('agency.plans.store'), formData, {
        onError: (errors) => {
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
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Recursos do Plano</h3>
            <Button 
              type="button" 
              variant="outline" 
              onClick={addFeature} 
              className="text-xs"
            >
              Adicionar Recurso
            </Button>
          </div>
          
          {features.map((feature, index) => (
            <div key={index} className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-gray-400" />
              <Input
                value={feature}
                onChange={(e) => updateFeature(index, e.target.value)}
                placeholder="Ex: 10 GB de armazenamento"
                className="flex-1"
              />
              <Button 
                type="button" 
                variant="ghost" 
                onClick={() => removeFeature(index)}
                className="text-red-500 hover:text-red-700 p-1 h-8 w-8"
              >
                &times;
              </Button>
            </div>
          ))}
        </div>
        
        <Separator />
        
        <div className="flex flex-col space-y-4">
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
                  <FormLabel>
                    {field.value ? 'Plano Ativo' : 'Plano Inativo'}
                  </FormLabel>
                  <FormDescription>
                    {field.value 
                      ? 'Este plano está disponível para contratação' 
                      : 'Este plano não está disponível para contratação'
                    }
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
                    {field.value ? 'Este plano será destacado na seção de preços da landing page' : 'Este plano não aparecerá em destaque na landing page'}
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