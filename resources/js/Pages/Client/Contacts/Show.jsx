"use client";

import { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import ClientLayout from '@/Layouts/ClientLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Mail,
  Phone,
  Building,
  Briefcase,
  MapPin,
  Calendar,
  Clock,
  MessageSquare,
  Tag,
  Download,
  Share2,
  UserPlus,
  Info
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/Components/ui/table';
import { toast } from 'react-toastify';
import axios from 'axios';

export default function ContactShow({ auth, contact }) {
  const [activeTab, setActiveTab] = useState('info');
  
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  const handleDelete = () => {
    if (window.confirm(`Tem certeza que deseja excluir o contato ${contact.name}?`)) {
      axios.delete(route('client.contacts.destroy', contact.id), {
        headers: {
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
        }
      })
        .then(() => {
          toast.success('Contato excluído com sucesso!');
          window.location.href = route('client.contacts.index');
        })
        .catch(error => {
          console.error('Erro ao excluir contato:', error);
          toast.error('Erro ao excluir contato. Tente novamente ou contate o suporte.');
        });
    }
  };
  
  return (
    <ClientLayout
      user={auth.user}
      header={
        <h2 className="font-semibold text-xl text-gray-800 leading-tight">
          Detalhes do Contato
        </h2>
      }
    >
      <Head title={`Contato: ${contact.name}`} />

      <div className="py-6">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="mb-4 flex justify-between items-center">
            <Link href={route('client.contacts.index')}>
              <Button variant="outline" className="flex items-center gap-1">
                <ArrowLeft className="h-4 w-4" />
                Voltar para lista
              </Button>
            </Link>
            
            <div className="flex gap-2">
              <Link href={route('client.contacts.edit', contact.id)}>
                <Button variant="outline" className="flex items-center gap-1">
                  <Edit className="h-4 w-4" />
                  Editar
                </Button>
              </Link>
              <Button variant="destructive" className="flex items-center gap-1" onClick={handleDelete}>
                <Trash2 className="h-4 w-4" />
                Excluir
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">{contact.name}</CardTitle>
                  {contact.status && (
                    <Badge variant="outline" className="mt-1">
                      {contact.status}
                    </Badge>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  {contact.email && (
                    <div className="flex items-start gap-3">
                      <Mail className="h-4 w-4 text-gray-500 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">E-mail</h4>
                        <a href={`mailto:${contact.email}`} className="text-blue-600 hover:underline">
                          {contact.email}
                        </a>
                      </div>
                    </div>
                  )}
                  
                  {contact.phone && (
                    <div className="flex items-start gap-3">
                      <Phone className="h-4 w-4 text-gray-500 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Telefone</h4>
                        <a href={`tel:${contact.phone}`} className="text-blue-600 hover:underline">
                          {contact.phone}
                        </a>
                      </div>
                    </div>
                  )}
                  
                  {contact.whatsapp && (
                    <div className="flex items-start gap-3">
                      <Phone className="h-4 w-4 text-gray-500 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">WhatsApp</h4>
                        <a 
                          href={`https://wa.me/${contact.whatsapp.replace(/\D/g,'')}`} 
                          target="_blank"
                          className="text-green-600 hover:underline"
                        >
                          {contact.whatsapp}
                        </a>
                      </div>
                    </div>
                  )}
                  
                  {contact.company && (
                    <div className="flex items-start gap-3">
                      <Building className="h-4 w-4 text-gray-500 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Empresa</h4>
                        <p>{contact.company}</p>
                      </div>
                    </div>
                  )}
                  
                  {contact.position && (
                    <div className="flex items-start gap-3">
                      <Briefcase className="h-4 w-4 text-gray-500 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Cargo</h4>
                        <p>{contact.position}</p>
                      </div>
                    </div>
                  )}
                  
                  {(contact.address || contact.city || contact.state) && (
                    <div className="flex items-start gap-3">
                      <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Endereço</h4>
                        <p>{contact.address}</p>
                        {(contact.city || contact.state) && (
                          <p>
                            {contact.city}
                            {contact.city && contact.state ? ', ' : ''}
                            {contact.state}
                            {contact.postal_code ? ` - ${contact.postal_code}` : ''}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {contact.document && (
                    <div className="flex items-start gap-3">
                      <Info className="h-4 w-4 text-gray-500 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">CPF/CNPJ</h4>
                        <p>{contact.document}</p>
                      </div>
                    </div>
                  )}
                  
                  {contact.source && (
                    <div className="flex items-start gap-3">
                      <Tag className="h-4 w-4 text-gray-500 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Origem</h4>
                        <p>{contact.source}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="border-t pt-4">
                  <div className="w-full flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      <span className="font-medium">Criado em:</span> {formatDate(contact.created_at)}
                    </div>
                    {contact.last_interaction_at && (
                      <div className="text-sm text-gray-500">
                        <span className="font-medium">Última interação:</span> {formatDate(contact.last_interaction_at)}
                      </div>
                    )}
                  </div>
                </CardFooter>
              </Card>
              
              {contact.notes && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Observações</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="whitespace-pre-line">{contact.notes}</p>
                  </CardContent>
                </Card>
              )}
            </div>
            
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid grid-cols-3">
                      <TabsTrigger value="info">Informações</TabsTrigger>
                      <TabsTrigger value="history">Histórico</TabsTrigger>
                      <TabsTrigger value="opportunities">Oportunidades</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </CardHeader>
                
                <TabsContent value="info" className="mt-0">
                  <CardContent>
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-medium mb-2">Dados completos</h3>
                        <div className="rounded border overflow-hidden">
                          <Table>
                            <TableBody>
                              {Object.entries({
                                'Nome': contact.name,
                                'E-mail': contact.email,
                                'Telefone': contact.phone,
                                'WhatsApp': contact.whatsapp,
                                'CPF/CNPJ': contact.document,
                                'Empresa': contact.company,
                                'Cargo': contact.position,
                                'Endereço': contact.address,
                                'Cidade': contact.city,
                                'Estado': contact.state,
                                'CEP': contact.postal_code,
                                'País': contact.country,
                                'Origem': contact.source,
                                'Status': contact.status,
                                'Data de criação': formatDate(contact.created_at),
                                'Última atualização': formatDate(contact.updated_at),
                                'Última interação': formatDate(contact.last_interaction_at),
                              }).map(([key, value]) => 
                                value && (
                                  <TableRow key={key}>
                                    <TableCell className="font-medium w-1/3">{key}</TableCell>
                                    <TableCell>{value}</TableCell>
                                  </TableRow>
                                )
                              )}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                      
                      {contact.custom_fields && Object.keys(contact.custom_fields).length > 0 && (
                        <div>
                          <h3 className="text-lg font-medium mb-2">Campos personalizados</h3>
                          <div className="rounded border overflow-hidden">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Campo</TableHead>
                                  <TableHead>Valor</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {Object.entries(contact.custom_fields).map(([key, value]) => (
                                  <TableRow key={key}>
                                    <TableCell className="font-medium">{key}</TableCell>
                                    <TableCell>{value}</TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </TabsContent>
                
                <TabsContent value="history" className="mt-0">
                  <CardContent>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium">Histórico de interações</h3>
                    </div>
                    
                    {contact.interactions && contact.interactions.length > 0 ? (
                      <div className="space-y-4">
                        {contact.interactions.map((interaction) => (
                          <div key={interaction.id} className="border rounded-lg p-4">
                            <div className="flex justify-between items-start">
                              <div className="flex items-center gap-2">
                                <MessageSquare className="h-4 w-4 text-gray-500" />
                                <span className="font-medium">{interaction.channel_label}</span>
                                <Badge variant="outline" className="ml-2">
                                  {interaction.direction === 'incoming' ? 'Recebida' : 'Enviada'}
                                </Badge>
                              </div>
                              <div className="text-sm text-gray-500">
                                <Clock className="h-3 w-3 inline mr-1" />
                                {formatDate(interaction.created_at)}
                              </div>
                            </div>
                            <div className="mt-2 pl-6 whitespace-pre-line">
                              {interaction.content}
                            </div>
                            {interaction.user && (
                              <div className="mt-2 pl-6 text-sm text-gray-500">
                                Por: {interaction.user.name}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <MessageSquare className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                        <p>Nenhuma interação registrada para este contato</p>
                      </div>
                    )}
                  </CardContent>
                </TabsContent>
                
                <TabsContent value="opportunities" className="mt-0">
                  <CardContent>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium">Oportunidades</h3>
                      <Button className="flex items-center gap-1">
                        <UserPlus className="h-4 w-4" />
                        Nova Oportunidade
                      </Button>
                    </div>
                    
                    <div className="text-center py-8 text-gray-500">
                      <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                      <p>Nenhuma oportunidade registrada para este contato</p>
                    </div>
                  </CardContent>
                </TabsContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </ClientLayout>
  );
} 