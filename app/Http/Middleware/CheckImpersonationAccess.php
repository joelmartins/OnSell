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
            
            if ($clientId) {
                $client = Client::find($clientId);
                
                if (!$client || $client->agency_id !== $user->agency_id) {
                    $this->logImpersonation(
                        $user->id,
                        $clientId,
                        'client',
                        false,
                        'Tentativa de impersonar cliente que não pertence à agência'
                    );
                    return abort(403, 'Você não tem permissão para impersonar este cliente.');
                }
                
                $this->logImpersonation(
                    $user->id,
                    $clientId,
                    'client',
                    true
                );
                
                return $next($request);
            }
            
            // Se não é um cliente, verificar se está tentando impersonar uma agência
            $agencyId = $request->route('agency');
            if ($agencyId) {
                $this->logImpersonation(
                    $user->id,
                    $agencyId,
                    'agency',
                    false,
                    'Agências não podem impersonar outras agências'
                );
                return abort(403, 'Agências não podem impersonar outras agências.');
            }
        }
        
        // Cliente não pode impersonar ninguém
        if ($user->hasRole('client.user')) {
            $this->logImpersonation(
                $user->id,
                null,
                null,
                false,
                'Clientes não têm permissão para impersonar'
            );
            return abort(403, 'Você não tem permissão para impersonar.');
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