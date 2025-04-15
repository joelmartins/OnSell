<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\ClientRequest;
use App\Models\Agency;
use App\Models\Client;
use App\Models\Plan;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;
use Laravel\Cashier\Subscription;
use Stripe\StripeClient;

class ClientController extends Controller
{
    /**
     * Display a listing of clients.
     */
    public function index(): Response
    {
        $clients = Client::with(['agency', 'plan', 'users'])
            ->orderBy('name')
            ->paginate(10)
            ->through(function($client) {
                $user = $client->users()->first();
                $subscription = $user ? $user->subscription('default') : null;
                return [
                    'id' => $client->id,
                    'name' => $client->name,
                    'email' => $client->email,
                    'is_active' => $client->is_active,
                    'agency' => $client->agency ? [
                        'id' => $client->agency->id,
                        'name' => $client->agency->name,
                    ] : null,
                    'plan' => $client->plan ? [
                        'id' => $client->plan->id,
                        'name' => $client->plan->name,
                    ] : null,
                    'created_at' => $client->created_at,
                    'subscription_status' => $subscription ? $subscription->stripe_status : null,
                ];
            });
            
        return Inertia::render('Admin/Clients/Index', [
            'clients' => $clients,
        ]);
    }

    /**
     * Show the form for creating a new client.
     */
    public function create(): Response
    {
        $agencies = Agency::where('is_active', true)
            ->orderBy('name')
            ->get();
            
        $plans = Plan::where('is_active', true)
            ->orderBy('name')
            ->get();
            
        return Inertia::render('Admin/Clients/Create', [
            'agencies' => $agencies,
            'plans' => $plans,
        ]);
    }

    /**
     * Store a newly created client in storage.
     */
    public function store(ClientRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        
        // Convert empty strings or "null" strings to null for foreign keys
        $validated['agency_id'] = ($validated['agency_id'] === 'null' || empty($validated['agency_id'])) ? null : $validated['agency_id'];
        $validated['plan_id'] = ($validated['plan_id'] === 'null' || empty($validated['plan_id'])) ? null : $validated['plan_id'];
        
        // Remove os campos de usuário do array de dados do cliente
        $createUser = isset($validated['create_user']) ? (bool) $validated['create_user'] : false;
        $userData = null;
        
        if ($createUser) {
            $userData = [
                'name' => $validated['user_name'],
                'email' => $validated['user_email'],
                'password' => $validated['user_password'],
            ];
            
            // Remover campos do usuário para não interferir na criação do cliente
            unset($validated['create_user']);
            unset($validated['user_name']);
            unset($validated['user_email']);
            unset($validated['user_password']);
        }
        
        // Criar o cliente
        $client = Client::create($validated);
        
        // Se solicitado, criar o primeiro usuário do cliente
        if ($createUser && $userData) {
            $user = new \App\Models\User([
                'name' => $userData['name'],
                'email' => $userData['email'],
                'password' => bcrypt($userData['password']),
                'client_id' => $client->id,
            ]);
            
            $user->save();
            $user->assignRole('client.user');
        }
        
        return redirect()
            ->route('admin.clients.index')
            ->with('success', 'Cliente criado com sucesso!');
    }

    /**
     * Display the specified client.
     */
    public function show(Client $client): Response
    {
        $client->load(['agency', 'plan']);
        
        return Inertia::render('Admin/Clients/Show', [
            'client' => $client,
        ]);
    }

    /**
     * Show the form for editing the specified client.
     */
    public function edit(Client $client): Response
    {
        $client->load(['agency', 'plan']);
        
        $agencies = Agency::where('is_active', true)
            ->orderBy('name')
            ->get();
            
        $plans = Plan::where('is_active', true)
            ->orderBy('name')
            ->get();
            
        return Inertia::render('Admin/Clients/Edit', [
            'client' => $client,
            'agencies' => $agencies,
            'plans' => $plans,
        ]);
    }

    /**
     * Update the specified client in storage.
     */
    public function update(ClientRequest $request, Client $client): RedirectResponse
    {
        $validated = $request->validated();
        
        // Convert empty strings or "null" strings to null for foreign keys
        $validated['agency_id'] = ($validated['agency_id'] === 'null' || empty($validated['agency_id'])) ? null : $validated['agency_id'];
        $validated['plan_id'] = ($validated['plan_id'] === 'null' || empty($validated['plan_id'])) ? null : $validated['plan_id'];
        
        // Remove os campos de usuário do array de dados do cliente
        $createUser = isset($validated['create_user']) ? (bool) $validated['create_user'] : false;
        $userData = null;
        
        if ($createUser) {
            $userData = [
                'name' => $validated['user_name'],
                'email' => $validated['user_email'],
                'password' => $validated['user_password'],
            ];
            
            // Remover campos do usuário para não interferir na atualização do cliente
            unset($validated['create_user']);
            unset($validated['user_name']);
            unset($validated['user_email']);
            unset($validated['user_password']);
        }
        
        // Atualizar o cliente
        $client->update($validated);
        
        // Se solicitado, criar um novo usuário para o cliente
        if ($createUser && $userData) {
            $user = new \App\Models\User([
                'name' => $userData['name'],
                'email' => $userData['email'],
                'password' => bcrypt($userData['password']),
                'client_id' => $client->id,
            ]);
            
            $user->save();
            $user->assignRole('client.user');
        }
        
        return redirect()
            ->route('admin.clients.index')
            ->with('success', 'Cliente atualizado com sucesso!');
    }

