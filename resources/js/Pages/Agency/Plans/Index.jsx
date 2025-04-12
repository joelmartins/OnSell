"use client";

import { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import { router, usePage } from '@inertiajs/react';
import AgencyLayout from '@/Layouts/AgencyLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/Components/ui/table";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/Components/ui/dropdown-menu";
import { Badge } from "@/Components/ui/badge";
import { 
  Search, 
  Plus, 
  MoreHorizontal, 
  Edit, 
  Eye,
  Copy,
  CheckCircle,
  XCircle,
  Trash 
} from 'lucide-react';
import { toast } from 'react-toastify';
import { Link } from '@inertiajs/react';

export default function PlansIndex({ plans = [] }) {
  const { auth } = usePage().props;
  const [search, setSearch] = useState('');
  const [filteredPlans, setFilteredPlans] = useState(plans);
  const [duplicating, setDuplicating] = useState(false);

  useEffect(() => {
    if (plans.length > 0) {
      setFilteredPlans(
        plans.filter(plan => 
          plan.name.toLowerCase().includes(search.toLowerCase()) ||
          plan.description.toLowerCase().includes(search.toLowerCase())
        )
      );
    }
  }, [search, plans]);

  const handleSearch = (e) => {
    setSearch(e.target.value);
  };

  const handleCreate = () => {
    router.visit(route('agency.plans.create'));
  };

  const handleEdit = (id) => {
    router.visit(route('agency.plans.edit', id));
  };

  const handleView = (id) => {
    router.visit(route('agency.plans.show', id));
  };

  const handleDuplicate = (id) => {
    if (duplicating) {
      return;
    }
    
    setDuplicating(true);
    toast.info('Duplicando plano, aguarde um momento...', { autoClose: 3000 });
    
    router.visit(route('agency.plans.duplicate', id), {
      onSuccess: () => {
        setDuplicating(false);
      },
      onError: (errors) => {
        setDuplicating(false);
        console.error('Erro ao duplicar plano:', errors);
        
        if (errors.error) {
          if (errors.error.includes('Unique violation') || errors.error.includes('duplicate key')) {
            toast.error('Erro ao duplicar: conflito de ID. Tente novamente em alguns instantes.');
          } else {
            toast.error(errors.error);
          }
        } else {
          toast.error('Ocorreu um erro ao duplicar o plano. Tente novamente mais tarde.');
        }
      },
      onFinish: () => {
        setDuplicating(false);
      }
    });
  };

  const handleToggleStatus = (id) => {
    router.put(route('agency.plans.toggle', id), {}, {
      onSuccess: () => {
        toast.success('Status do plano atualizado com sucesso!');
      },
      onError: () => {
        toast.error('Ocorreu um erro ao atualizar o status do plano.');
      }
    });
  };

  const handleDelete = (id) => {
    if (confirm('Tem certeza que deseja excluir este plano? Esta ação não pode ser desfeita.')) {
      router.delete(route('agency.plans.destroy', id), {
        onSuccess: () => {
          toast.success('Plano excluído com sucesso!');
        },
        onError: (errors) => {
          console.error('Erro ao excluir plano:', errors);
          if (errors.error) {
            toast.error(errors.error);
          } else {
            toast.error('Ocorreu um erro ao excluir o plano.');
          }
        }
      });
    }
  };

  return (
    <AgencyLayout title="Planos">
      <Head title="Planos" />
      
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold">Planos</h2>
          <p className="text-muted-foreground">Gerencie os planos oferecidos pela sua agência</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Plano
        </Button>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle>Todos os Planos</CardTitle>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar planos..."
                className="pl-8 w-full sm:w-64"
                value={search}
                onChange={handleSearch}
              />
            </div>
          </div>
          <CardDescription>
            Gerencie os planos que você oferece para seus clientes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Preço</TableHead>
                  <TableHead>Período</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-center">Destaque</TableHead>
                  <TableHead>Criado em</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPlans.length > 0 ? (
                  filteredPlans.map((plan) => (
                    <TableRow key={plan.id}>
                      <TableCell className="font-medium">
                        <Link
                          href={route('agency.plans.edit', { id: plan.id })}
                          className="underline text-blue-500"
                        >
                          {plan.name}
                        </Link>
                      </TableCell>
                      <TableCell>{plan.description}</TableCell>
                      <TableCell>
                        {typeof plan.price === 'string' && plan.price.startsWith('R$') 
                          ? plan.price 
                          : `R$ ${typeof plan.price === 'number' 
                              ? plan.price.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2}) 
                              : parseFloat(plan.price).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`
                        }
                      </TableCell>
                      <TableCell>
                        {plan.period === 'monthly' && 'Mensal'}
                        {plan.period === 'quarterly' && 'Trimestral'}
                        {plan.period === 'semiannual' && 'Semestral'}
                        {plan.period === 'annual' && 'Anual'}
                        {plan.period === 'lifetime' && 'Vitalício'}
                      </TableCell>
                      <TableCell className="text-center">
                        {plan.is_active ? (
                          <Badge variant="success">Ativo</Badge>
                        ) : (
                          <Badge variant="destructive">Inativo</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {plan.is_featured ? (
                          <Badge variant="outline" className="bg-amber-100 text-amber-800 hover:bg-amber-100">Destacado</Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {new Date(plan.created_at).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Abrir menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Ações</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleView(plan.id)}>
                              <Eye className="mr-2 h-4 w-4" />
                              <span>Visualizar</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEdit(plan.id)}>
                              <Edit className="mr-2 h-4 w-4" />
                              <span>Editar</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDuplicate(plan.id)}
                              disabled={duplicating}
                            >
                              <Copy className="mr-2 h-4 w-4" />
                              <span>{duplicating ? 'Duplicando...' : 'Duplicar'}</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleToggleStatus(plan.id)}>
                              {plan.is_active ? (
                                <>
                                  <XCircle className="mr-2 h-4 w-4" />
                                  <span>Desativar</span>
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  <span>Ativar</span>
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleDelete(plan.id)}
                              className="text-red-600 focus:text-red-600"
                            >
                              <Trash className="mr-2 h-4 w-4" />
                              <span>Excluir</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                      {search ? 'Nenhum plano encontrado para a busca.' : 'Nenhum plano cadastrado.'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </AgencyLayout>
  );
} 