<?php

namespace App\Http\Controllers;

use App\Models\Agency;
use App\Models\Client;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class ImpersonationController extends Controller
{
    /**
     * Impersonate an agency
     *
     * @param Agency $agency
     * @return \Illuminate\Http\RedirectResponse
     */
    public function impersonateAgency(Agency $agency)
    {
        // Guardar dados do usuário original na sessão
        session()->put('impersonate.original_user', [
            'id' => Auth::id(),
            'name' => Auth::user()->name,
            'role' => Auth::user()->getRoleNames()->first()
        ]);
        
        // Guardar dados da entidade impersonada
        session()->put('impersonate.target', [
            'id' => $agency->id,
            'name' => $agency->name,
            'type' => 'agency'
        ]);
        
        // Registrar auditoria
        Log::channel('audit')->info('Impersonação iniciada', [
            'user_id' => Auth::id(),
            'agency_id' => $agency->id,
            'ip' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);
        
        // Redirecionar para o dashboard da agência
        return redirect()->route('agency.dashboard');
    }
    
    /**
     * Impersonate a client
     *
     * @param Client $client
     * @return \Illuminate\Http\RedirectResponse
     */
    public function impersonateClient(Client $client)
    {
        // Guardar dados do usuário original na sessão
        session()->put('impersonate.original_user', [
            'id' => Auth::id(),
            'name' => Auth::user()->name,
            'role' => Auth::user()->getRoleNames()->first()
        ]);
        
        // Guardar dados da entidade impersonada
        session()->put('impersonate.target', [
            'id' => $client->id,
            'name' => $client->name,
            'type' => 'client'
        ]);
        
        // Registrar auditoria
        Log::channel('audit')->info('Impersonação iniciada', [
            'user_id' => Auth::id(),
            'client_id' => $client->id,
            'ip' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);
        
        // Redirecionar para o dashboard do cliente
        return redirect()->route('client.dashboard');
    }
    
    /**
     * Stop impersonating
     *
     * @return \Illuminate\Http\RedirectResponse
     */
    public function stopImpersonating()
    {
        // Buscar dados do usuário original
        $originalUser = session()->get('impersonate.original_user');
        $target = session()->get('impersonate.target');
        $user = Auth::user();
        
        // Remover papéis temporários
        if ($target) {
            if ($target['type'] === 'client') {
                $user->removeRole('client.user');
            }
            
            if ($target['type'] === 'agency') {
                $user->removeRole('agency.owner');
            }
            
            // Restaurar papéis originais
            $originalRoles = session()->get('impersonate.original_roles', []);
            
            if (!empty($originalRoles)) {
                if (isset($originalRoles['admin']) && $originalRoles['admin']) {
                    $user->assignRole('admin.super');
                }
                
                if (isset($originalRoles['agency']) && $originalRoles['agency']) {
                    $user->assignRole('agency.owner');
                }
                
                if (isset($originalRoles['client']) && $originalRoles['client']) {
                    $user->assignRole('client.user');
                }
                
                session()->forget('impersonate.original_roles');
            } else {
                // Caso não tenha guardado informações de papéis, restaurar baseado no papel original
                if ($originalUser && isset($originalUser['role'])) {
                    $user->assignRole($originalUser['role']);
                }
            }
        }
        
        // Registrar auditoria
        if ($originalUser && $target) {
            Log::channel('audit')->info('Impersonação finalizada', [
                'user_id' => $originalUser['id'],
                'target_id' => $target['id'],
                'target_type' => $target['type'],
                'ip' => request()->ip(),
                'user_agent' => request()->userAgent(),
            ]);
        }
        
        // Limpar dados de impersonação da sessão
        session()->forget('impersonate.original_user');
        session()->forget('impersonate.target');
        
        // Redirecionar para o dashboard principal baseado no papel do usuário
        if ($originalUser) {
            if ($originalUser['role'] == 'admin.super') {
                return redirect()->route('admin.dashboard');
            } elseif ($originalUser['role'] == 'agency.owner') {
                return redirect()->route('agency.dashboard');
            }
        }
        
        return redirect()->route('dashboard');
    }
    
    /**
     * Get impersonation targets for current user
     *
     * @return array
     */
    public function getImpersonationTargets()
    {
        $user = Auth::user();
        $targets = [];
        
        if ($user->hasRole('admin.super')) {
            $targets['agencies'] = Agency::where('is_active', true)->get(['id', 'name']);
            $targets['clients'] = Client::where('is_active', true)->get(['id', 'name']);
        } elseif ($user->hasRole('agency.owner')) {
            $agency = $user->agency;
            if ($agency) {
                $targets['clients'] = Client::where('agency_id', $agency->id)
                    ->where('is_active', true)
                    ->get(['id', 'name']);
            }
        }
        
        return $targets;
    }
} 