<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\AgencyRequest;
use App\Models\Agency;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Laravel\Cashier\Subscription;
use Stripe\StripeClient;

class AgencyController extends Controller
{
    /**
     * Display a listing of agencies.
     */
    public function index(Request $request): Response
    {
        $agencies = Agency::with(['users'])->withCount(['clients'])
            ->orderBy('name')
            ->paginate(10)
            ->through(function($agency) {
                // Buscar o usuário owner da agência
                $owner = $agency->users()->whereHas('roles', function($q) {
                    $q->where('name', 'agency.owner');
                })->first();
                $subscription = $owner ? $owner->subscription('default') : null;
                return [
                    'id' => $agency->id,
                    'name' => $agency->name,
                    'email' => $agency->email,
                    'domain' => $agency->domain,
                    'is_active' => $agency->is_active,
                    'clients_count' => $agency->clients_count,
                    'created_at' => $agency->created_at,
                    'subscription_status' => $subscription ? $subscription->stripe_status : null,
                ];
            });

        return Inertia::render('Admin/Agencies/Index', [
            'agencies' => $agencies,
        ]);
    }

    /**
     * Show the form for creating a new agency.
     */
    public function create(): Response
    {
        $agencies = Agency::where('is_active', true)
            ->whereNull('parent_agency_id')
            ->orderBy('name')
            ->get(['id', 'name']);
            
        return Inertia::render('Admin/Agencies/Create', [
            'parentAgencies' => $agencies,
        ]);
    }

    /**
     * Store a newly created agency in storage.
     */
    public function store(AgencyRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        
        // Convert empty strings to null for foreign keys
        $validated['parent_agency_id'] = $validated['parent_agency_id'] ?? null;
        
        // Remove os campos de usuário do array de dados da agência
        $createUser = isset($validated['create_user']) ? (bool) $validated['create_user'] : false;
        $userData = null;
        
        if ($createUser) {
            $userData = [
                'name' => $validated['user_name'],
                'email' => $validated['user_email'],
                'password' => $validated['user_password'],
            ];
            
            // Remover campos do usuário para não interferir na criação da agência
            unset($validated['create_user']);
            unset($validated['user_name']);
            unset($validated['user_email']);
            unset($validated['user_password']);
        }
        
        // Criar a agência
        $agency = Agency::create($validated);
        
        // Se solicitado, criar o primeiro usuário da agência
        if ($createUser && $userData) {
            $user = new \App\Models\User([
                'name' => $userData['name'],
                'email' => $userData['email'],
                'password' => bcrypt($userData['password']),
                'agency_id' => $agency->id,
            ]);
            
            $user->save();
            $user->assignRole('agency.owner');
        }
        
        return redirect()
            ->route('admin.agencies.index')
            ->with('success', 'Agência criada com sucesso!');
    }

    /**
     * Display the specified agency.
     */
    public function show(Agency $agency): Response
    {
        $agency->load(['clients', 'subAgencies', 'parentAgency']);
        
        return Inertia::render('Admin/Agencies/Show', [
            'agency' => $agency,
        ]);
    }

    /**
     * Show the form for editing the specified agency.
     */
    public function edit(Agency $agency): Response
    {
        $parentAgencies = Agency::where('is_active', true)
            ->whereNull('parent_agency_id')
            ->where('id', '!=', $agency->id)
            ->orderBy('name')
            ->get(['id', 'name']);
            
        return Inertia::render('Admin/Agencies/Edit', [
            'agency' => $agency,
            'parentAgencies' => $parentAgencies,
        ]);
    }

