<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class AgencyRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Log inicial para análise de depuração
        Log::channel('audit')->info('Middleware AgencyRole iniciado', [
            'path' => $request->path(),
            'method' => $request->method(),
            'user_id' => auth()->id(),
            'has_session' => session()->has('impersonate.target'),
            'session_id' => session()->getId(),
            'route_name' => $request->route()->getName()
        ]);
        
        // Verificar se há uma impersonação ativa de agência na sessão
        $target = session()->get('impersonate.target');
        if ($target && $target['type'] === 'agency') {
            // Verificação adicional: o target['id'] existe e é válido?
            if (!isset($target['id']) || empty($target['id'])) {
                Log::channel('audit')->error('Sessão de impersonação de agência inválida - ID ausente', [
                    'path' => $request->path(),
                    'session_data' => session()->all()
                ]);
                // Limpar sessão de impersonação corrompida
                session()->forget('impersonate.target');
                return redirect()->route('dashboard')
                    ->with('error', 'Sessão de impersonação inválida. Por favor, tente novamente.');
            }
            
            Log::channel('audit')->info('Acessando rota de agência como impersonador', [
                'path' => $request->path(),
                'target_id' => $target['id']
            ]);
            return $next($request);
        }
        
        // Verifica se o usuário está impersonando uma agência
        if ($request->attributes->has('is_impersonating_agency')) {
            Log::channel('audit')->info('Acesso via atributo de impersonação', [
                'path' => $request->path(),
                'agency_id' => $request->attributes->get('agency_id')
            ]);
            return $next($request);
        }
        
        // Verifica se o usuário tem o papel de agência
        if (auth()->user() && auth()->user()->hasRole('agency.owner')) {
            return $next($request);
        }
        
        Log::channel('audit')->warning('Acesso negado a rota de agência', [
            'path' => $request->path(),
            'user_id' => auth()->id(),
            'roles' => auth()->user() ? auth()->user()->getRoleNames() : [],
            'has_impersonation_attribute' => $request->attributes->has('is_impersonating_agency'),
            'has_impersonation_session' => session()->has('impersonate.target'),
            'impersonation_type' => session()->get('impersonate.target.type'),
        ]);
        
        // Verificação para evitar erro 404 em rotas de branding específicas
        if ($request->is('agency/branding/*') && stripos($request->path(), 'visual') !== false
            || stripos($request->path(), 'domain') !== false
            || stripos($request->path(), 'landing') !== false) {
            // Redirecionar para a página principal de branding
            return redirect()->route('agency.branding.index')
                ->with('error', 'Acesso não autorizado a esta seção de branding. Redirecionado para a página principal.');
        }
        
        return abort(403, 'Acesso não autorizado.');
    }
} 