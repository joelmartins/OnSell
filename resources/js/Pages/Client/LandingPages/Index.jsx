import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import ClientLayout from '@/Layouts/ClientLayout';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/Components/ui/dropdown-menu';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/Components/ui/table';
import { Badge } from '@/Components/ui/badge';
import { Input } from '@/Components/ui/input';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/Components/ui/alert-dialog';
import { Plus, Search, MoreHorizontal, Edit, Trash, Eye, Copy } from 'lucide-react';

export default function LandingPagesIndex({ landingPages = [], remainingPages }) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [landingPageToDelete, setLandingPageToDelete] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLandingPages = landingPages.filter(
    page => page.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const confirmDelete = (landingPage) => {
    setLandingPageToDelete(landingPage);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = () => {
    // Implementar a exclusão via Inertia
    // router.delete(route('client.landing-pages.destroy', landingPageToDelete.id));
    setIsDeleteDialogOpen(false);
  };

  return (
    <ClientLayout>
      <Head title="Landing Pages" />
      
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Landing Pages</h1>
            <p className="text-gray-500">Gerencie suas páginas de captura</p>
          </div>
          <div className="flex gap-2">
            <Badge variant="outline" className="text-sm">
              Restantes: {remainingPages}
            </Badge>
            <Button asChild>
              <Link href={route('client.landing-pages.create')}>
                <Plus className="mr-2 h-4 w-4" /> Nova Landing Page
              </Link>
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex justify-between">
              <CardTitle>Suas Landing Pages</CardTitle>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Buscar landing page..."
                  className="pl-8 w-64"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <CardDescription>
              Gerencie todas as suas páginas de captura em um só lugar
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredLandingPages.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Leads Capturados</TableHead>
                    <TableHead>Taxa de Conversão</TableHead>
                    <TableHead>Criada em</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLandingPages.map((page) => (
                    <TableRow key={page.id}>
                      <TableCell className="font-medium">{page.name}</TableCell>
                      <TableCell>
                        <Badge variant={page.is_active ? "success" : "secondary"}>
                          {page.is_active ? "Ativa" : "Inativa"}
                        </Badge>
                      </TableCell>
                      <TableCell>{page.leads_count}</TableCell>
                      <TableCell>{page.conversion_rate}%</TableCell>
                      <TableCell>{page.created_at}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Abrir menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Ações</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                              <Link href={route('client.landing-pages.preview', page.id)}>
                                <Eye className="mr-2 h-4 w-4" /> Visualizar
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={route('client.landing-pages.edit', page.id)}>
                                <Edit className="mr-2 h-4 w-4" /> Editar
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={route('client.landing-pages.duplicate', page.id)}>
                                <Copy className="mr-2 h-4 w-4" /> Duplicar
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-red-600" 
                              onClick={() => confirmDelete(page)}
                            >
                              <Trash className="mr-2 h-4 w-4" /> Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="rounded-full bg-gray-100 p-3 mb-4">
                  <Plus className="h-6 w-6 text-gray-500" />
                </div>
                <h3 className="text-lg font-medium mb-1">Nenhuma landing page encontrada</h3>
                <p className="text-gray-500 text-center mb-4">
                  {searchQuery 
                    ? "Nenhuma landing page corresponde à sua busca. Tente outros termos."
                    : "Você ainda não criou nenhuma landing page. Crie a primeira agora!"}
                </p>
                {!searchQuery && (
                  <Button asChild>
                    <Link href={route('client.landing-pages.create')}>
                      <Plus className="mr-2 h-4 w-4" /> Criar Landing Page
                    </Link>
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Você tem certeza que deseja excluir a landing page 
              "{landingPageToDelete?.name}"? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ClientLayout>
  );
} 