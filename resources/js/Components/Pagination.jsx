import { Link } from '@inertiajs/react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { Button } from '@/Components/ui/button';

export default function Pagination({ links }) {
  if (!links || links.length === 1) return null;

  return (
    <nav className="flex items-center justify-center space-x-1" role="navigation" aria-label="Paginação">
      {links.map((link, index) => {
        // Não renderizar o link "..." que vem da API
        if (link.label.includes('...')) {
          return (
            <span key={index} className="mx-1">
              <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
            </span>
          );
        }

        // Link anterior
        if (link.label.includes('Anterior')) {
          return (
            <Button
              key={index}
              variant={link.url ? 'outline' : 'ghost'}
              size="icon"
              disabled={!link.url}
              asChild={link.url ? true : false}
              className="h-8 w-8"
            >
              {link.url ? (
                <Link href={link.url} preserveScroll preserveState>
                  <ChevronLeft className="h-4 w-4" />
                  <span className="sr-only">Página anterior</span>
                </Link>
              ) : (
                <span>
                  <ChevronLeft className="h-4 w-4" />
                  <span className="sr-only">Página anterior</span>
                </span>
              )}
            </Button>
          );
        }

        // Link próximo
        if (link.label.includes('Próximo')) {
          return (
            <Button
              key={index}
              variant={link.url ? 'outline' : 'ghost'}
              size="icon"
              disabled={!link.url}
              asChild={link.url ? true : false}
              className="h-8 w-8"
            >
              {link.url ? (
                <Link href={link.url} preserveScroll preserveState>
                  <ChevronRight className="h-4 w-4" />
                  <span className="sr-only">Próxima página</span>
                </Link>
              ) : (
                <span>
                  <ChevronRight className="h-4 w-4" />
                  <span className="sr-only">Próxima página</span>
                </span>
              )}
            </Button>
          );
        }

        // Links de número de página
        return (
          <Button
            key={index}
            variant={link.active ? "default" : "outline"}
            size="icon"
            className="h-8 w-8"
            asChild={!link.active && link.url ? true : false}
          >
            {!link.active && link.url ? (
              <Link href={link.url} preserveScroll preserveState>
                {link.label}
              </Link>
            ) : (
              <span>{link.label}</span>
            )}
          </Button>
        );
      })}
    </nav>
  );
} 