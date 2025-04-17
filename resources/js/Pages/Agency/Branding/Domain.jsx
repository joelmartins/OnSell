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
import { Save, RefreshCcw } from 'lucide-react';
import { toast } from 'react-toastify';
import { useState } from 'react';

const domainSchema = z.object({
  custom_domain: z.string().regex(/^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/, { message: 'Domínio inválido. Ex: minha-agencia.com.br' }).optional().or(z.literal('')),
  domain_status: z.string().optional(),
  subdomain: z.string().regex(/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/, { message: 'Subdomínio inválido. Use apenas letras minúsculas, números e hífen.' }),
});

export default function Domain({ agency }) {
  const [loading, setLoading] = useState(false);
  const domainForm = useForm({
    resolver: zodResolver(domainSchema),
    defaultValues: {
      custom_domain: agency.custom_domain || '',
      domain_status: agency.domain_status || 'pending',
      subdomain: agency.subdomain || '',
    },
  });

  function onSubmitDomain(data) {
    setLoading(true);
    window.axios.put(route('agency.branding.update.domain'), data)
      .then(() => {
        toast.success('Configurações de domínio atualizadas com sucesso!');
      })
      .catch(() => {
        toast.error('Ocorreu um erro ao salvar as configurações de domínio.');
      })
      .finally(() => setLoading(false));
  }

  return (
    <AgencyLayout title="Domínio Personalizado">
      <Head title="Domínio Personalizado" />
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">Domínio Personalizado</h2>
        <p className="text-muted-foreground">Configure um domínio personalizado para sua agência e clientes</p>
      </div>
      <Form {...domainForm}>
        <form onSubmit={domainForm.handleSubmit(onSubmitDomain)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Domínio Personalizado</CardTitle>
              <CardDescription>Configure um domínio personalizado para sua agência e clientes</CardDescription>
            </CardHeader>
            <CardContent>
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
                    <FormDescription>Seu subdomínio para acesso à plataforma. Ex: minhaagencia.onsell.com.br</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Separator className="my-4" />
              <FormField
                control={domainForm.control}
                name="custom_domain"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Domínio Personalizado</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Ex: minhaagencia.com.br" />
                    </FormControl>
                    <FormDescription>Seu domínio personalizado para a landing page e acesso dos clientes</FormDescription>
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
                          const response = await window.axios.get(route('agency.branding.check.domain'));
                          const data = response.data;
                          if (data.status === 'active') {
                            toast.success(data.message);
                            domainForm.setValue('domain_status', 'active');
                          } else {
                            toast.warning(data.message);
                          }
                        } catch (error) {
                          toast.error('Erro ao verificar o status do domínio');
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
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button type="submit" disabled={loading} className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                Salvar Configurações de Domínio
              </Button>
            </CardFooter>
          </Card>
        </form>
      </Form>
    </AgencyLayout>
  );
} 