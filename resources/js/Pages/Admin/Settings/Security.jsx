"use client";

import { useState } from 'react';
import { Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Switch } from '@/Components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Separator } from '@/Components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import { Link } from '@inertiajs/react';
import { 
  Settings, 
  FileText, 
  Shield, 
  Lock, 
  Eye, 
  KeyRound, 
  History, 
  UserPlus,
  Save
} from 'lucide-react';

export default function SecuritySettings({ auth }) {
  const [passwordSettings, setPasswordSettings] = useState({
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    expiryDays: 90,
    preventReuse: 5,
    twoFactorAuth: 'optional'
  });

  const [sessionSettings, setSessionSettings] = useState({
    sessionTimeout: 60,
    rememberMeDuration: 30,
    maxConcurrentSessions: 3,
    enforceIpCheck: true,
    enforceUserAgentCheck: true
  });

  const [accessSettings, setAccessSettings] = useState({
    loginAttempts: 5,
    lockoutDuration: 15,
    registrationOpen: true,
    requireEmailVerification: true,
    adminApprovalRequired: false
  });

  const handlePasswordChange = (field, value) => {
    setPasswordSettings({
      ...passwordSettings,
      [field]: value
    });
  };

  const handleSessionChange = (field, value) => {
    setSessionSettings({
      ...sessionSettings,
      [field]: value
    });
  };

  const handleAccessChange = (field, value) => {
    setAccessSettings({
      ...accessSettings,
      [field]: value
    });
  };

  const handleSave = (e) => {
    e.preventDefault();
    // Lógica para salvar configurações
    console.log('Configurações salvas:', { passwordSettings, sessionSettings, accessSettings });
  };

  return (
    <AdminLayout title="Configurações de Segurança">
      <Head title="Configurações de Segurança" />
      
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Configurações de Segurança</h2>
          <p className="text-muted-foreground">Gerencie as configurações de segurança da plataforma</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" asChild>
            <Link href={route('admin.settings.index')}>
              <Settings className="mr-2 h-4 w-4" />
              Configurações Gerais
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
      
      <Tabs defaultValue="passwords" className="w-full space-y-6">
        <TabsList>
          <TabsTrigger value="passwords" className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            Política de Senhas
          </TabsTrigger>
          <TabsTrigger value="sessions" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            Sessões e Timeout
          </TabsTrigger>
          <TabsTrigger value="access" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Controle de Acesso
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="passwords" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Política de Senhas</CardTitle>
              <CardDescription>
                Configure os requisitos de complexidade e políticas de segurança para senhas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="minLength">Tamanho Mínimo da Senha</Label>
                  <Input 
                    id="minLength" 
                    type="number"
                    min={6}
                    max={32}
                    value={passwordSettings.minLength} 
                    onChange={(e) => handlePasswordChange('minLength', parseInt(e.target.value))} 
                  />
                  <p className="text-xs text-muted-foreground">
                    Mínimo recomendado: 8 caracteres
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="expiryDays">Expiração de Senhas (dias)</Label>
                  <Input 
                    id="expiryDays" 
                    type="number"
                    min={0}
                    max={365}
                    value={passwordSettings.expiryDays} 
                    onChange={(e) => handlePasswordChange('expiryDays', parseInt(e.target.value))} 
                  />
                  <p className="text-xs text-muted-foreground">
                    0 = sem expiração, recomendado: 90 dias
                  </p>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Requisitos de Complexidade</h3>
                
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="requireUppercase" 
                    checked={passwordSettings.requireUppercase}
                    onCheckedChange={(checked) => handlePasswordChange('requireUppercase', checked)}
                  />
                  <Label htmlFor="requireUppercase">Exigir pelo menos uma letra maiúscula</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="requireLowercase" 
                    checked={passwordSettings.requireLowercase}
                    onCheckedChange={(checked) => handlePasswordChange('requireLowercase', checked)}
                  />
                  <Label htmlFor="requireLowercase">Exigir pelo menos uma letra minúscula</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="requireNumbers" 
                    checked={passwordSettings.requireNumbers}
                    onCheckedChange={(checked) => handlePasswordChange('requireNumbers', checked)}
                  />
                  <Label htmlFor="requireNumbers">Exigir pelo menos um número</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="requireSpecialChars" 
                    checked={passwordSettings.requireSpecialChars}
                    onCheckedChange={(checked) => handlePasswordChange('requireSpecialChars', checked)}
                  />
                  <Label htmlFor="requireSpecialChars">Exigir pelo menos um caractere especial</Label>
                </div>
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="preventReuse">Histórico de Senhas</Label>
                  <Input 
                    id="preventReuse" 
                    type="number"
                    min={0}
                    max={20}
                    value={passwordSettings.preventReuse} 
                    onChange={(e) => handlePasswordChange('preventReuse', parseInt(e.target.value))} 
                  />
                  <p className="text-xs text-muted-foreground">
                    Número de senhas anteriores que não podem ser reutilizadas (0 = desativado)
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="twoFactorAuth">Autenticação de Dois Fatores</Label>
                  <Select 
                    value={passwordSettings.twoFactorAuth}
                    onValueChange={(value) => handlePasswordChange('twoFactorAuth', value)}
                  >
                    <SelectTrigger id="twoFactorAuth">
                      <SelectValue placeholder="Selecione uma opção" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="disabled">Desativada</SelectItem>
                      <SelectItem value="optional">Opcional (recomendado)</SelectItem>
                      <SelectItem value="required">Obrigatória para todos</SelectItem>
                      <SelectItem value="admin_only">Apenas para administradores</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="sessions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Sessão</CardTitle>
              <CardDescription>
                Configure prazos de sessão e limitações de uso
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="sessionTimeout">Timeout de Sessão (minutos)</Label>
                  <Input 
                    id="sessionTimeout" 
                    type="number"
                    min={5}
                    max={1440}
                    value={sessionSettings.sessionTimeout} 
                    onChange={(e) => handleSessionChange('sessionTimeout', parseInt(e.target.value))} 
                  />
                  <p className="text-xs text-muted-foreground">
                    Tempo de inatividade até o logout automático
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="rememberMeDuration">Duração do "Lembrar-me" (dias)</Label>
                  <Input 
                    id="rememberMeDuration" 
                    type="number"
                    min={1}
                    max={365}
                    value={sessionSettings.rememberMeDuration} 
                    onChange={(e) => handleSessionChange('rememberMeDuration', parseInt(e.target.value))} 
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="maxConcurrentSessions">Sessões Simultâneas Máximas</Label>
                <Input 
                  id="maxConcurrentSessions" 
                  type="number"
                  min={1}
                  max={10}
                  value={sessionSettings.maxConcurrentSessions} 
                  onChange={(e) => handleSessionChange('maxConcurrentSessions', parseInt(e.target.value))} 
                />
                <p className="text-xs text-muted-foreground">
                  Número máximo de dispositivos ou navegadores que podem estar logados simultaneamente
                </p>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Verificações Adicionais</h3>
                
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="enforceIpCheck" 
                    checked={sessionSettings.enforceIpCheck}
                    onCheckedChange={(checked) => handleSessionChange('enforceIpCheck', checked)}
                  />
                  <Label htmlFor="enforceIpCheck">Verificar mudanças de endereço IP durante a sessão</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="enforceUserAgentCheck" 
                    checked={sessionSettings.enforceUserAgentCheck}
                    onCheckedChange={(checked) => handleSessionChange('enforceUserAgentCheck', checked)}
                  />
                  <Label htmlFor="enforceUserAgentCheck">Verificar mudanças de navegador/dispositivo durante a sessão</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="access" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Controle de Acesso</CardTitle>
              <CardDescription>
                Configure políticas de acesso e registro
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="loginAttempts">Tentativas de Login</Label>
                  <Input 
                    id="loginAttempts" 
                    type="number"
                    min={1}
                    max={10}
                    value={accessSettings.loginAttempts} 
                    onChange={(e) => handleAccessChange('loginAttempts', parseInt(e.target.value))} 
                  />
                  <p className="text-xs text-muted-foreground">
                    Número de tentativas antes do bloqueio temporário
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="lockoutDuration">Duração do Bloqueio (minutos)</Label>
                  <Input 
                    id="lockoutDuration" 
                    type="number"
                    min={5}
                    max={1440}
                    value={accessSettings.lockoutDuration} 
                    onChange={(e) => handleAccessChange('lockoutDuration', parseInt(e.target.value))} 
                  />
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Registros e Verificações</h3>
                
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="registrationOpen" 
                    checked={accessSettings.registrationOpen}
                    onCheckedChange={(checked) => handleAccessChange('registrationOpen', checked)}
                  />
                  <Label htmlFor="registrationOpen">Permitir registro de novos usuários</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="requireEmailVerification" 
                    checked={accessSettings.requireEmailVerification}
                    onCheckedChange={(checked) => handleAccessChange('requireEmailVerification', checked)}
                  />
                  <Label htmlFor="requireEmailVerification">Exigir verificação de email</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="adminApprovalRequired" 
                    checked={accessSettings.adminApprovalRequired}
                    onCheckedChange={(checked) => handleAccessChange('adminApprovalRequired', checked)}
                  />
                  <Label htmlFor="adminApprovalRequired">Exigir aprovação do administrador para novos usuários</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="mt-6 flex justify-end">
        <Button onClick={handleSave} className="flex items-center gap-2">
          <Save className="h-4 w-4" />
          Salvar Configurações de Segurança
        </Button>
      </div>
    </AdminLayout>
  );
} 