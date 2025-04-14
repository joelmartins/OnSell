import { Link } from '@inertiajs/react';

export default function Header({ auth = {} }) {
    return (
        <header className="border-b">
            <div className="container mx-auto max-w-6xl flex h-16 items-center justify-between px-4">
                <div className="flex items-center gap-2">
                    <Link href={route('site.index')}>
                        <img src="/img/onsell_logo.svg" alt="OnSell" className="h-8" />
                    </Link>
                </div>
                <nav className="hidden md:flex items-center gap-6">
                    <Link href={route('site.index') + "#features"} className="text-sm font-medium hover:underline underline-offset-4">
                        Funcionalidades
                    </Link>
                    <Link href={route('site.index') + "#how-it-works"} className="text-sm font-medium hover:underline underline-offset-4">
                        Como Funciona
                    </Link>
                    <Link href={route('site.index') + "#pricing"} className="text-sm font-medium hover:underline underline-offset-4">
                        Preços
                    </Link>
                    {auth.user ? (
                        <Link href={route('dashboard')} className="text-sm font-medium hover:underline underline-offset-4">
                            Dashboard
                        </Link>
                    ) : (
                        <Link href={route('login')} className="text-sm font-medium hover:underline underline-offset-4">
                            Login
                        </Link>
                    )}
                </nav>
                <div className="flex items-center gap-4">
                    {auth.user ? (
                        <Link href={route('dashboard')} className="px-4 py-2 rounded-md bg-primary text-white text-sm font-medium hover:bg-primary/90">
                            Dashboard
                        </Link>
                    ) : (
                        <Link href={route('register')} className="px-4 py-2 rounded-md bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition">
                            Começar Grátis
                        </Link>
                    )}
                </div>
            </div>
        </header>
    );
} 