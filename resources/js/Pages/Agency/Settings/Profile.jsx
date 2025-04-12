"use client";

import { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AgencyLayout from '@/Layouts/AgencyLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Label } from '@/Components/ui/label';
import { Input } from '@/Components/ui/input';
import { toast } from 'react-toastify';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/Components/ui/tabs";
import { AlertCircle, Phone } from 'lucide-react';
import { PhoneInput } from '@/Components/ui/phone-input';

export default function Profile({ auth, mustVerifyEmail, status, user }) {
  const [activeTab, setActiveTab] = useState('profile');
  
  const { data, setData, patch, errors, processing, recentlySuccessful } = useForm({
    name: user.name,
    email: user.email,
    phone: user.phone || '',
    phone_country: user.phone_country || '+55',
  });

  const { data: passwordData, setData: setPasswordData, reset, processing: passwordProcessing, errors: passwordErrors, put } = useForm({
    current_password: '',
    password: '',
    password_confirmation: '',
  });

  const updateProfile = (e) => {
    e.preventDefault();

    patch(route('agency.settings.update-profile'), {
      onSuccess: () => {
        toast.success('Perfil atualizado com sucesso!');
      },
      onError: (errors) => {
        console.error(errors);
        toast.error('Erro ao atualizar perfil.');
      }
    });
  };

  const updatePassword = (e) => {
    e.preventDefault();

    put(route('agency.settings.update-password'), {
      preserveScroll: true,
      onSuccess: () => {
        reset();
        toast.success('Senha atualizada com sucesso!');
      },
      onError: (errors) => {
        console.error(errors);
        toast.error('Erro ao atualizar senha.');
      }
    });
  };

  return (
    <AgencyLayout title="Perfil do Usuário">
      <Head title="Perfil do Usuário" />

      <div className="mb-8">
        <h2 className="text-2xl font-semibold">Perfil do Usuário</h2>
        <p className="text-muted-foreground">Gerencie suas informações pessoais e senha</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="profile">Informações Pessoais</TabsTrigger>
          <TabsTrigger value="password">Alterar Senha</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Informações Pessoais</CardTitle>
              <CardDescription>
                Atualize seu nome, e-mail e telefone
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={updateProfile} className="space-y-6">
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Nome</Label>
                    <Input 
                      id="name"
                      type="text"
                      value={data.name}
                      onChange={(e) => setData('name', e.target.value)}
                      className={errors.name ? 'border-red-500' : ''}
                    />
                    {errors.name && 
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.name}
                      </p>
                    }
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="email">E-mail</Label>
                    <Input 
                      id="email"
                      type="email"
                      value={data.email}
                      onChange={(e) => setData('email', e.target.value)}
                      className={errors.email ? 'border-red-500' : ''}
                    />
                    {errors.email && 
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.email}
                      </p>
                    }
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="phone" className="flex items-center gap-1">
                      <Phone className="h-4 w-4" />
                      Telefone
                    </Label>
                    <PhoneInput 
                      id="phone"
                      name="phone"
                      value={data.phone}
                      country={data.phone_country}
                      onValueChange={(value) => setData('phone', value)}
                      onCountryChange={(code) => setData('phone_country', code)}
                      error={errors.phone}
                    />
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  disabled={processing}
                >
                  Salvar Alterações
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="password">
          <Card>
            <CardHeader>
              <CardTitle>Alterar Senha</CardTitle>
              <CardDescription>
                Altere sua senha para manter sua conta segura
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={updatePassword} className="space-y-6">
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="current_password">Senha Atual</Label>
                    <Input 
                      id="current_password"
                      type="password"
                      value={passwordData.current_password}
                      onChange={(e) => setPasswordData('current_password', e.target.value)}
                      className={passwordErrors.current_password ? 'border-red-500' : ''}
                    />
                    {passwordErrors.current_password && 
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {passwordErrors.current_password}
                      </p>
                    }
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="password">Nova Senha</Label>
                    <Input 
                      id="password"
                      type="password"
                      value={passwordData.password}
                      onChange={(e) => setPasswordData('password', e.target.value)}
                      className={passwordErrors.password ? 'border-red-500' : ''}
                    />
                    {passwordErrors.password && 
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {passwordErrors.password}
                      </p>
                    }
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="password_confirmation">Confirmar Nova Senha</Label>
                    <Input 
                      id="password_confirmation"
                      type="password"
                      value={passwordData.password_confirmation}
                      onChange={(e) => setPasswordData('password_confirmation', e.target.value)}
                    />
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  disabled={passwordProcessing}
                >
                  Alterar Senha
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AgencyLayout>
  );
} 