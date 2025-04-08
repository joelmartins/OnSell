"use client";

import { useState } from 'react';
import { Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Link } from '@inertiajs/react';
import { FileText, Settings, Shield, Search, Download, RefreshCcw, Info, AlertCircle, AlertTriangle, XCircle, CheckCircle, UserCog } from 'lucide-react';

export default function LogsSettings({ auth }) {
  const [filter, setFilter] = useState({
    search: '',
    type: 'all',
    level: 'all',
    dateFrom: '',
    dateTo: '',
  });

  // Dados de exemplo para logs
  const generateLogs = () => {
    const types = ['auth', 'system', 'user', 'audit'];
    const levels = ['info', 'warning', 'error', 'critical'];
    const actions = [
      'Login realizado com sucesso',
      'Tentativa de login falhou',
      'Usuário criado',
      'Usuário atualizado',
      'Arquivo removido',
      'Banco de dados atualizado',
      'Senha redefinida',
      'Impersonação iniciada',
      'Impersonação finalizada',
      'Configuração alterada',
      'Backup realizado',
      'Erro no sistema',
      'Importação concluída',
      'Exportação concluída',
      'API acessada',
      'Limite de requisições excedido'
    ];
    const users = ['admin@onsell.com.br', 'gerente@onsell.com.br', 'suporte@onsell.com.br', 'sistema@onsell.com.br'];
    const ips = ['192.168.1.1', '189.123.45.67', '177.98.76.54', '201.45.67.89', '8.8.8.8'];
    
    const getRandomDate = () => {
      const start = new Date('2025-03-01');
      const end = new Date();
      return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    };
    
    return Array.from({ length: 50 }, (_, i) => {
      const type = types[Math.floor(Math.random() * types.length)];
      const level = levels[Math.floor(Math.random() * levels.length)];
      const date = getRandomDate();
      const user = users[Math.floor(Math.random() * users.length)];
      const ip = ips[Math.floor(Math.random() * ips.length)];
      const action = actions[Math.floor(Math.random() * actions.length)];
      
      return {
        id: i + 1,
        date,
        type,
        level,
        user,
        ip,
        action,
        details: JSON.stringify({
          browser: 'Chrome 94.0.4606.81',
          os: 'Windows 10',
          requestData: { page: 1, limit: 10 }
        }, null, 2)
      };
    }).sort((a, b) => b.date - a.date);
  };
  
  const logs = generateLogs();
  
  // Filtrar logs
  const filteredLogs = logs.filter(log => {
    // Filtro por termo de busca
    if (filter.search && 
        !log.action.toLowerCase().includes(filter.search.toLowerCase()) &&
        !log.user.toLowerCase().includes(filter.search.toLowerCase()) &&
        !log.ip.toLowerCase().includes(filter.search.toLowerCase())) {
      return false;
    }
    
    // Filtro por tipo
    if (filter.type !== 'all' && log.type !== filter.type) {
      return false;
    }
    
    // Filtro por nível
    if (filter.level !== 'all' && log.level !== filter.level) {
      return false;
    }
    
    // Filtro por data de início
    if (filter.dateFrom && new Date(filter.dateFrom) > log.date) {
      return false;
    }
    
    // Filtro por data de fim
    if (filter.dateTo && new Date(filter.dateTo) < log.date) {
      return false;
    }
    
    return true;
  });
  
  const handleFilterChange = (field, value) => {
    setFilter({
      ...filter,
      [field]: value
    });
  };
  
  const resetFilters = () => {
    setFilter({
      search: '',
      type: 'all',
      level: 'all',
      dateFrom: '',
      dateTo: '',
    });
  };
  
  const downloadLogs = () => {
    console.log('Downloading logs...');
    // Implementação real: converter logs para CSV ou JSON e baixar
  };
  
  const getLevelBadge = (level) => {
    switch (level) {
      case 'info':
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100 flex items-center gap-1">
            <Info className="h-3.5 w-3.5" />
            <span>Informação</span>
          </Badge>
        );
      case 'warning':
        return (
          <Badge variant="outline" className="bg-amber-100 text-amber-800 hover:bg-amber-100 flex items-center gap-1">
            <AlertTriangle className="h-3.5 w-3.5" />
            <span>Alerta</span>
          </Badge>
        );
      case 'error':
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100 flex items-center gap-1">
            <AlertCircle className="h-3.5 w-3.5" />
            <span>Erro</span>
          </Badge>
        );
      case 'critical':
        return (
          <Badge variant="outline" className="bg-red-200 text-red-900 hover:bg-red-200 flex items-center gap-1">
            <XCircle className="h-3.5 w-3.5" />
            <span>Crítico</span>
          </Badge>
        );
      default:
        return null;
    }
  };
  
  const getTypeBadge = (type) => {
    switch (type) {
      case 'auth':
        return (
          <Badge variant="outline" className="bg-purple-100 text-purple-800 hover:bg-purple-100">
            Autenticação
          </Badge>
        );
      case 'system':
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-800 hover:bg-gray-100">
            Sistema
          </Badge>
        );
      case 'user':
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
            Usuário
          </Badge>
        );
      case 'audit':
        return (
          <Badge variant="outline" className="bg-indigo-100 text-indigo-800 hover:bg-indigo-100">
            Auditoria
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <AdminLayout title="Logs do Sistema">
      <Head title="Logs do Sistema" />
      
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Logs do Sistema</h2>
          <p className="text-muted-foreground">Visualize e analise os registros de atividade do sistema</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" asChild>
            <Link href={route('admin.settings.index')}>
              <Settings className="mr-2 h-4 w-4" />
              Configurações Gerais
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={route('admin.settings.security')}>
              <Shield className="mr-2 h-4 w-4" />
              Segurança
            </Link>
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="all" className="w-full space-y-6">
        <TabsList>
          <TabsTrigger value="all" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Todos os Logs
          </TabsTrigger>
          <TabsTrigger value="auth" className="flex items-center gap-2">
            <UserCog className="h-4 w-4" />
            Autenticação
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Sistema
          </TabsTrigger>
          <TabsTrigger value="audit" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Auditoria
          </TabsTrigger>
        </TabsList>
        
        {['all', 'auth', 'system', 'audit'].map((tabValue) => (
          <TabsContent key={tabValue} value={tabValue} className="space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                  <CardTitle>Logs {tabValue !== 'all' ? `de ${tabValue === 'auth' ? 'Autenticação' : tabValue === 'system' ? 'Sistema' : 'Auditoria'}` : ''}</CardTitle>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={resetFilters} size="sm" className="flex items-center gap-1">
                      <RefreshCcw className="h-4 w-4" />
                      Limpar Filtros
                    </Button>
                    <Button variant="outline" onClick={downloadLogs} size="sm" className="flex items-center gap-1">
                      <Download className="h-4 w-4" />
                      Exportar
                    </Button>
                  </div>
                </div>
                <CardDescription>
                  {filteredLogs.length} registros encontrados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div className="space-y-2">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="search"
                        placeholder="Procurar nos logs..."
                        className="pl-8"
                        value={filter.search}
                        onChange={(e) => handleFilterChange('search', e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Select 
                      value={filter.type}
                      onValueChange={(value) => handleFilterChange('type', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Tipo de Log" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos os tipos</SelectItem>
                        <SelectItem value="auth">Autenticação</SelectItem>
                        <SelectItem value="system">Sistema</SelectItem>
                        <SelectItem value="user">Usuário</SelectItem>
                        <SelectItem value="audit">Auditoria</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Select 
                      value={filter.level}
                      onValueChange={(value) => handleFilterChange('level', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Nível" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos os níveis</SelectItem>
                        <SelectItem value="info">Informação</SelectItem>
                        <SelectItem value="warning">Alerta</SelectItem>
                        <SelectItem value="error">Erro</SelectItem>
                        <SelectItem value="critical">Crítico</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Input
                        type="date"
                        value={filter.dateFrom}
                        onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                        placeholder="Data inicial"
                      />
                    </div>
                    <div>
                      <Input
                        type="date"
                        value={filter.dateTo}
                        onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                        placeholder="Data final"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[100px]">Data</TableHead>
                        <TableHead>Ação</TableHead>
                        <TableHead>Usuário</TableHead>
                        <TableHead>IP</TableHead>
                        <TableHead className="text-center">Tipo</TableHead>
                        <TableHead className="text-center">Nível</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredLogs.length > 0 ? (
                        filteredLogs
                          .filter(log => tabValue === 'all' || log.type === tabValue)
                          .slice(0, 25)
                          .map((log) => (
                          <TableRow key={log.id}>
                            <TableCell className="whitespace-nowrap">
                              {log.date.toLocaleString('pt-BR', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </TableCell>
                            <TableCell className="font-medium">{log.action}</TableCell>
                            <TableCell>{log.user}</TableCell>
                            <TableCell>{log.ip}</TableCell>
                            <TableCell className="text-center">{getTypeBadge(log.type)}</TableCell>
                            <TableCell className="text-center">{getLevelBadge(log.level)}</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="h-24 text-center">
                            Nenhum registro encontrado.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
                
                {filteredLogs.length > 25 && (
                  <div className="mt-4 text-center text-sm text-muted-foreground">
                    Exibindo 25 de {filteredLogs.length} resultados. Refine sua busca para ver mais registros.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </AdminLayout>
  );
} 