    /**
     * Update the specified agency in storage.
     */
    public function update(AgencyRequest $request, Agency $agency): RedirectResponse
    {
        $validated = $request->validated();
        
        // Verificar que uma agência não pode ser sua própria pai
        if (!empty($validated['parent_agency_id']) && $validated['parent_agency_id'] == $agency->id) {
            return back()->withErrors(['parent_agency_id' => 'Uma agência não pode ser sua própria pai.']);
        }
        
        // Convert empty strings to null for foreign keys
        $validated['parent_agency_id'] = $validated['parent_agency_id'] ?? null;
        
        // Remove os campos de usuário do array de dados da agência
        $createUser = isset($validated['create_user']) ? (bool) $validated['create_user'] : false;
        $userData = null;
        
        if ($createUser) {
            $userData = [
                'name' => $validated['user_name'],
                'email' => $validated['user_email'],
                'password' => $validated['user_password'],
            ];
            
            // Remover campos do usuário para não interferir na atualização da agência
            unset($validated['create_user']);
            unset($validated['user_name']);
            unset($validated['user_email']);
            unset($validated['user_password']);
        }
        
        // Atualizar a agência
        $agency->update($validated);
        
        // Se solicitado, criar um novo usuário para a agência
        if ($createUser && $userData) {
            $user = new \App\Models\User([
                'name' => $userData['name'],
                'email' => $userData['email'],
                'password' => bcrypt($userData['password']),
                'agency_id' => $agency->id,
            ]);
            
            $user->save();
            $user->assignRole('agency.owner');
        }
        
        return redirect()
            ->route('admin.agencies.index')
            ->with('success', 'Agência atualizada com sucesso!');
    }

    /**
     * Toggle the active status of the specified agency.
     */
    public function toggleStatus(Agency $agency): RedirectResponse
    {
        $agency->update([
            'is_active' => !$agency->is_active
        ]);

        // Se desativou, cancelar assinatura Stripe se existir
        if (!$agency->is_active) {
            $subscription = $agency->subscription('default');
            if ($subscription && $subscription->valid()) {
                try {
                    $subscription->cancel(); // Cancela no Stripe e marca como cancelada localmente
                } catch (\Exception $e) {
                    \Log::error('Erro ao cancelar assinatura Stripe ao desativar agência', [
                        'agency_id' => $agency->id,
                        'error' => $e->getMessage()
                    ]);
                }
            }
        }

        $statusMessage = $agency->is_active 
            ? 'Agência ativada com sucesso!' 
            : 'Agência desativada e cobrança cancelada!';

        return back()->with('success', $statusMessage);
    }

    /**
     * Remove the specified agency from storage.
     */
    public function destroy(Agency $agency): RedirectResponse
    {
        // Verificar se tem clientes associados
        if ($agency->clients()->count() > 0) {
            return back()->with('error', 'Esta agência possui clientes associados e não pode ser excluída.');
        }
        
        // Verificar se tem subagências
        if ($agency->subAgencies()->count() > 0) {
            return back()->with('error', 'Esta agência possui subagências associadas e não pode ser excluída.');
        }
        
        // Verificar se tem usuários associados
        if ($agency->users()->count() > 0) {
            return back()->with('error', 'Esta agência possui usuários associados e não pode ser excluída.');
        }
        
        $agency->delete();
        
        return redirect()
            ->route('admin.agencies.index')
            ->with('success', 'Agência excluída com sucesso!');
    }

    /**
     * Retorna o histórico de invoices do owner da agência.
     */
    public function invoices(Agency $agency)
    {
        $owner = $agency->users()->whereHas('roles', function($q) {
            $q->where('name', 'agency.owner');
        })->first();
        if (!$owner) {
            return response()->json(['error' => 'Owner da agência não encontrado.'], 404);
        }
        $invoices = collect($owner->invoices())->map(function($invoice) {
            return [
                'id' => $invoice->id,
                'date' => $invoice->date()->format('Y-m-d'),
                'amount' => 'R$ ' . number_format($invoice->total() / 100, 2, ',', '.'),
                'status' => $invoice->paid ? 'Pago' : 'Pendente',
                'url' => $invoice->hosted_invoice_url,
            ];
        });
        return response()->json(['invoices' => $invoices]);
    }
} 