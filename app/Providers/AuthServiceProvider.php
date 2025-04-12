<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Gate;
use App\Models\User;
use App\Models\Plan;
use Illuminate\Support\Facades\Log;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Register any authentication / authorization services.
     */
    public function boot(): void
    {
        // Registrar políticas adicionais para o modelo Plan
        Gate::define('canCreateForAgency', function (User $user, Plan $plan, $agencyId) {
            Log::channel('audit')->info('Verificando permissão canCreateForAgency', [
                'user_id' => $user->id,
                'user_roles' => $user->getRoleNames(),
                'plan_id' => $plan->id,
                'agency_id' => $agencyId,
                'impersonating' => session()->has('impersonate.target'),
                'impersonation_data' => session()->get('impersonate.target')
            ]);
            
            // Se for uma impersonação de agência, verificar correspondência
            if (session()->has('impersonate.target')) {
                $impersonating = session()->get('impersonate.target');
                if ($impersonating['type'] === 'agency') {
                    $hasPermission = (int)$impersonating['id'] === (int)$agencyId;
                    
                    Log::channel('audit')->info('Verificação de impersonação concluída', [
                        'result' => $hasPermission ? 'aprovado' : 'negado',
                        'impersonating_id' => (int)$impersonating['id'],
                        'agency_id' => (int)$agencyId
                    ]);
                    
                    return $hasPermission;
                }
            }
            
            // Admins do sistema sempre podem criar
            if ($user->hasRole('admin.super')) {
                Log::channel('audit')->info('Admin super tem permissão para criar', [
                    'user_id' => $user->id
                ]);
                return true;
            }
            
            // Membros da agência podem criar planos para sua própria agência
            if (($user->hasRole('agency.owner') || $user->hasRole('agency.admin'))) {
                $hasPermission = (int)$user->agency_id === (int)$agencyId;
                
                Log::channel('audit')->info('Verificação de usuário da agência concluída', [
                    'result' => $hasPermission ? 'aprovado' : 'negado',
                    'user_agency_id' => (int)$user->agency_id,
                    'target_agency_id' => (int)$agencyId
                ]);
                
                return $hasPermission;
            }
            
            return false;
        });
    }
} 