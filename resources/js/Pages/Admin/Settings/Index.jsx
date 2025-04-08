"use client";

import { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Badge } from '@/Components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/Components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/Components/ui/form';
import { Label } from '@/Components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import { Textarea } from '@/Components/ui/textarea';
import { Switch } from '@/Components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Separator } from '@/Components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/Components/ui/radio-group';
import { Globe, Shield, FileText, Settings, Save, ArrowRight, Cloud, Server, Upload, Wrench } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'react-toastify';

// Esquemas de validação
const generalSchema = z.object({
  siteName: z.string().min(2, 'Nome da plataforma deve ter pelo menos 2 caracteres'),
  siteDescription: z.string().min(10, 'Descrição deve ter pelo menos 10 caracteres'),
  logoUrl: z.string().url('URL do logo inválida'),
  faviconUrl: z.string().url('URL do favicon inválida'),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Cor primária deve ser um código hexadecimal válido'),
  secondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Cor secundária deve ser um código hexadecimal válido'),
  userRegistration: z.boolean(),
  defaultLanguage: z.enum(['pt_BR', 'en_US', 'es_ES']),
  dateFormat: z.enum(['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD']),
  timeFormat: z.enum(['12h', '24h'])
});

const emailSchema = z.object({
  fromName: z.string().min(2, 'Nome do remetente deve ter pelo menos 2 caracteres'),
  fromEmail: z.string().email('Email do remetente inválido'),
  replyToEmail: z.string().email('Email de resposta inválido'),
  welcomeEmail: z.boolean(),
  passwordResetEmail: z.boolean(),
  newsletterDefault: z.boolean()
});

const settingsSchema = z.object({
  general: generalSchema,
  email: emailSchema
});

export default function SettingsIndex({ auth }) {
  const [activeTab, setActiveTab] = useState("general");

  // Inicializar o formulário com valores padrão
  const form = useForm({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      general: {
        siteName: 'OnSell',
        siteDescription: 'Plataforma de automação de vendas e marketing',
        logoUrl: 'https://onsell.com.br/images/onsell-logo.png',
        faviconUrl: 'https://onsell.com.br/images/favicon.ico',
        primaryColor: '#3b82f6',
        secondaryColor: '#10b981',
        userRegistration: true,
        defaultLanguage: 'pt_BR',
        dateFormat: 'DD/MM/YYYY',
        timeFormat: '24h'
      },
      email: {
        fromName: 'Suporte OnSell',
        fromEmail: 'noreply@onsell.com.br',
        replyToEmail: 'suporte@onsell.com.br',
        welcomeEmail: true,
        passwordResetEmail: true,
        newsletterDefault: false
      }
    }
  });

  function onSubmit(data) {
    // Lógica para salvar configurações
    console.log('Configurações salvas:', data);
    
    // Enviar para a API
    // Exemplo:
    // axios.post(route('api.settings.update'), data)
    //   .then(() => {
    //     toast.success('Configurações salvas com sucesso');
    //   })
    //   .catch((error) => {
    //     toast.error('Erro ao salvar configurações');
    //     console.error(error);
    //   });
    
    toast.success('Configurações salvas com sucesso');
  }

  return (
    <AdminLayout title="Configurações da Plataforma">
      <Head title="Configurações da Plataforma" />
      
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Configurações</h2>
          <p className="text-muted-foreground">Gerencie as configurações gerais da plataforma</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" asChild>
            <Link href={route('admin.settings.security')}>
              <Shield className="mr-2 h-4 w-4" />
              Segurança
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={route('admin.settings.logs')}>
              <FileText className="mr-2 h-4 w-4" />
              Logs
            </Link>
          </Button>
        </div>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
            <TabsList>
              <TabsTrigger value="general" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Geral
              </TabsTrigger>
              <TabsTrigger value="branding" className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Marca e Aparência
              </TabsTrigger>
              <TabsTrigger value="email" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Email
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="general" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Configurações Gerais</CardTitle>
                  <CardDescription>
                    Configure os parâmetros básicos da plataforma
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="general.siteName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome da Plataforma</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="general.defaultLanguage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Idioma Padrão</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione um idioma" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="pt_BR">Português (Brasil)</SelectItem>
                              <SelectItem value="en_US">Inglês (EUA)</SelectItem>
                              <SelectItem value="es_ES">Espanhol</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="general.siteDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descrição da Plataforma</FormLabel>
                        <FormControl>
                          <Textarea rows={3} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Separator />
                  
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="general.dateFormat"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Formato de Data</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Formato de data" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                              <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                              <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="general.timeFormat"
                      render={({ field }) => (
                        <FormItem className="space-y-2">
                          <FormLabel>Formato de Hora</FormLabel>
                          <FormControl>
                            <RadioGroup 
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="flex space-x-4"
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="12h" id="12h" />
                                <Label htmlFor="12h">12 horas (AM/PM)</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="24h" id="24h" />
                                <Label htmlFor="24h">24 horas</Label>
                              </div>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="general.userRegistration"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-2 space-y-0 rounded-md border p-3">
                        <FormControl>
                          <Switch 
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Permitir registro de novos usuários</FormLabel>
                          <FormDescription>
                            Quando ativado, qualquer pessoa poderá criar uma conta na plataforma
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="branding" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Marca e Aparência</CardTitle>
                  <CardDescription>
                    Personalize a aparência da plataforma
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="general.logoUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>URL do Logo</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormDescription>
                            Imagem em formato PNG ou SVG (recomendado 200x50px)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="general.faviconUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>URL do Favicon</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormDescription>
                            Imagem em formato ICO, PNG ou SVG (recomendado 32x32px)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="general.primaryColor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cor Primária</FormLabel>
                          <div className="flex space-x-2">
                            <FormControl>
                              <>
                                <Input 
                                  type="color"
                                  className="w-16 p-1 h-9"
                                  value={field.value}
                                  onChange={field.onChange}
                                />
                                <Input 
                                  value={field.value}
                                  onChange={field.onChange}
                                />
                              </>
                            </FormControl>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="general.secondaryColor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cor Secundária</FormLabel>
                          <div className="flex space-x-2">
                            <FormControl>
                              <>
                                <Input 
                                  type="color"
                                  className="w-16 p-1 h-9"
                                  value={field.value}
                                  onChange={field.onChange}
                                />
                                <Input 
                                  value={field.value}
                                  onChange={field.onChange}
                                />
                              </>
                            </FormControl>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="email" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Configurações de Email</CardTitle>
                  <CardDescription>
                    Configure os parâmetros de envio de email
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="email.fromName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome do Remetente</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="email.fromEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email do Remetente</FormLabel>
                          <FormControl>
                            <Input type="email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="email.replyToEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email de Resposta (Reply-To)</FormLabel>
                        <FormControl>
                          <Input type="email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">Notificações por Email</h3>
                    
                    <FormField
                      control={form.control}
                      name="email.welcomeEmail"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                          <FormControl>
                            <Switch 
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel>Enviar email de boas-vindas para novos usuários</FormLabel>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="email.passwordResetEmail"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                          <FormControl>
                            <Switch 
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel>Permitir redefinição de senha por email</FormLabel>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="email.newsletterDefault"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                          <FormControl>
                            <Switch 
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel>Inscrever novos usuários na newsletter por padrão</FormLabel>
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
          
          <div className="mt-6 flex justify-end">
            <Button type="submit" className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              Salvar Configurações
            </Button>
          </div>
        </form>
      </Form>
    </AdminLayout>
  );
} 