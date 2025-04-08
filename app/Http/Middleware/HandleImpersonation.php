<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
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
        
        // Pegar o usuário atual
        $user = Auth::user();
        
        // Dependendo do tipo de impersonação, modificamos a requisição
        if ($target['type'] === 'client' && !$request->routeIs('stop.impersonating')) {
            // Adicionar um parâmetro à requisição para indicar que estamos impersonando um cliente
            $request->attributes->add(['is_impersonating_client' => true, 'client_id' => $target['id']]);
            
            // Verificar se estamos acessando uma rota de cliente, incluindo /client/dashboard
            // Isso garante que o check seja mais preciso para evitar o erro 403
            if ($request->is('client/*') || $request->is('client')) {
                return $next($request);
            }
            
            // Se estamos tentando acessar outra rota, redirecionar para o dashboard do cliente
            if (!$request->routeIs('stop.impersonating')) {
                Log::channel('audit')->info('Redirecionando impersonação para dashboard', [
                    'path' => $request->path(),
                    'target_type' => $target['type'],
                    'target_id' => $target['id']
                ]);
                return redirect()->route('client.dashboard');
            }
        }
        
        if ($target['type'] === 'agency' && !$request->routeIs('stop.impersonating')) {
            // Adicionar um parâmetro à requisição para indicar que estamos impersonando uma agência
            $request->attributes->add(['is_impersonating_agency' => true, 'agency_id' => $target['id']]);
            
            // Verificar se estamos acessando uma rota de agência
            if ($request->is('agency/*') || $request->is('agency')) {
                Log::channel('audit')->info('Acesso a rota de agência durante impersonação', [
                    'user_id' => $user?->id,
                    'path' => $request->path(),
                    'target_type' => $target['type'],
                    'target_id' => $target['id']
                ]);
                return $next($request);
            }
            
            // Se estamos tentando acessar outra rota, redirecionar para o dashboard da agência
            if (!$request->routeIs('stop.impersonating')) {
                Log::channel('audit')->info('Redirecionando impersonação para dashboard da agência', [
                    'path' => $request->path(),
                    'target_type' => $target['type'],
                    'target_id' => $target['id']
                ]);
                return redirect()->route('agency.dashboard');
            }
        }
        
        return $next($request);
    }
} 