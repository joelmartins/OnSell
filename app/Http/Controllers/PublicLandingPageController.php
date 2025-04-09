<?php

namespace App\Http\Controllers;

use App\Models\Agency;
use App\Models\Plan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class PublicLandingPageController extends Controller
{
    /**
     * Exibe a landing page pública de uma agência pelo subdomínio
     */
    public function showBySubdomain(string $subdomain): Response
    {
        // Buscar a agência pelo subdomínio
        $agency = Agency::where('subdomain', $subdomain)
            ->where('is_active', true)
            ->first();
            
        if (!$agency) {
            abort(404, 'Agência não encontrada');
        }
        
        // Log para depuração
        Log::channel('audit')->info('Acessando landing page de agência via subdomínio', [
            'agency_id' => $agency->id,
            'agency_name' => $agency->name,
            'subdomain' => $subdomain,
        ]);
        
        return $this->renderLandingPage($agency);
    }
    
    /**
     * Exibe a landing page pública de uma agência pelo ID
     */
    public function showById(int $id): Response
    {
        // Buscar a agência pelo ID
        $agency = Agency::where('id', $id)
            ->where('is_active', true)
            ->first();
            
        if (!$agency) {
            abort(404, 'Agência não encontrada');
        }
        
        // Log para depuração
        Log::channel('audit')->info('Acessando landing page de agência via ID', [
            'agency_id' => $agency->id,
            'agency_name' => $agency->name,
        ]);
        
        return $this->renderLandingPage($agency);
    }
    
    /**
     * Método comum para renderizar a landing page
     */
    private function renderLandingPage(Agency $agency): Response
    {
        // Decodificar dados da landing page
        $landingData = $agency->landing_page ? json_decode($agency->landing_page, true) : null;
        
        if (!$landingData) {
            $landingData = [
                'headline' => 'Aumente suas vendas com nossa solução completa',
                'subheadline' => 'Captura de leads, automação de marketing e gestão de vendas em um só lugar',
                'hero_image' => null,
                'cta_text' => 'Começar agora',
                'features_title' => 'Recursos principais',
                'features' => [
                    [
                        'title' => 'Captura de Leads',
                        'description' => 'Landing pages de alta conversão para capturar leads qualificados',
                        'icon' => 'Users'
                    ],
                    [
                        'title' => 'Automação de Marketing',
                        'description' => 'Fluxos automatizados para nutrir seus leads até a venda',
                        'icon' => 'Zap'
                    ],
                    [
                        'title' => 'CRM Completo',
                        'description' => 'Gestão completa do seu funil de vendas com dashboards e relatórios',
                        'icon' => 'BarChart'
                    ]
                ],
            ];
        }
        
        // Buscar planos ativos da agência em destaque (featured)
        $featuredPlans = Plan::where('agency_id', $agency->id)
            ->where('is_active', true)
            ->where('is_featured', true)
            ->orderBy('price')
            ->get()
            ->map(function($plan) {
                return [
                    'id' => $plan->id,
                    'name' => $plan->name,
                    'description' => $plan->description,
                    'price' => (float)$plan->price,
                    'period' => $plan->period,
                    'period_label' => $plan->period === 'monthly' ? 'mês' : 'ano',
                    'features' => $plan->features,
                    'is_featured' => $plan->is_featured,
                ];
            });
            
        // Se não houver planos em destaque, buscar todos os planos ativos
        if ($featuredPlans->isEmpty()) {
            $featuredPlans = Plan::where('agency_id', $agency->id)
                ->where('is_active', true)
                ->orderBy('price')
                ->get()
                ->map(function($plan) {
                    return [
                        'id' => $plan->id,
                        'name' => $plan->name,
                        'description' => $plan->description,
                        'price' => (float)$plan->price,
                        'period' => $plan->period,
                        'period_label' => $plan->period === 'monthly' ? 'mês' : 'ano',
                        'features' => $plan->features,
                        'is_featured' => $plan->is_featured,
                    ];
                });
        }
        
        // Renderizar a landing page
        return Inertia::render('Public/AgencyLandingPage', [
            'agency' => [
                'id' => $agency->id,
                'name' => $agency->name,
                'logo' => $agency->logo,
                'favicon' => $agency->favicon,
                'primary_color' => $agency->primary_color,
                'secondary_color' => $agency->secondary_color,
                'accent_color' => $agency->accent_color,
            ],
            'landing' => $landingData,
            'plans' => $featuredPlans,
            'signupUrl' => route('agency.signup', ['agencyId' => $agency->id]),
        ]);
    }
} 