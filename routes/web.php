<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Rota inicial pública
Route::get('/', [\App\Http\Controllers\HomeController::class, 'index'])->name('home');

// Rotas autenticadas
Route::middleware(['auth', 'verified'])->group(function () {
    // Dashboard e perfil
    Route::get('/dashboard', function () {
        return Inertia::render('Dashboard');
    })->middleware(\App\Http\Middleware\RedirectBasedOnRole::class)->name('dashboard');

    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Rotas de Admin
    Route::middleware([\Spatie\Permission\Middleware\RoleMiddleware::class.':admin.super'])->prefix('admin')->name('admin.')->group(function () {
        // Dashboard
        Route::get('/dashboard', function () {
            return Inertia::render('Admin/Dashboard/Index');
        })->name('dashboard');

        // Clientes
        Route::resource('clients', \App\Http\Controllers\Admin\ClientController::class);
        Route::put('clients/{client}/toggle-status', [\App\Http\Controllers\Admin\ClientController::class, 'toggleStatus'])->name('clients.toggle-status');

        // Agências
        Route::resource('agencies', \App\Http\Controllers\Admin\AgencyController::class);
        Route::put('agencies/{agency}/toggle-status', [\App\Http\Controllers\Admin\AgencyController::class, 'toggleStatus'])->name('agencies.toggle-status');

        // Impersonação
        Route::get('/impersonate/agency/{agency}', function(\App\Models\Agency $agency) {
            // Aqui você implementará a lógica de impersonação real no futuro
            session()->flash('success', 'Você está acessando como a agência: ' . $agency->name);
            return redirect()->route('admin.agencies.index');
        })->name('impersonate.agency');

        Route::get('/impersonate/client/{client}', function(\App\Models\Client $client) {
            // Aqui você implementará a lógica de impersonação real no futuro
            session()->flash('success', 'Você está acessando como o cliente: ' . $client->name);
            return redirect()->route('admin.clients.index');
        })->name('impersonate.client');

        // Planos
        Route::get('/plans', [\App\Http\Controllers\Admin\PlanController::class, 'index'])->name('plans.index');
        
        Route::get('/plans/create', function () {
            return Inertia::render('Admin/Plans/Create');
        })->name('plans.create');
        
        Route::post('/plans', [\App\Http\Controllers\Admin\PlanController::class, 'store'])->name('plans.store');
        
        Route::get('/plans/{plan}/edit', function ($plan) {
            return Inertia::render('Admin/Plans/Edit', [
                'plan' => \App\Models\Plan::findOrFail($plan)
            ]);
        })->name('plans.edit');
        
        Route::put('/plans/{plan}', [\App\Http\Controllers\Admin\PlanController::class, 'update'])->name('plans.update');
        
        Route::delete('/plans/{plan}', [\App\Http\Controllers\Admin\PlanController::class, 'destroy'])->name('plans.destroy');

        Route::put('/plans/{plan}/toggle', [\App\Http\Controllers\Admin\PlanController::class, 'toggle'])->name('plans.toggle');
        
        Route::put('/plans/{plan}/toggle-featured', [\App\Http\Controllers\Admin\PlanController::class, 'toggleFeatured'])->name('plans.toggle-featured');
        
        Route::get('/plans/{plan}/duplicate', [\App\Http\Controllers\Admin\PlanController::class, 'duplicate'])->name('plans.duplicate');

        // Integrações
        Route::get('/integrations', [\App\Http\Controllers\Admin\IntegrationsController::class, 'index'])->name('integrations.index');
        
        // Rotas de Integrações Específicas
        Route::get('/integrations/whatsapp', [\App\Http\Controllers\Admin\IntegrationsController::class, 'whatsapp'])->name('integrations.whatsapp');
        Route::get('/integrations/evolution', [\App\Http\Controllers\Admin\IntegrationsController::class, 'evolution'])->name('integrations.evolution');
        Route::get('/integrations/telegram', [\App\Http\Controllers\Admin\IntegrationsController::class, 'telegram'])->name('integrations.telegram');
        Route::get('/integrations/smtp', [\App\Http\Controllers\Admin\IntegrationsController::class, 'smtp'])->name('integrations.smtp');
        Route::get('/integrations/mailchimp', [\App\Http\Controllers\Admin\IntegrationsController::class, 'mailchimp'])->name('integrations.mailchimp');
        Route::get('/integrations/ses', [\App\Http\Controllers\Admin\IntegrationsController::class, 'ses'])->name('integrations.ses');
        Route::get('/integrations/twilio', [\App\Http\Controllers\Admin\IntegrationsController::class, 'twilio'])->name('integrations.twilio');
        Route::get('/integrations/meta', [\App\Http\Controllers\Admin\IntegrationsController::class, 'meta'])->name('integrations.meta');
        Route::get('/integrations/google', [\App\Http\Controllers\Admin\IntegrationsController::class, 'google'])->name('integrations.google');

        // Configurações
        Route::get('/settings', function () {
            return Inertia::render('Admin/Settings/Index');
        })->name('settings.index');
        
        Route::get('/settings/security', function () {
            return Inertia::render('Admin/Settings/Security');
        })->name('settings.security');
        
        Route::get('/settings/logs', function () {
            return Inertia::render('Admin/Settings/Logs');
        })->name('settings.logs');
    });

    // Rotas de Agência
    Route::middleware([\Spatie\Permission\Middleware\RoleMiddleware::class.':agency.owner'])->prefix('agency')->name('agency.')->group(function () {
        // Dashboard
        Route::get('/dashboard', function () {
            return Inertia::render('Agency/Dashboard/Index');
        })->name('dashboard');
        
        // Clientes
        Route::get('/clients', function () {
            return Inertia::render('Agency/Clients/Index');
        })->name('clients.index');

        // White Label
        Route::get('/branding', [\App\Http\Controllers\Agency\BrandingController::class, 'index'])->name('branding.index');
        Route::put('/branding', [\App\Http\Controllers\Agency\BrandingController::class, 'update'])->name('branding.update');

        // Planos
        Route::get('/plans', function () {
            return Inertia::render('Agency/Plans/Index');
        })->name('plans.index');

        // Configurações
        Route::get('/settings', function () {
            return Inertia::render('Agency/Settings/Index');
        })->name('settings.index');
    });
    
    // Rotas de Cliente
    Route::middleware([\Spatie\Permission\Middleware\RoleMiddleware::class.':client.user'])->prefix('client')->name('client.')->group(function () {
        // Dashboard
        Route::get('/dashboard', function () {
            return Inertia::render('Client/Dashboard/Index');
        })->name('dashboard');
        
        // Pipeline
        Route::get('/pipeline', function () {
            return Inertia::render('Client/Pipeline/Index');
        })->name('pipeline');
        
        // Mensagens
        Route::get('/messages', function () {
            return Inertia::render('Client/Messages/Index');
        })->name('messages');
        
        // Automação
        Route::get('/automation', function () {
            return Inertia::render('Client/Automation/Index');
        })->name('automation');
        
        // Contatos
        Route::get('/contacts', function () {
            return Inertia::render('Client/Contacts/Index');
        })->name('contacts');
        
        // Relatórios
        Route::get('/reports', function () {
            return Inertia::render('Client/Reports/Index');
        })->name('reports');
        
        // Integrações
        Route::get('/integrations', function () {
            return Inertia::render('Client/Integrations/Index');
        })->name('integrations');
        
        // Configurações
        Route::get('/settings', function () {
            return Inertia::render('Client/Settings/Index');
        })->name('settings');
    });

    // Impersonação
    Route::get('/impersonate', function () {
        // Lógica de impersonação será implementada
    })->middleware(\App\Http\Middleware\CheckImpersonationAccess::class)->name('impersonate');
    
    Route::get('/impersonate/agency/{agency}', function ($agency) {
        // Lógica para impersonar agência
        return redirect()->route('agency.dashboard');
    })->middleware(\App\Http\Middleware\CheckImpersonationAccess::class)->name('impersonate.agency');
    
    Route::get('/impersonate/client/{client}', function ($client) {
        // Lógica para impersonar cliente
        return redirect()->route('client.dashboard');
    })->middleware(\App\Http\Middleware\CheckImpersonationAccess::class)->name('impersonate.client');
    
    Route::get('/stop-impersonating', function () {
        // Lógica para parar impersonação
        return redirect()->route('dashboard');
    })->name('stop.impersonating');
});

require __DIR__.'/auth.php';
