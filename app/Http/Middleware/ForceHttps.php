<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ForceHttps
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Verifica se está em ambiente de produção
        if (app()->environment('production')) {
            // Verifica se a requisição não é segura
            $isSecure = $request->secure() || 
                       ($request->header('X-Forwarded-Proto') === 'https');
                   
            // Se a requisição não for HTTPS, redireciona
            if (!$isSecure) {
                return redirect()->secure($request->getRequestUri(), 301);
            }
            
            // Adiciona cabeçalhos de segurança
            $response = $next($request);
            
            if ($response instanceof Response) {
                // Strict-Transport-Security para forçar HTTPS nos próximos acessos
                $response->headers->set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
                
                // Content-Security-Policy para prevenir mixed content
                $response->headers->set('Content-Security-Policy', 'upgrade-insecure-requests');
            }
            
            return $response;
        }
        
        return $next($request);
    }
}
