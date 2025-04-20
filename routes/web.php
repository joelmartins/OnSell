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
use App\Http\Controllers\Admin\IntegrationsController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Plan;
use Illuminate\Support\Facades\DB;
use Stripe\StripeClient;

// Rota inicial pública
Route::get('/', function () {
    $featuredPlans = \App\Models\Plan::whereNull('agency_id')
        ->where('is_active', true)
        ->where('is_featured', true)
        ->where('is_agency_plan', false)
        ->whereNotNull('price_id')
        ->whereNotNull('product_id')
        ->orderBy('price')
        ->get();
    return Inertia::render('Site/Index', [
        'featuredPlans' => $featuredPlans,
    ]);
})->name('site.index');

// Rotas para páginas do site
Route::get('/contact', function () { return Inertia::render('Site/Contact'); })->name('site.contact');
Route::get('/terms', function () { return Inertia::render('Site/Terms'); })->name('site.terms');
Route::get('/privacy', function () { return Inertia::render('Site/Privacy'); })->name('site.privacy');
Route::get('/agencies', function () { return Inertia::render('Site/Agencies'); })->name('site.agencies');

// Rotas públicas de landing pages e cadastro
// Rotas para landing pages públicas de agências
Route::get('/agency/{id}/landing', [\App\Http\Controllers\PublicLandingPageController::class, 'showById'])
    ->where('id', '[0-9]+')
    ->name('agency.landing');

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
        Route::get('clients/trashed', [\App\Http\Controllers\Admin\ClientController::class, 'trashedIndex'])->name('clients.trashed');
        Route::put('clients/{id}/restore', [\App\Http\Controllers\Admin\ClientController::class, 'restore'])->name('clients.restore');
        Route::delete('clients/{id}/force-delete', [\App\Http\Controllers\Admin\ClientController::class, 'forceDelete'])->name('clients.force-delete');
        Route::get('clients/{client}/invoices', [\App\Http\Controllers\Admin\ClientController::class, 'invoices'])->name('clients.invoices');
        Route::resource('clients', \App\Http\Controllers\Admin\ClientController::class);
        Route::put('clients/{client}/toggle-status', [\App\Http\Controllers\Admin\ClientController::class, 'toggleStatus'])->name('clients.toggle-status');

        // Agências
        Route::get('agencies/{agency}/invoices', [\App\Http\Controllers\Admin\AgencyController::class, 'invoices'])->name('agencies.invoices');
        Route::resource('agencies', \App\Http\Controllers\Admin\AgencyController::class);
        Route::put('agencies/{agency}/toggle-status', [\App\Http\Controllers\Admin\AgencyController::class, 'toggleStatus'])->name('agencies.toggle-status');

        // Planos
        Route::resource('plans', \App\Http\Controllers\Admin\PlanController::class);
        Route::get('plans/{plan}/duplicate', [\App\Http\Controllers\Admin\PlanController::class, 'duplicate'])->name('plans.duplicate');
        Route::put('plans/{plan}/toggle', [\App\Http\Controllers\Admin\PlanController::class, 'toggle'])->name('plans.toggle');
        Route::put('plans/{plan}/toggle-featured', [\App\Http\Controllers\Admin\PlanController::class, 'toggleFeatured'])->name('plans.toggle-featured');
        Route::post('plans/{plan}/sync-stripe', [\App\Http\Controllers\Admin\PlanController::class, 'syncStripe'])->name('plans.sync-stripe');

        // Usuários
        Route::get('/users', [\App\Http\Controllers\Admin\UserController::class, 'index'])->name('users.index');
        Route::post('/users/{user}/verify-email', [\App\Http\Controllers\Admin\UserController::class, 'verifyEmail'])->name('users.verify-email');
        Route::put('/users/{user}/toggle-status', [\App\Http\Controllers\Admin\UserController::class, 'toggleStatus'])->name('users.toggle-status');
        Route::post('/users/{user}/generate-password', [\App\Http\Controllers\Admin\UserController::class, 'generatePassword'])->name('users.generate-password');

        // Integrações
        Route::get('/integrations', [\App\Http\Controllers\Admin\IntegrationsController::class, 'index'])->name('integrations.index');
        
        // Rotas de Integrações Específicas
        Route::get('/integrations/whatsapp', [\App\Http\Controllers\Admin\IntegrationsController::class, 'whatsapp'])->name('integrations.whatsapp');
        Route::get('/integrations/evolution', [\App\Http\Controllers\Admin\IntegrationsController::class, 'evolutionIndex'])->name('integrations.evolution.index');
        Route::get('/integrations/evolution/settings', [\App\Http\Controllers\Admin\IntegrationsController::class, 'evolutionSettings'])->name('integrations.evolution.settings');
        Route::post('/integrations/evolution/webhook', [\App\Http\Controllers\Admin\IntegrationsController::class, 'evolutionWebhook'])->name('integrations.evolution.webhook');
        Route::get('/integrations/ses', [\App\Http\Controllers\Admin\IntegrationsController::class, 'ses'])->name('integrations.ses');
        Route::get('/integrations/twilio', [\App\Http\Controllers\Admin\IntegrationsController::class, 'twilio'])->name('integrations.twilio');
        Route::get('/integrations/vapi', [\App\Http\Controllers\Admin\IntegrationsController::class, 'vapi'])->name('integrations.vapi');
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

            // Gerenciador de Filas
            Route::get('/queues', [\App\Http\Controllers\Admin\QueueManagerController::class, 'index'])->name('queues.index');
            Route::post('/queues/flush-failed', [\App\Http\Controllers\Admin\QueueManagerController::class, 'flushFailed'])->name('queues.flush-failed');
            Route::post('/queues/retry-failed', [\App\Http\Controllers\Admin\QueueManagerController::class, 'retryFailed'])->name('queues.retry-failed');
            Route::post('/queues/purge', [\App\Http\Controllers\Admin\QueueManagerController::class, 'purgeQueue'])->name('queues.purge');
            Route::post('/queues/restart-worker', [\App\Http\Controllers\Admin\QueueManagerController::class, 'restartWorker'])->name('queues.restart-worker');
            Route::post('/queues/force-process', [\App\Http\Controllers\Admin\QueueManagerController::class, 'forceProcess'])->name('queues.force-process');
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
        // As rotas abaixo são usadas pelo backend, mas no frontend a navegação é feita por abas no Index.jsx
        // Os links no AgencyLayout.jsx redirecionam para branding.index com um parâmetro defaultTab
        Route::get('/branding/visual', [\App\Http\Controllers\Agency\BrandingController::class, 'visual'])->name('branding.visual');
        Route::get('/branding/domain', [\App\Http\Controllers\Agency\BrandingController::class, 'domain'])->name('branding.domain');
        Route::get('/branding/landing', [\App\Http\Controllers\Agency\BrandingController::class, 'landing'])->name('branding.landing');
        Route::put('/branding', [\App\Http\Controllers\Agency\BrandingController::class, 'update'])->name('branding.update');
        Route::put('/branding/domain', [\App\Http\Controllers\Agency\BrandingController::class, 'updateDomain'])->name('branding.update.domain');
        Route::put('/branding/landing', [\App\Http\Controllers\Agency\BrandingController::class, 'updateLandingPage'])->name('branding.update.landing');
        Route::put('/branding/landing-json', [\App\Http\Controllers\Agency\BrandingController::class, 'updateLandingPageJson'])->name('branding.update.landing.json');
        Route::get('/branding/check-domain', [\App\Http\Controllers\Agency\BrandingController::class, 'checkDomainStatus'])->name('branding.check.domain');
        Route::post('/branding/ai-fill', [\App\Http\Controllers\Agency\BrandingController::class, 'aiFillLandingPage'])->name('branding.ai-fill');
        Route::post('/branding/ai-fill-json', [\App\Http\Controllers\Agency\BrandingController::class, 'aiFillLandingPageJson'])->name('branding.ai-fill-json');

        // Planos
        Route::resource('plans', \App\Http\Controllers\Agency\PlanController::class);
        Route::put('/plans/{plan}/toggle', [\App\Http\Controllers\Agency\PlanController::class, 'toggle'])->name('plans.toggle');
        Route::put('/plans/{plan}/toggle-featured', [\App\Http\Controllers\Agency\PlanController::class, 'toggleFeatured'])->name('plans.toggle-featured');
        Route::get('/plans/{plan}/duplicate', [\App\Http\Controllers\Agency\PlanController::class, 'duplicate'])->name('plans.duplicate');
        Route::post('/plans/{plan}/sync-stripe', [\App\Http\Controllers\Agency\PlanController::class, 'syncStripe'])->name('plans.sync-stripe');

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
            
            // Integrações
            Route::get('/integrations', [\App\Http\Controllers\Agency\SettingsController::class, 'integrations'])->name('integrations');
            
            // Checkout Stripe
            Route::post('/billing/checkout', [\App\Http\Controllers\Agency\BillingController::class, 'checkout'])->name('billing.checkout');
            Route::get('/billing', [\App\Http\Controllers\Agency\BillingController::class, 'show'])->name('billing');
        });

        // Diagnóstico de clientes
        Route::get('/debug/clients/{client}', [\App\Http\Controllers\Agency\ResolveClientIssueController::class, 'checkClientStatus'])
            ->name('debug.clients.check');
        Route::post('/debug/clients/{client}/fix', [\App\Http\Controllers\Agency\ResolveClientIssueController::class, 'fixClientIssue'])
            ->name('debug.clients.fix');
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
        Route::get('/contacts', [\App\Http\Controllers\Client\ContactController::class, 'index'])->name('contacts.index');
        Route::get('/contacts/create', [\App\Http\Controllers\Client\ContactController::class, 'create'])->name('contacts.create');
        Route::post('/contacts', [\App\Http\Controllers\Client\ContactController::class, 'store'])->name('contacts.store');
        Route::get('/contacts/import', [\App\Http\Controllers\Client\ContactController::class, 'importForm'])->name('contacts.import');
        Route::post('/contacts/import/process', [\App\Http\Controllers\Client\ContactController::class, 'importProcess'])->name('contacts.import.process');
        Route::get('/contacts/export', [\App\Http\Controllers\Client\ContactController::class, 'export'])->name('contacts.export');
        Route::get('/contacts/{contact}/edit', [\App\Http\Controllers\Client\ContactController::class, 'edit'])->name('contacts.edit');
        Route::put('/contacts/{contact}', [\App\Http\Controllers\Client\ContactController::class, 'update'])->name('contacts.update');
        Route::delete('/contacts/{contact}', [\App\Http\Controllers\Client\ContactController::class, 'destroy'])->name('contacts.destroy');
        Route::get('/contacts/{contact}', [\App\Http\Controllers\Client\ContactController::class, 'show'])->name('contacts.show');
        
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
            
            // Checkout Stripe
            Route::post('/billing/checkout', [\App\Http\Controllers\Client\BillingController::class, 'checkout'])->name('billing.checkout');
            Route::get('/billing', [\App\Http\Controllers\Client\BillingController::class, 'show'])->name('billing');
        });

        // Cliente: cancelamento de assinatura
        Route::post('/billing/cancel', [\App\Http\Controllers\Client\BillingController::class, 'cancel'])->name('client.billing.cancel');

        // Sales Intelligence (novo fluxo modular)
        Route::get('/sales-intelligence/diagnosis', [\App\Http\Controllers\Client\SalesIntelligenceController::class, 'showForm'])->name('salesintelligence.diagnosis');
        Route::post('/sales-intelligence/answers', [\App\Http\Controllers\Client\SalesIntelligenceController::class, 'storeAnswers'])->name('salesintelligence.answers');
        Route::get('/sales-intelligence/deliverables', [\App\Http\Controllers\Client\SalesIntelligenceController::class, 'listDeliverables'])->name('salesintelligence.deliverables');
        Route::get('/sales-intelligence/check-progress', [\App\Http\Controllers\Client\SalesIntelligenceController::class, 'checkProgress'])->name('salesintelligence.check-progress');
        Route::post('/sales-intelligence/deliverable/{type}/generate', [\App\Http\Controllers\Client\SalesIntelligenceController::class, 'generateDeliverable'])->name('salesintelligence.generate');
        Route::post('/sales-intelligence/deliverable/{type}/save', [\App\Http\Controllers\Client\SalesIntelligenceController::class, 'saveDeliverable'])->name('salesintelligence.save');
        Route::post('/sales-intelligence/reprocess', [\App\Http\Controllers\Client\SalesIntelligenceController::class, 'reprocessDeliverables'])->name('salesintelligence.reprocess');
    });

    // Agência: cancelamento de assinatura
    Route::middleware(['auth', 'role:agency.owner'])->prefix('agency/settings')->group(function () {
        Route::post('/billing/cancel', [\App\Http\Controllers\Agency\BillingController::class, 'cancel'])->name('agency.billing.cancel');
    });

    // Integração Stripe Connect para agências
    Route::middleware(['auth', \App\Http\Middleware\AgencyRole::class])->prefix('agency/settings/integrations')->group(function () {
        Route::get('/stripe/connect', [\App\Http\Controllers\Agency\StripeIntegrationController::class, 'redirectToStripe'])->name('agency.stripe.connect');
        Route::get('/stripe/callback', [\App\Http\Controllers\Agency\StripeIntegrationController::class, 'handleStripeCallback'])->name('agency.stripe.callback');
        Route::post('/stripe/disconnect', [\App\Http\Controllers\Agency\StripeIntegrationController::class, 'disconnectStripe'])->name('agency.stripe.disconnect');
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

// Rotas para envio de e-mails reais do sistema
Route::prefix('system-emails')->middleware(['auth', 'role:admin.super'])->group(function () {
    Route::post('/welcome', [\App\Http\Controllers\SystemEmailController::class, 'sendWelcomeEmail'])->name('system.email.welcome');
    Route::post('/password-reset', [\App\Http\Controllers\SystemEmailController::class, 'sendPasswordResetEmail'])->name('system.email.password-reset');
    Route::post('/account-activation', [\App\Http\Controllers\SystemEmailController::class, 'sendAccountActivationEmail'])->name('system.email.account-activation');
});

// Rota para renderizar a página de cadastro rápido
Route::get('/signup', function (\Illuminate\Http\Request $request) {
    $planId = $request->query('plan_id');
    $plan = $planId ? \App\Models\Plan::find($planId) : null;
    $featuredPlans = \App\Models\Plan::whereNull('agency_id')
        ->where('is_active', true)
        ->where('is_agency_plan', false)
        ->whereNotNull('price_id')
        ->whereNotNull('product_id')
        ->orderBy('price')
        ->get();
    return Inertia::render('Site/Signup', [
        'selectedPlan' => $plan,
        'plan_id' => $planId,
        'featuredPlans' => $featuredPlans,
    ]);
})->name('signup');

Route::post('/signup', function (Request $request) {
    $validated = $request->validate([
        'client_name' => 'required|string|max:255',
        'client_document' => 'nullable|string|max:32',
        'client_email' => 'required|email|max:255|unique:clients,email',
        'client_phone' => 'nullable|string|max:20',
        'user_name' => 'required|string|max:255',
        'user_email' => 'required|email|max:255|unique:users,email',
        'user_phone' => 'nullable|string|max:20',
        'password' => 'required|string|min:6',
        'plan_id' => 'nullable|exists:plans,id',
    ]);

    DB::beginTransaction();
    try {
        $plan = $validated['plan_id'] ? Plan::find($validated['plan_id']) : null;
        $client = \App\Models\Client::create([
            'name' => $validated['client_name'],
            'document' => $validated['client_document'],
            'email' => $validated['client_email'],
            'phone' => $validated['client_phone'],
            'plan_id' => $plan ? $plan->id : null,
            'is_active' => false,
        ]);
        $user = User::create([
            'name' => $validated['user_name'],
            'email' => $validated['user_email'],
            'phone' => $validated['user_phone'],
            'password' => Hash::make($validated['password']),
            'client_id' => $client->id,
            'is_active' => true,
        ]);
        if (\Spatie\Permission\Models\Role::where('name', 'client.user')->exists()) {
            $user->assignRole('client.user');
        }
        if ($plan && $plan->price > 0 && $plan->price_id) {
            $stripe = new StripeClient(config('services.stripe.secret'));
            $customer = $stripe->customers->create([
                'email' => $user->email,
                'name' => $user->name,
                'phone' => $user->phone,
                'metadata' => [
                    'user_id' => $user->id,
                    'client_id' => $client->id,
                ],
            ]);
            $user->stripe_id = $customer->id;
            $user->save();
            $checkoutSession = $stripe->checkout->sessions->create([
                'customer' => $customer->id,
                'payment_method_types' => ['card'],
                'line_items' => [[
                    'price' => $plan->price_id,
                    'quantity' => 1,
                ]],
                'mode' => 'subscription',
                'success_url' => url('/payment-success?user_id=' . $user->id . '&client_id=' . $client->id),
                'cancel_url' => url('/signup?plan_id=' . $plan->id . '&cancel=1'),
            ]);
            DB::commit();
            return response()->json(['checkout_url' => $checkoutSession->url]);
        }
        DB::commit();
        return response()->json(['success' => true]);
    } catch (\Exception $e) {
        DB::rollBack();
        return response()->json(['message' => $e->getMessage()], 422);
    }
});

// Rota para confirmar pagamento bem-sucedido
Route::get('/payment-success', function (Request $request) {
    $userId = $request->query('user_id');
    $clientId = $request->query('client_id');
    
    if ($userId && $clientId) {
        // Ativar o cliente manualmente, já que pode haver atraso no webhook do Stripe
        try {
            $client = \App\Models\Client::find($clientId);
            if ($client && !$client->is_active) {
                $client->is_active = true;
                $client->save();
                \Log::info('Cliente ativado manualmente após pagamento bem-sucedido', [
                    'client_id' => $clientId,
                    'user_id' => $userId
                ]);
            }
        } catch (\Exception $e) {
            \Log::error('Erro ao ativar cliente após pagamento', [
                'error' => $e->getMessage(),
                'client_id' => $clientId,
                'user_id' => $userId
            ]);
        }
    }
    
    return Inertia::render('Site/PaymentSuccess', [
        'loginUrl' => url('/login')
    ]);
});

require __DIR__.'/auth.php';
