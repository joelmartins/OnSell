"use client";

import { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { router } from '@inertiajs/react';
import AgencyLayout from '@/Layouts/AgencyLayout';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/Components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/Components/ui/form';
import { Input } from '@/Components/ui/input';
import { Textarea } from '@/Components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import { Switch } from '@/Components/ui/switch';
import { Separator } from '@/Components/ui/separator';
import { Save, Bell, Mail, Phone, Shield, UserCog } from 'lucide-react';
import { toast } from 'react-toastify';

// Esquema de validação
const formSchema = z.object({
  notifications: z.object({
    email: z.boolean().default(true),
    push: z.boolean().default(false),
    sms: z.boolean().default(false),
    whatsapp: z.boolean().default(true),
  }),
  security: z.object({
    two_factor: z.boolean().default(false),
    ip_restriction: z.boolean().default(false),
    session_timeout: z.number().int().min(5).max(120).default(30),
  }),
  appearance: z.object({
    dark_mode: z.boolean().default(false),
    compact_mode: z.boolean().default(false),
  }),
  contact: z.object({
    support_email: z.string().email().optional(),
    support_phone: z.string().optional(),
  }),
});

export default function AgencySettings({ billing = {}, ...props }) {
  const [activeTab, setActiveTab] = useState("notifications");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      notifications: {
        email: true,
        push: false,
        sms: false,
        whatsapp: true,
      },
      security: {
        two_factor: false,
        ip_restriction: false,
        session_timeout: 30,
      },
      appearance: {
        dark_mode: false,
        compact_mode: false,
      },
      contact: {
        support_email: '',
        support_phone: '',
      },
    },
  });

  function onSubmit(data) {
    setIsSubmitting(true);
    
    // Simulação de envio para o backend
    setTimeout(() => {
      console.log('Dados do formulário:', data);
      toast.success('Configurações salvas com sucesso!');
      setIsSubmitting(false);
    }, 1000);
  }

  const handleCheckout = async () => {
    setLoading(true);
    toast.info('Redirecionando para pagamento...');
    // window.location.href = '/agency/settings/billing/checkout';
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <AgencyLayout title="Configurações">
      <Head title="Configurações" />
      
      <div className="mb-8">
        <h2 className="text-2xl font-semibold">Configurações da Agência</h2>
        <p className="text-muted-foreground">Gerencie as configurações da sua agência</p>
      </div>
      
      <div className="mb-6 flex justify-end">
        <Button variant="outline" asChild className="mb-4">
          <Link href={route('agency.settings.profile')}>
            <UserCog className="mr-2 h-4 w-4" />
            Editar Perfil de Usuário
          </Link>
        </Button>
      </div>
      <div className="mb-6 flex justify-end">
        <Button variant="outline" asChild className="mb-4">
          <Link href={route('agency.settings.billing')}>
            <UserCog className="mr-2 h-4 w-4" />
            Cobrança e Assinatura
          </Link>
        </Button>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-4 w-full md:w-auto">
              <TabsTrigger value="notifications" className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                <span className="hidden sm:inline">Notificações</span>
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <span className="hidden sm:inline">Segurança</span>
              </TabsTrigger>
              <TabsTrigger value="appearance" className="flex items-center gap-2">
                <UserCog className="h-4 w-4" />
                <span className="hidden sm:inline">Aparência</span>
              </TabsTrigger>
              <TabsTrigger value="contact" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span className="hidden sm:inline">Contato</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="notifications" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Notificações</CardTitle>
                  <CardDescription>
                    Configure como você deseja receber notificações do sistema
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="notifications.email"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Email
                          </FormLabel>
                          <FormDescription>
                            Receber notificações via email
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
                    name="notifications.push"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Push
                          </FormLabel>
                          <FormDescription>
                            Receber notificações push no navegador
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
                    name="notifications.sms"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            SMS
                          </FormLabel>
                          <FormDescription>
                            Receber notificações via SMS
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
                    name="notifications.whatsapp"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            WhatsApp
                          </FormLabel>
                          <FormDescription>
                            Receber notificações via WhatsApp
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
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="security" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Segurança</CardTitle>
                  <CardDescription>
                    Configure as opções de segurança da sua conta
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="security.two_factor"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Autenticação de dois fatores
                          </FormLabel>
                          <FormDescription>
                            Requer um código adicional ao fazer login
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
                    name="security.ip_restriction"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Restrição de IP
                          </FormLabel>
                          <FormDescription>
                            Limitar o acesso a IPs específicos
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
                    name="security.session_timeout"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tempo de inatividade (minutos)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} min={5} max={120} />
                        </FormControl>
                        <FormDescription>
                          Tempo até a sessão expirar por inatividade
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="appearance" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Aparência</CardTitle>
                  <CardDescription>
                    Personalize a aparência da plataforma
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="appearance.dark_mode"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Modo escuro
                          </FormLabel>
                          <FormDescription>
                            Utilizar tema escuro na interface
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
                    name="appearance.compact_mode"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Modo compacto
                          </FormLabel>
                          <FormDescription>
                            Reduzir o espaçamento entre elementos
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
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="contact" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Informações de Contato</CardTitle>
                  <CardDescription>
                    Configure as informações de contato para seus clientes
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="contact.support_email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email de Suporte</FormLabel>
                        <FormControl>
                          <Input placeholder="suporte@suaagencia.com.br" {...field} />
                        </FormControl>
                        <FormDescription>
                          Email que será exibido para seus clientes para contato
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="contact.support_phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telefone de Suporte</FormLabel>
                        <FormControl>
                          <Input placeholder="(11) 99999-9999" {...field} />
                        </FormControl>
                        <FormDescription>
                          Telefone que será exibido para seus clientes para contato
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
          
          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting} className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              {isSubmitting ? "Salvando..." : "Salvar Configurações"}
            </Button>
          </div>
        </form>
      </Form>
    </AgencyLayout>
  );
} 