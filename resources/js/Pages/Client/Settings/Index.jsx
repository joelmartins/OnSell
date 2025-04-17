"use client";

import { Head, Link } from '@inertiajs/react';
import ClientLayout from '@/Layouts/ClientLayout';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/Components/ui/card';
import { UserCog } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/Components/ui/form';
import { Input } from '@/Components/ui/input';
import { PhoneInput } from '@/Components/ui/phone-input';
import { toast } from 'react-toastify';

const companySchema = z.object({
  company_name: z.string().min(2, 'O nome da empresa é obrigatório.'),
  company_document: z.string().optional(),
  company_email: z.string().email('E-mail inválido.'),
  company_phone: z.string().optional(),
  company_country_code: z.string().optional(),
});

export default function SettingsIndex({ auth }) {
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

  function onSubmitCompany(data) {
    toast.success('Dados da empresa salvos com sucesso!');
  }

  return (
    <ClientLayout title="Configurações">
      <Head title="Configurações" />

      <div className="mb-8">
        <h2 className="text-2xl font-semibold">Configurações</h2>
        <p className="text-muted-foreground">Gerencie as configurações da sua conta</p>
      </div>

      <div className="mb-8 mt-8">
        <Card className="w-full mx-auto">
          <CardHeader>
            <CardTitle>Dados da Empresa</CardTitle>
            <CardDescription>Edite as informações cadastrais da sua empresa.</CardDescription>
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
                <Button type="submit">Salvar Dados da Empresa</Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </ClientLayout>
  );
} 