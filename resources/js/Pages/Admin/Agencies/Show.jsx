import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Separator } from '@/Components/ui/separator';
import { 
  ArrowLeft, 
  Edit, 
  CheckCircle,
  XCircle, 
  Building2, 
  Mail, 
  Phone, 
  FileText, 
  Globe,
  Users
} from 'lucide-react';

export default function AgencyShow({ agency }) {
  return (
    <AdminLayout title={`Agência: ${agency.name}`}>
      <Head title={`Agência: ${agency.name}`} />
      
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center">
          <Button variant="outline" size="sm" asChild className="mr-4">
            <Link href={route('admin.agencies.index')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Link>
          </Button>
          <div>
            <h2 className="text-2xl font-semibold">{agency.name}</h2>
            <p className="text-muted-foreground">
              Visualizando informações da agência
            </p>
          </div>
        </div>
        <Button asChild>
          <Link href={route('admin.agencies.edit', agency.id)}>
            <Edit className="mr-2 h-4 w-4" />
            Editar Agência
          </Link>
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Informações da Agência</CardTitle>
            <CardDescription>Detalhes completos da agência</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col space-y-4">
              <div className="flex flex-row items-center">
                <Badge 
                  className={`${
                    agency.is_active 
                      ? 'bg-green-100 text-green-800 hover:bg-green-100' 
                      : 'bg-red-100 text-red-800 hover:bg-red-100'
                  } flex items-center justify-center gap-1 px-3 py-1 text-sm`}
                >
                  {agency.is_active ? (
                    <>
                      <CheckCircle className="h-3.5 w-3.5" />
                      <span>Ativo</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-3.5 w-3.5" />
                      <span>Inativo</span>
                    </>
                  )}
                </Badge>
              </div>
              
              <div className="space-y-3">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Informações básicas</h3>
                  <Separator className="my-2" />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm">Email: {agency.email || 'Não informado'}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm">Telefone: {agency.phone || 'Não informado'}</span>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-sm">CNPJ/CPF: {agency.document || 'Não informado'}</span>
                </div>
                
                <div>
                  <span className="text-sm">Descrição: {agency.description || 'Sem descrição'}</span>
                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Relacionamentos</h3>
                  <Separator className="my-2" />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm">
                      Clientes: {agency.clients_count || 0}
                    </span>
                  </div>
                  
                  <div className="flex items-center">
                    <Building2 className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm">
                      Agência Pai: {agency.parent_agency ? agency.parent_agency.name : 'Agência Principal'}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Domínio</h3>
                  <Separator className="my-2" />
                </div>
                
                <div className="flex items-center">
                  <Globe className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-sm">
                    {agency.domain || 'Nenhum domínio configurado'}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Cores</CardTitle>
              <CardDescription>Cores personalizadas da agência</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {agency.primary_color && (
                <div className="flex items-center space-x-3">
                  <div 
                    className="h-6 w-6 rounded-full border" 
                    style={{ backgroundColor: agency.primary_color }}
                  />
                  <div>
                    <p className="text-sm font-medium">Cor Primária</p>
                    <p className="text-xs text-muted-foreground">{agency.primary_color}</p>
                  </div>
                </div>
              )}
              
              {agency.secondary_color && (
                <div className="flex items-center space-x-3">
                  <div 
                    className="h-6 w-6 rounded-full border" 
                    style={{ backgroundColor: agency.secondary_color }}
                  />
                  <div>
                    <p className="text-sm font-medium">Cor Secundária</p>
                    <p className="text-xs text-muted-foreground">{agency.secondary_color}</p>
                  </div>
                </div>
              )}
              
              {agency.accent_color && (
                <div className="flex items-center space-x-3">
                  <div 
                    className="h-6 w-6 rounded-full border" 
                    style={{ backgroundColor: agency.accent_color }}
                  />
                  <div>
                    <p className="text-sm font-medium">Cor de Destaque</p>
                    <p className="text-xs text-muted-foreground">{agency.accent_color}</p>
                  </div>
                </div>
              )}
              
              {!agency.primary_color && !agency.secondary_color && !agency.accent_color && (
                <p className="text-sm text-muted-foreground">Nenhuma cor personalizada definida</p>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Ações Adicionais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                <Link href={route('impersonate.agency', agency.id)}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-2 h-4 w-4"
                  >
                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                    <polyline points="10 17 15 12 10 7" />
                    <line x1="15" y1="12" x2="3" y2="12" />
                  </svg>
                  Acessar como Agência
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
} 