<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
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
        
        // Log para depuração
        Log::channel('audit')->info('Redirecionamento baseado em papel', [
            'user_id' => $user->id,
            'route_name' => $routeName,
            'roles' => $user->getRoleNames()->toArray(),
            'is_impersonating' => session()->has('impersonate.target'),
            'impersonating_type' => session()->get('impersonate.target.type'),
        ]);
        
        // Verificar se está impersonando alguma entidade
        $impersonating = session()->get('impersonate.target');
        if ($impersonating) {
            // Se for impersonação de cliente, redirecionar para dashboard do cliente
            if ($impersonating['type'] === 'client' && $routeName === 'dashboard') {
                return redirect()->route('client.dashboard');
            }
            
            // Se for impersonação de agência, redirecionar para dashboard da agência
            if ($impersonating['type'] === 'agency' && $routeName === 'dashboard') {
                return redirect()->route('agency.dashboard');
            }
        }
        
        // Se for a rota de dashboard padrão, redirecionar com base na role
        if ($routeName === 'dashboard') {
            if ($user->hasRole('admin.super')) {
                return redirect()->route('admin.dashboard');
            } elseif ($user->hasRole('agency.owner')) {
                return redirect()->route('agency.dashboard');
            } elseif ($user->hasRole(['client.user', 'client.user'])) {
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
                    Log::channel('audit')->warning('Agência tentando acessar área de admin', [
                        'user_id' => $user->id,
                        'route' => $routeName
                    ]);
                    return redirect()->route('agency.dashboard')
                        ->with('error', 'Você não tem acesso a essa área.');
                }
            }
            return $next($request);
        }
        
        // Se for cliente, verificar se está tentando acessar rotas de admin ou agência
        if ($user->hasRole(['client.user', 'client.user'])) {
            foreach (array_merge($adminRoutes, $agencyRoutes) as $prefix) {
                if (str_starts_with($routeName, $prefix)) {
                    Log::channel('audit')->warning('Cliente tentando acessar área restrita', [
                        'user_id' => $user->id,
                        'route' => $routeName
                    ]);
                    return redirect()->route('client.dashboard')
                        ->with('error', 'Você não tem acesso a essa área.');
                }
            }
            return $next($request);
        }
        
        return $next($request);
    }
} 