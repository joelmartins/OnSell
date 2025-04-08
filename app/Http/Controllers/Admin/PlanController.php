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
        $validated = $this->validateRequest();

        $plan = new Plan();
        $plan->name = $validated['name'];
        $plan->description = $validated['description'];
        $plan->price = $validated['price'];
        $plan->is_active = $validated['is_active'];
        $plan->is_featured = $validated['is_featured'] ?? false;
        $plan->features = $validated['features'];
        $plan->monthly_leads = $validated['monthly_leads'];
        $plan->max_landing_pages = $validated['max_landing_pages'];
        $plan->max_pipelines = $validated['max_pipelines'];
        $plan->total_leads = $validated['total_leads'];
        $plan->is_agency_plan = $validated['is_agency_plan'];
        $plan->max_clients = $validated['max_clients'];
        $plan->save();

        return redirect()->route('admin.plans.index')
            ->with('success', 'Plano criado com sucesso!');
    }

    public function update(Request $request, Plan $plan)
    {
        $validated = $this->validateRequest();

        $plan->name = $validated['name'];
        $plan->description = $validated['description'];
        $plan->price = $validated['price'];
        $plan->is_active = $validated['is_active'];
        $plan->is_featured = $validated['is_featured'] ?? false;
        $plan->features = $validated['features'];
        $plan->monthly_leads = $validated['monthly_leads'];
        $plan->max_landing_pages = $validated['max_landing_pages'];
        $plan->max_pipelines = $validated['max_pipelines'];
        $plan->total_leads = $validated['total_leads'];
        $plan->is_agency_plan = $validated['is_agency_plan'];
        $plan->max_clients = $validated['max_clients'];
        $plan->save();

        return redirect()->route('admin.plans.index')
            ->with('success', 'Plano atualizado com sucesso!');
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
     * Duplica um plano existente
     */
    public function duplicate(Plan $plan)
    {
        $newPlan = $plan->replicate();
        $newPlan->name = $plan->name . ' (Cópia)';
        $newPlan->is_featured = false; // A cópia não é destacada automaticamente
        $newPlan->save();
        
        return redirect()->route('admin.plans.edit', $newPlan->id)
            ->with('success', 'Plano duplicado com sucesso! Você pode editar os detalhes abaixo.');
    }

    protected function validateRequest(): array
    {
        return request()->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string|max:500',
            'price' => 'required|numeric|min:0',
            'period' => 'required|in:monthly,yearly',
            'is_active' => 'boolean',
            'is_featured' => 'boolean',
            'is_agency_plan' => 'boolean',
            'features' => 'nullable|array',
            'monthly_leads' => 'nullable|integer|min:0',
            'max_landing_pages' => 'nullable|integer|min:0',
            'max_pipelines' => 'nullable|integer|min:0',
            'total_leads' => 'nullable|integer|min:0',
            'max_clients' => 'nullable|integer|min:0',
            'has_whatsapp_integration' => 'boolean',
            'has_email_integration' => 'boolean',
            'has_meta_integration' => 'boolean',
            'has_google_integration' => 'boolean',
            'has_custom_domain' => 'boolean',
        ]);
    }
} 