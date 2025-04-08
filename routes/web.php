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
    Route::middleware(['auth', 'verified', \App\Http\Middleware\AgencyRole::class])->prefix('agency')->name('agency.')->group(function () {
        // Dashboard
        Route::get('/dashboard', function () {
            return Inertia::render('Agency/Dashboard/Index');
        })->name('dashboard');
        
        // Clientes
        Route::resource('clients', \App\Http\Controllers\Agency\ClientController::class);
        Route::put('/clients/{client}/toggle-status', [\App\Http\Controllers\Agency\ClientController::class, 'toggleStatus'])->name('clients.toggle-status');

        // White Label
        Route::get('/branding', [\App\Http\Controllers\Agency\BrandingController::class, 'index'])->name('branding.index');
        Route::put('/branding', [\App\Http\Controllers\Agency\BrandingController::class, 'update'])->name('branding.update');

        // Planos
        Route::resource('plans', \App\Http\Controllers\Agency\PlanController::class);

        // Configurações
        Route::get('/settings', function () {
            return Inertia::render('Agency/Settings/Index');
        })->name('settings.index');
    });
    
    // Rotas de Cliente
    Route::middleware(['auth', 'verified', \App\Http\Middleware\ClientRole::class])->prefix('client')->name('client.')->group(function () {
        // Dashboard
        Route::get('/dashboard', [\App\Http\Controllers\Client\DashboardController::class, 'index'])->name('dashboard');
        
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
        
        // Landing Pages
        Route::get('/landing-pages', [\App\Http\Controllers\Client\LandingPageController::class, 'index'])->name('landing-pages.index');
        Route::get('/landing-pages/create', [\App\Http\Controllers\Client\LandingPageController::class, 'create'])->name('landing-pages.create');
        Route::post('/landing-pages', [\App\Http\Controllers\Client\LandingPageController::class, 'store'])->name('landing-pages.store');
        Route::get('/landing-pages/{landingPage}/preview', [\App\Http\Controllers\Client\LandingPageController::class, 'preview'])->name('landing-pages.preview');
        Route::get('/landing-pages/{landingPage}/edit', [\App\Http\Controllers\Client\LandingPageController::class, 'edit'])->name('landing-pages.edit');
        Route::put('/landing-pages/{landingPage}', [\App\Http\Controllers\Client\LandingPageController::class, 'update'])->name('landing-pages.update');
        Route::delete('/landing-pages/{landingPage}', [\App\Http\Controllers\Client\LandingPageController::class, 'destroy'])->name('landing-pages.destroy');
        Route::get('/landing-pages/{landingPage}/duplicate', [\App\Http\Controllers\Client\LandingPageController::class, 'duplicate'])->name('landing-pages.duplicate');
        
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
    Route::get('/impersonate/targets', [\App\Http\Controllers\ImpersonationController::class, 'getImpersonationTargets'])
        ->name('impersonate.targets');
    
    Route::get('/impersonate/agency/{agency}', [\App\Http\Controllers\ImpersonationController::class, 'impersonateAgency'])
        ->middleware(\App\Http\Middleware\CheckImpersonationAccess::class)
        ->name('impersonate.agency');
    
    Route::get('/impersonate/client/{client}', [\App\Http\Controllers\ImpersonationController::class, 'impersonateClient'])
        ->middleware(\App\Http\Middleware\CheckImpersonationAccess::class)
        ->name('impersonate.client');
    
    Route::get('/stop-impersonating', [\App\Http\Controllers\ImpersonationController::class, 'stopImpersonating'])
        ->name('stop.impersonating');
});

require __DIR__.'/auth.php';
