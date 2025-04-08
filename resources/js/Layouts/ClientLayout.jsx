"use client";

import { useState, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';
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
import ImpersonationBanner from '@/Components/ImpersonationBanner';

export default function ClientLayout({ children, title }) {
  const { auth, ziggy, branding } = usePage().props;
  const user = auth.user;
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isImpersonating, setIsImpersonating] = useState(false);

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
    
    // Verificar se está impersonando
    const impersonateData = sessionStorage.getItem('impersonate.data');
    setIsImpersonating(!!impersonateData);
  }, [branding]);

  const navigation = [
    { 
      name: 'Painel', 
      href: route('client.dashboard', [], undefined, ziggy), 
      icon: <LayoutDashboard className="h-5 w-5" />
    },
    { 
      name: 'Pipeline', 
      href: route('client.pipeline', [], undefined, ziggy), 
      icon: <Kanban className="h-5 w-5" />
    },
    { 
      name: 'Mensagens', 
      href: route('client.messages', [], undefined, ziggy), 
      icon: <MessageSquare className="h-5 w-5" />
    },
    { 
      name: 'Automação', 
      href: route('client.automation', [], undefined, ziggy), 
      icon: <Zap className="h-5 w-5" />
    },
    { 
      name: 'Landing Pages', 
      href: route('client.landing-pages.index', [], undefined, ziggy), 
      icon: <FileText className="h-5 w-5" />
    },
    { 
      name: 'Contatos', 
      href: route('client.contacts', [], undefined, ziggy), 
      icon: <Users className="h-5 w-5" />
    },
    { 
      name: 'Relatórios', 
      href: route('client.reports', [], undefined, ziggy), 
      icon: <BarChart className="h-5 w-5" />
    },
    { 
      name: 'Integrações', 
      href: route('client.integrations', [], undefined, ziggy), 
      icon: <Plug className="h-5 w-5" />
    },
    { 
      name: 'Configurações', 
      href: route('client.settings', [], undefined, ziggy), 
      icon: <Settings className="h-5 w-5" />
    },
  ];

  // Função para verificar se o link está ativo
  const isActive = (href) => {
    return route().current(href.replace(`${ziggy.url}/`, '').split('?')[0]);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Banner de impersonação */}
      {isImpersonating && <ImpersonationBanner />}
      
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
      <div className={`lg:pl-64 ${isImpersonating ? 'pt-10' : ''}`}>
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
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar>
            <AvatarImage src={user?.profile_photo_url} alt={user?.name} />
            <AvatarFallback 
              style={{ backgroundColor: branding?.primary_color, color: getContrastColor(branding?.primary_color) }}
            >
              {user?.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end">
        <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={route('profile.edit')}>Perfil</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={route('logout')} method="post" as="button" className="w-full text-left">
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