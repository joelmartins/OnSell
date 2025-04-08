<?php

namespace Database\Seeders;

use App\Models\Plan;
use Illuminate\Database\Seeder;

class PlanSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Plano Starter
        Plan::create([
            'name' => 'Starter',
            'description' => 'Ideal para pequenas empresas com necessidades básicas de automação e volume limitado de leads.',
            'price' => 99.90,
            'period' => 'monthly',
            'agency_id' => null, // Plano do sistema
            'is_active' => true,
            'features' => json_encode([
                'Acesso ao pipeline',
                'Acesso ao inbox',
                'Qualificação básica de leads',
                'Relatórios básicos',
            ]),
            'max_contacts' => 500,
            'max_pipelines' => 1,
            'max_automation_flows' => 2,
            'has_whatsapp_integration' => true,
            'has_email_integration' => true,
            'has_meta_integration' => false,
            'has_google_integration' => false,
            'has_custom_domain' => false,
        ]);

        // Plano Pro
        Plan::create([
            'name' => 'Pro',
            'description' => 'Para empresas em crescimento, com maiores volumes e necessidade de mais automações e integrações.',
            'price' => 299.90,
            'period' => 'monthly',
            'agency_id' => null, // Plano do sistema
            'is_active' => true,
            'features' => json_encode([
                'Acesso ao pipeline',
                'Acesso ao inbox',
                'Qualificação avançada de leads',
                'Automação completa',
                'Relatórios detalhados',
                'Integrações com redes sociais',
            ]),
            'max_contacts' => 2000,
            'max_pipelines' => 3,
            'max_automation_flows' => 10,
            'has_whatsapp_integration' => true,
            'has_email_integration' => true,
            'has_meta_integration' => true,
            'has_google_integration' => true,
            'has_custom_domain' => false,
        ]);

        // Plano Enterprise
        Plan::create([
            'name' => 'Enterprise',
            'description' => 'Empresas consolidadas com necessidades específicas, maior personalização e alto volume operacional.',
            'price' => 799.90,
            'period' => 'monthly',
            'agency_id' => null, // Plano do sistema
            'is_active' => true,
            'features' => json_encode([
                'Acesso ao pipeline',
                'Acesso ao inbox',
                'Qualificação avançada de leads',
                'Automação completa',
                'Relatórios detalhados',
                'Integrações com redes sociais',
                'APIs customizadas',
                'Domínio personalizado',
                'Suporte dedicado',
            ]),
            'max_contacts' => 10000,
            'max_pipelines' => 10,
            'max_automation_flows' => 50,
            'has_whatsapp_integration' => true,
            'has_email_integration' => true,
            'has_meta_integration' => true,
            'has_google_integration' => true,
            'has_custom_domain' => true,
        ]);
    }
} 