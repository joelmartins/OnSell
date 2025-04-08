<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Route;
use Stancl\Tenancy\Middleware\InitializeTenancyByDomain;
use Stancl\Tenancy\Middleware\PreventAccessFromCentralDomains;

/*
|--------------------------------------------------------------------------
| Tenant Routes
|--------------------------------------------------------------------------
|
| Aqui estão as rotas específicas para cada tenant (cliente ou agência).
| Essas rotas são carregadas apenas quando o domínio corresponde a um tenant.
|
*/

Route::middleware([
    'web',
    InitializeTenancyByDomain::class,
    PreventAccessFromCentralDomains::class,
])->group(function () {
    // Rota inicial do tenant
    Route::get('/', function () {
        return redirect()->route('login');
    });

    // Rotas de autenticação
    Route::middleware(['guest'])->group(function () {
        Route::get('/login', function () {
            return inertia('Auth/Login');
        })->name('login');
    });

    // Rotas autenticadas para clientes
    Route::middleware(['auth', 'verified'])->group(function () {
        // Dashboard
        Route::get('/dashboard', function () {
            return inertia('Client/Dashboard');
        })->name('dashboard');

        // Pipeline
        Route::get('/pipeline', function () {
            return inertia('Client/Pipeline/Index');
        })->name('pipeline.index');

        // Mensagens
        Route::get('/messages', function () {
            return inertia('Client/Messages/Index');
        })->name('messages.index');

        // Automação
        Route::get('/automation', function () {
            return inertia('Client/Automation/Index');
        })->name('automation.index');

        // Contatos
        Route::get('/contacts', function () {
            return inertia('Client/Contacts/Index');
        })->name('contacts.index');

        // Relatórios
        Route::get('/reports', function () {
            return inertia('Client/Reports/Index');
        })->name('reports.index');

        // Integrações
        Route::get('/integrations', function () {
            return inertia('Client/Integrations/Index');
        })->name('integrations.index');

        // Configurações
        Route::get('/settings', function () {
            return inertia('Client/Settings/Index');
        })->name('settings.index');
    });
});
