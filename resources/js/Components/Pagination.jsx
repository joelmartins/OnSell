import { Link } from '@inertiajs/react';

export default function Pagination({ links }) {
  if (links.length <= 3) return null;

  return (
    <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 px-4 py-3 sm:px-6">
      <div className="flex flex-1 justify-between sm:hidden">
        {links[0].url ? (
          <Link
            href={links[0].url}
            className="relative inline-flex items-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Anterior
          </Link>
        ) : (
          <span className="relative inline-flex items-center rounded-md border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 px-4 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 cursor-not-allowed">
            Anterior
          </span>
        )}
        
        {links[links.length - 1].url ? (
          <Link
            href={links[links.length - 1].url}
            className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Próximo
          </Link>
        ) : (
          <span className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 px-4 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 cursor-not-allowed">
            Próximo
          </span>
        )}
      </div>
      
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Mostrando <span className="font-medium">{links[1].label}</span> a{' '}
            <span className="font-medium">{links[links.length - 2].label}</span> de{' '}
            <span className="font-medium">{links[Math.floor(links.length / 2)].label}</span> resultados
          </p>
        </div>
        
        <div>
          <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
            {links.map((link, index) => {
              // Pular os links de números de página
              if (index === 0 || index === links.length - 1) {
                return (
                  <Link
                    key={index}
                    href={link.url || '#'}
                    className={`relative inline-flex items-center px-2 py-2 text-sm font-medium ${
                      !link.url
                        ? 'text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 cursor-not-allowed'
                        : 'text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'
                    } ${index === 0 ? 'rounded-l-md' : 'rounded-r-md'}`}
                    aria-disabled={!link.url}
                  >
                    <span className="sr-only">{index === 0 ? 'Anterior' : 'Próximo'}</span>
                    {index === 0 ? (
                      <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                      </svg>
                    )}
                  </Link>
                );
              }

              return (
                <Link
                  key={index}
                  href={link.url || '#'}
                  className={`relative inline-flex items-center px-4 py-2 text-sm font-medium ${
                    link.active
                      ? 'z-10 bg-blue-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600'
                      : !link.url
                      ? 'text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 cursor-not-allowed'
                      : 'text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'
                  } border border-gray-300 dark:border-gray-600`}
                  aria-current={link.active ? 'page' : undefined}
                  aria-disabled={!link.url}
                >
                  {link.label.replace('&laquo;', '').replace('&raquo;', '')}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
} 