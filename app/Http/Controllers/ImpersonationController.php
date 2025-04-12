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
        
        // Garantir que a sessão seja salva imediatamente
        session()->save();
        
        // Registrar auditoria
        Log::channel('audit')->info('Impersonação iniciada', [
            'user_id' => Auth::id(),
            'agency_id' => $agency->id,
            'ip' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'session_data' => session()->get('impersonate'),
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
        // Verificar se já existe uma impersonação ativa (caso de impersonação em cascata)
        if (session()->has('impersonate.original_user')) {
            // Guardar os dados atuais de impersonação como impersonação em cascata
            session()->put('impersonate.cascade', [
                'original_user' => session()->get('impersonate.original_user'),
                'target' => session()->get('impersonate.target')
            ]);
            
            Log::channel('audit')->info('Impersonação em cascata iniciada', [
                'original_user' => session()->get('impersonate.original_user'),
                'intermediate_target' => session()->get('impersonate.target'),
                'final_target' => [
                    'id' => $client->id,
                    'name' => $client->name,
                    'type' => 'client'
                ]
            ]);
        } else {
            // Impersonação normal - guardar dados do usuário original na sessão
            session()->put('impersonate.original_user', [
                'id' => Auth::id(),
                'name' => Auth::user()->name,
                'role' => Auth::user()->getRoleNames()->first()
            ]);
        }
        
        // Guardar dados da entidade impersonada
        session()->put('impersonate.target', [
            'id' => $client->id,
            'name' => $client->name,
            'type' => 'client'
        ]);
        
        // Garantir que a sessão seja salva imediatamente
        session()->save();
        
        // Definir atributo para permitir acesso via middleware
        request()->attributes->add(['is_impersonating_client' => true]);
        
        // Registrar auditoria
        Log::channel('audit')->info('Impersonação de cliente iniciada', [
            'user_id' => Auth::id(),
            'client_id' => $client->id,
            'user_role' => Auth::user()->getRoleNames()->first(),
            'ip' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'session_data' => session()->get('impersonate'),
            'client_active' => $client->is_active,
            'client_agency_id' => $client->agency_id
        ]);

        // Em vez de redirecionar diretamente para o dashboard do cliente,
        // usamos uma página intermediária de redirecionamento HTML
        return response()->view('impersonation.redirect', [
            'redirect_to' => route('client.dashboard')
        ]);
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
        $cascade = session()->get('impersonate.cascade');
        
        // Registrar auditoria
        if ($originalUser && $target) {
            Log::channel('audit')->info('Impersonação finalizada', [
                'user_id' => $originalUser['id'],
                'target_id' => $target['id'],
                'target_type' => $target['type'],
                'has_cascade' => !empty($cascade),
                'ip' => request()->ip(),
                'user_agent' => request()->userAgent(),
                'session_id' => session()->getId(),
                'all_session_data' => session()->all()
            ]);
        }
        
        // Verificar se é uma impersonação em cascata
        if ($cascade) {
            // Restaurar o nível anterior de impersonação
            session()->put('impersonate.original_user', $cascade['original_user']);
            session()->put('impersonate.target', $cascade['target']);
            session()->forget('impersonate.cascade');
            
            Log::channel('audit')->info('Voltando ao nível anterior de impersonação', [
                'original_user' => $cascade['original_user'],
                'target' => $cascade['target'],
                'session_id' => session()->getId()
            ]);
            
            // Redirecionar para o dashboard apropriado com base no tipo de target
            if ($cascade['target']['type'] === 'agency') {
                return redirect()->route('agency.dashboard');
            } else if ($cascade['target']['type'] === 'client') {
                return redirect()->route('client.dashboard');
            }
            
            return redirect()->route('dashboard');
        }
        
        // Não é uma cascata, encerrar a impersonação completamente
        Log::channel('audit')->info('Encerramento completo da impersonação', [
            'original_user' => $originalUser,
            'target' => $target,
            'session_id' => session()->getId()
        ]);
        
        session()->forget('impersonate.original_user');
        session()->forget('impersonate.target');
        
        // Garantir que a sessão seja salva
        session()->save();
        
        // Verificar se a impersonação foi realmente removida
        Log::channel('audit')->info('Verificação após remoção de impersonação', [
            'has_impersonation_session' => session()->has('impersonate.target'),
            'session_data' => session()->all(),
            'session_id' => session()->getId()
        ]);
        
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