<?php

namespace App\Policies;

use App\Models\Contact;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;
use Illuminate\Support\Facades\Log;

class ContactPolicy
{
    use HandlesAuthorization;

    /**
     * Verifica se o usuário está impersonando um cliente
     */
    private function checkImpersonation(User $user, Contact $contact = null): bool
    {
        // Se for uma impersonação, verificar correspondência
        if (session()->has('impersonate')) {
            // Se estiver impersonando um cliente, verificar se o contato pertence a esse cliente
            if (session()->has('impersonate.target') && session()->get('impersonate.target')['type'] === 'client') {
                $impersonating = session()->get('impersonate.target');
                
                if ($contact) {
                    $hasPermission = (int)$impersonating['id'] === (int)$contact->client_id;
                    
                    Log::channel('audit')->info('Verificação de impersonação de cliente para contato', [
                        'result' => $hasPermission ? 'aprovado' : 'negado',
                        'impersonating_id' => (int)$impersonating['id'],
                        'contact_client_id' => (int)$contact->client_id
                    ]);
                    
                    return $hasPermission;
                }
                
                // Se não tiver contato (ex: listagem), deve permitir
                return true;
            }
            
            // Administradores de agência podem acessar contatos de seus clientes
            if (session()->has('impersonate.target') && session()->get('impersonate.target')['type'] === 'agency') {
                $impersonating = session()->get('impersonate.target');
                
                if ($contact && $contact->client) {
                    $hasPermission = (int)$contact->client->agency_id === (int)$impersonating['id'];
                    
                    Log::channel('audit')->info('Verificação de impersonação de agência para contato', [
                        'result' => $hasPermission ? 'aprovado' : 'negado',
                        'impersonating_agency_id' => (int)$impersonating['id'],
                        'contact_agency_id' => (int)$contact->client->agency_id
                    ]);
                    
                    return $hasPermission;
                }
                
                // Se não tiver contato (ex: listagem), deve permitir
                return true;
            }
        }
        
        return false;
    }

    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        // Administradores podem sempre ver todos os contatos
        if ($user->hasRole('admin.super')) {
            return true;
        }
        
        // Donos de agência podem ver contatos de seus clientes
        if ($user->hasRole('agency.owner') || $user->hasRole('agency.admin')) {
            return true;
        }
        
        // Se está impersonando um cliente ou agência
        if (session()->has('impersonate')) {
            return true;
        }
        
        // Se é usuário do cliente
        return $user->hasRole('client.admin') || $user->hasRole('client.user');
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Contact $contact): bool
    {
        // Administradores podem sempre ver detalhes de qualquer contato
        if ($user->hasRole('admin.super')) {
            return true;
        }
        
        // Se for uma agência, verificar se o contato pertence a um de seus clientes
        if (($user->hasRole('agency.owner') || $user->hasRole('agency.admin')) && $user->agency_id) {
            if ($contact->client && $contact->client->agency_id === $user->agency_id) {
                return true;
            }
        }
        
        // Verificar impersonação
        if ($this->checkImpersonation($user, $contact)) {
            return true;
        }
        
        // Verificar se o contato pertence ao cliente do usuário
        return $user->client && $contact->client_id === $user->client->id;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        // Administradores podem sempre criar contatos
        if ($user->hasRole('admin.super')) {
            return true;
        }
        
        // Donos de agência podem criar contatos para seus clientes durante impersonação
        if (($user->hasRole('agency.owner') || $user->hasRole('agency.admin')) && session()->has('impersonate.target')) {
            return true;
        }
        
        // Usuários de cliente podem criar contatos
        return $user->hasRole('client.admin') || $user->hasRole('client.user');
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Contact $contact): bool
    {
        // Administradores podem sempre atualizar qualquer contato
        if ($user->hasRole('admin.super')) {
            return true;
        }
        
        // Se for uma agência, verificar se o contato pertence a um de seus clientes
        if (($user->hasRole('agency.owner') || $user->hasRole('agency.admin')) && $user->agency_id) {
            if ($contact->client && $contact->client->agency_id === $user->agency_id) {
                return true;
            }
        }
        
        // Verificar impersonação
        if ($this->checkImpersonation($user, $contact)) {
            return true;
        }
        
        // Verificar se o contato pertence ao cliente do usuário
        return $user->client && $contact->client_id === $user->client->id;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Contact $contact): bool
    {
        // Administradores podem sempre excluir qualquer contato
        if ($user->hasRole('admin.super')) {
            return true;
        }
        
        // Se for uma agência, verificar se o contato pertence a um de seus clientes
        if (($user->hasRole('agency.owner') || $user->hasRole('agency.admin')) && $user->agency_id) {
            if ($contact->client && $contact->client->agency_id === $user->agency_id) {
                return true;
            }
        }
        
        // Verificar impersonação
        if ($this->checkImpersonation($user, $contact)) {
            return true;
        }
        
        // Verificar se o contato pertence ao cliente do usuário
        return $user->client && $contact->client_id === $user->client->id;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Contact $contact): bool
    {
        // Administradores podem sempre restaurar qualquer contato
        if ($user->hasRole('admin.super')) {
            return true;
        }
        
        // Se for uma agência, verificar se o contato pertence a um de seus clientes
        if (($user->hasRole('agency.owner') || $user->hasRole('agency.admin')) && $user->agency_id) {
            if ($contact->client && $contact->client->agency_id === $user->agency_id) {
                return true;
            }
        }
        
        // Verificar impersonação
        if ($this->checkImpersonation($user, $contact)) {
            return true;
        }
        
        // Verificar se o contato pertence ao cliente do usuário
        return $user->client && $contact->client_id === $user->client->id;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Contact $contact): bool
    {
        // Apenas administradores podem excluir permanentemente
        if ($user->hasRole('admin.super')) {
            return true;
        }
        
        // Donos de agência podem excluir permanentemente durante impersonação
        if ($user->hasRole('agency.owner') && $this->checkImpersonation($user, $contact)) {
            return true;
        }
        
        // Verificar se o contato pertence ao cliente do usuário e se ele é admin
        return $user->client && $contact->client_id === $user->client->id && $user->hasRole('client.admin');
    }
} 