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
import { Save, Tag, Star, Plus, Trash2 } from 'lucide-react';
import { CurrencyInput } from '@/Components/ui/currency-input';
import { toast } from 'react-toastify';

// Esquema de validação do formulário
const formSchema = z.object({
  name: z.string().min(3, { message: 'Nome deve ter pelo menos 3 caracteres' }),
  description: z.string().min(10, { message: 'Descrição deve ter pelo menos 10 caracteres' }),
  price: z.string().min(1, { message: 'Preço é obrigatório' }),
  period: z.string().min(1, { message: 'Período é obrigatório' }),
  is_active: z.boolean().default(true),
  is_featured: z.boolean().default(false),
  features: z.any().optional(), // Permite qualquer formato de features
  monthly_leads: z.coerce.number().int().nullable().optional(),
  max_landing_pages: z.coerce.number().int().nullable().optional(),
  max_pipelines: z.coerce.number().int().nullable().optional(),
  total_leads: z.coerce.number().int().nullable().optional(),
  max_clients: z.coerce.number().int().nullable().optional(),
});

export default function AgencyPlanForm({ plan, isEditing = false }) {
  const { errors: serverErrors } = usePage().props;
  const [generalError, setGeneralError] = useState(null);
  const [jsonFeatures, setJsonFeatures] = useState([{ key: 'feature_1', value: '' }]);
  const [syncLoading, setSyncLoading] = useState(false);
  
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
      features: {},
      monthly_leads: 500,
      max_landing_pages: 1,
      max_pipelines: 1,
      total_leads: 500,
    },
  });

  // Carrega os dados do plano ao editar
  useEffect(() => {
    if (plan) {
      // Processar features que podem estar em formato JSON
      let featuresObj = {};
      try {
        if (typeof plan.features === 'string') {
          featuresObj = JSON.parse(plan.features);
        } else if (typeof plan.features === 'object' && !Array.isArray(plan.features)) {
          featuresObj = plan.features;
        }
      } catch (e) {
        console.error('Erro ao parsear features:', e);
        featuresObj = {};
      }

      // Converter features para o formato de array de objetos para a UI
      const featuresArray = Object.entries(featuresObj).map(([key, value]) => ({
        key,
        value
      }));

      // Se não houver features, inicializar com uma vazia
      if (featuresArray.length === 0) {
        featuresArray.push({ key: 'feature_1', value: '' });
      }

      setJsonFeatures(featuresArray);
      form.setValue('features', featuresObj);
      
      form.reset({
        name: plan.name || '',
        description: plan.description || '',
        price: plan.price || '',
        period: plan.period || 'monthly',
        is_active: plan.is_active !== undefined ? plan.is_active : true,
        is_featured: plan.is_featured !== undefined ? plan.is_featured : false,
        features: featuresObj,
        monthly_leads: plan.monthly_leads || null,
        max_landing_pages: plan.max_landing_pages || null,
        max_pipelines: plan.max_pipelines || null,
        total_leads: plan.total_leads || null,
        max_clients: plan.max_clients || null,
      });
    }
  }, [plan]);

  // Adicionar nova feature
  const addFeature = () => {
    // Encontrar o próximo número disponível para a feature
    const nextNumber = jsonFeatures.length > 0 
      ? Math.max(...jsonFeatures.map(f => {
          const matches = f.key.match(/feature_(\d+)/);
          return matches ? parseInt(matches[1]) : 0;
        })) + 1
      : 1;
    
    setJsonFeatures([...jsonFeatures, { key: `feature_${nextNumber}`, value: '' }]);
  };

  // Remover feature
  const removeFeature = (index) => {
    const newFeatures = [...jsonFeatures];
    newFeatures.splice(index, 1);
    setJsonFeatures(newFeatures);
    
    // Atualizar o valor no formulário
    updateFeaturesInForm(newFeatures);
  };

  // Atualizar chave da feature
  const updateFeatureKey = (index, newKey) => {
    const newFeatures = [...jsonFeatures];
    newFeatures[index].key = newKey;
    setJsonFeatures(newFeatures);
    
    // Atualizar o valor no formulário
    updateFeaturesInForm(newFeatures);
  };

  // Atualizar valor da feature
  const updateFeatureValue = (index, newValue) => {
    const newFeatures = [...jsonFeatures];
    newFeatures[index].value = newValue;
    setJsonFeatures(newFeatures);
    
    // Atualizar o valor no formulário
    updateFeaturesInForm(newFeatures);
  };

  // Converter o array de features para objeto e atualizar no formulário
  const updateFeaturesInForm = (features) => {
    const featuresObj = features.reduce((obj, item) => {
      if (item.key && item.key.trim() !== '') {
        obj[item.key] = item.value;
      }
      return obj;
    }, {});
    
    form.setValue('features', featuresObj);
  };

  function onSubmit(values) {
    // Garantir que features seja um objeto válido
    if (typeof values.features !== 'object' || Array.isArray(values.features)) {
      values.features = {};
    }
    
    // Filtrar features vazias
    const filteredFeatures = {};
    for (const key in values.features) {
      if (values.features[key].trim() !== '') {
        filteredFeatures[key] = values.features[key];
      }
    }
    
    values.features = filteredFeatures;

    if (isEditing) {
      router.put(route('agency.plans.update', plan.id), values, {
        onError: (errors) => {
          console.error('Erros de validação:', errors);
        }
      });
    } else {
      router.post(route('agency.plans.store'), values, {
        onError: (errors) => {
          console.error('Erros de validação:', errors);
        }
      });
    }
  }

  const handleSyncStripe = async () => {
    if (!plan?.id) return;
    setSyncLoading(true);
    try {
      const response = await fetch(`/agency/plans/${plan.id}/sync-stripe`, {
        method: 'POST',
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
          'Accept': 'application/json',
        },
      });
      const data = await response.json();
      if (response.ok) {
        toast.success('Plano sincronizado com sucesso com o Stripe!');
        router.reload({ only: ['plan'] });
      } else {
        toast.error(data.message || 'Erro ao sincronizar com Stripe.');
      }
    } catch (e) {
      toast.error('Erro de comunicação com Stripe.');
    } finally {
      setSyncLoading(false);
    }
  };

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
        
        {/* Features do Plano - Editor de JSON */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Recursos do Plano (Features)</h3>
            <Button 
              type="button" 
              variant="outline" 
              onClick={addFeature} 
              className="text-xs"
            >
              <Plus className="h-4 w-4 mr-1" />
              Adicionar Recurso
            </Button>
          </div>
          
          <div className="space-y-3">
            {jsonFeatures.map((feature, index) => (
              <div key={index} className="grid grid-cols-12 gap-2 items-center">
                <div className="col-span-4">
                  <div className="flex items-center space-x-2">
                    <Tag className="h-4 w-4 text-gray-400" />
                    <Input
                      value={feature.key}
                      onChange={(e) => updateFeatureKey(index, e.target.value)}
                      placeholder="feature_1"
                    />
                  </div>
                </div>
                <div className="col-span-7">
                  <Input
                    value={feature.value}
                    onChange={(e) => updateFeatureValue(index, e.target.value)}
                    placeholder="Valor do recurso"
                  />
                </div>
                <div className="col-span-1 flex justify-center">
                  <Button 
                    type="button" 
                    variant="ghost" 
                    onClick={() => removeFeature(index)}
                    className="text-red-500 hover:text-red-700 p-1 h-8 w-8 flex items-center justify-center"
                    disabled={jsonFeatures.length <= 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          
          <FormDescription className="mt-2">
            Os recursos serão exibidos para os usuários na página de planos. Recomendamos usar o formato feature_1, feature_2, etc.
          </FormDescription>
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

      {isEditing && (
        <div className="flex flex-col gap-2 mt-4">
          <div>
            <span className="text-xs text-muted-foreground">ID do Produto Stripe:</span>
            <span className="block font-mono text-sm">{plan?.product_id || '-'}</span>
          </div>
          <div>
            <span className="text-xs text-muted-foreground">ID do Preço Stripe:</span>
            <span className="block font-mono text-sm">{plan?.price_id || '-'}</span>
          </div>
          <Button type="button" variant="secondary" className="mt-2" onClick={handleSyncStripe} disabled={syncLoading}>
            {syncLoading ? 'Sincronizando...' : 'Sincronizar com Stripe'}
          </Button>
        </div>
      )}
    </Form>
  );
} 