import AgencyLayout from '@/Layouts/AgencyLayout';
import { Head } from '@inertiajs/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Button } from '@/Components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/Components/ui/form';
import { Separator } from '@/Components/ui/separator';
import { Save } from 'lucide-react';
import { toast } from 'react-toastify';
import { useState, useEffect } from 'react';

const brandingSchema = z.object({
  name: z.string().min(3, { message: 'Nome deve ter pelo menos 3 caracteres' }),
  logo: z.string().url({ message: 'URL inválida para o logo' }).optional().or(z.literal('')),
  favicon: z.string().url({ message: 'URL inválida para o favicon' }).optional().or(z.literal('')),
  primary_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, { message: 'Cor inválida, use formato hexadecimal' }),
  secondary_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, { message: 'Cor inválida, use formato hexadecimal' }),
  accent_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, { message: 'Cor inválida, use formato hexadecimal' }),
});

export default function Visual({ agency }) {
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState({
    primary_color: agency.primary_color || '#3b82f6',
    secondary_color: agency.secondary_color || '#10b981',
    accent_color: agency.accent_color || '#f97316'
  });

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

  function getContrastColor(hexColor) {
    hexColor = hexColor.replace('#', '');
    const r = parseInt(hexColor.substr(0, 2), 16);
    const g = parseInt(hexColor.substr(2, 2), 16);
    const b = parseInt(hexColor.substr(4, 2), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? '#000000' : '#ffffff';
  }

  function onSubmitBranding(data) {
    setLoading(true);
    window.axios.put(route('agency.branding.update'), data)
      .then(() => {
        toast.success('Configurações de marca atualizadas com sucesso!');
      })
      .catch(() => {
        toast.error('Ocorreu um erro ao salvar as configurações.');
      })
      .finally(() => setLoading(false));
  }

  return (
    <AgencyLayout title="Identidade Visual">
      <Head title="Identidade Visual" />
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">Identidade Visual</h2>
        <p className="text-muted-foreground">Configure a identidade visual da sua agência na plataforma</p>
      </div>
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
                    <FormDescription>Este nome será exibido para seus clientes</FormDescription>
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
                      <FormDescription>Recomendado: formato PNG ou SVG (200x50px)</FormDescription>
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
                      <FormDescription>Recomendado: formato ICO, PNG ou SVG (32x32px)</FormDescription>
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
                      <FormDescription>Usada em elementos principais (cabeçalho, botões)</FormDescription>
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
                      <FormDescription>Usada em elementos secundários (cards, bordas)</FormDescription>
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
                      <FormDescription>Usada para elementos que precisam de destaque</FormDescription>
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
    </AgencyLayout>
  );
} 