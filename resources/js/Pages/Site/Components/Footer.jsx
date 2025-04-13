import { Link } from '@inertiajs/react';

export default function Footer() {
    return (
        <footer className="border-t py-6 md:py-0">
            <div className="container mx-auto max-w-6xl flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row px-4">
                <div className="flex items-center gap-2 font-bold">
                    <Link href={route('site.index')}>
                        <img src="/img/onsell_logo.svg" alt="OnSell" className="h-6" />
                    </Link>
                </div>
                <p className="text-center text-sm leading-loose text-gray-500 md:text-left">
                    © 2025 OnSell. Todos os direitos reservados.
                </p>
                <div className="flex items-center gap-4">
                    <Link href={route('site.terms')} className="text-sm text-gray-500 hover:underline underline-offset-4">
                        Termos
                    </Link>
                    <Link href={route('site.privacy')} className="text-sm text-gray-500 hover:underline underline-offset-4">
                        Privacidade
                    </Link>
                    <Link href={route('site.contact')} className="text-sm text-gray-500 hover:underline underline-offset-4">
                        Contato
                    </Link>
                </div>
            </div>
        </footer>
    );
} 