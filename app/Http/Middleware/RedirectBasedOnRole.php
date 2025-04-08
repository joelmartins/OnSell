<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class RedirectBasedOnRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Se não estiver autenticado, redirecionar para login
        if (!Auth::check()) {
            return redirect()->route('login');
        }

        $user = Auth::user();
        $routeName = $request->route()->getName();
        
        // Se for a rota de dashboard padrão, redirecionar com base na role
        if ($routeName === 'dashboard') {
            if ($user->hasRole('admin.super')) {
                return redirect()->route('admin.dashboard');
            } elseif ($user->hasRole('agency.owner')) {
                return redirect()->route('agency.dashboard');
            } elseif ($user->hasRole('client.user')) {
                return redirect()->route('client.dashboard');
            }
        }
        
        // Verificar se o usuário está tentando acessar uma área inadequada
        $adminRoutes = ['admin.'];
        $agencyRoutes = ['agency.'];
        $clientRoutes = ['client.'];
        
        // Se for admin, pode acessar todas as rotas
        if ($user->hasRole('admin.super')) {
            return $next($request);
        }
        
        // Se for agência, verificar se está tentando acessar rotas de admin
        if ($user->hasRole('agency.owner')) {
            foreach ($adminRoutes as $prefix) {
                if (str_starts_with($routeName, $prefix)) {
                    return redirect()->route('agency.dashboard');
                }
            }
            return $next($request);
        }
        
        // Se for cliente, verificar se está tentando acessar rotas de admin ou agência
        if ($user->hasRole('client.user')) {
            foreach (array_merge($adminRoutes, $agencyRoutes) as $prefix) {
                if (str_starts_with($routeName, $prefix)) {
                    return redirect()->route('client.dashboard');
                }
            }
            return $next($request);
        }
        
        return $next($request);
    }
} 