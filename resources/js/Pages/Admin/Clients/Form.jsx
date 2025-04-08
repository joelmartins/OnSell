import { useEffect } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm as useHookForm } from 'react-hook-form';
import * as z from 'zod';
import { ArrowLeft, Save } from 'lucide-react';

const formSchema = z.object({
  name: z.string().min(1, 'O nome é obrigatório'),
  email: z.string().email('Formato de e-mail inválido'),
  phone: z.string().optional(),
  document: z.string().optional(),
  description: z.string().optional(),
  domain: z.string().optional(),
  is_active: z.boolean().default(true),
  agency_id: z.string().optional(),
  plan_id: z.string().optional(),
  primary_color: z.string().optional(),
  secondary_color: z.string().optional(),
  accent_color: z.string().optional(),
});

export default function ClientForm({ client, agencies, plans, isEditing = false }) {
  const form = useHookForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      document: '',
      description: '',
      domain: '',
      is_active: true,
      agency_id: '',
      plan_id: '',
      primary_color: '',
      secondary_color: '',
      accent_color: '',
    },
  });

  useEffect(() => {
    if (client) {
      form.reset({
        name: client.name || '',
        email: client.email || '',
        phone: client.phone || '',
        document: client.document || '',
        description: client.description || '',
        domain: client.domain || '',
        is_active: client.is_active,
        agency_id: client.agency_id ? String(client.agency_id) : '',
        plan_id: client.plan_id ? String(client.plan_id) : '',
        primary_color: client.primary_color || '',
        secondary_color: client.secondary_color || '',
        accent_color: client.accent_color || '',
      });
    }
  }, [client]);

  function onSubmit(values) {
    if (isEditing) {
      router.put(route('admin.clients.update', client.id), values);
    } else {
      router.post(route('admin.clients.store'), values);
    }
  }

  const handleCancel = () => {
    router.get(route('admin.clients.index'));
  };

  return (
    <AdminLayout title={isEditing ? `Editar Cliente: ${client?.name}` : 'Novo Cliente'}>
      <Head title={isEditing ? `Editar Cliente: ${client?.name}` : 'Novo Cliente'} />
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Informações Básicas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome do cliente" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="Email do cliente" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefone</FormLabel>
                      <FormControl>
                        <Input placeholder="Telefone do cliente" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="document"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CNPJ/CPF</FormLabel>
                      <FormControl>
                        <Input placeholder="CNPJ ou CPF do cliente" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Input placeholder="Descrição do cliente" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Ativo</FormLabel>
                    </div>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Associações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="agency_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Agência</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione uma agência" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="">Cliente Direto</SelectItem>
                          {agencies?.map((agency) => (
                            <SelectItem key={agency.id} value={String(agency.id)}>
                              {agency.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="plan_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Plano</FormLabel>
                      <Select 
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um plano" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="">Sem plano</SelectItem>
                          {plans?.map((plan) => (
                            <SelectItem key={plan.id} value={String(plan.id)}>
                              {plan.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Personalização</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="domain"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Domínio</FormLabel>
                    <FormControl>
                      <Input placeholder="cliente.onsell.com.br" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="primary_color"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cor Primária</FormLabel>
                      <div className="flex gap-2">
                        <FormControl>
                          <Input type="text" placeholder="#3B82F6" {...field} />
                        </FormControl>
                        <Input 
                          type="color" 
                          value={field.value || '#3B82F6'} 
                          className="w-10 p-1 h-10"
                          onChange={(e) => field.onChange(e.target.value)}
                        />
                      </div>
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
                      <div className="flex gap-2">
                        <FormControl>
                          <Input type="text" placeholder="#9333EA" {...field} />
                        </FormControl>
                        <Input 
                          type="color" 
                          value={field.value || '#9333EA'} 
                          className="w-10 p-1 h-10"
                          onChange={(e) => field.onChange(e.target.value)}
                        />
                      </div>
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
                      <div className="flex gap-2">
                        <FormControl>
                          <Input type="text" placeholder="#10B981" {...field} />
                        </FormControl>
                        <Input 
                          type="color" 
                          value={field.value || '#10B981'} 
                          className="w-10 p-1 h-10"
                          onChange={(e) => field.onChange(e.target.value)}
                        />
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button type="button" variant="outline" onClick={handleCancel}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar
              </Button>
              <Button type="submit">
                <Save className="mr-2 h-4 w-4" />
                {isEditing ? 'Atualizar' : 'Salvar'}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </Form>
    </AdminLayout>
  );
} 