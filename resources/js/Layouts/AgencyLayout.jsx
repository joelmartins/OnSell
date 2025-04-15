import { useState, useEffect } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/Components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/Components/ui/dropdown-menu';
import { 
  LayoutDashboard, 
  Users, 
  Palette, 
  PackageOpen, 
  Settings, 
  Menu, 
  LogOut,
  ChevronRight,
  FileText,
  User,
  Database,
  CreditCard,
} from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/Components/ui/collapsible";
import ImpersonationDropdown from '@/Components/ImpersonationDropdown';
import { cn } from '@/lib/utils';

export default function AgencyLayout({ children, title }) {
  const { auth, impersonation } = usePage().props;
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isImpersonating, setIsImpersonating] = useState(false);
  const [impersonateData, setImpersonateData] = useState(null);
  const [openMenus, setOpenMenus] = useState({});

  // Get current route name to highlight active links
  const currentRoute = route().current();

  const toggleMenu = (menuKey) => {
    setOpenMenus(prev => ({
      ...prev,
      [menuKey]: !prev[menuKey]
    }));
  };

  useEffect(() => {
    // Verificar se existe impersonação ativa nos dados da página
    if (impersonation?.active && impersonation?.target) {
      const newImpersonationData = {
        id: impersonation.target.id,
        name: impersonation.target.name,
        type: impersonation.target.type
      };
      
      // Atualizar os dados no sessionStorage
      sessionStorage.setItem('impersonate.data', JSON.stringify(newImpersonationData));
      setImpersonateData(newImpersonationData);
      setIsImpersonating(true);
    } else {
      // Verificar dados no sessionStorage como fallback
      const impersonateData = sessionStorage.getItem('impersonate.data');
      setIsImpersonating(!!impersonateData);
      
      if (impersonateData) {
        try {
          setImpersonateData(JSON.parse(impersonateData));
        } catch (e) {
          console.error('Erro ao analisar dados de impersonação:', e);
        }
      }
    }

    // Auto-expandir menu de configurações se estiver em uma página de configurações
    if (currentRoute?.startsWith('agency.settings.')) {
      setOpenMenus(prev => ({ ...prev, settings: true }));
    }
  }, [impersonation, currentRoute]);

  const sidebarItems = [
    { label: 'Dashboard', icon: <LayoutDashboard className="h-5 w-5" />, href: route('agency.dashboard') },
    { label: 'Clientes', icon: <Users className="h-5 w-5" />, href: route('agency.clients.index') },
    { label: 'Usuários', icon: <Users className="h-5 w-5" />, href: route('agency.users.index') },
    { label: 'White Label', icon: <Palette className="h-5 w-5" />, href: route('agency.branding.index') },
    { label: 'Planos', icon: <PackageOpen className="h-5 w-5" />, href: route('agency.plans.index') },
    { 
      key: 'settings',
      label: 'Configurações', 
      icon: <Settings className="h-5 w-5" />, 
      children: [
        { label: 'Geral', icon: <Settings className="h-4 w-4" />, href: route('agency.settings.index') },
        { label: 'Perfil', icon: <User className="h-4 w-4" />, href: route('agency.settings.profile') },
        { label: 'Cobrança e Assinatura', icon: <CreditCard className="h-4 w-4" />, href: route('agency.settings.billing') },
      ]
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Mobile sidebar */}
      <div className="lg:hidden fixed top-0 w-full bg-white dark:bg-gray-800 border-b z-40 py-3 px-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)}>
              <Menu className="h-6 w-6" />
            </Button>
            <h1 className="ml-3 text-xl font-semibold">{title || 'Agência'}</h1>
          </div>
          <ProfileDropdown user={auth.user} />
        </div>
      </div>

      {/* Sidebar */}
      <div className={`fixed top-0 left-0 z-50 h-full w-64 bg-white dark:bg-gray-800 border-r transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="p-4 flex items-center justify-between border-b">
            <img src="/img/onsell_logo.svg" alt="OnSell" className="h-8" />
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(false)}>
              <Menu className="h-5 w-5" />
            </Button>
          </div>
          
          {/* Banner de impersonação na sidebar */}
          {isImpersonating && (
            <div className="bg-amber-100 dark:bg-amber-800/30 p-3 border-b">
              <div className="flex items-center text-amber-800 dark:text-amber-300 text-sm">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-2 flex-shrink-0">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                </svg>
                <span className="font-medium">
                  {impersonateData?.name 
                    ? `Impersonando: ${impersonateData.name}` 
                    : 'Impersonando agência'}
                </span>
              </div>
              <Button 
                variant="outline"
                size="sm"
                className="w-full mt-2 bg-amber-200/50 dark:bg-amber-700/50 border-amber-300 dark:border-amber-600 text-amber-800 dark:text-amber-200 hover:bg-amber-200 dark:hover:bg-amber-700"
                onClick={() => {
                  router.visit(route('stop.impersonating'), {
                    onSuccess: (page) => {
                      // Após sair, verificar se ainda há impersonação ativa
                      if (page.props.impersonation?.active) {
                        // Se ainda estiver impersonando (voltou para o nível anterior de uma cascata)
                        const newImpersonationData = {
                          id: page.props.impersonation.target.id,
                          name: page.props.impersonation.target.name,
                          type: page.props.impersonation.target.type
                        };
                        sessionStorage.setItem('impersonate.data', JSON.stringify(newImpersonationData));
                      } else {
                        // Se não estiver mais impersonando, limpar os dados
                        sessionStorage.removeItem('impersonate.data');
                      }
                    }
                  });
                }}
              >
                Sair da impersonação
              </Button>
            </div>
          )}
          
          <div className="overflow-y-auto flex-1 py-4">
            <nav className="space-y-1 px-2">
              {sidebarItems.map((item, index) => {
                const isActive = currentRoute === route().current(item.href);
                
                return (
                  <div key={index}>
                    {item.children ? (
                      <Collapsible
                        open={openMenus[item.key]}
                        onOpenChange={() => toggleMenu(item.key)}
                        className="w-full"
                      >
                        <CollapsibleTrigger asChild>
                          <Button
                            variant="ghost"
                            className={cn(
                              "w-full justify-between px-3 py-2 text-sm font-medium",
                              currentRoute?.startsWith(`agency.${item.key}`) && "bg-gray-100 dark:bg-gray-700"
                            )}
                          >
                            <div className="flex items-center">
                              {item.icon}
                              <span className="ml-3">{item.label}</span>
                            </div>
                            <ChevronRight className={cn(
                              "h-4 w-4 transition-transform duration-200",
                              openMenus[item.key] ? "rotate-90" : ""
                            )} />
                          </Button>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="pl-4">
                          <div className="mt-1 pl-2 border-l border-gray-200 dark:border-gray-700 space-y-1">
                            {item.children.map((subItem, subIndex) => {
                              const isSubActive = currentRoute === route().current(subItem.href);
                              
                              return (
                                <Link
                                  key={subIndex}
                                  href={subItem.href}
                                  className={cn(
                                    "flex items-center px-3 py-2 text-sm rounded-md transition-colors",
                                    isSubActive
                                      ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300"
                                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                                  )}
                                >
                                  {subItem.icon}
                                  <span className="ml-3">{subItem.label}</span>
                                </Link>
                              );
                            })}
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    ) : (
                      <Link
                        href={item.href}
                        className={cn(
                          "flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100 dark:hover:bg-gray-700",
                          isActive && "bg-gray-100 dark:bg-gray-700"
                        )}
                      >
                        {item.icon}
                        <span className="ml-3">{item.label}</span>
                      </Link>
                    )}
                  </div>
                );
              })}
              
              {/* Dropdown de impersonação */}
              {auth.user?.roles?.includes('agency.owner') && (
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <ImpersonationDropdown />
                </div>
              )}
            </nav>
          </div>
          <div className="p-4 border-t">
            <ProfileDropdown user={auth.user} />
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Desktop header */}
        <div className="hidden lg:flex lg:sticky lg:top-0 lg:z-40 lg:h-16 lg:border-b lg:bg-white lg:dark:bg-gray-800 lg:items-center lg:justify-between lg:px-6">
          <h1 className="text-xl font-semibold">{title || 'Agência'}</h1>
          <ProfileDropdown user={auth.user} />
        </div>

        {/* Page content */}
        <main className="py-6 px-4 sm:px-6 lg:px-8 mt-12 lg:mt-0">
          {children}
        </main>
      </div>
    </div>
  );
}

function ProfileDropdown({ user }) {
  // Função segura para gerar rotas mesmo durante impersonação
  const safeRoute = (name, params = [], absolute = undefined) => {
    try {
      return route(name, params, absolute);
    } catch (error) {
      console.error(`Erro ao gerar rota ${name}:`, error);
      
      // Fallbacks para rotas comuns
      const routeMap = {
        'agency.settings.profile': '/agency/settings/profile',
        'logout': '/logout'
      };
      
      return routeMap[name] || '/';
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar>
            <AvatarImage src={user?.profile_photo_url} alt={user?.name} />
            <AvatarFallback>{user?.name?.charAt(0)?.toUpperCase() || 'U'}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end">
        <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={safeRoute('agency.settings.profile')}>Perfil</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={safeRoute('logout')} method="post" as="button" className="w-full text-left">
            <LogOut className="mr-2 h-4 w-4" />
            <span>Sair</span>
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 