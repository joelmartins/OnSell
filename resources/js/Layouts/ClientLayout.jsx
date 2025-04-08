"use client";

import { useState, useEffect } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  LayoutDashboard,
  Kanban,
  MessageSquare,
  Zap,
  Users,
  BarChart,
  Plug,
  Settings,
  Menu,
  LogOut,
  X,
  FileText
} from 'lucide-react';

export default function ClientLayout({ children, title }) {
  const { auth, ziggy, branding, impersonation } = usePage().props;
  const user = auth.user;
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isImpersonating, setIsImpersonating] = useState(false);
  const [impersonateData, setImpersonateData] = useState(null);

  // Aplicar as cores do branding via CSS variáveis
  useEffect(() => {
    if (branding) {
      // Definir as variáveis CSS personalizadas
      document.documentElement.style.setProperty('--primary', branding.primary_color);
      document.documentElement.style.setProperty('--primary-foreground', getContrastColor(branding.primary_color));
      
      document.documentElement.style.setProperty('--secondary', branding.secondary_color);
      document.documentElement.style.setProperty('--secondary-foreground', getContrastColor(branding.secondary_color));
      
      document.documentElement.style.setProperty('--accent', branding.accent_color);
      document.documentElement.style.setProperty('--accent-foreground', getContrastColor(branding.accent_color));

      // Definir uma cor de fundo sutil para o sidebar baseada na cor primária
      const sidebarColor = adjustColorBrightness(branding.primary_color, 0.97);
      document.documentElement.style.setProperty('--sidebar-bg', sidebarColor);
    }
  }, [branding]);

  // Verificar dados de impersonação
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
  }, [impersonation]);

  // Função segura para gerar rotas mesmo durante impersonação
  const safeRoute = (name, params = [], absolute = undefined) => {
    try {
      return route(name, params, absolute, ziggy);
    } catch (error) {
      console.error(`Erro ao gerar rota ${name}:`, error);
      
      // Fallbacks para rotas comuns
      const routeMap = {
        'client.dashboard': '/client/dashboard',
        'client.pipeline': '/client/pipeline',
        'client.messages': '/client/messages',
        'client.automation': '/client/automation',
        'client.landing-pages.index': '/client/landing-pages',
        'client.contacts': '/client/contacts',
        'client.reports': '/client/reports',
        'client.integrations': '/client/integrations',
        'client.settings': '/client/settings',
        'profile.edit': '/profile/edit',
        'logout': '/logout'
      };
      
      return routeMap[name] || '/';
    }
  };

  const navigation = [
    { 
      name: 'Painel', 
      href: safeRoute('client.dashboard'), 
      icon: <LayoutDashboard className="h-5 w-5" />
    },
    { 
      name: 'Pipeline', 
      href: safeRoute('client.pipeline'), 
      icon: <Kanban className="h-5 w-5" />
    },
    { 
      name: 'Mensagens', 
      href: safeRoute('client.messages'), 
      icon: <MessageSquare className="h-5 w-5" />
    },
    { 
      name: 'Automação', 
      href: safeRoute('client.automation'), 
      icon: <Zap className="h-5 w-5" />
    },
    { 
      name: 'Landing Pages', 
      href: safeRoute('client.landing-pages.index'), 
      icon: <FileText className="h-5 w-5" />
    },
    { 
      name: 'Contatos', 
      href: safeRoute('client.contacts'), 
      icon: <Users className="h-5 w-5" />
    },
    { 
      name: 'Relatórios', 
      href: safeRoute('client.reports'), 
      icon: <BarChart className="h-5 w-5" />
    },
    { 
      name: 'Integrações', 
      href: safeRoute('client.integrations'), 
      icon: <Plug className="h-5 w-5" />
    },
    { 
      name: 'Configurações', 
      href: safeRoute('client.settings'), 
      icon: <Settings className="h-5 w-5" />
    },
  ];

  // Função para verificar se o link está ativo
  const isActive = (href) => {
    if (!href) return false;
    
    try {
      // Modo seguro que não depende do ziggy.url
      const currentPath = window.location.pathname;
      
      // Verificar se o pathname atual corresponde ao href fornecido
      if (href === currentPath) return true;
      
      // Extrair a rota do href (remover domínio e parâmetros de consulta)
      let routePath = href;
      
      // Se ziggy existe e tem url, limpar o href
      if (ziggy && ziggy.url) {
        routePath = href.replace(`${ziggy.url}/`, '').split('?')[0];
      } else {
        // Se não temos ziggy.url, remover qualquer domínio que possa existir
        routePath = href.replace(/^https?:\/\/[^\/]+\//, '').split('?')[0];
      }
      
      // Limpa o currentPath também
      const cleanCurrentPath = currentPath.replace(/^\//, '').split('?')[0];
      
      // Verificar correspondência direta
      if (routePath === cleanCurrentPath) return true;
      
      // Verificar usando o route().current() se possível
      try {
        return route().current(routePath);
      } catch (e) {
        // Fallback: verificar se a rota começa com o mesmo padrão
        return cleanCurrentPath.startsWith(routePath);
      }
    } catch (error) {
      console.error('Erro ao verificar rota ativa:', error);
      return false;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Mobile sidebar */}
      <div className="lg:hidden fixed top-0 w-full bg-white dark:bg-gray-800 border-b z-40 py-3 px-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)}>
              <Menu className="h-6 w-6" />
            </Button>
            <h1 className="ml-3 text-xl font-semibold">{title || 'Dashboard'}</h1>
          </div>
          <ProfileDropdown user={user} branding={branding} />
        </div>
      </div>

      {/* Sidebar */}
      <div 
        className={`fixed top-0 left-0 z-50 h-full w-64 border-r transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ backgroundColor: 'var(--sidebar-bg, white)' }}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 flex items-center justify-between border-b">
            {branding?.logo ? (
              <img 
                src={branding.logo} 
                alt={branding.agency_name || 'OnSell'} 
                className="h-8" 
              />
            ) : (
              <h1 className="text-xl font-bold" style={{ color: branding?.primary_color }}>
                {branding?.agency_name || 'OnSell'}
              </h1>
            )}
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(false)}>
              <X className="h-5 w-5" />
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
                    : 'Impersonando cliente'}
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
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                    isActive(item.href) 
                      ? 'bg-primary/10 text-primary'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className={`mr-3 flex-shrink-0 ${
                    isActive(item.href)
                      ? 'text-primary'
                      : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-500'
                  }`}>
                    {item.icon}
                  </div>
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
          <div className="p-4 border-t">
            <ProfileDropdown user={user} branding={branding} />
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Desktop header */}
        <div 
          className="hidden lg:flex lg:sticky lg:top-0 lg:z-40 lg:h-16 lg:border-b lg:items-center lg:justify-between lg:px-6"
          style={{ backgroundColor: 'var(--sidebar-bg, white)' }}
        >
          <h1 className="text-xl font-semibold">{title || 'Dashboard'}</h1>
          <ProfileDropdown user={user} branding={branding} />
        </div>

        {/* Page content */}
        <main className="py-6 px-4 sm:px-6 lg:px-8 mt-12 lg:mt-0">
          {children}
        </main>
      </div>
    </div>
  );
}

function ProfileDropdown({ user, branding }) {
  // Função segura para gerar rotas mesmo durante impersonação
  const safeRoute = (name, params = [], absolute = undefined) => {
    try {
      return route(name, params, absolute);
    } catch (error) {
      console.error(`Erro ao gerar rota ${name}:`, error);
      
      // Fallbacks para rotas comuns
      const routeMap = {
        'profile.edit': '/profile/edit',
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
            <AvatarFallback 
              style={{ backgroundColor: branding?.primary_color, color: getContrastColor(branding?.primary_color) }}
            >
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end">
        <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={safeRoute('profile.edit')}>Perfil</Link>
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

// Função para determinar cor de texto (branco ou preto) baseado na cor de fundo
function getContrastColor(hexColor) {
  // Se não houver cor, retorna branco
  if (!hexColor) return '#ffffff';
  
  // Converte hex para RGB
  let r = 0, g = 0, b = 0;
  
  // 3 caracteres
  if (hexColor.length === 4) {
    r = parseInt(hexColor[1] + hexColor[1], 16);
    g = parseInt(hexColor[2] + hexColor[2], 16);
    b = parseInt(hexColor[3] + hexColor[3], 16);
  }
  // 6 caracteres
  else if (hexColor.length === 7) {
    r = parseInt(hexColor.substring(1, 3), 16);
    g = parseInt(hexColor.substring(3, 5), 16);
    b = parseInt(hexColor.substring(5, 7), 16);
  } else {
    return '#ffffff';
  }
  
  // Calcula a luminância
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // Retorna branco ou preto conforme a luminância
  return luminance > 0.5 ? '#000000' : '#ffffff';
}

// Função para ajustar o brilho de uma cor
function adjustColorBrightness(hex, factor) {
  if (!hex) return '#ffffff';
  
  // Remove o hash se existir
  hex = hex.replace('#', '');
  
  // Converte para RGB
  let r = parseInt(hex.substring(0, 2), 16);
  let g = parseInt(hex.substring(2, 4), 16);
  let b = parseInt(hex.substring(4, 6), 16);
  
  // Ajusta o brilho
  r = Math.min(255, Math.floor(r * factor));
  g = Math.min(255, Math.floor(g * factor));
  b = Math.min(255, Math.floor(b * factor));
  
  // Converte de volta para hex
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
} 