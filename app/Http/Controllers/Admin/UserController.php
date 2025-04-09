<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Verified;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    /**
     * Display a listing of users.
     */
    public function index(Request $request): Response
    {
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
        // Verificar permissões - apenas admin ou agência responsável pode verificar
        if (!auth()->user()->isAdmin() && 
            !(auth()->user()->isAgency() && auth()->user()->agency_id === $user->agency_id)) {
            return redirect()->back()->with('error', 'Você não tem permissão para realizar esta ação.');
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
        // Verificar permissões - apenas admin ou agência responsável pode ativar/desativar
        if (!auth()->user()->isAdmin() && 
            !(auth()->user()->isAgency() && auth()->user()->agency_id === $user->agency_id)) {
            return redirect()->back()->with('error', 'Você não tem permissão para realizar esta ação.');
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
} 