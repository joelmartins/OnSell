<?php

namespace App\Http\Controllers\Agency;

use App\Http\Controllers\Controller;
use App\Http\Requests\ProfileUpdateRequest;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;

class SettingsController extends Controller
{
    /**
     * Display the settings page.
     */
    public function index(Request $request)
    {
        Log::channel('audit')->info('Acessou configurações da agência', [
            'user_id' => auth()->id(),
            'ip' => request()->ip(),
        ]);
        
        return Inertia::render('Agency/Settings/Index');
    }
    
    /**
     * Display the user's profile form.
     */
    public function profile(Request $request): Response
    {
        Log::channel('audit')->info('Acessou página de perfil da agência', [
            'user_id' => auth()->id(),
            'ip' => request()->ip(),
        ]);
        
        return Inertia::render('Agency/Settings/Profile/Index', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => session('status'),
            'user' => $request->user(),
        ]);
    }
    
    /**
     * Update the user's profile information.
     */
    public function updateProfile(ProfileUpdateRequest $request): RedirectResponse
    {
        $user = $request->user();
        $user->fill($request->validated());

        if ($user->isDirty('email')) {
            $user->email_verified_at = null;
        }

        $user->save();
        
        Log::channel('audit')->info('Atualizou perfil de usuário (agência)', [
            'user_id' => auth()->id(),
            'ip' => request()->ip()
        ]);

        return Redirect::route('agency.settings.profile')->with('success', 'Perfil atualizado com sucesso.');
    }
    
    /**
     * Update the user's password.
     */
    public function updatePassword(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'current_password' => ['required', 'current_password'],
            'password' => ['required', 'confirmed', \Illuminate\Validation\Rules\Password::defaults()],
        ]);

        $request->user()->update([
            'password' => Hash::make($validated['password']),
        ]);
        
        Log::channel('audit')->info('Atualizou senha (agência)', [
            'user_id' => auth()->id(),
            'ip' => request()->ip()
        ]);

        return Redirect::route('agency.settings.profile')->with('success', 'Senha atualizada com sucesso.');
    }

    /**
     * Exibe a tela de integrações da agência (Stripe Connect, etc).
     */
    public function integrations(Request $request)
    {
        $impersonating = session()->get('impersonate.target');
        if ($impersonating && $impersonating['type'] === 'agency') {
            $agency = \App\Models\Agency::find($impersonating['id']);
        } else {
            $agency = $request->user()->agency;
        }
        if (!$agency) {
            abort(403, 'Agência não encontrada para este usuário.');
        }
        return inertia('Agency/Settings/Integrations', [
            'agency' => [
                'id' => $agency->id,
                'name' => $agency->name,
                'stripe_account_id' => $agency->stripe_account_id,
            ],
        ]);
    }
} 