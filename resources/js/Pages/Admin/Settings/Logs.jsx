"use client";

import { useState, useEffect } from 'react';
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
import { FileText, Settings, Shield, Search, Download, RefreshCcw, Info, AlertCircle, AlertTriangle, XCircle, CheckCircle, UserCog, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";

export default function LogsSettings({ auth }) {
  const [filter, setFilter] = useState({
    search: '',
    type: 'all',
    level: 'all',
    dateFrom: '',
    dateTo: '',
  });
  
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    current_page: 1,
    per_page: 25,
    total: 0,
    last_page: 1
  });
  
  const [selectedLog, setSelectedLog] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  // Carregar logs do backend
  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = {
        ...filter,
        page: pagination.current_page
      };
      
      const response = await fetch(route('admin.settings.get-logs') + '?' + new URLSearchParams(params));
      const data = await response.json();
      
      if (data.success) {
        setLogs(data.data.data || []);
        setPagination({
          current_page: data.data.current_page || 1,
          per_page: data.data.per_page || 25,
          total: data.data.total || 0,
          last_page: data.data.last_page || 1
        });
      } else {
        console.error('Erro ao carregar logs:', data.message);
      }
    } catch (error) {
      console.error('Erro ao carregar logs:', error);
    } finally {
      setLoading(false);
    }
  };

  // Efeito para carregar logs ao montar o componente ou quando os filtros mudarem
  useEffect(() => {
    fetchLogs();
  }, [filter, pagination.current_page]);

  // Filtrar logs
  const handleFilterChange = (field, value) => {
    setFilter({
      ...filter,
      [field]: value
    });
    
    // Resetar para a primeira página ao mudar filtros
    setPagination(prev => ({
      ...prev,
      current_page: 1
    }));
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
  
  const downloadLogs = async () => {
    try {
      const params = {
        ...filter,
        format: 'csv'
      };
      
      window.location.href = route('admin.settings.export-logs') + '?' + new URLSearchParams(params);
    } catch (error) {
      console.error('Erro ao exportar logs:', error);
    }
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
      case 'debug':
        return (
          <Badge variant="outline" className="bg-teal-100 text-teal-800 hover:bg-teal-100">
            Debug
          </Badge>
        );
      case 'local':
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100">
            Local
          </Badge>
        );
      case 'stack':
        return (
          <Badge variant="outline" className="bg-amber-100 text-amber-800 hover:bg-amber-100">
            Stack
          </Badge>
        );
      case 'daily':
        return (
          <Badge variant="outline" className="bg-orange-100 text-orange-800 hover:bg-orange-100">
            Diário
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-800 hover:bg-gray-100">
            {type || "Desconhecido"}
          </Badge>
        );
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
          <TabsTrigger value="debug" className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            Debug
          </TabsTrigger>
        </TabsList>
        
        {['all', 'auth', 'system', 'audit', 'debug'].map((tabValue) => (
          <TabsContent key={tabValue} value={tabValue} className="space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                  <CardTitle>Logs {tabValue !== 'all' ? `de ${tabValue === 'auth' ? 'Autenticação' : tabValue === 'system' ? 'Sistema' : tabValue === 'audit' ? 'Auditoria' : 'Debug'}` : ''}</CardTitle>
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
                  {logs.length} registros encontrados
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
                        <SelectItem value="debug">Debug</SelectItem>
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
                        <TableHead className="w-[120px]">Data</TableHead>
                        <TableHead className="w-[40%]">Mensagem</TableHead>
                        <TableHead>Usuário</TableHead>
                        <TableHead>IP</TableHead>
                        <TableHead className="text-center">Tipo</TableHead>
                        <TableHead className="text-center">Nível</TableHead>
                        <TableHead className="text-center w-[80px]">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={7} className="h-24 text-center">
                            Carregando logs...
                          </TableCell>
                        </TableRow>
                      ) : logs.length > 0 ? (
                        logs
                          .filter(log => tabValue === 'all' || log.type === tabValue)
                          .map((log, index) => (
                          <TableRow key={index}>
                            <TableCell className="whitespace-nowrap text-xs">
                              {new Date(log.date).toLocaleString('pt-BR', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                                second: '2-digit'
                              })}
                            </TableCell>
                            <TableCell className="font-medium">
                              <div className="truncate max-w-md" title={log.message}>
                                {log.message}
                              </div>
                            </TableCell>
                            <TableCell className="text-sm">{log.user || '-'}</TableCell>
                            <TableCell className="text-sm">{log.ip || '-'}</TableCell>
                            <TableCell className="text-center">{getTypeBadge(log.type)}</TableCell>
                            <TableCell className="text-center">{getLevelBadge(log.level)}</TableCell>
                            <TableCell className="text-center">
                              {log.details && (
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => {
                                    setSelectedLog(log);
                                    setDetailsOpen(true);
                                  }}
                                >
                                  <Info className="h-4 w-4" />
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} className="h-24 text-center">
                            Nenhum registro encontrado.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
                
                {pagination.total > pagination.per_page && (
                  <div className="mt-4 flex justify-between items-center">
                    <div className="text-sm text-muted-foreground">
                      Exibindo {Math.min(pagination.per_page, logs.length)} de {pagination.total} resultados
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setPagination(prev => ({ ...prev, current_page: prev.current_page - 1 }))} 
                        disabled={pagination.current_page <= 1}
                      >
                        Anterior
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setPagination(prev => ({ ...prev, current_page: prev.current_page + 1 }))} 
                        disabled={pagination.current_page >= pagination.last_page}
                      >
                        Próxima
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
      
      {/* Modal de detalhes do log */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Detalhes do Log</span>
              <DialogClose asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <X className="h-4 w-4" />
                </Button>
              </DialogClose>
            </DialogTitle>
            {selectedLog && (
              <DialogDescription>
                {new Date(selectedLog.date).toLocaleString('pt-BR')} - {selectedLog.message}
              </DialogDescription>
            )}
          </DialogHeader>
          
          {selectedLog && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium mb-1">Tipo</h4>
                  <div>{getTypeBadge(selectedLog.type)}</div>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-1">Nível</h4>
                  <div>{getLevelBadge(selectedLog.level)}</div>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-1">Usuário</h4>
                  <div className="text-sm">{selectedLog.user || '-'}</div>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-1">IP</h4>
                  <div className="text-sm">{selectedLog.ip || '-'}</div>
                </div>
              </div>
              
              {selectedLog.details && (
                <div>
                  <h4 className="text-sm font-medium mb-1">Informações Completas</h4>
                  <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded text-xs font-mono whitespace-pre-wrap overflow-auto max-h-96">
                    {typeof selectedLog.details === 'string' 
                      ? (selectedLog.details.startsWith('{') 
                          ? JSON.stringify(JSON.parse(selectedLog.details), null, 2) 
                          : selectedLog.details)
                      : JSON.stringify(selectedLog.details, null, 2)
                    }
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
} 