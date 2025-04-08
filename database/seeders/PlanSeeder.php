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
        Plan::updateOrCreate(
            ['id' => 1],
            [
                'name' => 'Starter',
                'description' => 'Ideal para pequenos negócios',
                'price' => 97,
                'period' => 'monthly',
                'agency_id' => null,
                'is_active' => true,
                'is_agency_plan' => false,
                'features' => json_encode([
                    'feature_1' => 'Funil de vendas',
                    'feature_2' => 'Landing pages ilimitadas',
                    'feature_3' => 'Integrações básicas',
                ]),
                'monthly_leads' => 50,
                'max_landing_pages' => 5,
                'max_pipelines' => 2,
                'total_leads' => 1000,
                'has_whatsapp_integration' => true,
                'has_email_integration' => true,
                'has_meta_integration' => false,
                'has_google_integration' => false,
                'has_custom_domain' => false,
            ]
        );

        // Plano Pro
        Plan::updateOrCreate(
            ['id' => 2],
            [
                'name' => 'Pro',
                'description' => 'Para empresas em crescimento',
                'price' => 197,
                'period' => 'monthly',
                'agency_id' => null,
                'is_active' => true,
                'is_agency_plan' => false,
                'features' => json_encode([
                    'feature_1' => 'Tudo do Starter',
                    'feature_2' => 'Automações avançadas',
                    'feature_3' => 'Integrações avançadas',
                ]),
                'monthly_leads' => 200,
                'max_landing_pages' => 15,
                'max_pipelines' => 5,
                'total_leads' => 5000,
                'has_whatsapp_integration' => true,
                'has_email_integration' => true,
                'has_meta_integration' => true,
                'has_google_integration' => true,
                'has_custom_domain' => false,
            ]
        );

        // Plano Enterprise
        Plan::updateOrCreate(
            ['id' => 3],
            [
                'name' => 'Enterprise',
                'description' => 'Para grandes empresas',
                'price' => 497,
                'period' => 'monthly',
                'agency_id' => null,
                'is_active' => true,
                'is_agency_plan' => false,
                'features' => json_encode([
                    'feature_1' => 'Tudo do Pro',
                    'feature_2' => 'Domínio personalizado',
                    'feature_3' => 'Suporte prioritário',
                ]),
                'monthly_leads' => 1000,
                'max_landing_pages' => 50,
                'max_pipelines' => 15,
                'total_leads' => 20000,
                'has_whatsapp_integration' => true,
                'has_email_integration' => true,
                'has_meta_integration' => true,
                'has_google_integration' => true,
                'has_custom_domain' => true,
            ]
        );

        // Planos de agência
        Plan::updateOrCreate(
            ['id' => 4],
            [
                'name' => 'Agência Starter',
                'description' => 'Para agências iniciantes',
                'price' => 297,
                'period' => 'monthly',
                'agency_id' => null,
                'is_active' => true,
                'is_agency_plan' => true,
                'features' => json_encode([
                    'feature_1' => 'Até 5 clientes',
                    'feature_2' => 'Marca personalizável',
                    'feature_3' => 'Domínio personalizado',
                ]),
                'max_clients' => 5,
                'has_whatsapp_integration' => true,
                'has_email_integration' => true,
                'has_meta_integration' => true,
                'has_google_integration' => true,
                'has_custom_domain' => true,
            ]
        );

        Plan::updateOrCreate(
            ['id' => 5],
            [
                'name' => 'Agência Pro',
                'description' => 'Para agências em crescimento',
                'price' => 597,
                'period' => 'monthly',
                'agency_id' => null,
                'is_active' => true,
                'is_agency_plan' => true,
                'features' => json_encode([
                    'feature_1' => 'Até 15 clientes',
                    'feature_2' => 'Todos os recursos da Starter',
                    'feature_3' => 'Suporte prioritário',
                ]),
                'max_clients' => 15,
                'has_whatsapp_integration' => true,
                'has_email_integration' => true,
                'has_meta_integration' => true,
                'has_google_integration' => true,
                'has_custom_domain' => true,
            ]
        );

        Plan::updateOrCreate(
            ['id' => 6],
            [
                'name' => 'Agência Enterprise',
                'description' => 'Para agências de grande porte',
                'price' => 997,
                'period' => 'monthly',
                'agency_id' => null,
                'is_active' => true,
                'is_agency_plan' => true,
                'features' => json_encode([
                    'feature_1' => 'Clientes ilimitados',
                    'feature_2' => 'Todos os recursos da Pro',
                    'feature_3' => 'Consultoria personalizada',
                ]),
                'max_clients' => null, // Ilimitado
                'has_whatsapp_integration' => true,
                'has_email_integration' => true,
                'has_meta_integration' => true,
                'has_google_integration' => true,
                'has_custom_domain' => true,
            ]
        );
    }
} 