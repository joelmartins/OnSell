<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class ClientRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Verificar se há uma impersonação ativa de cliente na sessão
        $target = session()->get('impersonate.target');
        if ($target && $target['type'] === 'client') {
            Log::channel('audit')->info('Acessando rota de cliente como impersonador', [
                'path' => $request->path(),
                'target_id' => $target['id']
            ]);
            return $next($request);
        }
        
        // Verifica se o usuário está impersonando um cliente através dos atributos da requisição
        if ($request->attributes->has('is_impersonating_client')) {
            return $next($request);
        }
        
        // Verifica se o usuário tem o papel de cliente
        if (auth()->user() && auth()->user()->hasRole('client.user')) {
            return $next($request);
        }
        
        Log::channel('audit')->warning('Acesso negado a rota de cliente', [
            'path' => $request->path(),
            'user_id' => auth()->id(),
            'roles' => auth()->user() ? auth()->user()->getRoleNames() : [],
            'has_impersonation_attribute' => $request->attributes->has('is_impersonating_client'),
            'has_impersonation_session' => session()->has('impersonate.target'),
        ]);
        
        return abort(403, 'Acesso não autorizado.');
    }
} 