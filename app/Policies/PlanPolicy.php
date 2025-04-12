<?php

namespace App\Policies;

use App\Models\Plan;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class PlanPolicy
{
    /**
     * Método auxiliar para verificar se o usuário é administrador da agência ou está impersonando
     */
    private function isAgencyAdminOrImpersonating(User $user): bool
    {
        // Verificar se é um usuário de agência
        if ($user->hasRole('agency.owner') || $user->hasRole('agency.admin')) {
            return true;
        }
        
        // Verificar se é um administrador impersonando uma agência
        if ($user->hasRole('admin.super') && session()->has('impersonate.target')) {
            $impersonating = session()->get('impersonate.target');
            return ($impersonating['type'] === 'agency');
        }
        
        return false;
    }
    
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        // Usuários de agência ou admins impersonando podem ver planos
        return $this->isAgencyAdminOrImpersonating($user);
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Plan $plan): bool
    {
        // Verificar impersonação
        if (session()->has('impersonate.target')) {
            $impersonating = session()->get('impersonate.target');
            if ($impersonating['type'] === 'agency') {
                return $impersonating['id'] === $plan->agency_id;
            }
        }
        
        // Admins do sistema podem ver todos os planos
        if ($user->hasRole('admin.super')) {
            return true;
        }
        
        // Usuários de agência podem ver seus próprios planos
        if (($user->hasRole('agency.owner') || $user->hasRole('agency.admin')) && $user->agency_id === $plan->agency_id) {
            return true;
        }
        
        return false;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        // Usuários de agência ou admins impersonando podem criar planos
        return $this->isAgencyAdminOrImpersonating($user);
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Plan $plan): bool
    {
        // Verificar impersonação
        if (session()->has('impersonate.target')) {
            $impersonating = session()->get('impersonate.target');
            if ($impersonating['type'] === 'agency') {
                return $impersonating['id'] === $plan->agency_id;
            }
        }
        
        // Admins do sistema podem atualizar todos os planos
        if ($user->hasRole('admin.super')) {
            return true;
        }
        
        // Usuários de agência podem atualizar seus próprios planos
        if (($user->hasRole('agency.owner') || $user->hasRole('agency.admin')) && $user->agency_id === $plan->agency_id) {
            return true;
        }
        
        return false;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Plan $plan): bool
    {
        // Verificar se o plano está em uso - se estiver, ninguém pode excluir
        if ($plan->clients()->count() > 0) {
            return false;
        }
        
        // Verificar impersonação primeiro
        if (session()->has('impersonate.target')) {
            $impersonating = session()->get('impersonate.target');
            if ($impersonating['type'] === 'agency') {
                return $impersonating['id'] === $plan->agency_id;
            }
        }
        
        // Admins do sistema podem excluir planos
        if ($user->hasRole('admin.super')) {
            return true;
        }
        
        // Usuários de agência podem excluir seus próprios planos
        if (($user->hasRole('agency.owner') || $user->hasRole('agency.admin')) && $user->agency_id === $plan->agency_id) {
            return true;
        }
        
        return false;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Plan $plan): bool
    {
        // Verificar impersonação primeiro
        if (session()->has('impersonate.target')) {
            $impersonating = session()->get('impersonate.target');
            if ($impersonating['type'] === 'agency') {
                return $impersonating['id'] === $plan->agency_id;
            }
        }
        
        // Admins do sistema podem restaurar todos os planos
        if ($user->hasRole('admin.super')) {
            return true;
        }
        
        // Usuários de agência podem restaurar seus próprios planos
        if (($user->hasRole('agency.owner') || $user->hasRole('agency.admin')) && $user->agency_id === $plan->agency_id) {
            return true;
        }
        
        return false;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Plan $plan): bool
    {
        // Apenas admins do sistema podem excluir permanentemente planos
        return $user->hasRole('admin.super');
    }

    /**
     * Método auxiliar para verificar permissão de criar planos com base na agência atual
     */
    public function canCreateForAgency(User $user, $agencyId): bool
    {
        // Verificar impersonação primeiro
        if (session()->has('impersonate.target')) {
            $impersonating = session()->get('impersonate.target');
            if ($impersonating['type'] === 'agency') {
                return $impersonating['id'] === $agencyId;
            }
        }
        
        // Admins do sistema podem criar planos
        if ($user->hasRole('admin.super')) {
            return true;
        }
        
        // Usuários de agência podem criar planos para sua própria agência
        if (($user->hasRole('agency.owner') || $user->hasRole('agency.admin')) && $user->agency_id === $agencyId) {
            return true;
        }
        
        return false;
    }
}
