<?php

namespace App\Http\Controllers\Agency;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Client;
use Illuminate\Auth\Events\Verified;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    /**
     * Obtém o ID da agência atual, considerando impersonação
     */
    private function getAgencyId(): int
    {
        $impersonating = session()->get('impersonate.target');
        
        if ($impersonating && $impersonating['type'] === 'agency') {
            // Se está impersonando, usar o ID da agência da sessão
            return $impersonating['id'];
        }
        
        // Caso contrário, obter o ID da agência do usuário autenticado
        return auth()->user()->agency_id;
    }

    /**
     * Display a listing of users for the agency.
     */
    public function index(Request $request): Response
    {
        // Obter o ID da agência atual (considerando impersonação)
        $agencyId = $this->getAgencyId();
        
        // Obter usuários que pertencem à agência atual ou aos clientes da agência
        $query = User::query()
            ->with(['roles', 'client']);

        // Garantir que só serão exibidos usuários vinculados corretamente
        $query->where(function($query) use ($agencyId) {
            // Usuários da própria agência (colaboradores/funcionários)
            $query->where(function($q) use ($agencyId) {
                $q->where('agency_id', $agencyId)
                  ->whereNull('client_id') // Colaboradores da agência (sem vínculo com cliente)
                  ->whereHas('roles', function($r) {
                      $r->where('name', 'like', 'agency.%'); // Apenas com roles de agência
                  });
            });
            
            // OU usuários que pertencem a clientes da agência atual
            $query->orWhere(function($q) use ($agencyId) {
                $q->whereNotNull('client_id') // Deve ter um cliente vinculado
                  ->whereHas('client', function($clientQuery) use ($agencyId) {
                      $clientQuery->where('agency_id', $agencyId); // Cliente pertence à agência
                  })
                  ->whereHas('roles', function($r) {
                      $r->where('name', 'like', 'client.%'); // Apenas com roles de cliente
                  });
            });
        });
        
        // Excluir usuários admin do sistema
        $query->whereDoesntHave('roles', function($q) {
            $q->where('name', 'admin.super');
        });
            
        // Filtrar por termo de busca (nome, email)
        if ($request->has('search') && !empty($request->search)) {
            $searchTerm = $request->search;
            $query->where(function($q) use ($searchTerm) {
                $q->where('name', 'like', "%{$searchTerm}%")
                  ->orWhere('email', 'like', "%{$searchTerm}%");
                  
                // Buscar também pelo nome do cliente
                $q->orWhereHas('client', function($clientQuery) use ($searchTerm) {
                    $clientQuery->where('name', 'like', "%{$searchTerm}%");
                });
            });
        }
        
        // Filtrar por papel (role)
        if ($request->has('role') && !empty($request->role)) {
            $query->whereHas('roles', function($q) use ($request) {
                $q->where('name', $request->role);
            });
        }
        
        // Filtrar por status
        if ($request->has('status')) {
            if ($request->status === 'active') {
                $query->where('is_active', true);
            } elseif ($request->status === 'inactive') {
                $query->where('is_active', false);
            } elseif ($request->status === 'unverified') {
                $query->whereNull('email_verified_at');
            }
        }
        
        // Ordenar os resultados
        $query->orderBy('name');
        
        // Paginar os resultados
        $users = $query->paginate(10)
            ->withQueryString()
            ->through(function($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'email_verified_at' => $user->email_verified_at,
                    'is_active' => $user->is_active,
                    'roles' => $user->roles->pluck('name'),
                    'client' => $user->client ? [
                        'id' => $user->client->id,
                        'name' => $user->client->name,
                    ] : null,
                    'created_at' => $user->created_at,
                ];
            });
            
        return Inertia::render('Agency/Users/Index', [
            'users' => $users,
            'filters' => [
                'search' => $request->search ?? '',
                'role' => $request->role ?? 'all',
                'status' => $request->status ?? 'all',
            ],
        ]);
    }

    /**
     * Verifica se o usuário atual tem acesso para manipular o usuário alvo
     * 
     * @param User $user O usuário que está sendo manipulado
     * @return bool
     */
    private function hasAccessToUser(User $user): bool 
    {
        // Obter o ID da agência atual (considerando impersonação)
        $agencyId = $this->getAgencyId();
        
        // Usuário colaborador da agência (sem client_id e com role da agência)
        if ($user->agency_id === $agencyId && 
            $user->client_id === null) {
            // Verificar se tem alguma role de agência
            foreach ($user->roles as $role) {
                if (str_starts_with($role->name, 'agency.')) {
                    return true;
                }
            }
        }
        
        // Usuário vinculado a um cliente da agência (com client_id, cliente da agência e role de cliente)
        if ($user->client_id && 
            $user->client && 
            $user->client->agency_id === $agencyId) {
            // Verificar se tem alguma role de cliente
            foreach ($user->roles as $role) {
                if (str_starts_with($role->name, 'client.')) {
                    return true;
                }
            }
        }
        
        return false;
    }

    /**
     * Mark user's email as verified manually.
     */
    public function verifyEmail(User $user): RedirectResponse
    {
        if (!$this->hasAccessToUser($user)) {
            return redirect()->back()->with('error', 'Você não tem permissão para verificar este usuário.');
        }
        
        if (!$user->hasVerifiedEmail()) {
            $user->markEmailAsVerified();
            event(new Verified($user));
            
            // Registrar no log quem verificou o e-mail
            \Log::info('E-mail verificado manualmente', [
                'user_id' => $user->id,
                'user_email' => $user->email,
                'verified_by' => auth()->user()->id,
                'verified_by_name' => auth()->user()->name,
                'verified_by_role' => auth()->user()->roles->pluck('name')->first(),
            ]);
            
            return redirect()->back()->with('success', 'E-mail verificado com sucesso!');
        }
        
        return redirect()->back()->with('info', 'O e-mail deste usuário já está verificado.');
    }

    /**
     * Toggle user active status.
     */
    public function toggleStatus(User $user): RedirectResponse
    {
        if (!$this->hasAccessToUser($user)) {
            return redirect()->back()->with('error', 'Você não tem permissão para alterar o status deste usuário.');
        }
        
        $user->is_active = !$user->is_active;
        $user->save();
        
        $status = $user->is_active ? 'ativado' : 'desativado';
        
        \Log::info('Status do usuário alterado', [
            'user_id' => $user->id,
            'user_email' => $user->email,
            'status' => $status,
            'changed_by' => auth()->user()->id,
            'changed_by_name' => auth()->user()->name,
            'changed_by_role' => auth()->user()->roles->pluck('name')->first(),
        ]);
        
        return redirect()->back()->with('success', "Usuário {$status} com sucesso!");
    }

    /**
     * Exibe o formulário para editar usuário
     */
    public function edit(User $user)
    {
        if (!$this->hasAccessToUser($user)) {
            return redirect()->route('agency.users.index')
                ->with('error', 'Você não tem permissão para editar este usuário.');
        }

        // Buscar clientes da agência, considerando impersonação
        $clients = Client::where('agency_id', $this->getAgencyId())
            ->select('id', 'name')
            ->get();

        return Inertia::render('Agency/Users/Edit', [
            'user' => $user->load('roles'),
            'clients' => $clients
        ]);
    }

    /**
     * Atualiza os dados do usuário
     */
    public function update(Request $request, User $user)
    {
        if (!$this->hasAccessToUser($user)) {
            return redirect()->route('agency.users.index')
                ->with('error', 'Você não tem permissão para atualizar este usuário.');
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
            'client_id' => 'nullable|exists:clients,id',
        ]);

        // Verificar se o cliente selecionado pertence à agência
        if (!empty($validated['client_id'])) {
            $clientBelongsToAgency = \App\Models\Client::where('id', $validated['client_id'])
                ->where('agency_id', $this->getAgencyId())
                ->exists();
                
            if (!$clientBelongsToAgency) {
                return redirect()->back()
                    ->with('error', 'O cliente selecionado não pertence à sua agência.');
            }
        }

        $user->update([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'client_id' => $validated['client_id'] ?? null,
        ]);

        \Log::info('Usuário atualizado', [
            'user_id' => $user->id,
            'user_email' => $user->email,
            'updated_by' => auth()->user()->id,
            'updated_by_name' => auth()->user()->name,
        ]);

        return redirect()->route('agency.users.index')
            ->with('success', 'Usuário atualizado com sucesso.');
    }

    /**
     * Gera uma nova senha para o usuário.
     */
    public function generatePassword(User $user)
    {
        try {
            if (!$this->hasAccessToUser($user)) {
                return redirect()->route('agency.users.index')
                    ->with('error', 'Você não tem permissão para gerar senha para este usuário.');
            }

            $password = Str::random(12); // Senha mais longa para maior segurança
            $user->password = Hash::make($password);
            $user->save();

            \Log::info('Nova senha gerada para usuário', [
                'user_id' => $user->id,
                'user_email' => $user->email,
                'generated_by' => auth()->user()->id,
                'generated_by_name' => auth()->user()->name,
            ]);

            // Dados da senha gerada
            $passwordData = [
                'message' => 'Nova senha gerada com sucesso!',
                'password' => $password,
                'user_id' => $user->id,
                'timestamp' => now()->timestamp // Para garantir que é um novo valor
            ];

            // Buscar clientes da agência, considerando impersonação
            $clients = Client::where('agency_id', $this->getAgencyId())
                ->select('id', 'name')
                ->get();

            // Sempre retorna uma resposta Inertia para que o cliente possa processar corretamente
            return Inertia::render('Agency/Users/Edit', [
                'user' => $user->load('roles'),
                'clients' => $clients,
                'flash' => [
                    'password_generated' => $passwordData
                ]
            ]);
                
        } catch (\Exception $e) {
            \Log::error('Erro ao gerar nova senha', [
                'user_id' => $user->id,
                'error' => $e->getMessage()
            ]);

            // Buscar clientes da agência, considerando impersonação
            $clients = Client::where('agency_id', $this->getAgencyId())
                ->select('id', 'name')
                ->get();

            return Inertia::render('Agency/Users/Edit', [
                'user' => $user->load('roles'),
                'clients' => $clients,
                'flash' => [
                    'error' => 'Erro ao gerar nova senha: ' . $e->getMessage()
                ]
            ]);
        }
    }

    /**
     * Mostra o formulário para criar um novo usuário
     */
    public function create(): Response
    {
        // Buscar clientes da agência, considerando impersonação
        $clients = Client::where('agency_id', $this->getAgencyId())
            ->select('id', 'name')
            ->get();

        return Inertia::render('Agency/Users/Create', [
            'clients' => $clients
        ]);
    }

    /**
     * Armazena um novo usuário
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email',
            'password' => 'required|min:8|confirmed',
            'user_type' => 'required|in:agency,client',
            'client_id' => 'required_if:user_type,client|nullable|exists:clients,id',
        ]);

        // Verificar se o cliente selecionado pertence à agência (se for usuário de cliente)
        if ($validated['user_type'] === 'client' && !empty($validated['client_id'])) {
            $clientBelongsToAgency = Client::where('id', $validated['client_id'])
                ->where('agency_id', $this->getAgencyId())
                ->exists();
                
            if (!$clientBelongsToAgency) {
                return redirect()->back()
                    ->with('error', 'O cliente selecionado não pertence à sua agência.');
            }
        }

        // Definir dados do usuário
        $userData = [
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'is_active' => true,
        ];

        // Definir o vínculo com base no tipo de usuário
        if ($validated['user_type'] === 'agency') {
            $userData['agency_id'] = $this->getAgencyId();
            $userData['client_id'] = null;
        } else {
            $userData['agency_id'] = null;
            $userData['client_id'] = $validated['client_id'];
        }

        // Criar o usuário
        $user = User::create($userData);

        // Atribuir papel adequado
        if ($validated['user_type'] === 'agency') {
            $user->assignRole('agency.user');
        } else {
            $user->assignRole('client.user');
        }

        \Log::info('Usuário criado', [
            'user_id' => $user->id,
            'user_email' => $user->email,
            'created_by' => auth()->user()->id,
            'created_by_name' => auth()->user()->name,
        ]);

        return redirect()->route('agency.users.index')
            ->with('success', 'Usuário criado com sucesso.');
    }
} 