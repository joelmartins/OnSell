<?php

namespace App\Http\Controllers;

use App\Models\Plan;
use Illuminate\Foundation\Application;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

class HomeController extends Controller
{
    /**
     * Mostrar a página inicial
     */
    public function index()
    {
        // Obter todos os planos do sistema que estão ativos e em destaque
        $featuredPlans = Plan::whereNull('agency_id')
            ->where('is_active', true)
            ->where('is_featured', true)
            ->orderBy('price')
            ->get();
            
        return Inertia::render('Welcome', [
            'canLogin' => Route::has('login'),
            'canRegister' => Route::has('register'),
            'laravelVersion' => Application::VERSION,
            'phpVersion' => PHP_VERSION,
            'featuredPlans' => $featuredPlans
        ]);
    }
}
