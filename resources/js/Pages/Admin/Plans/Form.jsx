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
import { Save, Building2, User, Star, Plus, Trash2, Tag } from 'lucide-react';
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
  features: z.any(), // Permite qualquer formato para features (será tratado no código)
  is_agency_plan: z.boolean().default(false),
  max_clients: z.coerce.number().int().optional(),
  period: z.string().min(1, { message: 'Período é obrigatório' }),
});

export default function PlanForm({ plan, isEditing = false }) {
  const { errors: serverErrors } = usePage().props;
  const [generalError, setGeneralError] = useState(null);
  const [jsonFeatures, setJsonFeatures] = useState([{ key: 'feature_1', value: '' }]);

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
      features: {},
      is_agency_plan: false,
      max_clients: 5
    },
  });

  // Monitora mudanças no campo for_agency
  const isAgencyPlan = form.watch('is_agency_plan');

  // Carregar features do plano quando disponível
  useEffect(() => {
    if (plan) {
      // Processar features que podem estar em formato JSON
      let featuresObj = {};
      try {
        if (typeof plan.features === 'string') {
          featuresObj = JSON.parse(plan.features);
        } else if (typeof plan.features === 'object') {
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
        is_active: plan.is_active,
        is_featured: plan.is_featured || false,
        monthly_leads: plan.monthly_leads || 500,
        total_leads: plan.total_leads || 500,
        max_landing_pages: plan.max_landing_pages || 1,
        max_pipelines: plan.max_pipelines || 1,
        features: featuresObj,
        is_agency_plan: plan.is_agency_plan || false,
        max_clients: plan.max_clients || 5,
        period: plan.period || 'monthly'
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
    // Ajustar os valores antes de enviar
    if (values.is_agency_plan) {
      // Se for plano de agência, ajustar campos adequadamente
      values.max_clients = values.max_clients || 5;
      
      // Zerar campos não usados em planos de agência
      values.monthly_leads = null;
      values.total_leads = null;
      values.max_landing_pages = null;
      values.max_pipelines = null;
    } else {
      // Se for plano de cliente
      values.max_clients = null;
    }

    // Garantir que features seja um objeto válido
    if (typeof values.features !== 'object' || Array.isArray(values.features)) {
      values.features = {};
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
          name="is_agency_plan"
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
            Os recursos serão exibidos para os usuários na página de planos.
          </FormDescription>
        </div>
        
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
        
        {isAgencyPlan && (
          <>
            <h3 className="text-lg font-medium">Limites para Agência</h3>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="max_clients"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número máximo de clientes</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" {...field} />
                    </FormControl>
                    <FormDescription>
                      Número máximo de clientes que a agência pode gerenciar
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />
          </>
        )}

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