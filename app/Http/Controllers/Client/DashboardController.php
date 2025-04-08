<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Exibe o dashboard do cliente
     */
    public function index(Request $request): Response
    {
        // Log para depuração
        Log::channel('audit')->info('Acessando dashboard do cliente', [
            'user_id' => Auth::id(),
            'client_id' => Auth::user()->client_id,
            'path' => $request->path(),
            'is_impersonating' => session()->has('impersonate.target'),
            'impersonating_data' => session()->get('impersonate.target'),
        ]);
        
        // Renderizar o dashboard
        return Inertia::render('Client/Dashboard/Index');
    }
} 