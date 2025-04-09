<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Agency;
use App\Models\Client;
use App\Models\User;
use Illuminate\Auth\Events\Verified;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    /**
     * Display a listing of users.
     */
    public function index(Request $request): Response
    {
        Log::channel('audit')->info('Acessou lista de usuários', [
            'user_id' => auth()->id(),
            'ip' => request()->ip()
        ]);

        $query = User::query()
            ->with(['roles', 'client', 'agency']);
            
        // Filtrar por termo de busca (nome, email)
        if ($request->has('search') && !empty($request->search)) {
            $searchTerm = $request->search;
            $query->where(function($q) use ($searchTerm) {
                $q->where('name', 'like', "%{$searchTerm}%")
                  ->orWhere('email', 'like', "%{$searchTerm}%");
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
                    'agency' => $user->agency ? [
                        'id' => $user->agency->id,
                        'name' => $user->agency->name,
                    ] : null,
                    'created_at' => $user->created_at,
                ];
            });
            
        return Inertia::render('Admin/Users/Index', [
            'users' => $users,
            'filters' => [
                'search' => $request->search ?? '',
                'role' => $request->role ?? 'all',
                'status' => $request->status ?? 'all',
            ],
        ]);
    }

    /**
     * Mark user's email as verified manually.
     */
    public function verifyEmail(User $user): RedirectResponse
    {
        if ($user->hasVerifiedEmail()) {
            return redirect()->route('admin.users.index')
                ->with('info', 'E-mail já verificado anteriormente.');
        }

        $user->markEmailAsVerified();
        event(new Verified($user));

        Log::channel('audit')->info('Verificou e-mail do usuário manualmente', [
            'user_id' => auth()->id(),
            'ip' => request()->ip(),
            'target_user_id' => $user->id
        ]);

        return redirect()->route('admin.users.index')
            ->with('success', 'E-mail verificado com sucesso.');
    }

    /**
     * Toggle user active status.
     */
    public function toggleStatus(User $user): RedirectResponse
    {
        $user->is_active = !$user->is_active;
        $user->save();

        $status = $user->is_active ? 'ativado' : 'desativado';

        Log::channel('audit')->info("Usuário {$status}", [
            'user_id' => auth()->id(),
            'ip' => request()->ip(),
            'target_user_id' => $user->id,
            'new_status' => $user->is_active
        ]);

        return redirect()->back()->with('success', "Usuário {$status} com sucesso!");
    }

    public function create()
    {
        Log::channel('audit')->info('Acessou página de criação de usuário', [
            'user_id' => auth()->id(),
            'ip' => request()->ip()
        ]);

        return Inertia::render('Admin/Users/Create', [
            'clients' => Client::select('id', 'name')->get(),
            'agencies' => Agency::select('id', 'name')->get()
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => ['required', 'confirmed', Password::defaults()],
            'role' => 'required|string|in:admin,agency,client,user',
            'client_id' => 'required_if:role,client|exists:clients,id',
            'agency_id' => 'required_if:role,agency|exists:agencies,id'
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'],
            'client_id' => $validated['client_id'] ?? null,
            'agency_id' => $validated['agency_id'] ?? null,
            'is_active' => true
        ]);

        // Atribuir papel ao usuário
        $this->assignRole($user);

        Log::channel('audit')->info('Criou novo usuário', [
            'user_id' => auth()->id(),
            'ip' => request()->ip(),
            'created_user_id' => $user->id
        ]);

        return redirect()->route('admin.users.index')
            ->with('success', 'Usuário criado com sucesso.');
    }

    public function edit(User $user)
    {
        Log::channel('audit')->info('Acessou página de edição de usuário', [
            'user_id' => auth()->id(),
            'ip' => request()->ip(),
            'target_user_id' => $user->id
        ]);

        return Inertia::render('Admin/Users/Edit', [
            'user' => $user->load('roles'),
            'clients' => Client::select('id', 'name')->get(),
            'agencies' => Agency::select('id', 'name')->get()
        ]);
    }

    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
            'role' => 'required|string|in:admin,agency,client,user',
            'client_id' => 'required_if:role,client|exists:clients,id',
            'agency_id' => 'required_if:role,agency|exists:agencies,id'
        ]);

        // Se a role mudou, precisamos atualizar os papéis do usuário
        $roleChanged = $user->role !== $validated['role'];

        $user->update([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'role' => $validated['role'],
            'client_id' => $validated['client_id'] ?? null,
            'agency_id' => $validated['agency_id'] ?? null
        ]);

        // Se a role mudou, atualizar os papéis
        if ($roleChanged) {
            $this->assignRole($user);
        }

        Log::channel('audit')->info('Atualizou usuário', [
            'user_id' => auth()->id(),
            'ip' => request()->ip(),
            'target_user_id' => $user->id
        ]);

        return redirect()->route('admin.users.index')
            ->with('success', 'Usuário atualizado com sucesso.');
    }

    public function destroy(User $user)
    {
        if ($user->id === auth()->id()) {
            return redirect()->route('admin.users.index')
                ->with('error', 'Você não pode excluir seu próprio usuário.');
        }

        Log::channel('audit')->info('Excluiu usuário', [
            'user_id' => auth()->id(),
            'ip' => request()->ip(),
            'target_user_id' => $user->id
        ]);

        $user->delete();

        return redirect()->route('admin.users.index')
            ->with('success', 'Usuário excluído com sucesso.');
    }

    /**
     * Gera uma nova senha para o usuário.
     */
    public function generatePassword(User $user)
    {
        try {
            $password = Str::random(12); // Senha mais longa para maior segurança
            $user->password = Hash::make($password);
            $user->save();

            Log::channel('audit')->info('Gerou nova senha para usuário', [
                'user_id' => auth()->id(),
                'ip' => request()->ip(),
                'target_user_id' => $user->id
            ]);

            // Dados da senha gerada
            $passwordData = [
                'message' => 'Nova senha gerada com sucesso!',
                'password' => $password,
                'user_id' => $user->id,
                'timestamp' => now()->timestamp // Para garantir que é um novo valor
            ];

            // Sempre retorna uma resposta Inertia para que o cliente possa processar corretamente
            return Inertia::render('Admin/Users/Edit', [
                'user' => $user->load('roles'),
                'clients' => Client::select('id', 'name')->get(),
                'agencies' => Agency::select('id', 'name')->get(),
                'flash' => [
                    'password_generated' => $passwordData
                ]
            ]);
                
        } catch (\Exception $e) {
            Log::error('Erro ao gerar nova senha', [
                'user_id' => auth()->id(),
                'target_user_id' => $user->id,
                'error' => $e->getMessage()
            ]);

            return Inertia::render('Admin/Users/Edit', [
                'user' => $user->load('roles'),
                'clients' => Client::select('id', 'name')->get(),
                'agencies' => Agency::select('id', 'name')->get(),
                'flash' => [
                    'error' => 'Erro ao gerar nova senha: ' . $e->getMessage()
                ]
            ]);
        }
    }

    /**
     * Atribui o papel correto ao usuário com base na sua role.
     */
    private function assignRole(User $user): void
    {
        // Remover todos os papéis atuais
        $user->roles()->detach();

        // Atribuir o novo papel com base na role
        switch ($user->role) {
            case 'admin':
                $user->assignRole('admin.super');
                break;
            case 'agency':
                $user->assignRole('agency.owner');
                break;
            case 'client':
                $user->assignRole('client.owner');
                break;
            default:
                $user->assignRole('user');
                break;
        }
    }
} 