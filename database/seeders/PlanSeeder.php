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
        // Plano Free
        Plan::updateOrCreate(
            ['id' => 1],
            [
                'name' => 'Free',
                'description' => 'Comece gratuitamente',
                'price' => 0,
                'period' => 'monthly',
                'agency_id' => null,
                'is_active' => true,
                'is_agency_plan' => false,
                'is_featured' => true,
                'features' => json_encode([
                    'feature_1' => 'Acesso básico',
                    'feature_2' => '1 landing page',
                    'feature_3' => '1 pipeline',
                    'feature_4' => 'Limite de 20 leads/mês',
                    'feature_5' => 'Integração WhatsApp',
                    'feature_6' => 'Integração Google Ads',
                    'feature_7' => 'Integração Meta Ads',
                ]),
                'monthly_leads' => 20,
                'max_landing_pages' => 1,
                'max_pipelines' => 1,
                'total_leads' => 1000,
                'has_whatsapp_integration' => true,
                'has_email_integration' => false,
                'has_meta_integration' => true,
                'has_google_integration' => true,
                'has_custom_domain' => false,
                'trial_days' => 0,
            ]
        );

        // Plano Starter
        Plan::updateOrCreate(
            ['id' => 2],
            [
                'name' => 'Starter',
                'description' => 'Ideal para pequenos negócios',
                'price' => 97,
                'period' => 'monthly',
                'agency_id' => null,
                'is_active' => true,
                'is_agency_plan' => false,
                'is_featured' => true,
                'features' => json_encode([
                    'feature_1' => 'Acesso completo',
                    'feature_2' => '4 landing pages',
                    'feature_3' => '1 pipeline',
                    'feature_4' => 'Qualificação de leads',
                    'feature_5' => '50 leads/mês',
                    'feature_6' => 'Integração WhatsApp',
                    'feature_7' => 'Integração Email',
                    'feature_8' => 'Integração Google Ads',
                    'feature_9' => 'Integração Meta Ads',
                    'feature_10' => 'Domínio personalizado',
                ]),
                'monthly_leads' => 50,
                'max_landing_pages' => 4,
                'max_pipelines' => 1,
                'total_leads' => 100000,
                'has_whatsapp_integration' => true,
                'has_email_integration' => true,
                'has_meta_integration' => true,
                'has_google_integration' => true,
                'has_custom_domain' => true,
                'trial_days' => 14,
            ]
        );

        // Plano Pro
        Plan::updateOrCreate(
            ['id' => 3],
            [
                'name' => 'Pro',
                'description' => 'Para empresas em crescimento',
                'price' => 197,
                'period' => 'monthly',
                'agency_id' => null,
                'is_active' => true,
                'is_agency_plan' => false,
                'is_featured' => true,
                'features' => json_encode([
                    'feature_1' => 'Tudo do Starter',
                    'feature_2' => '10 landing pages',
                    'feature_3' => '5 pipelines',
                    'feature_4' => 'Automações avançadas',
                    'feature_5' => '1000 leads/mês',
                    'feature_6' => 'Integração WhatsApp',
                    'feature_7' => 'Integração Email',
                    'feature_8' => 'Integração Google Ads',
                    'feature_9' => 'Integração Meta Ads',
                    'feature_10' => 'Domínio personalizado',
                ]),
                'monthly_leads' => 1000,
                'max_landing_pages' => 10,
                'max_pipelines' => 5,
                'total_leads' => 1000000,
                'has_whatsapp_integration' => true,
                'has_email_integration' => true,
                'has_meta_integration' => true,
                'has_google_integration' => true,
                'has_custom_domain' => true,
                'trial_days' => 14,
            ]
        );

        // Plano Unlimited
        Plan::updateOrCreate(
            ['id' => 4],
            [
                'name' => 'Unlimited',
                'description' => 'Para empresas que precisam de mais',
                'price' => 297,
                'period' => 'monthly',
                'agency_id' => null,
                'is_active' => true,
                'is_agency_plan' => false,
                'is_featured' => false,
                'features' => json_encode([
                    'feature_1' => 'Tudo do Pro',
                    'feature_2' => 'Landing pages ilimitadas',
                    'feature_3' => 'Pipelines ilimitados',
                    'feature_4' => 'Leads ilimitados',
                    'feature_5' => 'Suporte prioritário',
                    'feature_6' => 'Integração WhatsApp',
                    'feature_7' => 'Integração Email',
                    'feature_8' => 'Integração Google Ads',
                    'feature_9' => 'Integração Meta Ads',
                    'feature_10' => 'Domínio personalizado',
                    'feature_11' => 'API para integrações',
                ]),
                'monthly_leads' => null, // Ilimitado
                'max_landing_pages' => null, // Ilimitado
                'max_pipelines' => null, // Ilimitado
                'total_leads' => null, // Ilimitado
                'has_whatsapp_integration' => true,
                'has_email_integration' => true,
                'has_meta_integration' => true,
                'has_google_integration' => true,
                'has_custom_domain' => true,
                'trial_days' => 14,
            ]
        );

        // Planos de agência
        Plan::updateOrCreate(
            ['id' => 5],
            [
                'name' => 'Agência Starter',
                'description' => 'Para agências iniciantes',
                'price' => 297,
                'period' => 'monthly',
                'agency_id' => null,
                'is_active' => true,
                'is_agency_plan' => true,
                'is_featured' => true,
                'features' => json_encode([
                    'feature_1' => 'Até 5 clientes',
                    'feature_2' => 'White label básico',
                    'feature_3' => 'Planos personalizáveis',
                    'feature_4' => 'Suporte prioritário',
                    'feature_5' => 'Integração WhatsApp',
                    'feature_6' => 'Integração Email',
                    'feature_7' => 'Integração Google Ads',
                    'feature_8' => 'Integração Meta Ads',
                    'feature_9' => 'Domínio personalizado',
                ]),
                'max_clients' => 5,
                'has_whatsapp_integration' => true,
                'has_email_integration' => true,
                'has_meta_integration' => true,
                'has_google_integration' => true,
                'has_custom_domain' => true,
                'trial_days' => 0,
            ]
        );

        Plan::updateOrCreate(
            ['id' => 6],
            [
                'name' => 'Agência Unlimited',
                'description' => 'Para agências em crescimento',
                'price' => 497,
                'period' => 'monthly',
                'agency_id' => null,
                'is_active' => true,
                'is_agency_plan' => true,
                'is_featured' => true,
                'features' => json_encode([
                    'feature_1' => 'Clientes ilimitados',
                    'feature_2' => 'White label completo',
                    'feature_3' => 'API de integração',
                    'feature_4' => 'Gerente de contas dedicado',
                    'feature_5' => 'Integração WhatsApp',
                    'feature_6' => 'Integração Email',
                    'feature_7' => 'Integração Google Ads',
                    'feature_8' => 'Integração Meta Ads',
                    'feature_9' => 'Domínio personalizado',
                ]),
                'max_clients' => null, // Ilimitado
                'has_whatsapp_integration' => true,
                'has_email_integration' => true,
                'has_meta_integration' => true,
                'has_google_integration' => true,
                'has_custom_domain' => true,
                'trial_days' => 0,
            ]
        );
    }
} 