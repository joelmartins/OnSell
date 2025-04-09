<?php

namespace App\Http\Controllers\Client;

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
        Log::channel('audit')->info('Acessou configurações do cliente', [
            'user_id' => auth()->id(),
            'ip' => request()->ip(),
        ]);
        
        return Inertia::render('Client/Settings/Index');
    }
    
    /**
     * Display the user's profile form.
     */
    public function profile(Request $request): Response
    {
        Log::channel('audit')->info('Acessou página de perfil do cliente', [
            'user_id' => auth()->id(),
            'ip' => request()->ip(),
        ]);
        
        return Inertia::render('Client/Settings/Profile', [
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
        
        Log::channel('audit')->info('Atualizou perfil de usuário (cliente)', [
            'user_id' => auth()->id(),
            'ip' => request()->ip()
        ]);

        return Redirect::route('client.settings.profile')->with('success', 'Perfil atualizado com sucesso.');
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
        
        Log::channel('audit')->info('Atualizou senha (cliente)', [
            'user_id' => auth()->id(),
            'ip' => request()->ip()
        ]);

        return Redirect::route('client.settings.profile')->with('success', 'Senha atualizada com sucesso.');
    }
} 