<?php

namespace App\Http\Controllers\Agency;

use App\Http\Controllers\Controller;
use App\Models\Plan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

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
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            // Verificar permissão de criação
            $this->authorize('create', Plan::class);
            
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
            $plan->is_agency_plan = false; // Planos de agência são sempre para clientes
            $plan->monthly_leads = $validated['monthly_leads'] ?? null;
            $plan->max_landing_pages = $validated['max_landing_pages'] ?? null;
            $plan->max_pipelines = $validated['max_pipelines'] ?? null;
            $plan->total_leads = $validated['total_leads'] ?? null;
            $plan->max_clients = $validated['max_clients'] ?? null;
            $plan->save();
            
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
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Plan $plan)
    {
        // Verificar permissão de edição
        $this->authorize('update', $plan);
        
        // Formatar o preço para o formato brasileiro (R$ X,XX)
        $priceFormatted = 'R$ ' . number_format((float)$plan->price, 2, ',', '.');
        
        return Inertia::render('Agency/Plans/Edit', [
            'plan' => [
                'id' => $plan->id,
                'name' => $plan->name,
                'description' => $plan->description,
                'price' => $priceFormatted,
                'period' => $plan->period,
                'is_active' => $plan->is_active,
                'is_featured' => $plan->is_featured,
                'features' => $plan->features,
                'is_agency_plan' => $plan->is_agency_plan,
                'monthly_leads' => $plan->monthly_leads,
                'max_landing_pages' => $plan->max_landing_pages,
                'max_pipelines' => $plan->max_pipelines,
                'total_leads' => $plan->total_leads,
                'max_clients' => $plan->max_clients
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
            $this->authorize('update', $plan);
            
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
            $plan->monthly_leads = $validated['monthly_leads'] ?? $plan->monthly_leads;
            $plan->max_landing_pages = $validated['max_landing_pages'] ?? $plan->max_landing_pages;
            $plan->max_pipelines = $validated['max_pipelines'] ?? $plan->max_pipelines;
            $plan->total_leads = $validated['total_leads'] ?? $plan->total_leads;
            $plan->max_clients = $validated['max_clients'] ?? $plan->max_clients;
            $plan->save();
            
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
    public function destroy(string $id)
    {
        //
    }

    /**
     * Toggle the active status of the specified plan.
     */
    public function toggle(Plan $plan)
    {
        $this->authorize('update', $plan);

        $plan->is_active = !$plan->is_active;
        $plan->save();

        $status = $plan->is_active ? 'ativado' : 'desativado';

        return back()->with('success', "Plano {$status} com sucesso!");
    }

    /**
     * Toggle the featured status of the specified plan.
     */
    public function toggleFeatured(Plan $plan)
    {
        $this->authorize('update', $plan);

        $plan->is_featured = !$plan->is_featured;
        $plan->save();

        $status = $plan->is_featured ? 'destacado' : 'removido dos destaques';

        return back()->with('success', "Plano {$status} com sucesso!");
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
}
