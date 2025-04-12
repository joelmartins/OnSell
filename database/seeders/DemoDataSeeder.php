<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Agency;
use App\Models\Client;
use App\Models\Plan;
use Illuminate\Support\Facades\Hash;

class DemoDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Criar uma agência de exemplo
        $agency = Agency::create([
            'name' => 'Agência Digital BR',
            'email' => 'contato@agenciadigitalbr.com.br',
            'document' => '12.345.678/0001-90',
            'phone' => '(11) 98765-4321',
            'description' => 'Agência digital especializada em marketing e automação de vendas',
            'domain' => 'agenciadigitalbr',
            'is_active' => true,
            'primary_color' => '#3b82f6',  // Azul
            'secondary_color' => '#10b981', // Verde
            'accent_color' => '#f97316',    // Laranja
            'logo' => 'https://placehold.co/200x50/3b82f6/FFFFFF?text=Agência+Digital+BR',
        ]);
        
        // 2. Criar o usuário administrador da agência
        $agencyUser = User::create([
            'name' => 'Admin Agência',
            'email' => 'admin@agenciadigitalbr.com.br',
            'password' => Hash::make('senha123'),
            'email_verified_at' => now(),
            'agency_id' => $agency->id,
            'is_active' => true,
        ]);
        $agencyUser->assignRole('agency.owner');
        
        // 3. Criar planos específicos da agência para seus clientes
        $agencyPlans = [
            // Plano Básico da agência
            [
                'id' => 7,
                'name' => 'Básico Agência',
                'description' => 'Plano básico com recursos essenciais para pequenos negócios',
                'price' => 79.90,
                'period' => 'monthly',
                'agency_id' => $agency->id,
                'is_active' => true,
                'is_agency_plan' => false,
                'features' => json_encode([
                    'Acesso ao pipeline',
                    'Acesso ao inbox',
                    'Automação básica',
                    'Suporte da agência',
                ]),
                'monthly_leads' => 300,
                'max_landing_pages' => 1,
                'max_pipelines' => 1,
                'total_leads' => 1500,
                'has_whatsapp_integration' => true,
                'has_email_integration' => true,
                'has_meta_integration' => false,
                'has_google_integration' => false,
                'has_custom_domain' => false,
            ],
            // Plano Completo da agência
            [
                'id' => 8,
                'name' => 'Completo Agência',
                'description' => 'Plano completo com todas as ferramentas e suporte personalizado',
                'price' => 199.90,
                'period' => 'monthly',
                'agency_id' => $agency->id,
                'is_active' => true,
                'is_agency_plan' => false,
                'features' => json_encode([
                    'Acesso ao pipeline',
                    'Acesso ao inbox',
                    'Automação completa',
                    'Integração com redes sociais',
                    'Relatórios personalizados',
                    'Suporte prioritário da agência',
                ]),
                'monthly_leads' => 1500,
                'max_landing_pages' => 3,
                'max_pipelines' => 3,
                'total_leads' => 5000,
                'has_whatsapp_integration' => true,
                'has_email_integration' => true,
                'has_meta_integration' => true,
                'has_google_integration' => true,
                'has_custom_domain' => false,
            ],
        ];

        $createdAgencyPlans = [];
        foreach ($agencyPlans as $planData) {
            $id = $planData['id'];
            unset($planData['id']); // Remover o ID do array de dados para o updateOrCreate
            $createdAgencyPlans[] = Plan::updateOrCreate(['id' => $id], $planData);
        }
        
        // 4. Criar cliente 1 associado à agência (com o plano básico da agência)
        $client1 = Client::create([
            'name' => 'Restaurante Sabor & Arte',
            'email' => 'contato@saborarte.com.br',
            'document' => '23.456.789/0001-12',
            'phone' => '(11) 97654-3210',
            'description' => 'Restaurante de culinária contemporânea',
            'is_active' => true,
            'agency_id' => $agency->id,
            'plan_id' => $createdAgencyPlans[0]->id, // Plano Básico da agência
        ]);
        
        // 5. Criar o usuário administrador do cliente 1
        $client1User = User::create([
            'name' => 'Admin Restaurante',
            'email' => 'admin@saborarte.com.br',
            'password' => Hash::make('senha123'),
            'email_verified_at' => now(),
            'client_id' => $client1->id,
            'is_active' => true,
        ]);
        $client1User->assignRole('client.user');
        
        // 6. Criar cliente 2 associado à agência (com o plano completo da agência)
        $client2 = Client::create([
            'name' => 'Boutique Elegance',
            'email' => 'contato@boutiqueelegance.com.br',
            'document' => '34.567.890/0001-34',
            'phone' => '(11) 96543-2109',
            'description' => 'Loja de roupas e acessórios de luxo',
            'is_active' => true,
            'agency_id' => $agency->id,
            'plan_id' => $createdAgencyPlans[1]->id, // Plano Completo da agência
        ]);
        
        // 7. Criar o usuário administrador do cliente 2
        $client2User = User::create([
            'name' => 'Admin Boutique',
            'email' => 'admin@boutiqueelegance.com.br',
            'password' => Hash::make('senha123'),
            'email_verified_at' => now(),
            'client_id' => $client2->id,
            'is_active' => true,
        ]);
        $client2User->assignRole('client.user');
        
        // 8. Obter um plano do sistema para o cliente direto
        $systemPlan = Plan::where('agency_id', null)->where('name', 'Starter')->first();
        
        // 9. Criar cliente direto (sem agência, com plano do sistema)
        $directClient = Client::create([
            'name' => 'Academia Corpo Saudável',
            'email' => 'contato@corposaudavel.com.br',
            'document' => '45.678.901/0001-56',
            'phone' => '(11) 95432-1098',
            'description' => 'Academia de ginástica e bem-estar',
            'is_active' => true,
            'agency_id' => null, // Cliente direto, sem agência
            'plan_id' => $systemPlan->id, // Plano do sistema
        ]);
        
        // 10. Criar o usuário administrador do cliente direto
        $directClientUser = User::create([
            'name' => 'Admin Academia',
            'email' => 'admin@corposaudavel.com.br',
            'password' => Hash::make('senha123'),
            'email_verified_at' => now(),
            'client_id' => $directClient->id,
            'is_active' => true,
        ]);
        $directClientUser->assignRole('client.user');
        
        // 11. Imprimir uma mensagem de sucesso para confirmar a criação dos dados
        $this->command->info('Dados de demonstração criados com sucesso!');
        $this->command->info('1 agência com 2 planos personalizados, 2 clientes associados e 1 cliente direto foram criados.');
        $this->command->info('Todos os usuários têm a senha: senha123');
        
        // 12. Detalhar os dados criados (para fins de referência)
        $this->command->table(
            ['Tipo', 'Nome', 'Email', 'Plano'],
            [
                ['Agência', $agency->name, $agencyUser->email, 'N/A'],
                ['Cliente (Agência)', $client1->name, $client1User->email, $createdAgencyPlans[0]->name],
                ['Cliente (Agência)', $client2->name, $client2User->email, $createdAgencyPlans[1]->name],
                ['Cliente Direto', $directClient->name, $directClientUser->email, $systemPlan->name],
            ]
        );
        
        // 13. Detalhar os planos criados
        $this->command->info('Planos disponíveis:');
        $this->command->table(
            ['Tipo', 'Nome', 'Preço', 'Leads Mensais', 'Leads Totais', 'Landing Pages', 'Agência'],
            [
                ['Sistema', 'Starter', 'R$ 99,90', '500', '2000', '1', 'N/A'],
                ['Sistema', 'Pro', 'R$ 299,90', '2000', '10000', '3', 'N/A'],
                ['Sistema', 'Enterprise', 'R$ 799,90', '10000', '50000', '10', 'N/A'],
                ['Agência', $createdAgencyPlans[0]->name, 'R$ 79,90', '300', '1500', '1', $agency->name],
                ['Agência', $createdAgencyPlans[1]->name, 'R$ 199,90', '1500', '5000', '3', $agency->name],
            ]
        );
    }
}
