"use client";

import { useState } from 'react';
import { Head } from '@inertiajs/react';
import AgencyLayout from '@/Layouts/AgencyLayout';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/Components/ui/form';
import { Input } from '@/Components/ui/input';
import { toast } from 'react-toastify';
import { PhoneInput } from '@/Components/ui/phone-input';

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

// Adicionar schema para dados da empresa
const companySchema = z.object({
  company_name: z.string().min(2, 'O nome da empresa é obrigatório.'),
  company_document: z.string().optional(),
  company_email: z.string().email('E-mail inválido.'),
  company_phone: z.string().optional(),
  company_country_code: z.string().optional(),
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

  // Novo form para dados da empresa
  const companyForm = useForm({
    resolver: zodResolver(companySchema),
    defaultValues: {
      company_name: '',
      company_document: '',
      company_email: '',
      company_phone: '',
      company_country_code: '+55',
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

  function onSubmitCompany(data) {
    setIsSubmitting(true);
    // Simulação de envio para o backend
    setTimeout(() => {
      toast.success('Dados da empresa salvos com sucesso!');
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
        <h2 className="text-2xl font-semibold">Configurações</h2>
        <p className="text-muted-foreground">Gerencie as configurações da sua conta</p>
      </div>
      <div className="mb-8 mt-8">
        <Card className="w-full mx-auto">
          <CardHeader>
            <CardTitle>Dados da Empresa</CardTitle>
            <CardDescription>Edite as informações cadastrais da sua empresa/agência.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...companyForm}>
              <form onSubmit={companyForm.handleSubmit(onSubmitCompany)} className="space-y-6">
                <FormField
                  control={companyForm.control}
                  name="company_name"
                  rules={{ required: 'O nome da empresa é obrigatório.' }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome da empresa *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Ex: Padaria do João" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={companyForm.control}
                  name="company_document"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CNPJ ou CPF</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="CNPJ ou CPF" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={companyForm.control}
                  name="company_email"
                  rules={{ required: 'O e-mail da empresa é obrigatório.' }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>E-mail da empresa *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="empresa@email.com" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={companyForm.control}
                  name="company_phone"
                  rules={{
                    validate: (value) => {
                      const digits = (value || '').replace(/\D/g, '');
                      if (digits.length > 9) return 'O telefone deve ter no máximo 9 dígitos.';
                      return true;
                    },
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefone da empresa</FormLabel>
                      <FormControl>
                        <PhoneInput
                          id="company_phone"
                          name="company_phone"
                          value={field.value}
                          country={companyForm.watch('company_country_code') || '+55'}
                          onValueChange={val => companyForm.setValue('company_phone', val, { shouldValidate: true })}
                          onCountryChange={val => companyForm.setValue('company_country_code', val)}
                          placeholder="(11) 91234-5678"
                          error={companyForm.formState.errors.company_phone?.message}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={isSubmitting}>Salvar Dados da Empresa</Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </AgencyLayout>
  );
} 