    /**
     * Remove the specified client from storage.
     */
    public function destroy(Client $client): RedirectResponse
    {
        // Verificar se há usuários associados
        if ($client->users()->count() > 0) {
            // Em vez de desassociar, vamos desabilitar os usuários
            $client->users()->update(['is_active' => false]);
            
            \Log::channel('audit')->info('Usuários desabilitados ao excluir cliente', [
                'client_id' => $client->id,
                'client_name' => $client->name,
                'num_users' => $client->users()->count(),
                'user_id' => auth()->id() ?? 'sistema'
            ]);
        }
        
        $client->delete();
        
        return redirect()
            ->route('admin.clients.index')
            ->with('success', 'Cliente excluído com sucesso!');
    }

    /**
     * Toggle the active status of the specified client.
     */
    public function toggleStatus(Client $client): RedirectResponse
    {
        $client->update([
            'is_active' => !$client->is_active
        ]);

        // Se desativou, cancelar assinatura Stripe se existir
        if (!$client->is_active) {
            $subscription = $client->subscription('default');
            if ($subscription && $subscription->valid()) {
                try {
                    $subscription->cancel(); // Cancela no Stripe e marca como cancelada localmente
                } catch (\Exception $e) {
                    \Log::error('Erro ao cancelar assinatura Stripe ao desativar cliente', [
                        'client_id' => $client->id,
                        'error' => $e->getMessage()
                    ]);
                }
            }
        }

        $statusMessage = $client->is_active 
            ? 'Cliente ativado com sucesso!' 
            : 'Cliente desativado e cobrança cancelada!';

        return back()->with('success', $statusMessage);
    }

    /**
     * Display a listing of clients that have been soft deleted.
     */
    public function trashedIndex(Request $request): Response
    {
        // Verificar se o usuário é admin
        if (!Auth::user()->hasRole('admin.super')) {
            abort(403, 'Apenas administradores podem visualizar clientes excluídos.');
        }
        
        $query = Client::onlyTrashed()->with(['agency', 'plan']);
        
        // Aplicar filtro de busca, se fornecido
        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }
        
        $clients = $query->orderBy('deleted_at', 'desc')
            ->paginate(10)
            ->through(function($client) {
                return [
                    'id' => $client->id,
                    'name' => $client->name,
                    'email' => $client->email,
                    'is_active' => $client->is_active,
                    'agency' => $client->agency ? [
                        'id' => $client->agency->id,
                        'name' => $client->agency->name,
                    ] : null,
                    'plan' => $client->plan ? [
                        'id' => $client->plan->id,
                        'name' => $client->plan->name,
                    ] : null,
                    'deleted_at' => $client->deleted_at,
                    'created_at' => $client->created_at,
                ];
            });
            
        return Inertia::render('Admin/Clients/Trashed', [
            'clients' => $clients,
        ]);
    }
    
    /**
     * Restore a client that has been soft deleted.
     */
    public function restore($id): RedirectResponse
    {
        // Verificar se o usuário é admin
        if (!Auth::user()->hasRole('admin.super')) {
            abort(403, 'Apenas administradores podem restaurar clientes excluídos.');
        }
        
        $client = Client::onlyTrashed()->findOrFail($id);
        $client->restore();
        
        \Log::channel('audit')->info('Cliente restaurado manualmente pelo admin', [
            'client_id' => $client->id,
            'client_name' => $client->name,
            'admin_id' => auth()->id(),
            'admin_name' => auth()->user()->name
        ]);
        
        return redirect()
            ->route('admin.clients.trashed')
            ->with('success', 'Cliente restaurado com sucesso!');
    }
    
    /**
     * Permanently delete a client.
     */
    public function forceDelete($id): RedirectResponse
    {
        // Verificar se o usuário é admin
        if (!Auth::user()->hasRole('admin.super')) {
            abort(403, 'Apenas administradores podem excluir permanentemente clientes.');
        }
        
        $client = Client::withTrashed()->findOrFail($id);
        
        // Registrar informações do cliente antes da exclusão permanente
        \Log::channel('audit')->info('Cliente será excluído permanentemente', [
            'client_id' => $client->id,
            'client_name' => $client->name,
            'agency_id' => $client->agency_id,
            'admin_id' => auth()->id(),
            'admin_name' => auth()->user()->name
        ]);
        
        // Verificar se há usuários associados
        $usersCount = $client->users()->count();
        if ($usersCount > 0) {
            \Log::channel('audit')->warning('Cliente excluído permanentemente tem usuários associados', [
                'client_id' => $client->id,
                'users_count' => $usersCount
            ]);
            
            // Desassociar usuários antes de excluir permanentemente
            $client->users()->update(['client_id' => null]);
        }
        
        $client->forceDelete();
        
        return redirect()
            ->route('admin.clients.trashed')
            ->with('success', 'Cliente excluído permanentemente com sucesso!');
    }

    /**
     * Retorna o histórico de invoices do owner do cliente.
     */
    public function invoices(Client $client)
    {
        $owner = $client->users()->whereHas('roles', function($q) {
            $q->where('name', 'client.user');
        })->first();
        if (!$owner) {
            return response()->json(['error' => 'Owner do cliente não encontrado.'], 404);
        }
        $invoices = collect($owner->invoices())->map(function($invoice) {
            return [
                'id' => $invoice->id,
                'date' => $invoice->date()->format('Y-m-d'),
                'amount' => 'R$ ' . number_format($invoice->total() / 100, 2, ',', '.'),
                'status' => $invoice->paid ? 'Pago' : 'Pendente',
                'url' => $invoice->hosted_invoice_url,
            ];
        });
        return response()->json(['invoices' => $invoices]);
    }
} 