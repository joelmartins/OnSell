<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\Admin\AgencyController;
use App\Http\Controllers\Admin\ClientController;
use App\Http\Controllers\Admin\PlanController;
use App\Http\Controllers\Admin\SettingsController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\LogsController;
use App\Http\Controllers\Agency\AutomationController;

// Rota inicial pública
Route::get('/', [\App\Http\Controllers\HomeController::class, 'index'])->name('home');

// Rotas públicas de landing pages e cadastro
// Rotas para landing pages públicas de agências
Route::get('/agency/{id}/landing', [\App\Http\Controllers\PublicLandingPageController::class, 'showById'])->name('agency.landing');

// Rotas para cadastro via landing page
Route::get('/agency/{agencyId}/signup', [\App\Http\Controllers\AgencySignupController::class, 'showSignupForm'])->name('agency.signup');
Route::get('/agency/{agencyId}/signup/{planId}', [\App\Http\Controllers\AgencySignupController::class, 'showSignupForm'])->name('agency.signup.plan');
Route::post('/agency/{agencyId}/signup', [\App\Http\Controllers\AgencySignupController::class, 'processSignup'])->name('agency.signup.process');

// Rota para o subdomínio das agências
Route::domain('{subdomain}.'.config('app.url'))->group(function () {
    Route::get('/', [\App\Http\Controllers\PublicLandingPageController::class, 'showBySubdomain'])->name('agency.landing.subdomain');
    // Rotas para cadastro via subdomínio
    Route::get('/signup', [\App\Http\Controllers\AgencySignupController::class, 'showSignupFormBySubdomain'])->name('agency.subdomain.signup');
    Route::get('/signup/plan/{planId}', [\App\Http\Controllers\AgencySignupController::class, 'showSignupFormBySubdomain'])->name('agency.subdomain.signup.plan');
    Route::post('/signup', [\App\Http\Controllers\AgencySignupController::class, 'processSignupBySubdomain'])->name('agency.subdomain.signup.process');
});

// Rotas autenticadas
Route::middleware(['auth', 'verified'])->group(function () {
    // Dashboard
    Route::get('/dashboard', function () {
        return Inertia::render('Dashboard');
    })->middleware(\App\Http\Middleware\RedirectBasedOnRole::class)->name('dashboard');

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
        Route::resource('plans', \App\Http\Controllers\Admin\PlanController::class);
        Route::get('plans/{plan}/duplicate', [\App\Http\Controllers\Admin\PlanController::class, 'duplicate'])->name('plans.duplicate');
        Route::put('plans/{plan}/toggle', [\App\Http\Controllers\Admin\PlanController::class, 'toggle'])->name('plans.toggle');
        Route::put('plans/{plan}/toggle-featured', [\App\Http\Controllers\Admin\PlanController::class, 'toggleFeatured'])->name('plans.toggle-featured');

        // Usuários
        Route::get('/users', [\App\Http\Controllers\Admin\UserController::class, 'index'])->name('users.index');
        Route::post('/users/{user}/verify-email', [\App\Http\Controllers\Admin\UserController::class, 'verifyEmail'])->name('users.verify-email');
        Route::put('/users/{user}/toggle-status', [\App\Http\Controllers\Admin\UserController::class, 'toggleStatus'])->name('users.toggle-status');
        Route::post('/users/{user}/generate-password', [\App\Http\Controllers\Admin\UserController::class, 'generatePassword'])->name('users.generate-password');

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
        Route::prefix('settings')->name('settings.')->group(function () {
            Route::get('/', [SettingsController::class, 'index'])->name('index');
            Route::get('/logs', [LogsController::class, 'index'])->name('logs');
            Route::get('/get-logs', [LogsController::class, 'getLogs'])->name('get-logs');
            Route::get('/export-logs', [LogsController::class, 'exportLogs'])->name('export-logs');
            Route::post('/clear-old-logs', [LogsController::class, 'clearOldLogs'])->name('clear-old-logs');
            
            // Perfil
            Route::get('/profile', [\App\Http\Controllers\Admin\SettingsController::class, 'profile'])->name('profile');
            Route::patch('/profile', [\App\Http\Controllers\Admin\SettingsController::class, 'updateProfile'])->name('update-profile');
            Route::put('/password', [\App\Http\Controllers\Admin\SettingsController::class, 'updatePassword'])->name('update-password');
        });

        Route::resource('users', \App\Http\Controllers\Admin\UserController::class);
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
        Route::put('/branding/domain', [\App\Http\Controllers\Agency\BrandingController::class, 'updateDomain'])->name('branding.update.domain');
        Route::put('/branding/landing', [\App\Http\Controllers\Agency\BrandingController::class, 'updateLandingPage'])->name('branding.update.landing');

        // Planos
        Route::resource('plans', \App\Http\Controllers\Agency\PlanController::class);
        Route::put('/plans/{plan}/toggle', [\App\Http\Controllers\Agency\PlanController::class, 'toggle'])->name('plans.toggle');
        Route::put('/plans/{plan}/toggle-featured', [\App\Http\Controllers\Agency\PlanController::class, 'toggleFeatured'])->name('plans.toggle-featured');

        // Usuários
        Route::get('/users', [\App\Http\Controllers\Agency\UserController::class, 'index'])->name('users.index');
        Route::get('/users/create', [\App\Http\Controllers\Agency\UserController::class, 'create'])->name('users.create');
        Route::post('/users', [\App\Http\Controllers\Agency\UserController::class, 'store'])->name('users.store');
        Route::post('/users/{user}/verify-email', [\App\Http\Controllers\Agency\UserController::class, 'verifyEmail'])->name('users.verify-email');
        Route::put('/users/{user}/toggle-status', [\App\Http\Controllers\Agency\UserController::class, 'toggleStatus'])->name('users.toggle-status');
        Route::post('/users/{user}/generate-password', [\App\Http\Controllers\Agency\UserController::class, 'generatePassword'])->name('users.generate-password');
        Route::get('/users/{user}/edit', [\App\Http\Controllers\Agency\UserController::class, 'edit'])->name('users.edit');
        Route::put('/users/{user}', [\App\Http\Controllers\Agency\UserController::class, 'update'])->name('users.update');

        // Configurações
        Route::prefix('settings')->name('settings.')->group(function () {
            Route::get('/', [\App\Http\Controllers\Agency\SettingsController::class, 'index'])->name('index');
            
            // Perfil
            Route::get('/profile', [\App\Http\Controllers\Agency\SettingsController::class, 'profile'])->name('profile');
            Route::patch('/profile', [\App\Http\Controllers\Agency\SettingsController::class, 'updateProfile'])->name('update-profile');
            Route::put('/password', [\App\Http\Controllers\Agency\SettingsController::class, 'updatePassword'])->name('update-password');
        });
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
        Route::prefix('settings')->name('settings.')->group(function () {
            Route::get('/', [\App\Http\Controllers\Client\SettingsController::class, 'index'])->name('index');
            
            // Perfil
            Route::get('/profile', [\App\Http\Controllers\Client\SettingsController::class, 'profile'])->name('profile');
            Route::patch('/profile', [\App\Http\Controllers\Client\SettingsController::class, 'updateProfile'])->name('update-profile');
            Route::put('/password', [\App\Http\Controllers\Client\SettingsController::class, 'updatePassword'])->name('update-password');
        });
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
