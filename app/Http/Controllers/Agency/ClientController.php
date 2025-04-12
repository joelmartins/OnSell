<?php

namespace App\Http\Controllers\Agency;

use App\Http\Controllers\Controller;
use App\Models\Client;
use App\Models\Plan;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class ClientController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): InertiaResponse
    {
        // Verificar se está impersonando uma agência
        $agencyId = null;
        $impersonating = session()->get('impersonate.target');
        
        if ($impersonating && $impersonating['type'] === 'agency') {
            // Se está impersonando, usar o ID da agência da sessão
            $agencyId = $impersonating['id'];
            \Log::channel('audit')->info('Index: Impersonando agência', [
                'agency_id' => $agencyId,
                'user_id' => Auth::id(),
                'original_user' => session()->get('impersonate.original_user'),
                'route' => request()->route()->getName()
            ]);
        } else {
            // Caso contrário, obter o ID da agência do usuário autenticado
            $agencyId = Auth::user()->agency_id;
        }
        
        // Consulta base para clientes da agência atual
        // Quando usamos o modelo Client diretamente, o SoftDeletes já exclui os soft-deleted automaticamente
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
        
        // Log para debug da query
        \Log::channel('audit')->info('Consulta de clientes', [
            'agency_id' => $agencyId,
            'sql' => $query->toSql(),
            'bindings' => $query->getBindings(),
            'is_impersonating' => session()->has('impersonate.target'),
            'user_id' => Auth::id()
        ]);
        
        // Testar explicitamente que o soft delete está funcionando
        $withTrashedCount = Client::withTrashed()->where('agency_id', $agencyId)->count();
        $withoutTrashedCount = Client::where('agency_id', $agencyId)->count();
        
        \Log::channel('audit')->info('Contagem de clientes com/sem trashed', [
            'with_trashed' => $withTrashedCount,
            'without_trashed' => $withoutTrashedCount,
            'difference' => $withTrashedCount - $withoutTrashedCount,
            'agency_id' => $agencyId
        ]);
        
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
    public function create(): InertiaResponse
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
            $user->assignRole('client.user');
        }
        
        return redirect()
            ->route('agency.clients.index')
            ->with('success', 'Cliente criado com sucesso!');
    }

    /**
     * Display the specified resource.
     */
    public function show(Client $client): InertiaResponse
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
        
        // Verificar explicitamente se o cliente foi excluído (verificação de segurança)
        // Isso não deveria ser necessário porque o Laravel já faz isso, mas estamos sendo cautelosos
        $clientWithTrashed = Client::withTrashed()->find($client->id);
        if ($clientWithTrashed && $clientWithTrashed->deleted_at) {
            \Log::channel('audit')->warning('Tentativa de acessar cliente excluído', [
                'client_id' => $client->id,
                'client_name' => $client->name,
                'deleted_at' => $clientWithTrashed->deleted_at,
                'user_id' => Auth::id(),
                'route' => request()->route()->getName()
            ]);
            
            abort(404, 'Este cliente não está mais disponível pois foi excluído.');
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
    public function edit(Client $client): InertiaResponse
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
        
        // Verificar explicitamente se o cliente foi excluído (verificação de segurança)
        $clientWithTrashed = Client::withTrashed()->find($client->id);
        if ($clientWithTrashed && $clientWithTrashed->deleted_at) {
            \Log::channel('audit')->warning('Tentativa de editar cliente excluído', [
                'client_id' => $client->id,
                'client_name' => $client->name,
                'deleted_at' => $clientWithTrashed->deleted_at,
                'user_id' => Auth::id(),
                'route' => request()->route()->getName()
            ]);
            
            abort(404, 'Este cliente não está mais disponível pois foi excluído.');
        }
        
        // Carregar o plano do cliente e transformar todos os IDs em strings
        $client->load(['plan']);
        
        // Obter planos disponíveis para a agência
        $plans = Plan::where('agency_id', $agencyId)
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'description', 'price', 'period'])
            ->map(function($plan) {
                // Garantir que os IDs sejam retornados como inteiros (não strings)
                return [
                    'id' => (int)$plan->id,
                    'name' => $plan->name,
                    'description' => $plan->description,
                    'price' => (float)$plan->price,
                    'period' => $plan->period
                ];
            });
        
        // Log para debug
        \Log::info('Carregando dados do cliente para edição', [
            'client_id' => $client->id,
            'client_plan_id' => $client->plan_id,
            'available_plans' => $plans->pluck('id')->toArray(),
        ]);
        
        // Transformar client->plan_id em string antes de enviar para a view
        if ($client->plan_id !== null) {
            $client->plan_id = (string)$client->plan_id;
        }
        
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
        try {
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
                \Log::warning('Tentativa de acesso não autorizado', [
                    'user_id' => Auth::id(),
                    'client_id' => $client->id,
                    'client_agency_id' => $client->agency_id,
                    'user_agency_id' => $agencyId
                ]);
                abort(403, 'Você não tem permissão para modificar este cliente.');
            }
            
            // Verificar explicitamente se o cliente foi excluído (verificação de segurança)
            $clientWithTrashed = Client::withTrashed()->find($client->id);
            if ($clientWithTrashed && $clientWithTrashed->deleted_at) {
                \Log::channel('audit')->warning('Tentativa de atualizar cliente excluído', [
                    'client_id' => $client->id,
                    'client_name' => $client->name,
                    'deleted_at' => $clientWithTrashed->deleted_at,
                    'user_id' => Auth::id(),
                    'route' => request()->route()->getName()
                ]);
                
                return back()->withErrors(['error' => 'Este cliente foi excluído e não pode ser atualizado.']);
            }
            
            // Log de dados recebidos para debug
            \Log::info('Dados recebidos para atualização de cliente:', [
                'client_id' => $client->id,
                'all_data' => $request->all(),
                'content_type' => $request->header('Content-Type'),
                'method' => $request->method(),
                'spoofed_method' => $request->input('_method')
            ]);
            
            // Validar os dados da requisição
            try {
                // Regras básicas para clientes sempre presentes
                $rules = [
                    'name' => 'required|string|max:255',
                    'email' => 'nullable|email|max:255',
                    'document' => 'nullable|string|max:30',
                    'phone' => 'nullable|string|max:30',
                    'description' => 'nullable|string',
                    'is_active' => 'boolean',
                    'plan_id' => 'nullable|exists:plans,id',
                    'logo' => 'nullable|string',
                ];
                
                // Adicionar regras de usuário apenas se create_user estiver presente
                if ($request->has('create_user')) {
                    $rules['create_user'] = 'boolean';
                    $rules['user_name'] = 'required_if:create_user,true|string|max:255';
                    $rules['user_email'] = 'required_if:create_user,true|email|unique:users,email|max:255';
                    $rules['user_password'] = 'required_if:create_user,true|string|min:8';
                }
                
                $validated = $request->validate($rules);
                
            } catch (\Illuminate\Validation\ValidationException $e) {
                \Log::error('Erro de validação', [
                    'errors' => $e->errors(),
                    'data' => $request->all()
                ]);
                throw $e;
            }
            
            // Tratar plan_id vazio ou 'none' como null
            if (isset($validated['plan_id'])) {
                if ($validated['plan_id'] === '' || $validated['plan_id'] === 'none' || $validated['plan_id'] === 0) {
                    $validated['plan_id'] = null;
                } else {
                    // Garantir que plan_id seja um inteiro
                    $validated['plan_id'] = (int) $validated['plan_id'];
                    
                    // Verificar se o plano existe e pertence à agência
                    $planExists = Plan::where('id', $validated['plan_id'])
                        ->where('agency_id', $agencyId)
                        ->exists();
                        
                    if (!$planExists) {
                        \Log::warning('Tentativa de atribuir plano inválido', [
                            'client_id' => $client->id,
                            'plan_id' => $validated['plan_id'],
                            'agency_id' => $agencyId
                        ]);
                        return back()->withErrors(['plan_id' => 'O plano selecionado não é válido para esta agência.']);
                    }
                }
            }
            
            // Log para depuração de atualização do plano
            \Log::info('Atualizando cliente com novos dados', [
                'client_id' => $client->id,
                'client_name' => $client->name,
                'old_plan_id' => $client->plan_id,
                'new_plan_id' => $validated['plan_id'] ?? null,
                'validated_data' => $validated
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
            try {
                $oldPlanId = $client->plan_id;
                
                // Atualizar atributos manualmente para melhor controle
                $client->name = $validated['name'];
                $client->email = $validated['email'] ?? null;
                $client->phone = $validated['phone'] ?? null;
                $client->document = $validated['document'] ?? null;
                $client->description = $validated['description'] ?? null;
                $client->is_active = $validated['is_active'];
                $client->plan_id = $validated['plan_id'];
                $client->logo = $validated['logo'] ?? null;
                
                $result = $client->save();
                
                // Log de sucesso
                \Log::info('Cliente atualizado com sucesso', [
                    'client_id' => $client->id,
                    'old_plan_id' => $oldPlanId,
                    'new_plan_id' => $client->plan_id,
                    'save_result' => $result
                ]);
                
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
                    ->route('agency.clients.index')
                    ->with('success', 'Cliente atualizado com sucesso!');
            } catch (\Exception $e) {
                \Log::error('Erro ao salvar cliente', [
                    'client_id' => $client->id,
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString()
                ]);
                throw $e;
            }
        } catch (\Exception $e) {
            // Log de erro
            \Log::error('Erro ao atualizar cliente', [
                'client_id' => $client->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return back()->withErrors(['error' => 'Erro ao atualizar cliente: ' . $e->getMessage()]);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Client $client)
    {
        // Verificar se está impersonando uma agência
        $agencyId = null;
        $impersonating = session()->get('impersonate.target');
        
        if ($impersonating && $impersonating['type'] === 'agency') {
            // Se está impersonando, usar o ID da agência da sessão
            $agencyId = $impersonating['id'];
            \Log::channel('audit')->info('Destroy: Impersonando agência', [
                'agency_id' => $agencyId,
                'user_id' => Auth::id(),
                'original_user' => session()->get('impersonate.original_user'),
                'client_id' => $client->id
            ]);
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
        
        try {
            // Log antes da exclusão
            \Log::channel('audit')->info('Iniciando exclusão de cliente', [
                'client_id' => $client->id,
                'client_name' => $client->name,
                'agency_id' => $agencyId,
                'user_id' => Auth::id(),
                'request_id' => request()->route('client'),
                'session_id' => session()->getId()
            ]);
            
            // Primeiro desativar o cliente
            $client->is_active = false;
            $client->save();
            
            // Verificar se o cliente existe antes da exclusão
            $clientBeforeDelete = Client::find($client->id);
            if (!$clientBeforeDelete) {
                \Log::channel('audit')->error('Cliente não encontrado antes da exclusão', [
                    'client_id' => $client->id
                ]);
                return back()->with('error', 'Cliente não encontrado para exclusão');
            }
            
            // Excluir o cliente (soft delete)
            $result = $client->delete();
            
            // Verificar status pós-exclusão
            $clientAfterDelete = Client::find($client->id);
            $clientWithTrashed = Client::withTrashed()->find($client->id);
            
            // Log após a exclusão bem-sucedida
            \Log::channel('audit')->info('Resultado da exclusão de cliente', [
                'client_id' => $client->id,
                'client_name' => $client->name,
                'agency_id' => $agencyId,
                'user_id' => Auth::id(),
                'result' => $result ? 'sucesso' : 'falha',
                'client_exists_after_delete' => $clientAfterDelete !== null,
                'client_exists_with_trashed' => $clientWithTrashed !== null,
                'client_deleted_at' => $clientWithTrashed ? $clientWithTrashed->deleted_at : null
            ]);
            
            // Verificar se redirecionamento está sendo processado corretamente
            \Log::channel('audit')->info('Redirecionando após exclusão de cliente', [
                'redirect_to' => 'agency.clients.index',
                'session_id' => session()->getId()
            ]);
            
            // Usar a página intermediária para limpar o cache e redirecionar
            $redirectUrl = route('agency.clients.index');
            
            // Se estiver usando impersonação, verificar se há algum problema específico
            if ($impersonating) {
                \Log::channel('audit')->info('Redirecionamento durante impersonação', [
                    'impersonating' => $impersonating,
                    'agency_id' => $agencyId,
                    'session_id' => session()->getId()
                ]);
            }
            
            // Retornar a vista de redirecionamento com o Flash Message adicionado à sessão
            session()->flash('success', 'Cliente excluído com sucesso!');
            return response()->view('redirect.cache_buster', [
                'redirectUrl' => $redirectUrl
            ]);
        } catch (\Exception $e) {
            // Log em caso de erro na exclusão
            \Log::channel('audit')->error('Erro ao excluir cliente', [
                'client_id' => $client->id,
                'client_name' => $client->name,
                'agency_id' => $agencyId,
                'user_id' => Auth::id(),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return back()->with('error', 'Erro ao excluir cliente: ' . $e->getMessage());
        }
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
        
        // Verificar explicitamente se o cliente foi excluído (verificação de segurança)
        $clientWithTrashed = Client::withTrashed()->find($client->id);
        if ($clientWithTrashed && $clientWithTrashed->deleted_at) {
            \Log::channel('audit')->warning('Tentativa de alterar status de cliente excluído', [
                'client_id' => $client->id,
                'client_name' => $client->name,
                'deleted_at' => $clientWithTrashed->deleted_at,
                'user_id' => Auth::id(),
                'route' => request()->route()->getName()
            ]);
            
            return back()->withErrors(['error' => 'Este cliente foi excluído e não pode ser modificado.']);
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
