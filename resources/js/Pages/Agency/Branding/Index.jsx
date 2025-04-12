"use client";

import { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { router, usePage } from '@inertiajs/react';
import AgencyLayout from '@/Layouts/AgencyLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Button } from '@/Components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/Components/ui/form';
import { Separator } from '@/Components/ui/separator';
import { Save, Upload, Globe, Layout, Palette, RefreshCcw } from 'lucide-react';
import { toast } from 'react-toastify';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import { Textarea } from '@/Components/ui/textarea';
import { Checkbox } from '@/Components/ui/checkbox';

const brandingSchema = z.object({
  name: z.string().min(3, { message: 'Nome deve ter pelo menos 3 caracteres' }),
  logo: z.string().url({ message: 'URL inválida para o logo' }).optional().or(z.literal('')),
  favicon: z.string().url({ message: 'URL inválida para o favicon' }).optional().or(z.literal('')),
  primary_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, { message: 'Cor inválida, use formato hexadecimal' }),
  secondary_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, { message: 'Cor inválida, use formato hexadecimal' }),
  accent_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, { message: 'Cor inválida, use formato hexadecimal' }),
});

const domainSchema = z.object({
  custom_domain: z.string().regex(/^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/, { 
    message: 'Domínio inválido. Ex: minha-agencia.com.br' 
  }).optional().or(z.literal('')),
  domain_status: z.string().optional(),
  subdomain: z.string().regex(/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/, {
    message: 'Subdomínio inválido. Use apenas letras minúsculas, números e hífen.'
  }),
});

const landingPageSchema = z.object({
  headline: z.string().min(5, { message: 'Headline deve ter pelo menos 5 caracteres' }),
  subheadline: z.string().min(5, { message: 'Subheadline deve ter pelo menos 5 caracteres' }),
  hero_image: z.string().url({ message: 'URL inválida para a imagem principal' }).optional().or(z.literal('')),
  cta_text: z.string().min(2, { message: 'Texto do botão deve ter pelo menos 2 caracteres' }),
  features_title: z.string().min(3, { message: 'Título da seção de recursos deve ter pelo menos 3 caracteres' }),
  features: z.array(z.object({
    title: z.string().min(3, { message: 'Título do recurso deve ter pelo menos 3 caracteres' }),
    description: z.string().min(10, { message: 'Descrição do recurso deve ter pelo menos 10 caracteres' }),
    icon: z.string().optional(),
  })).min(1, { message: 'Adicione pelo menos um recurso' }),
  display_plans: z.boolean().optional(),
});

