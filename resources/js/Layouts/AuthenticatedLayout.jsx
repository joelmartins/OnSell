import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { cn } from "@/lib/utils";
import { Button } from '@/Components/ui/button';
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuLabel, 
    DropdownMenuSeparator, 
    DropdownMenuTrigger 
} from '@/Components/ui/dropdown-menu';
import { ChevronDown, Menu, User, LogOut } from 'lucide-react';

export default function AuthenticatedLayout({ header, children }) {
    const user = usePage().props.auth.user;
    const [showMobileMenu, setShowMobileMenu] = useState(false);

    return (
        <div className="min-h-screen bg-background">
            <header className="border-b border-border bg-card">
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-6">
                    <div className="flex items-center gap-6">
                        <Link href="/" className="text-2xl font-bold text-primary">
                            OnSell
                        </Link>
                        
                        <nav className="hidden md:flex items-center gap-6">
                            <Link 
                                href={route('dashboard')} 
                                className={cn(
                                    "text-sm font-medium transition-colors hover:text-primary",
                                    route().current('dashboard') ? "text-primary" : "text-muted-foreground"
                                )}
                            >
                                Dashboard
                            </Link>
                        </nav>
                    </div>

                    <div className="flex items-center gap-4">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="flex items-center gap-2">
                                    {user.name}
                                    <ChevronDown className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link 
                                        href={route('admin.settings.profile')}
                                        className="flex w-full items-center"
                                    >
                                        <User className="mr-2 h-4 w-4" />
                                        Perfil
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link href={route('logout')} method="post" as="button" className="flex w-full items-center">
                                        <LogOut className="mr-2 h-4 w-4" />
                                        Sair
                                    </Link>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="md:hidden" 
                            onClick={() => setShowMobileMenu(!showMobileMenu)}
                        >
                            <Menu />
                            <span className="sr-only">Menu</span>
                        </Button>
                    </div>
                </div>

                {/* Mobile menu */}
                {showMobileMenu && (
                    <div className="border-t border-border px-4 py-3 md:hidden">
                        <nav className="flex flex-col space-y-3">
                            <Link 
                                href={route('dashboard')} 
                                className={cn(
                                    "text-sm font-medium transition-colors hover:text-primary",
                                    route().current('dashboard') ? "text-primary" : "text-muted-foreground"
                                )}
                            >
                                Dashboard
                            </Link>
                            <div className="pt-3 border-t border-border">
                                <div className="mb-2 flex flex-col">
                                    <span className="font-medium text-foreground">{user.name}</span>
                                    <span className="text-sm text-muted-foreground">{user.email}</span>
                                </div>
                                <div className="flex flex-col space-y-3">
                                    <Link 
                                        href={route('admin.settings.profile')}
                                        className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                                    >
                                        Perfil
                                    </Link>
                                    <Link 
                                        href={route('logout')} 
                                        method="post" 
                                        as="button"
                                        className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary text-left"
                                    >
                                        Sair
                                    </Link>
                                </div>
                            </div>
                        </nav>
                    </div>
                )}
            </header>

            {header && (
                <div className="bg-card shadow-sm">
                    <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">
                        {header}
                    </div>
                </div>
            )}

            <main className="mx-auto max-w-7xl px-4 py-6 md:px-6">
                {children}
            </main>
        </div>
    );
}
