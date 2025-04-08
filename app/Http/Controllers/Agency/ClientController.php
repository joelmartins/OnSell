<?php

namespace App\Http\Controllers\Agency;

use App\Http\Controllers\Controller;
use App\Models\Client;
use App\Models\Plan;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class ClientController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        // Verificar se está impersonando uma agência
        $agencyId = null;
        $impersonating = session()->get('impersonate.target');
        
        if ($impersonating && $impersonating['type'] === 'agency') {
            // Se está impersonando, usar o ID da agência da sessão
            $agencyId = $impersonating['id'];
        } else {
            // Caso contrário, obter o ID da agência do usuário autenticado
            $agencyId = Auth::user()->agency_id;
        }
        
        // Consulta base para clientes da agência atual
        $query = Client::where('agency_id', $agencyId);
        
        // Aplicar filtro de busca, se fornecido
        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('domain', 'like', "%{$search}%");
            });
        }
        
        // Ordenar e paginar resultados
        $clients = $query->with(['plan'])
            ->orderBy('name')
            ->paginate(10)
            ->through(function($client) {
                return [
                    'id' => $client->id,
                    'name' => $client->name,
                    'email' => $client->email,
                    'domain' => $client->domain,
                    'is_active' => $client->is_active,
                    'plan' => $client->plan ? [
                        'id' => $client->plan->id,
                        'name' => $client->plan->name,
                    ] : null,
                    'created_at' => $client->created_at,
                ];
            });
        
        return Inertia::render('Agency/Clients/Index', [
            'clients' => $clients,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        // Verificar se está impersonando uma agência
        $agencyId = null;
        $impersonating = session()->get('impersonate.target');
        
        if ($impersonating && $impersonating['type'] === 'agency') {
            // Se está impersonando, usar o ID da agência da sessão
            $agencyId = $impersonating['id'];
        } else {
            // Caso contrário, obter o ID da agência do usuário autenticado
            $agencyId = Auth::user()->agency_id;
        }
        
        // Obter planos disponíveis para a agência
        $plans = Plan::where('agency_id', $agencyId)
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'description', 'price', 'period']);
        
        return Inertia::render('Agency/Clients/Create', [
            'plans' => $plans,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        // Verificar se está impersonando uma agência
        $agencyId = null;
        $impersonating = session()->get('impersonate.target');
        
        if ($impersonating && $impersonating['type'] === 'agency') {
            // Se está impersonando, usar o ID da agência da sessão
            $agencyId = $impersonating['id'];
        } else {
            // Caso contrário, obter o ID da agência do usuário autenticado
            $agencyId = Auth::user()->agency_id;
        }
        
        // Validar os dados da requisição
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'nullable|email|max:255',
            'document' => 'nullable|string|max:30',
            'phone' => 'nullable|string|max:30',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
            'plan_id' => 'nullable|exists:plans,id',
            'logo' => 'nullable|string',
            
            // Dados do usuário principal, se solicitado
            'create_user' => 'boolean',
            'user_name' => 'required_if:create_user,true|string|max:255',
            'user_email' => 'required_if:create_user,true|email|unique:users,email|max:255',
            'user_password' => 'required_if:create_user,true|string|min:8',
        ]);
        
        // Adicionar o ID da agência aos dados validados
        $validated['agency_id'] = $agencyId;
        
        // Remover campos do usuário para não interferir na criação do cliente
        $createUser = $validated['create_user'] ?? false;
        $userData = null;
        
        if ($createUser) {
            $userData = [
                'name' => $validated['user_name'],
                'email' => $validated['user_email'],
                'password' => $validated['user_password'],
            ];
            
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
            ->route('agency.clients.index')
            ->with('success', 'Cliente criado com sucesso!');
    }

    /**
     * Display the specified resource.
     */
    public function show(Client $client): Response
    {
        // Verificar se está impersonando uma agência
        $agencyId = null;
        $impersonating = session()->get('impersonate.target');
        
        if ($impersonating && $impersonating['type'] === 'agency') {
            // Se está impersonando, usar o ID da agência da sessão
            $agencyId = $impersonating['id'];
        } else {
            // Caso contrário, obter o ID da agência do usuário autenticado
            $agencyId = Auth::user()->agency_id;
        }
        
        // Verificar se o cliente pertence à agência correta
        if ($client->agency_id !== $agencyId) {
            abort(403, 'Você não tem permissão para visualizar este cliente.');
        }
        
        $client->load(['plan']);
        
        return Inertia::render('Agency/Clients/Show', [
            'client' => [
                'id' => $client->id,
                'name' => $client->name,
                'email' => $client->email,
                'domain' => $client->domain,
                'is_active' => $client->is_active,
                'plan' => $client->plan ? [
                    'id' => $client->plan->id,
                    'name' => $client->plan->name,
                ] : null,
                'created_at' => $client->created_at,
                'updated_at' => $client->updated_at,
            ]
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Client $client): Response
    {
        // Verificar se está impersonando uma agência
        $agencyId = null;
        $impersonating = session()->get('impersonate.target');
        
        if ($impersonating && $impersonating['type'] === 'agency') {
            // Se está impersonando, usar o ID da agência da sessão
            $agencyId = $impersonating['id'];
        } else {
            // Caso contrário, obter o ID da agência do usuário autenticado
            $agencyId = Auth::user()->agency_id;
        }
        
        // Verificar se o cliente pertence à agência correta
        if ($client->agency_id !== $agencyId) {
            abort(403, 'Você não tem permissão para editar este cliente.');
        }
        
        $client->load(['plan']);
        
        // Obter planos disponíveis para a agência
        $plans = Plan::where('agency_id', $agencyId)
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'description', 'price', 'period']);
        
        return Inertia::render('Agency/Clients/Edit', [
            'client' => $client,
            'plans' => $plans,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Client $client): RedirectResponse
    {
        // Verificar se está impersonando uma agência
        $agencyId = null;
        $impersonating = session()->get('impersonate.target');
        
        if ($impersonating && $impersonating['type'] === 'agency') {
            // Se está impersonando, usar o ID da agência da sessão
            $agencyId = $impersonating['id'];
        } else {
            // Caso contrário, obter o ID da agência do usuário autenticado
            $agencyId = Auth::user()->agency_id;
        }
        
        // Verificar se o cliente pertence à agência correta
        if ($client->agency_id !== $agencyId) {
            abort(403, 'Você não tem permissão para modificar este cliente.');
        }
        
        // Validar os dados da requisição
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'nullable|email|max:255',
            'document' => 'nullable|string|max:30',
            'phone' => 'nullable|string|max:30',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
            'plan_id' => 'nullable|exists:plans,id',
            'logo' => 'nullable|string',
            
            // Dados do usuário principal, se solicitado
            'create_user' => 'boolean',
            'user_name' => 'required_if:create_user,true|string|max:255',
            'user_email' => 'required_if:create_user,true|email|unique:users,email|max:255',
            'user_password' => 'required_if:create_user,true|string|min:8',
        ]);
        
        // Remover campos do usuário para não interferir na atualização do cliente
        $createUser = $validated['create_user'] ?? false;
        $userData = null;
        
        if ($createUser) {
            $userData = [
                'name' => $validated['user_name'],
                'email' => $validated['user_email'],
                'password' => $validated['user_password'],
            ];
            
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
            ->route('agency.clients.index')
            ->with('success', 'Cliente atualizado com sucesso!');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Client $client): RedirectResponse
    {
        // Verificar se está impersonando uma agência
        $agencyId = null;
        $impersonating = session()->get('impersonate.target');
        
        if ($impersonating && $impersonating['type'] === 'agency') {
            // Se está impersonando, usar o ID da agência da sessão
            $agencyId = $impersonating['id'];
        } else {
            // Caso contrário, obter o ID da agência do usuário autenticado
            $agencyId = Auth::user()->agency_id;
        }
        
        // Verificar se o cliente pertence à agência correta
        if ($client->agency_id !== $agencyId) {
            abort(403, 'Você não tem permissão para excluir este cliente.');
        }
        
        // Verificar se há usuários associados
        if ($client->users()->count() > 0) {
            return back()->with('error', 'Este cliente possui usuários associados e não pode ser excluído.');
        }
        
        // Excluir o cliente
        $client->delete();
        
        return redirect()
            ->route('agency.clients.index')
            ->with('success', 'Cliente excluído com sucesso!');
    }
    
    /**
     * Toggle the active status of the specified client.
     */
    public function toggleStatus(Client $client): RedirectResponse
    {
        // Verificar se está impersonando uma agência
        $agencyId = null;
        $impersonating = session()->get('impersonate.target');
        
        if ($impersonating && $impersonating['type'] === 'agency') {
            // Se está impersonando, usar o ID da agência da sessão
            $agencyId = $impersonating['id'];
        } else {
            // Caso contrário, obter o ID da agência do usuário autenticado
            $agencyId = Auth::user()->agency_id;
        }
        
        // Verificar se o cliente pertence à agência correta
        if ($client->agency_id !== $agencyId) {
            abort(403, 'Você não tem permissão para modificar este cliente.');
        }
        
        $client->update([
            'is_active' => !$client->is_active
        ]);
        
        $statusMessage = $client->is_active 
            ? 'Cliente ativado com sucesso!' 
            : 'Cliente desativado com sucesso!';
        
        return back()->with('success', $statusMessage);
    }
}
