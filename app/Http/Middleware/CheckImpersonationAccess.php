<?php

namespace App\Http\Middleware;

use App\Models\Agency;
use App\Models\Client;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class CheckImpersonationAccess
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = Auth::user();
        
        // Admin pode impersonar qualquer conta
        if ($user->hasRole('admin.super')) {
            return $next($request);
        }

        // Agência só pode impersonar seus próprios clientes
        if ($user->hasRole('agency.owner')) {
            $clientId = $request->route('client');
            
            // Verificar se o cliente pertence à agência
            // Lógica será implementada de acordo com o modelo de dados
            // Por enquanto, vamos apenas verificar se o usuário tem o papel de agência
            
            return $next($request);
        }
        
        return abort(403, 'Acesso não autorizado.');
    }

    /**
     * Log impersonation attempt
     */
    private function logImpersonation($userId, $targetId, $role, $success, $message = null)
    {
        Log::channel('audit')->info('Tentativa de impersonação', [
            'user_id' => $userId,
            'target_id' => $targetId,
            'role' => $role,
            'success' => $success,
            'message' => $message,
            'ip' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);
    }
} 