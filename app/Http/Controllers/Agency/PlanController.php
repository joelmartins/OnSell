<?php

namespace App\Http\Controllers\Agency;

use App\Http\Controllers\Controller;
use App\Models\Plan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\DB;

class PlanController extends Controller
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
        
        // Consulta base para planos da agência atual
        $query = Plan::where('agency_id', $agencyId);
        
        // Ordenar e transformar resultados
        $plans = $query->orderBy('name')
            ->get()
            ->map(function($plan) {
                return [
                    'id' => $plan->id,
                    'name' => $plan->name,
                    'description' => $plan->description,
                    'price' => (float)$plan->price,
                    'period' => $plan->period,
                    'is_active' => $plan->is_active,
                    'is_featured' => $plan->is_featured,
                    'created_at' => $plan->created_at,
                    'updated_at' => $plan->updated_at,
                    'clients_count' => $plan->clients()->count(),
                    'product_id' => $plan->product_id,
                    'price_id' => $plan->price_id,
                ];
            });
        
        // Log para depuração
        Log::channel('audit')->info('Acessando página de planos da agência', [
            'user_id' => Auth::id(),
            'agency_id' => $agencyId,
            'plans_count' => $plans->count(),
            'is_impersonating' => $impersonating ? true : false,
        ]);
        
        return Inertia::render('Agency/Plans/Index', [
            'plans' => $plans,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        // Verificar permissão de criação
        Gate::authorize('create', Plan::class);
        
        return Inertia::render('Agency/Plans/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            // Verificar permissão de criação
            Gate::authorize('create', Plan::class);
            
            // Obter ID da agência do usuário autenticado ou do modo de impersonação
            $agencyId = $this->getAgencyId();
            
            // Validar dados enviados
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'description' => 'required|string|max:500',
                'price' => 'required|string',
                'period' => 'required|in:monthly,yearly',
                'is_active' => 'boolean',
                'is_featured' => 'boolean',
                'features' => 'nullable|array',
                'monthly_leads' => 'nullable|integer',
                'max_landing_pages' => 'nullable|integer',
                'max_pipelines' => 'nullable|integer',
                'total_leads' => 'nullable|integer',
                'max_clients' => 'nullable|integer',
            ]);
            
            // Converter preço do formato brasileiro para float
            if (isset($validated['price']) && is_string($validated['price'])) {
                $validated['price'] = $this->convertBrazilianCurrencyToFloat($validated['price']);
            }
            
            // Criar o plano associado à agência
            $plan = new Plan();
            $plan->name = $validated['name'];
            $plan->description = $validated['description'];
            $plan->price = $validated['price'];
            $plan->period = $validated['period'];
            $plan->is_active = $validated['is_active'] ?? true;
            $plan->is_featured = $validated['is_featured'] ?? false;
            $plan->features = $validated['features'] ?? [];
            $plan->agency_id = $agencyId;
            
            // Garantir que agências só criem planos para clientes finais, nunca para outras agências
            $plan->is_agency_plan = false;
            
            $plan->monthly_leads = $validated['monthly_leads'] ?? null;
            $plan->max_landing_pages = $validated['max_landing_pages'] ?? null;
            $plan->max_pipelines = $validated['max_pipelines'] ?? null;
            $plan->total_leads = $validated['total_leads'] ?? null;
            $plan->max_clients = $validated['max_clients'] ?? null;
            $plan->save();
            
            // Registrar ação no log
            Log::channel('audit')->info('Plano criado por agência', [
                'user_id' => Auth::id(),
                'agency_id' => $agencyId,
                'plan_id' => $plan->id, 
                'plan_name' => $plan->name
            ]);
            
            return redirect()->route('agency.plans.index')
                ->with('success', 'Plano criado com sucesso!');
                
        } catch (\Illuminate\Validation\ValidationException $e) {
            return redirect()->back()->withErrors($e->errors())->withInput();
        } catch (\Exception $e) {
            return redirect()->back()->withErrors([
                'error' => 'Erro ao criar plano: ' . $e->getMessage()
            ])->withInput();
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Plan $plan)
    {
        // Verificar permissão de visualização
        Gate::authorize('view', $plan);
        
        // Formatar o preço para o formato brasileiro (R$ X,XX)
        $priceFormatted = 'R$ ' . number_format((float)$plan->price, 2, ',', '.');
        
        // Processar features para garantir que seja um array
        $features = [];
        if (!empty($plan->features)) {
            if (is_string($plan->features)) {
                try {
                    $decodedFeatures = json_decode($plan->features, true);
                    if (is_array($decodedFeatures)) {
                        $features = $decodedFeatures;
                    } elseif (is_object($decodedFeatures)) {
                        $features = (array)$decodedFeatures;
                    }
                } catch (\Exception $e) {
                    $features = [];
                }
            } elseif (is_array($plan->features)) {
                $features = $plan->features;
            } elseif (is_object($plan->features)) {
                $features = (array)$plan->features;
            }
        }
        
        return Inertia::render('Agency/Plans/Show', [
            'plan' => [
                'id' => $plan->id,
                'name' => $plan->name,
                'description' => $plan->description,
                'price' => $priceFormatted,
                'period' => $plan->period,
                'is_active' => $plan->is_active,
                'is_featured' => $plan->is_featured,
                'features' => $features,
                'monthly_leads' => $plan->monthly_leads,
                'max_landing_pages' => $plan->max_landing_pages,
                'max_pipelines' => $plan->max_pipelines,
                'total_leads' => $plan->total_leads,
                'max_clients' => $plan->max_clients,
                'clients_count' => $plan->clients()->count()
            ]
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Plan $plan)
    {
        // Verificar permissão de edição
        Gate::authorize('update', $plan);
        
        // Formatar o preço para o formato brasileiro (R$ X,XX)
        $priceFormatted = 'R$ ' . number_format((float)$plan->price, 2, ',', '.');
        
        // Processar features para garantir que seja um array
        $features = [];
        if (!empty($plan->features)) {
            if (is_string($plan->features)) {
                try {
                    $decodedFeatures = json_decode($plan->features, true);
                    if (is_array($decodedFeatures)) {
                        $features = $decodedFeatures;
                    } elseif (is_object($decodedFeatures)) {
                        $features = (array)$decodedFeatures;
                    }
                } catch (\Exception $e) {
                    $features = [];
                }
            } elseif (is_array($plan->features)) {
                $features = $plan->features;
            } elseif (is_object($plan->features)) {
                $features = (array)$plan->features;
            }
        }
        
        return Inertia::render('Agency/Plans/Edit', [
            'plan' => [
                'id' => $plan->id,
                'name' => $plan->name,
                'description' => $plan->description,
                'price' => $priceFormatted,
                'period' => $plan->period,
                'is_active' => $plan->is_active,
                'is_featured' => $plan->is_featured,
                'features' => $features,
                'is_agency_plan' => $plan->is_agency_plan,
                'monthly_leads' => $plan->monthly_leads,
                'max_landing_pages' => $plan->max_landing_pages,
                'max_pipelines' => $plan->max_pipelines,
                'total_leads' => $plan->total_leads,
                'max_clients' => $plan->max_clients,
                'product_id' => $plan->product_id,
                'price_id' => $plan->price_id,
            ]
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Plan $plan)
    {
        try {
            // Verificar permissão de edição
            Gate::authorize('update', $plan);
            
            // Validar dados enviados
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'description' => 'required|string|max:500',
                'price' => 'required|string',
                'period' => 'required|in:monthly,yearly',
                'is_active' => 'boolean',
                'is_featured' => 'boolean',
                'features' => 'nullable|array',
                'monthly_leads' => 'nullable|integer',
                'max_landing_pages' => 'nullable|integer',
                'max_pipelines' => 'nullable|integer',
                'total_leads' => 'nullable|integer',
                'max_clients' => 'nullable|integer',
            ]);
            
            // Converter preço do formato brasileiro para float
            if (isset($validated['price']) && is_string($validated['price'])) {
                $validated['price'] = $this->convertBrazilianCurrencyToFloat($validated['price']);
            }
            
            // Atualizar o plano
            $plan->name = $validated['name'];
            $plan->description = $validated['description'];
            $plan->price = $validated['price'];
            $plan->period = $validated['period'];
            $plan->is_active = $validated['is_active'] ?? $plan->is_active;
            $plan->is_featured = $validated['is_featured'] ?? $plan->is_featured;
            $plan->features = $validated['features'] ?? $plan->features;
            
            // Garantir que agências só possam ter planos para clientes finais
            $plan->is_agency_plan = false;
            
            $plan->monthly_leads = $validated['monthly_leads'] ?? $plan->monthly_leads;
            $plan->max_landing_pages = $validated['max_landing_pages'] ?? $plan->max_landing_pages;
            $plan->max_pipelines = $validated['max_pipelines'] ?? $plan->max_pipelines;
            $plan->total_leads = $validated['total_leads'] ?? $plan->total_leads;
            $plan->max_clients = $validated['max_clients'] ?? $plan->max_clients;
            $plan->save();
            
            // Registrar ação no log
            Log::channel('audit')->info('Plano atualizado por agência', [
                'user_id' => Auth::id(),
                'agency_id' => $plan->agency_id,
                'plan_id' => $plan->id,
                'plan_name' => $plan->name
            ]);
            
            return redirect()->route('agency.plans.index')
                ->with('success', 'Plano atualizado com sucesso!');
                
        } catch (\Illuminate\Validation\ValidationException $e) {
            return redirect()->back()->withErrors($e->errors())->withInput();
        } catch (\Exception $e) {
            return redirect()->back()->withErrors([
                'error' => 'Erro ao atualizar plano: ' . $e->getMessage()
            ])->withInput();
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        try {
            // Encontrar o plano pelo ID
            $plan = Plan::findOrFail($id);
            
            Log::channel('audit')->info('Iniciando tentativa de exclusão de plano', [
                'user_id' => Auth::id(),
                'user_roles' => Auth::user()->getRoleNames(),
                'plan_id' => $plan->id,
                'plan_name' => $plan->name,
                'plan_agency_id' => $plan->agency_id,
                'is_impersonating' => session()->has('impersonate.target'),
                'impersonation_data' => session()->has('impersonate.target') ? session()->get('impersonate.target') : null
            ]);
            
            // Verificar se o plano está em uso
            if ($plan->clients()->count() > 0) {
                Log::channel('audit')->warning('Tentativa de excluir plano em uso', [
                    'user_id' => Auth::id(),
                    'agency_id' => $plan->agency_id,
                    'plan_id' => $plan->id,
                    'plan_name' => $plan->name,
                    'clients_count' => $plan->clients()->count()
                ]);
                
                return back()->withErrors([
                    'error' => 'Este plano não pode ser excluído porque está sendo utilizado por clientes.'
                ]);
            }
            
            // Obter ID da agência e do usuário
            $agencyId = $plan->agency_id;
            $userId = Auth::id();
            
            Log::channel('audit')->info('Comparando IDs para permissão de exclusão', [
                'user_id' => $userId,
                'plan_agency_id' => (int)$agencyId,
                'user_agency_id' => (int)Auth::user()->agency_id,
                'is_admin' => Auth::user()->hasRole('admin.super'),
                'user_roles' => Auth::user()->getRoleNames()
            ]);
            
            // Verificar permissão manualmente
            $impersonating = session()->get('impersonate.target');
            $canDelete = false;
            
            // Se estiver impersonando uma agência
            if ($impersonating && $impersonating['type'] === 'agency') {
                $canDelete = (int)$impersonating['id'] === (int)$agencyId;
                
                Log::channel('audit')->info('Verificação de permissão para excluir plano (impersonando)', [
                    'user_id' => $userId,
                    'can_delete' => $canDelete,
                    'impersonating_agency_id' => (int)$impersonating['id'],
                    'plan_agency_id' => (int)$agencyId,
                    'is_equal' => ((int)$impersonating['id'] === (int)$agencyId) ? 'sim' : 'não'
                ]);
            } 
            // Se for um admin do sistema
            else if (Auth::user()->hasRole('admin.super')) {
                $canDelete = true;
                
                Log::channel('audit')->info('Admin com permissão para excluir plano', [
                    'user_id' => $userId
                ]);
            } 
            // Se for um usuário da agência
            else if (Auth::user()->hasRole(['agency.owner', 'agency.admin'])) {
                $canDelete = (int)Auth::user()->agency_id === (int)$agencyId;
                
                Log::channel('audit')->info('Verificação de permissão para excluir plano (usuário da agência)', [
                    'user_id' => $userId,
                    'can_delete' => $canDelete,
                    'user_agency_id' => (int)Auth::user()->agency_id,
                    'plan_agency_id' => (int)$agencyId,
                    'is_equal' => ((int)Auth::user()->agency_id === (int)$agencyId) ? 'sim' : 'não'
                ]);
            }
            
            if (!$canDelete) {
                Log::channel('audit')->warning('Tentativa não autorizada de excluir plano', [
                    'user_id' => $userId,
                    'plan_id' => $plan->id,
                    'plan_name' => $plan->name,
                    'plan_agency_id' => $agencyId
                ]);
                
                return redirect()->route('agency.plans.index')
                    ->withErrors(['error' => 'Você não tem permissão para excluir este plano.']);
            }
            
            // Registrar ação no log antes de excluir
            Log::channel('audit')->info('Plano autorizado para exclusão', [
                'user_id' => $userId,
                'agency_id' => $agencyId,
                'plan_id' => $plan->id,
                'plan_name' => $plan->name
            ]);
            
            // Excluir o plano
            $result = $plan->delete();
            
            Log::channel('audit')->info('Resultado da exclusão do plano', [
                'result' => $result ? 'sucesso' : 'falha',
                'user_id' => $userId,
                'plan_id' => $plan->id,
                'plan_name' => $plan->name
            ]);
            
            return redirect()->route('agency.plans.index')
                ->with('success', 'Plano excluído com sucesso!');
                
        } catch (\Exception $e) {
            Log::channel('audit')->error('Erro ao excluir plano', [
                'user_id' => Auth::id(),
                'plan_id' => $id,
                'error' => $e->getMessage(),
                'error_class' => get_class($e),
                'trace' => $e->getTraceAsString()
            ]);
            
            return back()->withErrors([
                'error' => 'Erro ao excluir plano: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Toggle the active status of the specified plan.
     */
    public function toggle(Plan $plan)
    {
        try {
            Gate::authorize('update', $plan);

            $oldStatus = $plan->is_active;
            $plan->is_active = !$plan->is_active;
            $plan->save();

            $status = $plan->is_active ? 'ativado' : 'desativado';
            
            // Registrar ação no log
            Log::channel('audit')->info('Status do plano alterado', [
                'user_id' => Auth::id(),
                'agency_id' => $plan->agency_id,
                'plan_id' => $plan->id,
                'plan_name' => $plan->name,
                'old_status' => $oldStatus ? 'ativo' : 'inativo',
                'new_status' => $plan->is_active ? 'ativo' : 'inativo'
            ]);

            return back()->with('success', "Plano {$status} com sucesso!");
            
        } catch (\Exception $e) {
            Log::channel('audit')->error('Erro ao alterar status do plano', [
                'user_id' => Auth::id(),
                'agency_id' => $plan->agency_id,
                'plan_id' => $plan->id,
                'plan_name' => $plan->name,
                'error' => $e->getMessage()
            ]);
            
            return back()->withErrors([
                'error' => 'Erro ao alterar status do plano: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Toggle the featured status of the specified plan.
     */
    public function toggleFeatured(Plan $plan)
    {
        try {
            Gate::authorize('update', $plan);

            $oldFeatured = $plan->is_featured;
            $plan->is_featured = !$plan->is_featured;
            $plan->save();

            $status = $plan->is_featured ? 'destacado' : 'removido dos destaques';
            
            // Registrar ação no log
            Log::channel('audit')->info('Destaque do plano alterado', [
                'user_id' => Auth::id(),
                'agency_id' => $plan->agency_id,
                'plan_id' => $plan->id,
                'plan_name' => $plan->name,
                'old_featured' => $oldFeatured ? 'destacado' : 'não destacado',
                'new_featured' => $plan->is_featured ? 'destacado' : 'não destacado'
            ]);

            return back()->with('success', "Plano {$status} com sucesso!");
            
        } catch (\Exception $e) {
            Log::channel('audit')->error('Erro ao alterar destaque do plano', [
                'user_id' => Auth::id(),
                'agency_id' => $plan->agency_id,
                'plan_id' => $plan->id,
                'plan_name' => $plan->name,
                'error' => $e->getMessage()
            ]);
            
            return back()->withErrors([
                'error' => 'Erro ao alterar destaque do plano: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Duplicate the specified plan.
     */
    public function duplicate(Plan $plan)
    {
        try {
            // Log simplificado
            Log::channel('audit')->info('Iniciando duplicação de plano', [
                'user_id' => Auth::id(), 
                'plan_id' => $plan->id,
                'plan_name' => $plan->name
            ]);
            
            // Obter ID da agência
            $agencyId = $this->getAgencyId();
            
            // Criar um novo plano sem usar ID existente
            $newPlan = new Plan();
            $newPlan->name = 'Cópia de ' . $plan->name;
            $newPlan->description = $plan->description;
            $newPlan->price = $plan->price;
            $newPlan->period = $plan->period;
            $newPlan->is_active = false;
            $newPlan->is_featured = false;
            $newPlan->features = $plan->features;
            $newPlan->agency_id = $agencyId;
            $newPlan->is_agency_plan = false;
            $newPlan->monthly_leads = $plan->monthly_leads;
            $newPlan->max_landing_pages = $plan->max_landing_pages;
            $newPlan->max_pipelines = $plan->max_pipelines;
            $newPlan->total_leads = $plan->total_leads;
            $newPlan->max_clients = $plan->max_clients;
            
            // Forçar a correção da sequência antes de salvar
            DB::statement('SELECT setval(\'plans_id_seq\', (SELECT MAX(id) FROM plans) + 1)');
            
            // Salvar o novo plano
            $newPlan->save();
            
            // Log de sucesso
            Log::channel('audit')->info('Plano duplicado com sucesso', [
                'user_id' => Auth::id(),
                'original_plan_id' => $plan->id,
                'new_plan_id' => $newPlan->id
            ]);
            
            return redirect()->route('agency.plans.edit', $newPlan->id)
                ->with('success', 'Plano duplicado com sucesso! Você pode editar os detalhes agora.');
        } catch (\Exception $e) {
            // Log de erro detalhado
            Log::channel('audit')->error('Erro ao duplicar plano', [
                'user_id' => Auth::id(),
                'plan_id' => $plan->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            // Retornar para a página de planos com mensagem de erro
            return redirect()->route('agency.plans.index')
                ->withErrors(['error' => 'Erro ao duplicar plano: ' . $e->getMessage()]);
        }
    }

    /**
     * Get the agency ID for the current user or impersonation session
     */
    private function getAgencyId()
    {
        $impersonating = session()->get('impersonate.target');
        
        if ($impersonating && $impersonating['type'] === 'agency') {
            return $impersonating['id'];
        }
        
        return Auth::user()->agency_id;
    }

    /**
     * Converte valor de moeda brasileira (R$ 1.999,99) para float (1999.99)
     * 
     * @param string $value
     * @return float
     */
    private function convertBrazilianCurrencyToFloat(string $value): float
    {
        // Remove o símbolo da moeda e possíveis espaços
        $value = trim(str_replace('R$', '', $value));
        
        // Substitui pontos por nada (remover separador de milhares)
        $value = str_replace('.', '', $value);
        
        // Substitui vírgula por ponto (separador decimal)
        $value = str_replace(',', '.', $value);
        
        // Converte para float
        return (float) $value;
    }

    /**
     * Sincroniza o plano com o Stripe da agência (cria/atualiza produto e price).
     */
    public function syncStripe(Request $request, $id)
    {
        // Buscar plano considerando impersonação
        $impersonating = session()->get('impersonate.target');
        if ($impersonating && $impersonating['type'] === 'agency') {
            $agencyId = $impersonating['id'];
        } else {
            $agencyId = Auth::user()->agency_id;
        }
        $plan = Plan::where('id', $id)->where('agency_id', $agencyId)->firstOrFail();
        $agency = $plan->agency;
        if (!$agency || !$agency->stripe_account_id) {
            return response()->json(['message' => 'Agência sem conta Stripe conectada.'], 400);
        }
        try {
            $stripe = new \Stripe\StripeClient(config('services.stripe.secret'));
            // Cria ou atualiza o produto no Stripe da agência
            if (!$plan->product_id) {
                $product = $stripe->products->create([
                    'name' => $plan->name,
                    'description' => $plan->description,
                ], [
                    'stripe_account' => $agency->stripe_account_id
                ]);
                $plan->product_id = $product->id;
            } else {
                $stripe->products->update($plan->product_id, [
                    'name' => $plan->name,
                    'description' => $plan->description,
                ], [
                    'stripe_account' => $agency->stripe_account_id
                ]);
            }
            // Cria um novo price sempre que sincronizar
            $price = $stripe->prices->create([
                'unit_amount' => (int) round($plan->price * 100),
                'currency' => 'brl',
                'recurring' => [
                    'interval' => $plan->period === 'yearly' ? 'year' : 'month',
                ],
                'product' => $plan->product_id,
            ], [
                'stripe_account' => $agency->stripe_account_id
            ]);
            $plan->price_id = $price->id;
            $plan->save();
            return response()->json(['success' => true, 'product_id' => $plan->product_id, 'price_id' => $plan->price_id]);
        } catch (\Exception $e) {
            \Log::error('Erro ao sincronizar plano com Stripe', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Erro ao sincronizar com Stripe: ' . $e->getMessage()], 500);
        }
    }
}
