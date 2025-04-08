<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\ClientRequest;
use App\Models\Agency;
use App\Models\Client;
use App\Models\Plan;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ClientController extends Controller
{
    /**
     * Display a listing of clients.
     */
    public function index(): Response
    {
        $clients = Client::with(['agency', 'plan'])
            ->orderBy('name')
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
                    'created_at' => $client->created_at,
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
            $user->assignRole('client.owner');
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
            $user->assignRole('client.owner');
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
            return back()->with('error', 'Este cliente possui usuários associados e não pode ser excluído.');
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
        
        $statusMessage = $client->is_active 
            ? 'Cliente ativado com sucesso!' 
            : 'Cliente desativado com sucesso!';
        
        return back()->with('success', $statusMessage);
    }
} 