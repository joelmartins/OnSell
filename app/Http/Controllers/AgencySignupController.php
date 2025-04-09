<?php

namespace App\Http\Controllers;

use App\Models\Agency;
use App\Models\Client;
use App\Models\Plan;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class AgencySignupController extends Controller
{
    /**
     * Exibe o formulário de cadastro para o plano selecionado (por ID da agência)
     */
    public function showSignupForm(int $agencyId, int $planId = null): Response
    {
        // Buscar a agência pelo ID
        $agency = Agency::where('id', $agencyId)
            ->where('is_active', true)
            ->first();
            
        if (!$agency) {
            abort(404, 'Agência não encontrada');
        }
        
        // Decodificar dados da landing page para manter consistência visual
        $landingData = $agency->landing_page ? json_decode($agency->landing_page, true) : null;
        
        // Buscar o plano selecionado, se houver
        $selectedPlan = null;
        if ($planId) {
            $selectedPlan = Plan::where('id', $planId)
                ->where('agency_id', $agencyId)
                ->where('is_active', true)
                ->first();
            
            if (!$selectedPlan) {
                abort(404, 'Plano não encontrado');
            }
        }
        
        // Buscar todos os planos ativos da agência para exibir opções
        $plans = Plan::where('agency_id', $agencyId)
            ->where('is_active', true)
            ->orderBy('price')
            ->get()
            ->map(function($plan) use ($planId) {
                return [
                    'id' => $plan->id,
                    'name' => $plan->name,
                    'description' => $plan->description,
                    'price' => (float)$plan->price,
                    'period' => $plan->period,
                    'period_label' => $plan->period === 'monthly' ? 'mês' : 'ano',
                    'features' => $plan->features,
                    'is_featured' => $plan->is_featured,
                    'is_selected' => $plan->id == $planId,
                ];
            });
        
        // Log para depuração
        Log::info('Acessando formulário de cadastro via landing page da agência', [
            'agency_id' => $agency->id,
            'agency_name' => $agency->name,
            'plan_id' => $planId,
            'plan_name' => $selectedPlan ? $selectedPlan->name : null,
        ]);
        
        // Renderizar o formulário de cadastro
        return Inertia::render('Public/AgencySignup', [
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
            'selectedPlan' => $selectedPlan ? [
                'id' => $selectedPlan->id,
                'name' => $selectedPlan->name,
                'description' => $selectedPlan->description,
                'price' => (float)$selectedPlan->price,
                'period' => $selectedPlan->period,
                'period_label' => $selectedPlan->period === 'monthly' ? 'mês' : 'ano',
                'features' => $selectedPlan->features,
            ] : null,
            'plans' => $plans,
            'formAction' => route('agency.signup.process', ['agencyId' => $agency->id]),
        ]);
    }
    
    /**
     * Exibe o formulário de cadastro para o plano selecionado (por subdomínio)
     */
    public function showSignupFormBySubdomain(string $subdomain, int $planId = null): Response
    {
        // Buscar a agência pelo subdomínio
        $agency = Agency::where('subdomain', $subdomain)
            ->where('is_active', true)
            ->first();
            
        if (!$agency) {
            abort(404, 'Agência não encontrada');
        }
        
        // Decodificar dados da landing page para manter consistência visual
        $landingData = $agency->landing_page ? json_decode($agency->landing_page, true) : null;
        
        // Buscar o plano selecionado, se houver
        $selectedPlan = null;
        if ($planId) {
            $selectedPlan = Plan::where('id', $planId)
                ->where('agency_id', $agency->id)
                ->where('is_active', true)
                ->first();
            
            if (!$selectedPlan) {
                abort(404, 'Plano não encontrado');
            }
        }
        
        // Buscar todos os planos ativos da agência para exibir opções
        $plans = Plan::where('agency_id', $agency->id)
            ->where('is_active', true)
            ->orderBy('price')
            ->get()
            ->map(function($plan) use ($planId) {
                return [
                    'id' => $plan->id,
                    'name' => $plan->name,
                    'description' => $plan->description,
                    'price' => (float)$plan->price,
                    'period' => $plan->period,
                    'period_label' => $plan->period === 'monthly' ? 'mês' : 'ano',
                    'features' => $plan->features,
                    'is_featured' => $plan->is_featured,
                    'is_selected' => $plan->id == $planId,
                ];
            });
        
        // Log para depuração
        Log::info('Acessando formulário de cadastro via subdomínio da agência', [
            'agency_id' => $agency->id,
            'agency_name' => $agency->name,
            'subdomain' => $subdomain,
            'plan_id' => $planId,
            'plan_name' => $selectedPlan ? $selectedPlan->name : null,
        ]);
        
        // Renderizar o formulário de cadastro
        return Inertia::render('Public/AgencySignup', [
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
            'selectedPlan' => $selectedPlan ? [
                'id' => $selectedPlan->id,
                'name' => $selectedPlan->name,
                'description' => $selectedPlan->description,
                'price' => (float)$selectedPlan->price,
                'period' => $selectedPlan->period,
                'period_label' => $selectedPlan->period === 'monthly' ? 'mês' : 'ano',
                'features' => $selectedPlan->features,
            ] : null,
            'plans' => $plans,
            'formAction' => route('agency.subdomain.signup.process', ['subdomain' => $subdomain]),
        ]);
    }
    
    /**
     * Processa o cadastro do cliente (por ID da agência)
     */
    public function processSignup(Request $request, int $agencyId)
    {
        // Buscar a agência pelo ID
        $agency = Agency::where('id', $agencyId)
            ->where('is_active', true)
            ->first();
            
        if (!$agency) {
            abort(404, 'Agência não encontrada');
        }
        
        return $this->handleSignup($request, $agency);
    }
    
    /**
     * Processa o cadastro do cliente (por subdomínio)
     */
    public function processSignupBySubdomain(Request $request, string $subdomain)
    {
        // Buscar a agência pelo subdomínio
        $agency = Agency::where('subdomain', $subdomain)
            ->where('is_active', true)
            ->first();
            
        if (!$agency) {
            abort(404, 'Agência não encontrada');
        }
        
        return $this->handleSignup($request, $agency);
    }
    
    /**
     * Método comum para processar o cadastro
     */
    private function handleSignup(Request $request, Agency $agency)
    {
        // Validar os dados do cadastro
        $validator = Validator::make($request->all(), [
            'plan_id' => 'required|exists:plans,id',
            'company_name' => 'required|string|max:255',
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'phone' => 'required|string|max:20',
            'password' => 'required|string|min:8|confirmed',
        ], [
            'plan_id.required' => 'É necessário selecionar um plano.',
            'plan_id.exists' => 'O plano selecionado não existe.',
            'company_name.required' => 'O nome da empresa é obrigatório.',
            'name.required' => 'O seu nome é obrigatório.',
            'email.required' => 'O e-mail é obrigatório.',
            'email.email' => 'Por favor, forneça um e-mail válido.',
            'email.unique' => 'Este e-mail já está em uso.',
            'phone.required' => 'O telefone é obrigatório.',
            'password.required' => 'A senha é obrigatória.',
            'password.min' => 'A senha deve ter pelo menos 8 caracteres.',
            'password.confirmed' => 'As senhas não correspondem.',
        ]);
        
        if ($validator->fails()) {
            return redirect()->back()->withErrors($validator)->withInput();
        }
        
        $validated = $validator->validated();
        
        // Log dos dados recebidos para debug (sem a senha)
        $logData = $validated;
        unset($logData['password']);
        unset($logData['password_confirmation']);
        Log::info('Tentativa de cadastro - dados recebidos:', $logData);
        
        // Verificar se o plano pertence à agência
        $plan = Plan::where('id', $validated['plan_id'])
            ->where('agency_id', $agency->id)
            ->where('is_active', true)
            ->first();
            
        if (!$plan) {
            Log::warning('Plano inválido no cadastro:', [
                'plan_id' => $validated['plan_id'],
                'agency_id' => $agency->id,
                'email' => $validated['email']
            ]);
            return redirect()->back()->withErrors(['plan_id' => 'Plano inválido ou não pertence a esta agência.'])->withInput();
        }
        
        try {
            // Iniciar transação para garantir consistência dos dados
            DB::beginTransaction();
            
            // Criar o cliente
            Log::info('Criando cliente...', [
                'company_name' => $validated['company_name'],
                'email' => $validated['email'],
                'agency_id' => $agency->id,
                'plan_id' => $plan->id
            ]);
            
            $client = Client::create([
                'name' => $validated['company_name'],
                'email' => $validated['email'],
                'phone' => $validated['phone'],
                'agency_id' => $agency->id,
                'plan_id' => $plan->id,
                'is_active' => true,
                'domain' => Str::slug($validated['company_name']) . '.onsell.com.br',
            ]);
            
            Log::info('Cliente criado com sucesso', [
                'client_id' => $client->id
            ]);
            
            // Criar o usuário associado ao cliente
            Log::info('Criando usuário...', [
                'name' => $validated['name'],
                'email' => $validated['email'],
                'client_id' => $client->id
            ]);
            
            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'phone' => $validated['phone'],
                'password' => Hash::make($validated['password']),
                'client_id' => $client->id,
                'agency_id' => $agency->id,
                'is_active' => true,
            ]);
            
            Log::info('Usuário criado com sucesso', [
                'user_id' => $user->id
            ]);
            
            // Atribuir papel de usuário do cliente ao usuário
            Log::info('Atribuindo papel ao usuário...');
            
            // Verificar se o papel existe antes de atribuí-lo
            if (\Spatie\Permission\Models\Role::where('name', 'client.user')->exists()) {
                $user->assignRole('client.user');
                Log::info('Papel client.user atribuído com sucesso');
            } else {
                Log::warning('O papel client.user não existe no sistema');
            }
            
            // Finalizar transação
            DB::commit();
            
            // Log de auditoria
            Log::info('Novo cliente cadastrado via landing page da agência', [
                'agency_id' => $agency->id,
                'agency_name' => $agency->name,
                'client_id' => $client->id,
                'client_name' => $client->name,
                'user_id' => $user->id,
                'user_name' => $user->name,
                'plan_id' => $plan->id,
                'plan_name' => $plan->name,
            ]);
            
            // Redirecionar para a página de sucesso
            return Inertia::render('Public/AgencySignupSuccess', [
                'agency' => [
                    'id' => $agency->id,
                    'name' => $agency->name,
                    'logo' => $agency->logo,
                    'favicon' => $agency->favicon,
                    'primary_color' => $agency->primary_color,
                    'secondary_color' => $agency->secondary_color,
                    'accent_color' => $agency->accent_color,
                ],
                'client' => [
                    'name' => $client->name,
                    'domain' => $client->domain,
                ],
                'loginUrl' => route('login'),
            ]);
            
        } catch (\Exception $e) {
            // Reverter transação em caso de erro
            DB::rollBack();
            
            // Log detalhado do erro
            Log::error('Erro ao cadastrar cliente via landing page da agência', [
                'agency_id' => $agency->id,
                'agency_name' => $agency->name,
                'error_message' => $e->getMessage(),
                'error_code' => $e->getCode(),
                'error_file' => $e->getFile(),
                'error_line' => $e->getLine(),
                'trace' => $e->getTraceAsString(),
            ]);
            
            // Determine um erro mais específico com base na mensagem de exceção
            $errorMessage = 'Ocorreu um erro ao processar o cadastro. Por favor, tente novamente.';
            
            // Verificar se é um erro de chave duplicada (email)
            if (strpos($e->getMessage(), 'Duplicate entry') !== false && strpos($e->getMessage(), 'email') !== false) {
                $errorMessage = 'Este e-mail já está em uso. Por favor, utilize outro e-mail.';
            }
            
            // Verificar erros específicos no modelo Client ou User
            if (strpos($e->getMessage(), 'clients') !== false) {
                if (strpos($e->getMessage(), 'domain') !== false) {
                    $errorMessage = 'Este domínio já está em uso. Por favor, escolha outro nome de empresa.';
                }
            }
            
            // Erros de atribuição de papel (role)
            if (strpos($e->getMessage(), 'role') !== false) {
                $errorMessage = 'Erro ao configurar permissões do usuário. Por favor, contate o suporte.';
            }
            
            // Retornar erro específico
            return redirect()->back()->withErrors(['general' => $errorMessage])->withInput();
        }
    }
} 