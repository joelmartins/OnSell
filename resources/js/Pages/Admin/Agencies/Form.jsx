"use client";

import { useEffect } from 'react';
import { useForm as useHookForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { router } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Textarea } from '@/Components/ui/textarea';
import { Switch } from '@/Components/ui/switch';
import { Separator } from '@/Components/ui/separator';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/Components/ui/form';
import { Save } from 'lucide-react';

const formSchema = z.object({
  name: z.string().min(3, { message: 'Nome deve ter pelo menos 3 caracteres' }),
  email: z.string().email({ message: 'Email inválido' }),
  phone: z.string().min(10, { message: 'Telefone deve ter pelo menos 10 dígitos' }).optional().or(z.literal('')),
  document: z.string().min(11, { message: 'CNPJ/CPF inválido' }).optional().or(z.literal('')),
  description: z.string().optional(),
  domain: z.string().min(5, { message: 'Domínio deve ter pelo menos 5 caracteres' }).optional().or(z.literal('')),
  is_active: z.boolean().default(true),
  primary_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, { message: 'Cor inválida, use formato hexadecimal' }).default('#3b82f6'),
  secondary_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, { message: 'Cor inválida, use formato hexadecimal' }).default('#10b981'),
  accent_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, { message: 'Cor inválida, use formato hexadecimal' }).default('#f97316'),
});

export default function AgencyForm({ agency, isEditing = false }) {
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
      primary_color: '#3b82f6',
      secondary_color: '#10b981',
      accent_color: '#f97316',
    },
  });

  useEffect(() => {
    if (agency) {
      form.reset({
        name: agency.name || '',
        email: agency.email || '',
        phone: agency.phone || '',
        document: agency.document || '',
        description: agency.description || '',
        domain: agency.domain || '',
        is_active: agency.is_active,
        primary_color: agency.primary_color || '#3b82f6',
        secondary_color: agency.secondary_color || '#10b981',
        accent_color: agency.accent_color || '#f97316',
      });
    }
  }, [agency]);

  function onSubmit(values) {
    if (isEditing) {
      router.put(route('admin.agencies.update', agency.id), values);
    } else {
      router.post(route('admin.agencies.store'), values);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome da Agência</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Agência Digital Suprema" {...field} />
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
                  <Input type="email" placeholder="contato@agencia.com.br" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Telefone</FormLabel>
                <FormControl>
                  <Input placeholder="(11) 99999-9999" {...field} />
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
                  <Input placeholder="00.000.000/0001-00" {...field} />
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
                <Textarea 
                  placeholder="Descreva brevemente a agência..." 
                  className="resize-none" 
                  rows={3} 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="domain"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Domínio</FormLabel>
              <FormControl>
                <Input placeholder="agencia.onsell.com.br" {...field} />
              </FormControl>
              <FormDescription>
                Domínio para acesso da agência à plataforma. Será usado no formato subdomain.onsell.com.br
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Separator />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
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
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

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
                <FormLabel>Agência ativa</FormLabel>
                <FormDescription>
                  Quando ativada, a agência pode acessar a plataforma e gerenciar seus clientes
                </FormDescription>
              </div>
            </FormItem>
          )}
        />

        <div className="flex justify-end">
          <Button type="submit" className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            {isEditing ? 'Atualizar Agência' : 'Criar Agência'}
          </Button>
        </div>
      </form>
    </Form>
  );
} 