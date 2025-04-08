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
        
        $client = Client::create($validated);
        
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
        
        $client->update($validated);
        
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