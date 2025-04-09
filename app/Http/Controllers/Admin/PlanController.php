<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Plan;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PlanController extends Controller
{
    /**
     * Exibe a lista de planos
     */
    public function index(Request $request)
    {
        $query = Plan::query()
            ->with('agency')
            ->withCount('clients')
            ->whereNull('agency_id'); // Apenas planos do sistema para admin
            
        // Filtrar por tipo (sistema normal ou para agência)
        if ($request->has('type')) {
            if ($request->type === 'client') {
                $query->where('is_agency_plan', false);
            } elseif ($request->type === 'agency') {
                $query->where('is_agency_plan', true);
            }
        }
        
        // Filtrar por status (ativo/inativo)
        if ($request->has('status')) {
            $query->where('is_active', $request->status === 'active');
        }
        
        // Filtrar por destaque (em destaque/não destacado)
        if ($request->has('featured')) {
            $query->where('is_featured', $request->featured === 'featured');
        }
        
        // Busca por nome ou descrição
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }
        
        $plans = $query->orderBy('name')->get();
        
        $data = [
            'plans' => $plans,
            'filters' => $request->only(['type', 'status', 'featured', 'search'])
        ];
        
        // Se houver mensagens de flash, elas serão automaticamente passadas para o Inertia
        return Inertia::render('Admin/Plans/Index', $data);
    }

    public function store(Request $request)
    {
        try {
            $validated = $this->validateRequest();
            
            // Converter preço do formato brasileiro para float
            if (isset($validated['price']) && is_string($validated['price'])) {
                $validated['price'] = $this->convertBrazilianCurrencyToFloat($validated['price']);
            }

            $plan = new Plan();
            $plan->name = $validated['name'];
            $plan->description = $validated['description'];
            $plan->price = $validated['price'];
            $plan->is_active = $validated['is_active'];
            $plan->is_featured = $validated['is_featured'] ?? false;
            $plan->features = $validated['features'];
            $plan->is_agency_plan = $validated['is_agency_plan'];
            
            // Se for plano de agência, configurar apenas max_clients e definir outros limites como null
            if ($plan->is_agency_plan) {
                $plan->max_clients = $validated['max_clients'];
                $plan->monthly_leads = null;
                $plan->max_landing_pages = null;
                $plan->max_pipelines = null;
                $plan->total_leads = null;
            } else {
                // Se for plano de cliente, configurar limites específicos
                $plan->monthly_leads = $validated['monthly_leads'];
                $plan->max_landing_pages = $validated['max_landing_pages'];
                $plan->max_pipelines = $validated['max_pipelines'];
                $plan->total_leads = $validated['total_leads'];
                $plan->max_clients = null;
            }
            
            $plan->save();

            return redirect()->route('admin.plans.index')
                ->with('success', 'Plano criado com sucesso!');
                
        } catch (\Illuminate\Validation\ValidationException $e) {
            return redirect()->back()->withErrors($e->errors())->withInput();
        } catch (\Exception $e) {
            return redirect()->back()->withErrors([
                'error' => 'Erro ao criar plano: ' . $e->getMessage()
            ])->withInput();
        }
    }

    public function update(Request $request, Plan $plan)
    {
        try {
            $validated = $this->validateRequest();

            // Converter preço do formato brasileiro para float
            if (isset($validated['price']) && is_string($validated['price'])) {
                $validated['price'] = $this->convertBrazilianCurrencyToFloat($validated['price']);
            }

            $plan->name = $validated['name'];
            $plan->description = $validated['description'];
            $plan->price = $validated['price'];
            $plan->is_active = $validated['is_active'];
            $plan->is_featured = $validated['is_featured'] ?? false;
            $plan->features = $validated['features'];
            $plan->is_agency_plan = $validated['is_agency_plan'];
            
            // Se for plano de agência, configurar apenas max_clients e definir outros limites como null
            if ($plan->is_agency_plan) {
                $plan->max_clients = $validated['max_clients'];
                $plan->monthly_leads = null;
                $plan->max_landing_pages = null;
                $plan->max_pipelines = null;
                $plan->total_leads = null;
            } else {
                // Se for plano de cliente, configurar limites específicos
                $plan->monthly_leads = $validated['monthly_leads'];
                $plan->max_landing_pages = $validated['max_landing_pages'];
                $plan->max_pipelines = $validated['max_pipelines'];
                $plan->total_leads = $validated['total_leads'];
                $plan->max_clients = null;
            }
            
            $plan->save();

            return redirect()->route('admin.plans.index')
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
     * Ativa ou inativa um plano
     */
    public function toggle(Plan $plan)
    {
        $plan->is_active = !$plan->is_active;
        $plan->save();
        
        return redirect()->route('admin.plans.index')
            ->with('success', $plan->is_active ? 
                'Plano ativado com sucesso!' : 
                'Plano inativado com sucesso!');
    }
    
    /**
     * Marca ou desmarca um plano como destaque
     */
    public function toggleFeatured(Plan $plan)
    {
        $plan->is_featured = !$plan->is_featured;
        $plan->save();
        
        return redirect()->route('admin.plans.index')
            ->with('success', $plan->is_featured ? 
                'Plano marcado como destaque com sucesso!' : 
                'Plano removido dos destaques!');
    }
    
    /**
     * Remove um plano do sistema
     */
    public function destroy(Plan $plan)
    {
        if ($plan->clients()->count() > 0) {
            return redirect()->route('admin.plans.index')
                ->with('error', 'Não é possível excluir um plano que possui clientes associados.');
        }
        
        $planName = $plan->name;
        $plan->delete();
        
        return redirect()->route('admin.plans.index')
            ->with('success', "Plano '{$planName}' excluído com sucesso!");
    }
    
    /**
     * Duplica um plano existente para criar um novo.
     *
     * @param \App\Models\Plan $plan
     * @return \Illuminate\Http\RedirectResponse
     */
    public function duplicate(Plan $plan)
    {
        // Criar uma cópia do plano com os mesmos atributos
        $newPlan = $plan->replicate();
        $newPlan->name = $plan->name . ' (Cópia)';
        $newPlan->is_active = false; // Define o novo plano como inativo por padrão
        $newPlan->is_featured = false; // Remove o status de destaque 
        $newPlan->save();

        return redirect()->route('admin.plans.index')
            ->with('success', 'Plano duplicado com sucesso!');
    }

    /**
     * Exibe o formulário para edição de um plano
     *
     * @param \App\Models\Plan $plan
     * @return \Inertia\Response
     */
    public function edit(Plan $plan)
    {
        // Formatar o preço para o formato brasileiro (R$ X,XX)
        $priceFormatted = 'R$ ' . number_format((float)$plan->price, 2, ',', '.');

        return Inertia::render('Admin/Plans/Edit', [
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
                'max_clients' => $plan->max_clients,
                'has_whatsapp_integration' => $plan->has_whatsapp_integration,
                'has_email_integration' => $plan->has_email_integration,
                'has_meta_integration' => $plan->has_meta_integration,
                'has_google_integration' => $plan->has_google_integration,
                'has_custom_domain' => $plan->has_custom_domain,
            ]
        ]);
    }

    protected function validateRequest(): array
    {
        $isAgencyPlan = request('is_agency_plan', false);
        
        $rules = [
            'name' => 'required|string|max:255',
            'description' => 'required|string|max:500',
            'price' => 'required|string',
            'period' => 'required|in:monthly,yearly',
            'is_active' => 'boolean',
            'is_featured' => 'boolean',
            'is_agency_plan' => 'boolean',
            'features' => 'nullable|array',
            'has_whatsapp_integration' => 'boolean',
            'has_email_integration' => 'boolean',
            'has_meta_integration' => 'boolean',
            'has_google_integration' => 'boolean',
            'has_custom_domain' => 'boolean',
        ];
        
        // Regras específicas para planos de agência
        if ($isAgencyPlan) {
            $rules['max_clients'] = 'required|integer|min:1';
            $rules['monthly_leads'] = 'nullable|integer';
            $rules['max_landing_pages'] = 'nullable|integer';
            $rules['max_pipelines'] = 'nullable|integer';
            $rules['total_leads'] = 'nullable|integer';
        } else {
            // Regras específicas para planos de cliente
            $rules['monthly_leads'] = 'required|integer|min:1';
            $rules['max_landing_pages'] = 'required|integer|min:1';
            $rules['max_pipelines'] = 'required|integer|min:1';
            $rules['total_leads'] = 'required|integer|min:1';
            $rules['max_clients'] = 'nullable|integer';
        }
        
        return request()->validate($rules);
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