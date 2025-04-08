"use client";

import { useState } from 'react';
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
  X
} from 'lucide-react';

export default function ClientLayout({ children, title }) {
  const { auth, ziggy } = usePage().props;
  const user = auth.user;
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
      {/* Mobile sidebar */}
      <div className="lg:hidden fixed top-0 w-full bg-white dark:bg-gray-800 border-b z-40 py-3 px-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)}>
              <Menu className="h-6 w-6" />
            </Button>
            <h1 className="ml-3 text-xl font-semibold">{title || 'Dashboard'}</h1>
          </div>
          <ProfileDropdown user={user} />
        </div>
      </div>

      {/* Sidebar */}
      <div className={`fixed top-0 left-0 z-50 h-full w-64 bg-white dark:bg-gray-800 border-r transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="p-4 flex items-center justify-between border-b">
            <h1 className="text-xl font-bold">OnSell</h1>
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
                      ? 'bg-gray-100 dark:bg-gray-700 text-primary'
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
            <ProfileDropdown user={user} />
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Desktop header */}
        <div className="hidden lg:flex lg:sticky lg:top-0 lg:z-40 lg:h-16 lg:border-b lg:bg-white lg:dark:bg-gray-800 lg:items-center lg:justify-between lg:px-6">
          <h1 className="text-xl font-semibold">{title || 'Dashboard'}</h1>
          <ProfileDropdown user={user} />
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
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar>
            <AvatarImage src={user?.profile_photo_url} alt={user?.name} />
            <AvatarFallback>{user?.name.charAt(0).toUpperCase()}</AvatarFallback>
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