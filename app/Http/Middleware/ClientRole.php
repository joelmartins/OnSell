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
        // Log para depuração do processo de autenticação
        Log::channel('audit')->info('Verificando acesso à rota de cliente', [
            'path' => $request->path(),
            'user_id' => auth()->id(),
            'roles' => auth()->user() ? auth()->user()->getRoleNames()->toArray() : [],
            'has_session_impersonation' => session()->has('impersonate.target'),
            'session_target_type' => session()->get('impersonate.target.type'),
            'session_target_id' => session()->get('impersonate.target.id'),
            'has_attribute_impersonation' => $request->attributes->has('is_impersonating_client'),
        ]);

        // Verificar se há uma impersonação ativa de cliente na sessão
        $target = session()->get('impersonate.target');
        if ($target && $target['type'] === 'client') {
            Log::channel('audit')->info('Acesso permitido via impersonação na sessão', [
                'path' => $request->path(),
                'target_id' => $target['id']
            ]);
            return $next($request);
        }
        
        // Verifica se o usuário está impersonando um cliente através dos atributos da requisição
        if ($request->attributes->has('is_impersonating_client')) {
            Log::channel('audit')->info('Acesso permitido via atributos de requisição', [
                'path' => $request->path()
            ]);
            return $next($request);
        }
        
        // Verifica se o usuário tem o papel de cliente
        if (auth()->user() && (auth()->user()->hasRole('client.owner') || auth()->user()->hasRole('client.user'))) {
            Log::channel('audit')->info('Acesso permitido via papel de cliente', [
                'path' => $request->path(),
                'user_id' => auth()->id()
            ]);
            return $next($request);
        }
        
        // Se estamos aqui, o acesso foi negado
        Log::channel('audit')->warning('Acesso negado a rota de cliente', [
            'path' => $request->path(),
            'user_id' => auth()->id(),
            'roles' => auth()->user() ? auth()->user()->getRoleNames()->toArray() : [],
            'has_impersonation_attribute' => $request->attributes->has('is_impersonating_client'),
            'has_impersonation_session' => session()->has('impersonate.target'),
            'session_data' => session()->all(),
        ]);
        
        // Redirecionar para o dashboard apropriado com base no papel
        if (auth()->user() && auth()->user()->hasRole('agency.owner')) {
            return redirect()->route('agency.dashboard')->with('error', 'Você não tem permissão para acessar essa área.');
        } elseif (auth()->user() && auth()->user()->hasRole('admin.super')) {
            return redirect()->route('admin.dashboard')->with('error', 'Você não tem permissão para acessar essa área.');
        }
        
        return abort(403, 'Acesso não autorizado.');
    }
} 