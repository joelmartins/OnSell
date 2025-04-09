<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class SettingsController extends Controller
{
    /**
     * Exibe a página principal de configurações
     */
    public function index()
    {
        // Registro de auditoria do acesso à página de configurações
        Log::channel('audit')->info('Acessando página de configurações do sistema', [
            'user_id' => auth()->id(),
            'user_email' => auth()->user()->email,
        ]);

        return Inertia::render('Admin/Settings/Index');
    }
} 