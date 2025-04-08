<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class HandleImpersonation
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Verificar se há uma impersonação ativa
        $target = session()->get('impersonate.target');
        
        // Se não houver impersonação, continua normalmente
        if (!$target) {
            return $next($request);
        }
        
        // Permitir acesso baseado no tipo de impersonação
        $user = Auth::user();
        
        if ($target['type'] === 'client') {
            // Se o usuário está impersonando um cliente, dar acesso temporário ao role de cliente
            if (!$user->hasRole('client.user')) {
                $user->assignRole('client.user');
                
                // Remover temporariamente outros papéis para evitar conflitos
                if ($user->hasRole('admin.super')) {
                    session()->put('impersonate.original_roles.admin', true);
                    $user->removeRole('admin.super');
                }
                
                if ($user->hasRole('agency.owner')) {
                    session()->put('impersonate.original_roles.agency', true);
                    $user->removeRole('agency.owner');
                }
            }
        }
        
        if ($target['type'] === 'agency') {
            // Se o usuário está impersonando uma agência, dar acesso temporário ao role de agência
            if (!$user->hasRole('agency.owner')) {
                $user->assignRole('agency.owner');
                
                // Remover temporariamente outros papéis para evitar conflitos
                if ($user->hasRole('admin.super')) {
                    session()->put('impersonate.original_roles.admin', true);
                    $user->removeRole('admin.super');
                }
                
                if ($user->hasRole('client.user')) {
                    session()->put('impersonate.original_roles.client', true);
                    $user->removeRole('client.user');
                }
            }
        }
        
        return $next($request);
    }
} 