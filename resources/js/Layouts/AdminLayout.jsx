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
  Users, 
  Building2, 
  PackageOpen, 
  Settings, 
  Menu, 
  LogOut,
  Plug,
  ChevronDown
} from 'lucide-react';
import ImpersonationDropdown from '@/Components/ImpersonationDropdown';

export default function AdminLayout({ children, title }) {
  const { auth } = usePage().props;
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isImpersonating, setIsImpersonating] = useState(false);
  const [impersonateData, setImpersonateData] = useState(null);

  useEffect(() => {
    // Verificar se está impersonando
    const impersonateData = sessionStorage.getItem('impersonate.data');
    setIsImpersonating(!!impersonateData);
    
    if (impersonateData) {
      try {
        setImpersonateData(JSON.parse(impersonateData));
      } catch (e) {
        console.error('Erro ao analisar dados de impersonação:', e);
      }
    }
  }, []);

  const sidebarItems = [
    { label: 'Dashboard', icon: <LayoutDashboard className="h-5 w-5" />, href: route('admin.dashboard') },
    { label: 'Clientes', icon: <Users className="h-5 w-5" />, href: route('admin.clients.index') },
    { label: 'Agências', icon: <Building2 className="h-5 w-5" />, href: route('admin.agencies.index') },
    { label: 'Planos', icon: <PackageOpen className="h-5 w-5" />, href: route('admin.plans.index') },
    { label: 'Integrações', icon: <Plug className="h-5 w-5" />, href: route('admin.integrations.index') },
    { 
      label: 'Configurações', 
      icon: <Settings className="h-5 w-5" />, 
      href: route('admin.settings.index'),
      submenu: [
        { label: 'Geral', href: route('admin.settings.index') },
        { label: 'Segurança', href: route('admin.settings.security') },
        { label: 'Logs', href: route('admin.settings.logs') },
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
            <h1 className="ml-3 text-xl font-semibold">{title || 'Admin'}</h1>
          </div>
          <ProfileDropdown user={auth.user} />
        </div>
      </div>

      {/* Sidebar */}
      <div className={`fixed top-0 left-0 z-50 h-full w-64 bg-white dark:bg-gray-800 border-r transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="p-4 flex items-center justify-between border-b">
            <h1 className="text-xl font-bold">OnSell</h1>
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
                    : 'Impersonando usuário'}
                </span>
              </div>
              <Button 
                variant="outline"
                size="sm"
                className="w-full mt-2 bg-amber-200/50 dark:bg-amber-700/50 border-amber-300 dark:border-amber-600 text-amber-800 dark:text-amber-200 hover:bg-amber-200 dark:hover:bg-amber-700"
                onClick={() => {
                  router.visit(route('stop.impersonating'), {
                    onSuccess: () => {
                      sessionStorage.removeItem('impersonate.data');
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
              {sidebarItems.map((item, index) => (
                <div key={index}>
                  {item.submenu ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          className="w-full justify-between px-3 py-2 text-sm font-medium"
                        >
                          <div className="flex items-center">
                            {item.icon}
                            <span className="ml-3">{item.label}</span>
                          </div>
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-56" align="start" side="right">
                        {item.submenu.map((subItem, subIndex) => (
                          <DropdownMenuItem key={subIndex} asChild>
                            <Link href={subItem.href}>{subItem.label}</Link>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : (
                    <Link
                      href={item.href}
                      className="flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      {item.icon}
                      <span className="ml-3">{item.label}</span>
                    </Link>
                  )}
                </div>
              ))}
              
              {/* Dropdown de impersonação */}
              {(auth.user.roles.includes('admin.super') || auth.user.roles.includes('agency.owner')) && (
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
          <h1 className="text-xl font-semibold">{title || 'Admin'}</h1>
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