"use client";

import { useState } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import ClientLayout from '@/Layouts/ClientLayout';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Textarea } from '@/Components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/Components/ui/card';
import { Label } from '@/Components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'react-toastify';

export default function ContactEdit({ auth, contact }) {
  const { data, setData, put, processing, errors } = useForm({
    name: contact.name || '',
    email: contact.email || '',
    phone: contact.phone || '',
    whatsapp: contact.whatsapp || '',
    document: contact.document || '',
    company: contact.company || '',
    position: contact.position || '',
    address: contact.address || '',
    city: contact.city || '',
    state: contact.state || '',
    postal_code: contact.postal_code || '',
    country: contact.country || 'Brasil',
    source: contact.source || '',
    status: contact.status || '',
    notes: contact.notes || '',
    custom_fields: contact.custom_fields || {},
    utm_source: contact.utm_source || '',
    utm_medium: contact.utm_medium || '',
    utm_campaign: contact.utm_campaign || '',
    utm_term: contact.utm_term || '',
    utm_content: contact.utm_content || ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData(name, value);
  };

  const handleSelectChange = (name, value) => {
    setData(name, value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    put(route('client.contacts.update', contact.id), {
      onSuccess: () => {
        toast.success('Contato atualizado com sucesso!');
      },
      onError: (errors) => {
        toast.error('Erro ao atualizar contato. Verifique os dados e tente novamente.');
      }
    });
  };

  return (
    <ClientLayout
      user={auth.user}
      header={
        <h2 className="font-semibold text-xl text-gray-800 leading-tight">
          Editar Contato
        </h2>
      }
    >
      <Head title={`Editar: ${contact.name}`} />

      <div className="py-6">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="mb-4">
            <Link href={route('client.contacts.show', contact.id)}>
              <Button variant="outline" className="flex items-center gap-1">
                <ArrowLeft className="h-4 w-4" />
                Voltar para detalhes
              </Button>
            </Link>
          </div>
          
          <Card>
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl">Editar Contato</CardTitle>
              <CardDescription>
                Atualize as informações do contato conforme necessário.
              </CardDescription>
            </CardHeader>
            
            <form onSubmit={handleSubmit}>
              <CardContent className="grid gap-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome <span className="text-red-500">*</span></Label>
                    <Input 
                      id="name" 
                      name="name" 
                      value={data.name} 
                      onChange={handleChange} 
                      required 
                    />
                    {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail</Label>
                    <Input 
                      id="email" 
                      name="email" 
                      type="email" 
                      value={data.email} 
                      onChange={handleChange} 
                    />
                    {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <Input 
                      id="phone" 
                      name="phone" 
                      value={data.phone} 
                      onChange={handleChange} 
                    />
                    {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="whatsapp">WhatsApp</Label>
                    <Input 
                      id="whatsapp" 
                      name="whatsapp" 
                      value={data.whatsapp} 
                      onChange={handleChange} 
                    />
                    {errors.whatsapp && <p className="text-red-500 text-sm">{errors.whatsapp}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="document">CPF/CNPJ</Label>
                    <Input 
                      id="document" 
                      name="document" 
                      value={data.document} 
                      onChange={handleChange} 
                    />
                    {errors.document && <p className="text-red-500 text-sm">{errors.document}</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="company">Empresa</Label>
                    <Input 
                      id="company" 
                      name="company" 
                      value={data.company} 
                      onChange={handleChange} 
                    />
                    {errors.company && <p className="text-red-500 text-sm">{errors.company}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="position">Cargo</Label>
                    <Input 
                      id="position" 
                      name="position" 
                      value={data.position} 
                      onChange={handleChange} 
                    />
                    {errors.position && <p className="text-red-500 text-sm">{errors.position}</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="source">Origem</Label>
                    <Select 
                      value={data.source} 
                      onValueChange={(value) => handleSelectChange('source', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a origem" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="manual">Cadastro Manual</SelectItem>
                        <SelectItem value="site">Site</SelectItem>
                        <SelectItem value="landing_page">Landing Page</SelectItem>
                        <SelectItem value="import">Importação</SelectItem>
                        <SelectItem value="recommendation">Indicação</SelectItem>
                        <SelectItem value="social_media">Redes Sociais</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.source && <p className="text-red-500 text-sm">{errors.source}</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select 
                      value={data.status} 
                      onValueChange={(value) => handleSelectChange('status', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="lead">Lead</SelectItem>
                        <SelectItem value="prospect">Prospect</SelectItem>
                        <SelectItem value="qualified">Qualificado</SelectItem>
                        <SelectItem value="customer">Cliente</SelectItem>
                        <SelectItem value="inactive">Inativo</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.status && <p className="text-red-500 text-sm">{errors.status}</p>}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="address">Endereço</Label>
                  <Input 
                    id="address" 
                    name="address" 
                    value={data.address} 
                    onChange={handleChange} 
                  />
                  {errors.address && <p className="text-red-500 text-sm">{errors.address}</p>}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">Cidade</Label>
                    <Input 
                      id="city" 
                      name="city" 
                      value={data.city || ""} 
                      onChange={handleChange} 
                    />
                    {errors.city && <p className="text-red-500 text-sm">{errors.city}</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="state">Estado</Label>
                    <Input 
                      id="state" 
                      name="state" 
                      value={data.state || ""} 
                      onChange={handleChange} 
                    />
                    {errors.state && <p className="text-red-500 text-sm">{errors.state}</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="postal_code">CEP</Label>
                    <Input 
                      id="postal_code" 
                      name="postal_code" 
                      value={data.postal_code || ""} 
                      onChange={handleChange} 
                    />
                    {errors.postal_code && <p className="text-red-500 text-sm">{errors.postal_code}</p>}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
                  <div className="col-span-2">
                    <h3 className="text-md font-medium mb-2">Informações de Rastreamento (UTM)</h3>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="utm_source">UTM Source</Label>
                    <Input 
                      id="utm_source" 
                      name="utm_source" 
                      value={data.utm_source || ""} 
                      onChange={handleChange} 
                      placeholder="Ex: google, facebook, instagram"
                    />
                    {errors.utm_source && <p className="text-red-500 text-sm">{errors.utm_source}</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="utm_medium">UTM Medium</Label>
                    <Input 
                      id="utm_medium" 
                      name="utm_medium" 
                      value={data.utm_medium || ""} 
                      onChange={handleChange} 
                      placeholder="Ex: cpc, organic, referral"
                    />
                    {errors.utm_medium && <p className="text-red-500 text-sm">{errors.utm_medium}</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="utm_campaign">UTM Campaign</Label>
                    <Input 
                      id="utm_campaign" 
                      name="utm_campaign" 
                      value={data.utm_campaign || ""} 
                      onChange={handleChange} 
                      placeholder="Ex: spring_sale, black_friday"
                    />
                    {errors.utm_campaign && <p className="text-red-500 text-sm">{errors.utm_campaign}</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="utm_term">UTM Term</Label>
                    <Input 
                      id="utm_term" 
                      name="utm_term" 
                      value={data.utm_term || ""} 
                      onChange={handleChange} 
                      placeholder="Ex: apartamentos, venda, aluguel"
                    />
                    {errors.utm_term && <p className="text-red-500 text-sm">{errors.utm_term}</p>}
                  </div>
                  
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="utm_content">UTM Content</Label>
                    <Input 
                      id="utm_content" 
                      name="utm_content" 
                      value={data.utm_content || ""} 
                      onChange={handleChange} 
                      placeholder="Ex: banner_top, sidebar"
                    />
                    {errors.utm_content && <p className="text-red-500 text-sm">{errors.utm_content}</p>}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="notes">Observações</Label>
                  <Textarea 
                    id="notes" 
                    name="notes" 
                    value={data.notes} 
                    onChange={handleChange} 
                    rows={4}
                  />
                  {errors.notes && <p className="text-red-500 text-sm">{errors.notes}</p>}
                </div>
              </CardContent>
              
              <CardFooter className="flex justify-between border-t p-6">
                <Link href={route('client.contacts.show', contact.id)}>
                  <Button type="button" variant="outline">Cancelar</Button>
                </Link>
                <Button type="submit" disabled={processing}>
                  {processing ? 'Salvando...' : 'Atualizar Contato'}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    </ClientLayout>
  );
} 