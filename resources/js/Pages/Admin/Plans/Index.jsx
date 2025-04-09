"use client";

import { useState, useEffect } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import { Badge } from '@/Components/ui/badge';
import { 
  Plus, 
  Search, 
  Edit, 
  Copy,
  CheckCircle,
  XCircle,
  Users,
  Database,
  MessageSquare,
  Building2,
  User,
  Trash2,
  AlertTriangle,
  Star,
  LayoutTemplate
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/Components/ui/dropdown-menu';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/Components/ui/select';
import { toast } from 'react-toastify';

export default function PlansIndex({ auth, plans, filters }) {
  const page = usePage();
  const flash = page.props.flash || {};
  const [search, setSearch] = useState(filters?.search || '');
  const [planTypeFilter, setPlanTypeFilter] = useState(filters?.type || 'all');
  const [statusFilter, setStatusFilter] = useState(filters?.status || 'all');
  const [featuredFilter, setFeaturedFilter] = useState(filters?.featured || 'all');
  
  useEffect(() => {
    if (flash && flash.success) {
      toast.success(flash.success);
    }
    
    if (flash && flash.error) {
      toast.error(flash.error);
    }
  }, [flash]);
  
  const applyFilters = () => {
    router.get(route('admin.plans.index'), {
      search: search || undefined,
      type: planTypeFilter !== 'all' ? planTypeFilter : undefined,
      status: statusFilter !== 'all' ? statusFilter : undefined,
      featured: featuredFilter !== 'all' ? featuredFilter : undefined,
    }, {
      preserveState: true,
      replace: true
    });
  };
  
  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };
  
  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      applyFilters();
    }
  };
  
  const handleTypeFilterChange = (value) => {
    setPlanTypeFilter(value);
    router.get(route('admin.plans.index'), {
      search: search || undefined,
      type: value !== 'all' ? value : undefined,
      status: statusFilter !== 'all' ? statusFilter : undefined,
      featured: featuredFilter !== 'all' ? featuredFilter : undefined,
    }, {
      preserveState: true,
      replace: true
    });
  };
  
  const handleStatusFilterChange = (value) => {
    setStatusFilter(value);
    router.get(route('admin.plans.index'), {
      search: search || undefined,
      type: planTypeFilter !== 'all' ? planTypeFilter : undefined,
      status: value !== 'all' ? value : undefined,
      featured: featuredFilter !== 'all' ? featuredFilter : undefined,
    }, {
      preserveState: true,
      replace: true
    });
  };
  
  const handleFeaturedFilterChange = (value) => {
    setFeaturedFilter(value);
    router.get(route('admin.plans.index'), {
      search: search || undefined,
      type: planTypeFilter !== 'all' ? planTypeFilter : undefined,
      status: statusFilter !== 'all' ? statusFilter : undefined,
      featured: value !== 'all' ? value : undefined,
    }, {
      preserveState: true,
      replace: true
    });
  };
  
  const handleToggleStatus = (plan) => {
    router.put(route('admin.plans.toggle', plan.id));
  };
  
  const handleToggleFeatured = (plan) => {
    router.put(route('admin.plans.toggle-featured', plan.id));
  };
  
  const confirmDelete = (plan) => {
    if (plan.clients_count > 0) {
      toast.error(`Não é possível excluir o plano "${plan.name}" pois possui ${plan.clients_count} cliente(s) associado(s).`);
      return;
    }
    
    if (confirm(`Tem certeza que deseja excluir o plano "${plan.name}"? Esta ação não poderá ser desfeita.`)) {
      router.delete(route('admin.plans.destroy', plan.id));
    }
  };

  return (
    <AdminLayout title="Gerenciamento de Planos">
      <Head title="Gerenciamento de Planos" />
      
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold">Planos do Sistema</h2>
          <p className="text-muted-foreground">Gerencie os planos disponíveis na plataforma</p>
        </div>
        <Button asChild>
          <Link href={route('admin.plans.create')}>
            <Plus className="mr-2 h-4 w-4" /> Novo Plano
          </Link>
        </Button>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle>Planos do Sistema</CardTitle>
            <div className="flex flex-col sm:flex-row gap-2">
              <Select value={planTypeFilter} onValueChange={handleTypeFilterChange}>
                <SelectTrigger className="w-full sm:w-[160px]">
                  <SelectValue placeholder="Tipo de plano" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os planos</SelectItem>
                  <SelectItem value="client">Para clientes</SelectItem>
                  <SelectItem value="agency">Para agências</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
                <SelectTrigger className="w-full sm:w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="active">Ativos</SelectItem>
                  <SelectItem value="inactive">Inativos</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={featuredFilter} onValueChange={handleFeaturedFilterChange}>
                <SelectTrigger className="w-full sm:w-[140px]">
                  <SelectValue placeholder="Destaque" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="featured">Em destaque</SelectItem>
                  <SelectItem value="not-featured">Sem destaque</SelectItem>
                </SelectContent>
              </Select>
              
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar planos..."
                  className="pl-8 w-full sm:w-64"
                  value={search}
                  onChange={handleSearchChange}
                  onKeyDown={handleSearchKeyDown}
                />
              </div>
            </div>
          </div>
          <CardDescription>
            Um total de {plans.length} planos do sistema configurados na plataforma.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Preço</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Destaque</TableHead>
                  <TableHead>Recursos</TableHead>
                  <TableHead>Clientes</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {plans.length > 0 ? (
                  plans.map((plan) => (
                    <TableRow key={plan.id}>
                      <TableCell className="font-medium">
                        {plan.name}
                        {plan.description && (
                          <p className="text-xs text-muted-foreground truncate max-w-[250px]">{plan.description}</p>
                        )}
                      </TableCell>
                      <TableCell>
                        {typeof plan.price === 'string' && plan.price.startsWith('R$') 
                          ? plan.price 
                          : `R$ ${typeof plan.price === 'number' 
                              ? plan.price.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2}) 
                              : parseFloat(plan.price).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`
                        }
                      </TableCell>
                      <TableCell>
                        {plan.is_agency_plan ? (
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-50">
                            <Building2 className="h-3 w-3 mr-1" />
                            Para Agências
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-purple-50 text-purple-700 hover:bg-purple-50">
                            <User className="h-3 w-3 mr-1" />
                            Para Clientes
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {plan.is_active ? (
                          <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Ativo
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-red-50 text-red-700 hover:bg-red-50">
                            <XCircle className="h-3 w-3 mr-1" />
                            Inativo
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {plan.is_featured ? (
                          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 hover:bg-yellow-50">
                            <Star className="h-3 w-3 mr-1 fill-yellow-500" />
                            Destaque
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            Não destacado
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <span className="inline-flex items-center text-xs">
                            <Database className="h-3 w-3 mr-1" />
                            {plan.monthly_leads || plan.features?.leads || 0} leads mensais
                          </span>
                          <span className="inline-flex items-center text-xs">
                            <Star className="h-3 w-3 mr-1" />
                            {plan.total_leads || plan.features?.total_leads || 0} leads totais
                          </span>
                          <span className="inline-flex items-center text-xs">
                            <LayoutTemplate className="h-3 w-3 mr-1" />
                            {plan.max_landing_pages || plan.features?.landing_pages || 0} landing pages
                          </span>
                          <span className="inline-flex items-center text-xs">
                            <MessageSquare className="h-3 w-3 mr-1" />
                            {plan.max_pipelines || plan.features?.pipelines || 0} pipelines
                          </span>
                          <span className="inline-flex items-center text-xs">
                            <Users className="h-3 w-3 mr-1" />
                            {plan.features?.users || 1} usuários
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={plan.clients_count > 0 ? "secondary" : "outline"}>
                          {plan.clients_count}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="sm">
                                Ações
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link href={route('admin.plans.edit', plan.id)}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Editar
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href={route('admin.plans.duplicate', plan.id)}>
                                  <Copy className="h-4 w-4 mr-2" />
                                  Duplicar
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleToggleFeatured(plan)}>
                                {plan.is_featured ? (
                                  <>
                                    <Star className="h-4 w-4 mr-2" />
                                    Remover destaque
                                  </>
                                ) : (
                                  <>
                                    <Star className="h-4 w-4 mr-2 fill-yellow-500" />
                                    Marcar como destaque
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleToggleStatus(plan)}>
                                {plan.is_active ? (
                                  <>
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Inativar
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Ativar
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => confirmDelete(plan)}
                                className={plan.clients_count > 0 ? "text-gray-400" : "text-red-600"}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Excluir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-4 text-muted-foreground">
                      Nenhum plano encontrado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </AdminLayout>
  );
} 