export default function BrandingIndex({ agency }) {
  const { auth, flash } = usePage().props;
  const [activeTab, setActiveTab] = useState("branding");
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState({
    primary_color: agency.primary_color || '#3b82f6',
    secondary_color: agency.secondary_color || '#10b981',
    accent_color: agency.accent_color || '#f97316'
  });

  // Definindo os formulários para cada aba
  const brandingForm = useForm({
    resolver: zodResolver(brandingSchema),
    defaultValues: {
      name: agency.name || '',
      logo: agency.logo || 'https://placehold.co/200x50/FAFAFA/6D7280?text=Logo+Agência',
      favicon: agency.favicon || 'https://placehold.co/32x32/FAFAFA/6D7280?text=F',
      primary_color: agency.primary_color || '#3b82f6',
      secondary_color: agency.secondary_color || '#10b981',
      accent_color: agency.accent_color || '#f97316',
    },
  });

  const domainForm = useForm({
    resolver: zodResolver(domainSchema),
    defaultValues: {
      custom_domain: agency.custom_domain || '',
      domain_status: agency.domain_status || 'pending',
      subdomain: agency.subdomain || '',
    },
  });

  const landingPageForm = useForm({
    resolver: zodResolver(landingPageSchema),
    defaultValues: {
      headline: agency.landing_page?.headline || 'Aumente suas vendas com nossa solução completa',
      subheadline: agency.landing_page?.subheadline || 'Captura de leads, automação de marketing e gestão de vendas em um só lugar',
      hero_image: agency.landing_page?.hero_image || 'https://placehold.co/800x600/FAFAFA/6D7280?text=Imagem+Principal',
      cta_text: agency.landing_page?.cta_text || 'Começar agora',
      features_title: agency.landing_page?.features_title || 'Recursos principais',
      features: agency.landing_page?.features || [
        {
          title: 'Captura de Leads',
          description: 'Landing pages de alta conversão para capturar leads qualificados',
          icon: 'Users'
        },
        {
          title: 'Automação de Marketing',
          description: 'Fluxos automatizados para nutrir seus leads até a venda',
          icon: 'Zap'
        },
        {
          title: 'CRM Completo',
          description: 'Gestão completa do seu funil de vendas com dashboards e relatórios',
          icon: 'BarChart'
        }
      ],
      display_plans: agency.landing_page?.display_plans || false,
    },
  });

  // Verificar se há mensagem de sucesso do backend no flash
  useEffect(() => {
    if (flash.success) {
      toast.success(flash.success);
    }
    if (flash.error) {
      toast.error(flash.error);
    }
  }, [flash]);

  // Atualizar a visualização ao alterar as cores
  useEffect(() => {
    const subscription = brandingForm.watch((values) => {
      setPreview({
        primary_color: values.primary_color || preview.primary_color,
        secondary_color: values.secondary_color || preview.secondary_color,
        accent_color: values.accent_color || preview.accent_color
      });
    });
    
    return () => subscription.unsubscribe();
  }, [brandingForm.watch]);

  function onSubmitBranding(data) {
    setLoading(true);
    router.put(route('agency.branding.update'), data, {
      onSuccess: () => {
        toast.success('Configurações de marca atualizadas com sucesso!');
        setLoading(false);
      },
      onError: (errors) => {
        Object.keys(errors).forEach(key => {
          brandingForm.setError(key, { message: errors[key] });
        });
        toast.error('Ocorreu um erro ao salvar as configurações.');
        setLoading(false);
      }
    });
  }

  function onSubmitDomain(data) {
    setLoading(true);
    router.put(route('agency.branding.update.domain'), data, {
      onSuccess: () => {
        toast.success('Configurações de domínio atualizadas com sucesso!');
        setLoading(false);
      },
      onError: (errors) => {
        Object.keys(errors).forEach(key => {
          domainForm.setError(key, { message: errors[key] });
        });
        toast.error('Ocorreu um erro ao salvar as configurações de domínio.');
        setLoading(false);
      }
    });
  }

  function onSubmitLandingPage(data) {
    setLoading(true);
    router.put(route('agency.branding.update.landing'), data, {
      onSuccess: () => {
        toast.success('Landing page personalizada com sucesso!');
        setLoading(false);
      },
      onError: (errors) => {
        Object.keys(errors).forEach(key => {
          landingPageForm.setError(key, { message: errors[key] });
        });
        toast.error('Ocorreu um erro ao personalizar a landing page.');
        setLoading(false);
      }
    });
  }

  // Função para determinar cor de texto (branco ou preto) baseado na cor de fundo
  function getContrastColor(hexColor) {
    // Remover o # do hexadecimal se existir
    hexColor = hexColor.replace('#', '');
    
    // Converter para RGB
    const r = parseInt(hexColor.substr(0, 2), 16);
    const g = parseInt(hexColor.substr(2, 2), 16);
    const b = parseInt(hexColor.substr(4, 2), 16);
    
    // Calcular luminância
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    
    // Retornar preto ou branco baseado na luminância
    return luminance > 0.5 ? '#000000' : '#ffffff';
  }

  return (
    <AgencyLayout title="White Label">
      <Head title="White Label" />

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">Personalização de Marca</h2>
        <p className="text-muted-foreground">Personalize a aparência da plataforma e landing page para seus clientes</p>
      </div>

      <Tabs defaultValue="branding" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6 grid grid-cols-3 lg:max-w-[600px]">
          <TabsTrigger value="branding" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            <span>Identidade Visual</span>
          </TabsTrigger>
          <TabsTrigger value="domain" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            <span>Domínio</span>
          </TabsTrigger>
          <TabsTrigger value="landing" className="flex items-center gap-2">
            <Layout className="h-4 w-4" />
            <span>Landing Page</span>
          </TabsTrigger>
        </TabsList>

        {/* Tab de Identidade Visual */}
        <TabsContent value="branding" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Form {...brandingForm}>
                <form onSubmit={brandingForm.handleSubmit(onSubmitBranding)} className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Identidade Visual</CardTitle>
                      <CardDescription>Configure a identidade visual da sua agência na plataforma</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <FormField
                        control={brandingForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nome da Agência</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormDescription>
                              Este nome será exibido para seus clientes
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={brandingForm.control}
                          name="logo"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>URL do Logo</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormDescription>
                                Recomendado: formato PNG ou SVG (200x50px)
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={brandingForm.control}
                          name="favicon"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>URL do Favicon</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormDescription>
                                Recomendado: formato ICO, PNG ou SVG (32x32px)
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <Separator />

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <FormField
                          control={brandingForm.control}
                          name="primary_color"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Cor Primária</FormLabel>
                              <div className="flex space-x-2">
                                <FormControl>
                                  <div className="flex items-center">
                                    <Input type="color" className="w-12 p-1 h-10" {...field} />
                                    <Input className="ml-2" {...field} />
                                  </div>
                                </FormControl>
                              </div>
                              <FormDescription>
                                Usada em elementos principais (cabeçalho, botões)
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={brandingForm.control}
                          name="secondary_color"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Cor Secundária</FormLabel>
                              <div className="flex space-x-2">
                                <FormControl>
                                  <div className="flex items-center">
                                    <Input type="color" className="w-12 p-1 h-10" {...field} />
                                    <Input className="ml-2" {...field} />
                                  </div>
                                </FormControl>
                              </div>
                              <FormDescription>
                                Usada em elementos secundários (cards, bordas)
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={brandingForm.control}
                          name="accent_color"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Cor de Destaque</FormLabel>
                              <div className="flex space-x-2">
                                <FormControl>
                                  <div className="flex items-center">
                                    <Input type="color" className="w-12 p-1 h-10" {...field} />
                                    <Input className="ml-2" {...field} />
                                  </div>
                                </FormControl>
                              </div>
                              <FormDescription>
                                Usada para elementos que precisam de destaque
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-end">
                      <Button type="submit" disabled={loading} className="flex items-center gap-2">
                        <Save className="h-4 w-4" />
                        Salvar Alterações
                      </Button>
                    </CardFooter>
                  </Card>
                </form>
              </Form>
            </div>

            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Visualização</CardTitle>
                  <CardDescription>Como seus clientes verão a plataforma</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-md overflow-hidden border">
                    {/* Header Preview */}
                    <div 
                      className="p-4 flex items-center justify-between" 
                      style={{ 
                        backgroundColor: preview.primary_color,
                        color: getContrastColor(preview.primary_color)
                      }}
                    >
                      <div className="flex items-center gap-2">
                        {brandingForm.watch('logo') ? (
                          <img src={brandingForm.watch('logo')} alt="Logo" className="h-8" />
                        ) : (
                          <div className="h-8 w-8 rounded bg-gray-200 flex items-center justify-center">
                            Logo
                          </div>
                        )}
                        <span className="font-bold">{brandingForm.watch('name')}</span>
                      </div>
                      <div className="h-8 w-8 rounded-full bg-gray-200"></div>
                    </div>
                    
                    {/* Content Preview */}
                    <div className="p-4 bg-white">
                      <div 
                        className="mb-4 p-2 rounded-md" 
                        style={{ backgroundColor: preview.secondary_color, color: getContrastColor(preview.secondary_color) }}
                      >
                        <p>Elemento secundário</p>
                      </div>
                      
                      <div className="flex gap-2">
                        <button 
                          className="px-3 py-1 rounded-md" 
                          style={{ backgroundColor: preview.primary_color, color: getContrastColor(preview.primary_color) }}
                        >
                          Botão Primário
                        </button>
                        <button 
                          className="px-3 py-1 rounded-md" 
                          style={{ backgroundColor: preview.accent_color, color: getContrastColor(preview.accent_color) }}
                        >
                          Botão Destaque
                        </button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Tab de Domínio Personalizado */}
        <TabsContent value="domain">
          <Card>
            <CardHeader>
              <CardTitle>Domínio Personalizado</CardTitle>
              <CardDescription>Configure um domínio personalizado para sua agência e clientes</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...domainForm}>
                <form onSubmit={domainForm.handleSubmit(onSubmitDomain)} className="space-y-6">
                  <div className="grid grid-cols-1 gap-6">
                    <FormField
                      control={domainForm.control}
                      name="subdomain"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Subdomínio da Plataforma</FormLabel>
                          <div className="flex items-center">
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <span className="ml-2 text-muted-foreground">.onsell.com.br</span>
                          </div>
                          <FormDescription>
                            Seu subdomínio para acesso à plataforma. Ex: minhaagencia.onsell.com.br
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Separator />

                    <FormField
                      control={domainForm.control}
                      name="custom_domain"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Domínio Personalizado</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Ex: minhaagencia.com.br" />
                          </FormControl>
                          <FormDescription>
                            Seu domínio personalizado para a landing page e acesso dos clientes
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {domainForm.watch('custom_domain') && (
                      <div className="mt-4">
                        <div className="p-4 bg-amber-50 border border-amber-200 rounded-md text-amber-800">
                          <h3 className="font-medium mb-2 flex items-center">
                            <span>Configuração de DNS</span>
                            <div className="ml-2 px-2 py-0.5 text-xs rounded-full bg-amber-200">
                              {domainForm.watch('domain_status') === 'active' ? 'Ativo' : 'Pendente'}
                            </div>
                          </h3>
                          <p className="text-sm mb-2">Configure os seguintes registros DNS no seu provedor de domínio:</p>
                          
                          <div className="bg-white p-3 rounded-md border border-amber-200 font-mono text-xs mb-3">
                            <p>Tipo: A</p>
                            <p>Nome: @</p>
                            <p>Valor: 34.95.121.61</p>
                            <p>TTL: 3600</p>
                          </div>
                          
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm"
                            className="flex items-center gap-1"
                            onClick={async () => {
                              try {
                                const response = await fetch(route('agency.branding.check.domain'));
                                const data = await response.json();
                                
                                if (response.ok) {
                                  if (data.status === 'active') {
                                    toast.success(data.message);
                                    domainForm.setValue('domain_status', 'active');
                                  } else {
                                    toast.warning(data.message);
                                  }
                                } else {
                                  toast.error(data.message || 'Erro ao verificar domínio');
                                }
                              } catch (error) {
                                toast.error('Erro ao verificar o status do domínio');
                                console.error(error);
                              }
                            }}
                          >
                            <RefreshCcw className="h-4 w-4" />
                            Verificar Status do Domínio
                          </Button>
                          
                          <p className="text-xs mt-3">
                            Após configurar os registros DNS, pode levar até 48 horas para a propagação completa. 
                            Utilize o botão acima para verificar o status.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  <Button type="submit" disabled={loading} className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    Salvar Configurações de Domínio
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab de Landing Page */}
        <TabsContent value="landing">
          <Card>
            <CardHeader>
              <CardTitle>Landing Page Personalizada</CardTitle>
              <CardDescription>Personalize a landing page que seus clientes veem ao se cadastrar</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...landingPageForm}>
                <form onSubmit={landingPageForm.handleSubmit(onSubmitLandingPage)} className="space-y-6">
                  <div className="grid grid-cols-1 gap-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Seção Principal</h3>
                      
                      <FormField
                        control={landingPageForm.control}
                        name="headline"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Headline Principal</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormDescription>
                              Título principal da sua landing page
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={landingPageForm.control}
                        name="subheadline"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Subtítulo</FormLabel>
                            <FormControl>
                              <Textarea {...field} rows={2} />
                            </FormControl>
                            <FormDescription>
                              Texto que aparece abaixo do título principal
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={landingPageForm.control}
                        name="hero_image"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>URL da Imagem Principal</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormDescription>
                              Imagem de destaque da sua landing page (recomendado: 1200x600px)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={landingPageForm.control}
                        name="cta_text"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Texto do Botão (CTA)</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormDescription>
                              Texto que aparece no botão principal
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Seção de Recursos</h3>
                      
                      <FormField
                        control={landingPageForm.control}
                        name="features_title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Título da Seção de Recursos</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormDescription>
                              Título da seção que lista os recursos do seu produto
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="space-y-4">
                        <FormLabel>Recursos</FormLabel>
                        {landingPageForm.watch('features')?.map((feature, index) => (
                          <div key={index} className="p-4 border rounded-md bg-gray-50">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <FormField
                                control={landingPageForm.control}
                                name={`features.${index}.title`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Título</FormLabel>
                                    <FormControl>
                                      <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              
                              <FormField
                                control={landingPageForm.control}
                                name={`features.${index}.description`}
                                render={({ field }) => (
                                  <FormItem className="md:col-span-2">
                                    <FormLabel>Descrição</FormLabel>
                                    <FormControl>
                                      <Textarea {...field} rows={1} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                            
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="mt-2"
                              onClick={() => {
                                const features = [...landingPageForm.getValues('features')];
                                if (features.length > 1) {
                                  features.splice(index, 1);
                                  landingPageForm.setValue('features', features);
                                } else {
                                  toast.error('Você precisa manter pelo menos um recurso');
                                }
                              }}
                            >
                              Remover
                            </Button>
                          </div>
                        ))}
                        
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            const features = [...landingPageForm.getValues('features')];
                            features.push({
                              title: 'Novo Recurso',
                              description: 'Descrição do novo recurso',
                              icon: 'Star'
                            });
                            landingPageForm.setValue('features', features);
                          }}
                        >
                          Adicionar Recurso
                        </Button>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Planos</h3>
                      
                      <FormField
                        control={landingPageForm.control}
                        name="display_plans"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>
                                Exibir planos na landing page
                              </FormLabel>
                              <FormDescription>
                                Os planos marcados como destaque serão exibidos na sua landing page
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Link da Landing Page</h3>
                      
                      <div className="p-4 bg-gray-50 border rounded-md space-y-4">
                        <div>
                          <h4 className="font-medium">URL personalizada:</h4>
                          {domainForm.watch('subdomain') ? (
                            <div className="mt-2 flex items-center space-x-2">
                              <code className="px-2 py-1 bg-gray-200 rounded text-sm">
                                https://{domainForm.watch('subdomain')}.{window.location.hostname.replace(/^www\./, '')}
                              </code>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  navigator.clipboard.writeText(`https://${domainForm.watch('subdomain')}.${window.location.hostname.replace(/^www\./, '')}`);
                                  toast.success('URL copiada para a área de transferência!');
                                }}
                              >
                                Copiar
                              </Button>
                            </div>
                          ) : (
                            <p className="text-muted-foreground text-sm mt-2">
                              Configure um subdomínio na aba "Domínio" para ter uma URL personalizada
                            </p>
                          )}
                        </div>
                        
                        <div>
                          <h4 className="font-medium">URL alternativa:</h4>
                          <div className="mt-2 flex items-center space-x-2">
                            <code className="px-2 py-1 bg-gray-200 rounded text-sm">
                              {window.location.origin}/agency/{agency.id}/landing
                            </code>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                navigator.clipboard.writeText(`${window.location.origin}/agency/${agency.id}/landing`);
                                toast.success('URL copiada para a área de transferência!');
                              }}
                            >
                              Copiar
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Button type="submit" disabled={loading} className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    Salvar Landing Page
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AgencyLayout>
  );
} 