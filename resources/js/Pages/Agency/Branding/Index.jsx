"use client";

import { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { router, usePage } from '@inertiajs/react';
import AgencyLayout from '@/Layouts/AgencyLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/Components/ui/form';
import { Separator } from '@/components/ui/separator';
import { Save, Upload } from 'lucide-react';
import { toast } from 'react-toastify';

const formSchema = z.object({
  name: z.string().min(3, { message: 'Nome deve ter pelo menos 3 caracteres' }),
  logo: z.string().url({ message: 'URL inválida para o logo' }).optional().or(z.literal('')),
  favicon: z.string().url({ message: 'URL inválida para o favicon' }).optional().or(z.literal('')),
  primary_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, { message: 'Cor inválida, use formato hexadecimal' }),
  secondary_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, { message: 'Cor inválida, use formato hexadecimal' }),
  accent_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, { message: 'Cor inválida, use formato hexadecimal' }),
});

export default function BrandingIndex({ agency }) {
  const { auth } = usePage().props;
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState({
    primary_color: agency.primary_color || '#3b82f6',
    secondary_color: agency.secondary_color || '#10b981',
    accent_color: agency.accent_color || '#f97316'
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: agency.name || '',
      logo: agency.logo || '',
      favicon: agency.favicon || '',
      primary_color: agency.primary_color || '#3b82f6',
      secondary_color: agency.secondary_color || '#10b981',
      accent_color: agency.accent_color || '#f97316',
    },
  });

  // Atualizar a visualização ao alterar as cores
  useEffect(() => {
    const subscription = form.watch((values) => {
      setPreview({
        primary_color: values.primary_color || preview.primary_color,
        secondary_color: values.secondary_color || preview.secondary_color,
        accent_color: values.accent_color || preview.accent_color
      });
    });
    
    return () => subscription.unsubscribe();
  }, [form.watch]);

  function onSubmit(data) {
    setLoading(true);
    router.put(route('agency.branding.update'), data, {
      onSuccess: () => {
        toast.success('Configurações de marca atualizadas com sucesso!');
        setLoading(false);
      },
      onError: (errors) => {
        Object.keys(errors).forEach(key => {
          form.setError(key, { message: errors[key] });
        });
        toast.error('Ocorreu um erro ao salvar as configurações.');
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
        <p className="text-muted-foreground">Personalize a aparência da plataforma para seus clientes</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Identidade Visual</CardTitle>
                  <CardDescription>Configure a identidade visual da sua agência na plataforma</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
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
                      control={form.control}
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
                      control={form.control}
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
                      control={form.control}
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
                      control={form.control}
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
                      control={form.control}
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
                    {form.watch('logo') ? (
                      <img src={form.watch('logo')} alt="Logo" className="h-8" />
                    ) : (
                      <div className="h-8 w-8 rounded bg-gray-200 flex items-center justify-center">
                        Logo
                      </div>
                    )}
                    <span className="font-bold">{form.watch('name')}</span>
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
    </AgencyLayout>
  );
} 