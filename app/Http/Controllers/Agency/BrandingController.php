<?php

namespace App\Http\Controllers\Agency;

use App\Http\Controllers\Controller;
use App\Models\Agency;
use App\Services\DomainService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use OpenAI\Laravel\Facades\OpenAI;

class BrandingController extends Controller
{
    protected $domainService;

    public function __construct(DomainService $domainService)
    {
        $this->domainService = $domainService;
    }

    /**
     * Exibe a página de configurações de marca
     */
    public function index()
    {
        // Verificar se está impersonando uma agência
        $agencyId = null;
        $impersonating = session()->get('impersonate.target');
        
        if ($impersonating && $impersonating['type'] === 'agency') {
            // Se está impersonando, usar o ID da agência da sessão
            $agencyId = $impersonating['id'];
        } else {
            // Caso contrário, obter o ID da agência do usuário autenticado
            $agencyId = Auth::user()->agency_id;
        }
        
        // Buscar a agência com o ID correto
        $agency = Agency::findOrFail($agencyId);
        
        // Log para depuração
        Log::channel('audit')->info('Acessando página de branding da agência', [
            'user_id' => Auth::id(),
            'agency_id' => $agencyId,
            'agency_name' => $agency->name,
            'is_impersonating' => $impersonating ? true : false,
            'impersonation_data' => $impersonating
        ]);
        
        // Obter URL completa do subdomínio para exibição
        $subdomain_url = '';
        if (!empty($agency->subdomain)) {
            $subdomain_url = 'https://' . $agency->subdomain . '.' . config('app.domain', 'onsell.com.br');
        }
        
        // Passar agency para a view com dados adicionais para as novas abas
        return Inertia::render('Agency/Branding/Index', [
            'agency' => [
                'id' => $agency->id,
                'name' => $agency->name,
                'logo' => $agency->logo,
                'favicon' => $agency->favicon,
                'primary_color' => $agency->primary_color,
                'secondary_color' => $agency->secondary_color,
                'accent_color' => $agency->accent_color,
                'custom_domain' => $agency->custom_domain,
                'domain_status' => $agency->domain_status,
                'subdomain' => $agency->subdomain,
                'subdomain_url' => $subdomain_url,
                'landing_page' => $agency->landing_page ? json_decode($agency->landing_page, true) : null,
            ]
        ]);
    }

    /**
     * Atualiza as configurações de marca da agência
     */
    public function update(Request $request)
    {
        // Verificar se está impersonando uma agência
        $agencyId = null;
        $impersonating = session()->get('impersonate.target');
        
        if ($impersonating && $impersonating['type'] === 'agency') {
            // Se está impersonando, usar o ID da agência da sessão
            $agencyId = $impersonating['id'];
        } else {
            // Caso contrário, obter o ID da agência do usuário autenticado
            $agencyId = Auth::user()->agency_id;
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|min:3',
            'logo' => 'nullable|url',
            'favicon' => 'nullable|url',
            'primary_color' => 'required|regex:/^#[0-9A-Fa-f]{6}$/',
            'secondary_color' => 'required|regex:/^#[0-9A-Fa-f]{6}$/',
            'accent_color' => 'required|regex:/^#[0-9A-Fa-f]{6}$/',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $validated = $validator->validated();
        
        // Obtém a agência do ID determinado
        $agency = Agency::findOrFail($agencyId);
        
        // Atualiza as configurações de marca
        $agency->update([
            'name' => $validated['name'],
            'logo' => $validated['logo'],
            'favicon' => $validated['favicon'],
            'primary_color' => $validated['primary_color'],
            'secondary_color' => $validated['secondary_color'],
            'accent_color' => $validated['accent_color'],
        ]);
        
        return redirect()->back()->with('success', 'Configurações de marca atualizadas com sucesso!');
    }

    /**
     * Atualiza as configurações de domínio da agência
     */
    public function updateDomain(Request $request)
    {
        // Verificar se está impersonando uma agência
        $agencyId = null;
        $impersonating = session()->get('impersonate.target');
        
        if ($impersonating && $impersonating['type'] === 'agency') {
            // Se está impersonando, usar o ID da agência da sessão
            $agencyId = $impersonating['id'];
        } else {
            // Caso contrário, obter o ID da agência do usuário autenticado
            $agencyId = Auth::user()->agency_id;
        }

        // Buscar a agência atual para validação
        $agency = Agency::findOrFail($agencyId);

        $validator = Validator::make($request->all(), [
            'subdomain' => [
                'required',
                'string',
                'regex:/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/',
                Rule::unique('agencies', 'subdomain')->ignore($agencyId)
            ],
            'custom_domain' => [
                'nullable',
                'string',
                'regex:/^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/',
                Rule::unique('agencies', 'custom_domain')->ignore($agencyId)
            ],
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $validated = $validator->validated();
        
        // Verificar status do domínio
        $domainStatus = $agency->domain_status;
        
        // Se o domínio personalizado foi alterado, definir status como pendente
        if ($validated['custom_domain'] !== $agency->custom_domain) {
            $domainStatus = 'pending';
        }
        
        // Atualiza as configurações de domínio
        $agency->update([
            'subdomain' => $validated['subdomain'],
            'custom_domain' => $validated['custom_domain'],
            'domain_status' => $domainStatus,
        ]);
        
        // Se há um domínio personalizado definido, verificar o status
        if (!empty($validated['custom_domain'])) {
            // Verificar o DNS do domínio e atualizar o status
            $domainStatus = $this->domainService->updateDomainStatus($agency);
            
            if ($domainStatus === 'active') {
                $successMessage = 'Configurações de domínio atualizadas com sucesso! Seu domínio foi verificado e está ativo.';
            } else {
                $successMessage = 'Configurações de domínio atualizadas. Seu domínio está pendente de verificação DNS. Por favor, configure os registros DNS conforme instruções.';
            }
        } else {
            $successMessage = 'Configurações de domínio atualizadas com sucesso!';
        }
        
        // Log para auditoria
        Log::channel('audit')->info('Domínio da agência atualizado', [
            'user_id' => Auth::id(),
            'agency_id' => $agencyId,
            'subdomain' => $validated['subdomain'],
            'custom_domain' => $validated['custom_domain'],
            'domain_status' => $agency->domain_status,
        ]);
        
        return redirect()->back()->with('success', $successMessage);
    }

    /**
     * Atualiza as configurações da landing page da agência
     */
    public function updateLandingPage(Request $request)
    {
        // Verificar se está impersonando uma agência
        $agencyId = null;
        $impersonating = session()->get('impersonate.target');
        
        if ($impersonating && $impersonating['type'] === 'agency') {
            // Se está impersonando, usar o ID da agência da sessão
            $agencyId = $impersonating['id'];
        } else {
            // Caso contrário, obter o ID da agência do usuário autenticado
            $agencyId = Auth::user()->agency_id;
        }

        $validator = Validator::make($request->all(), [
            'headline' => 'required|string|min:5',
            'subheadline' => 'required|string|min:5',
            'hero_image' => 'nullable|url',
            'cta_text' => 'required|string|min:2',
            'features_title' => 'required|string|min:3',
            'features' => 'required|array|min:1',
            'features.*.title' => 'required|string|min:3',
            'features.*.description' => 'required|string|min:10',
            'display_plans' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $validated = $validator->validated();
        
        // Obtém a agência do ID determinado
        $agency = Agency::findOrFail($agencyId);
        
        // Atualiza as configurações da landing page, armazenando como JSON
        $agency->update([
            'landing_page' => json_encode($validated),
        ]);
        
        // Log para auditoria
        Log::channel('audit')->info('Landing page da agência atualizada', [
            'user_id' => Auth::id(),
            'agency_id' => $agencyId,
            'headline' => $validated['headline'],
        ]);
        
        return redirect()->back()->with('success', 'Landing page personalizada com sucesso!');
    }

    /**
     * Atualiza as configurações da landing page da agência - Versão JSON para AJAX
     */
    public function updateLandingPageJson(Request $request)
    {
        \Log::info('Iniciando updateLandingPageJson com dados:', $request->all());
        \Log::info('Request Headers:', [
            'accept' => $request->header('accept'),
            'content-type' => $request->header('content-type'),
            'user-agent' => $request->header('user-agent'),
            'referer' => $request->header('referer'),
            'host' => $request->header('host'),
        ]);
        
        // Verificar se está impersonando uma agência
        $agencyId = null;
        $impersonating = session()->get('impersonate.target');
        
        \Log::info('Verificando impersonação:', [
            'has_session' => session()->has('impersonate.target'),
            'session_data' => $impersonating,
            'auth_check' => Auth::check(),
            'auth_id' => Auth::id(),
            'auth_user' => Auth::user() ? Auth::user()->toArray() : null,
            'session_id' => session()->getId(),
        ]);
        
        if ($impersonating && $impersonating['type'] === 'agency') {
            // Se está impersonando, usar o ID da agência da sessão
            $agencyId = $impersonating['id'];
            \Log::info('Usando ID da agência da sessão de impersonação:', ['agency_id' => $agencyId]);
        } else if (Auth::check() && Auth::user() && Auth::user()->agency_id) {
            // Caso contrário, obter o ID da agência do usuário autenticado
            $user = Auth::user();
            $agencyId = $user->agency_id;
            \Log::info('Usando ID da agência do usuário autenticado:', ['agency_id' => $agencyId, 'user_id' => $user->id]);
        } else {
            // Nem impersonação nem usuário autenticado com agência válida
            \Log::error('Falha na autenticação/impersonação para updateLandingPageJson', [
                'auth_check' => Auth::check(),
                'session_data' => $impersonating,
                'request_path' => $request->path(),
            ]);
            
            return response()->json([
                'error' => 'Não foi possível identificar a agência. Verifique sua autenticação.',
                'auth_status' => Auth::check() ? 'autenticado' : 'não autenticado',
                'timestamp' => now()->toIso8601String(),
            ], 401)->header('X-No-Redirect', 'true');
        }

        $validator = Validator::make($request->all(), [
            'headline' => 'required|string|min:5',
            'subheadline' => 'required|string|min:5',
            'hero_image' => 'nullable|url',
            'cta_text' => 'required|string|min:2',
            'features_title' => 'required|string|min:3',
            'features' => 'required|array|min:1',
            'features.*.title' => 'required|string|min:3',
            'features.*.description' => 'required|string|min:10',
            'display_plans' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422)
                ->header('X-No-Redirect', 'true');
        }

        $validated = $validator->validated();
        
        try {
            // Obtém a agência do ID determinado
            $agency = Agency::findOrFail($agencyId);
            
            // Atualiza as configurações da landing page, armazenando como JSON
            $agency->update([
                'landing_page' => json_encode($validated),
            ]);
            
            // Log para auditoria
            Log::channel('audit')->info('Landing page da agência atualizada via JSON', [
                'user_id' => Auth::id(),
                'agency_id' => $agencyId,
                'headline' => $validated['headline'],
            ]);
            
            return response()->json([
                'success' => true,
                'message' => 'Landing page personalizada com sucesso!',
                'timestamp' => now()->toIso8601String(),
            ], 200)->header('X-No-Redirect', 'true');
        } catch (\Exception $e) {
            \Log::error('Erro ao atualizar landing page: ' . $e->getMessage(), [
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'error' => 'Erro ao salvar landing page: ' . $e->getMessage(),
                'timestamp' => now()->toIso8601String(),
            ], 500)->header('X-No-Redirect', 'true');
        }
    }

    /**
     * Verifica o status do domínio personalizado
     */
    public function checkDomainStatus(Request $request)
    {
        // Verificar se está impersonando uma agência
        $agencyId = null;
        $impersonating = session()->get('impersonate.target');
        
        if ($impersonating && $impersonating['type'] === 'agency') {
            // Se está impersonando, usar o ID da agência da sessão
            $agencyId = $impersonating['id'];
        } else {
            // Caso contrário, obter o ID da agência do usuário autenticado
            $agencyId = Auth::user()->agency_id;
        }

        // Buscar a agência com o ID correto
        $agency = Agency::findOrFail($agencyId);
        
        if (empty($agency->custom_domain)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Nenhum domínio personalizado configurado'
            ], 400);
        }

        // Verificar o status do domínio
        $status = $this->domainService->updateDomainStatus($agency);
        
        $message = '';
        $statusCode = 200;
        
        if ($status === 'active') {
            $message = 'Domínio verificado com sucesso!';
        } else {
            $message = 'O domínio ainda não está apontando para o servidor correto. Verifique as configurações de DNS.';
            $statusCode = 202; // Accepted but not complete
        }
        
        return response()->json([
            'status' => $status,
            'message' => $message,
            'domain' => $agency->custom_domain,
            'domain_status' => $agency->domain_status
        ], $statusCode);
    }

    /**
     * Gera sugestões de landing page com IA (OpenAI)
     */
    public function aiFillLandingPage(Request $request)
    {
        \Log::info('Iniciando aiFillLandingPage com dados:', $request->all());
        
        // Verificar se está impersonando uma agência
        $agencyId = null;
        $impersonating = session()->get('impersonate.target');
        
        \Log::info('Verificando impersonação:', [
            'has_session' => session()->has('impersonate.target'),
            'session_data' => $impersonating,
            'auth_check' => Auth::check(),
            'auth_id' => Auth::id(),
            'auth_user' => Auth::user() ? Auth::user()->toArray() : null,
            'session_id' => session()->getId(),
        ]);
        
        if ($impersonating && $impersonating['type'] === 'agency') {
            // Se está impersonando, usar o ID da agência da sessão
            $agencyId = $impersonating['id'];
            \Log::info('Usando ID da agência da sessão de impersonação:', ['agency_id' => $agencyId]);
        } else if (Auth::check() && Auth::user() && Auth::user()->agency_id) {
            // Caso contrário, obter o ID da agência do usuário autenticado
            $user = Auth::user();
            $agencyId = $user->agency_id;
            \Log::info('Usando ID da agência do usuário autenticado:', ['agency_id' => $agencyId, 'user_id' => $user->id]);
        } else {
            // Nem impersonação nem usuário autenticado com agência válida
            \Log::error('Falha na autenticação/impersonação para aiFillLandingPage', [
                'auth_check' => Auth::check(),
                'session_data' => $impersonating,
                'request_path' => $request->path(),
            ]);
            
            // Redirecionar para a página de branding com erro
            return redirect()
                ->route('agency.branding.landing')
                ->with('error', 'Não foi possível identificar a agência. Verifique sua autenticação.');
        }

        try {
            $agency = Agency::findOrFail($agencyId);
            \Log::info('Agência encontrada:', ['agency_id' => $agency->id, 'agency_name' => $agency->name]);
        } catch (\Exception $e) {
            \Log::error('Agência não encontrada:', ['agency_id' => $agencyId, 'error' => $e->getMessage()]);
            return redirect()
                ->route('agency.branding.landing')
                ->with('error', 'Agência não encontrada. Verifique suas credenciais.');
        }
        
        $validated = $request->validate([
            'segmento' => 'required|string',
            'publico' => 'required|string',
            'diferencial' => 'required|string',
            'objetivo' => 'required|string',
        ]);

        // Monta o prompt para a OpenAI
        $prompt = "Gere sugestões para uma landing page de agência com as seguintes informações:\n" .
            "Segmento: {$validated['segmento']}\n" .
            "Público-alvo: {$validated['publico']}\n" .
            "Diferencial: {$validated['diferencial']}\n" .
            "Objetivo: {$validated['objetivo']}\n" .
            "Nome da agência: {$agency->name}\n" .
            "Sugira: headline, subheadline, texto do botão (CTA), título da seção de recursos, 3 recursos (título e descrição). Responda em JSON no formato: {headline, subheadline, cta_text, features_title, features: [{title, description}]}";

        \Log::info('Prompt montado para OpenAI', ['prompt' => $prompt]);
        
        try {
            \Log::info('Verificando configuração da OpenAI', [
                'api_key_exists' => !empty(config('openai.api_key')),
                'api_key_length' => strlen(config('openai.api_key')),
                'organization' => config('openai.organization'),
            ]);
            
            // Define um timeout para a requisição
            ini_set('default_socket_timeout', 10);
            
            $result = OpenAI::chat()->create([
                'model' => 'gpt-3.5-turbo',
                'messages' => [
                    ['role' => 'system', 'content' => 'Você é um especialista em copywriting para landing pages.'],
                    ['role' => 'user', 'content' => $prompt],
                ],
                'temperature' => 0.7,
                'max_tokens' => 600,
            ]);
            
            \Log::info('Resposta recebida da OpenAI', ['result' => json_encode($result)]);
            
            $content = $result->choices[0]->message->content;
            \Log::info('Conteúdo da resposta', ['content' => $content]);
            
            // Tenta extrair JSON da resposta (caso venha com texto adicional)
            $jsonContent = $content;
            if (preg_match('/```json\s*(.*?)\s*```/s', $content, $matches)) {
                $jsonContent = $matches[1];
                \Log::info('Extraído JSON de código formatado', ['extracted' => $jsonContent]);
            } elseif (preg_match('/\{.*\}/s', $content, $matches)) {
                $jsonContent = $matches[0];
                \Log::info('Extraído JSON por regex', ['extracted' => $jsonContent]);
            }
            
            // Tenta decodificar o JSON
            $json = json_decode($jsonContent, true);
            if (!$json) {
                // Último recurso: tentar criar um JSON válido a partir do texto
                \Log::warning('Resposta não é um JSON válido, tentando fallback', ['content' => $content]);
                
                // Estrutura básica para fallback
                $fallbackJson = [
                    'headline' => 'Aumente suas vendas com nossa solução completa',
                    'subheadline' => 'Criado com base no segmento: ' . $validated['segmento'],
                    'cta_text' => 'Começar agora',
                    'features_title' => 'Nossos diferenciais',
                    'features' => [
                        [
                            'title' => 'Soluções para ' . $validated['publico'],
                            'description' => 'Atendemos perfeitamente seu público-alvo com estratégias personalizadas.'
                        ],
                        [
                            'title' => 'Diferencial exclusivo',
                            'description' => $validated['diferencial']
                        ],
                        [
                            'title' => 'Resultados comprovados',
                            'description' => 'Focados em atingir: ' . $validated['objetivo']
                        ]
                    ]
                ];
                
                \Log::info('Gerado JSON de fallback', ['fallback' => $fallbackJson]);
                
                // Armazenar temporariamente na sessão para recuperar no frontend
                session()->flash('landing_suggestion', $fallbackJson);
                return redirect()->route('agency.branding.landing')->with('success', 'Sugestão gerada com IA (usando fallback)');
            }
            
            \Log::info('Sugestão gerada com sucesso', ['json' => $json]);
            
            // Armazenar temporariamente na sessão para recuperar no frontend
            session()->flash('landing_suggestion', $json);
            return redirect()->route('agency.branding.landing')->with('success', 'Sugestão gerada com IA');
        } catch (\Exception $e) {
            \Log::error('Erro ao chamar OpenAI: ' . $e->getMessage(), [
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);
            return redirect()->route('agency.branding.landing')->with('error', 'Erro ao gerar sugestão com IA: ' . $e->getMessage());
        }
    }

    /**
     * Gera sugestões de landing page com IA (OpenAI) - Retorna JSON para chamadas AJAX
     */
    public function aiFillLandingPageJson(Request $request)
    {
        \Log::info('Iniciando aiFillLandingPageJSON com dados:', $request->all());
        \Log::info('Request Headers:', [
            'accept' => $request->header('accept'),
            'content-type' => $request->header('content-type'),
            'user-agent' => $request->header('user-agent'),
            'referer' => $request->header('referer'),
            'host' => $request->header('host'),
        ]);
        
        // Verificar se está impersonando uma agência
        $agencyId = null;
        $impersonating = session()->get('impersonate.target');
        
        \Log::info('Verificando impersonação:', [
            'has_session' => session()->has('impersonate.target'),
            'session_data' => $impersonating,
            'auth_check' => Auth::check(),
            'auth_id' => Auth::id(),
            'auth_user' => Auth::user() ? Auth::user()->toArray() : null,
            'session_id' => session()->getId(),
            'cookies' => $request->cookies->all(),
        ]);
        
        if ($impersonating && $impersonating['type'] === 'agency') {
            // Se está impersonando, usar o ID da agência da sessão
            $agencyId = $impersonating['id'];
            \Log::info('Usando ID da agência da sessão de impersonação:', ['agency_id' => $agencyId]);
        } else if (Auth::check() && Auth::user() && Auth::user()->agency_id) {
            // Caso contrário, obter o ID da agência do usuário autenticado
            $user = Auth::user();
            $agencyId = $user->agency_id;
            \Log::info('Usando ID da agência do usuário autenticado:', ['agency_id' => $agencyId, 'user_id' => $user->id]);
        } else {
            // Nem impersonação nem usuário autenticado com agência válida
            \Log::error('Falha na autenticação/impersonação para aiFillLandingPage', [
                'auth_check' => Auth::check(),
                'session_data' => $impersonating,
                'request_path' => $request->path(),
            ]);
            // Retornar erro, mas garantir que não use o sistema padrão de resposta que pode causar redirecionamentos
            $response = [
                'error' => 'Não foi possível identificar a agência. Verifique sua autenticação.',
                'auth_status' => Auth::check() ? 'autenticado' : 'não autenticado',
                'timestamp' => now()->toIso8601String(),
            ];
            
            return response()->json($response, 401)
                ->header('X-No-Redirect', 'true')
                ->header('Cache-Control', 'no-store, no-cache, must-revalidate');
        }

        try {
            $agency = Agency::findOrFail($agencyId);
            \Log::info('Agência encontrada:', ['agency_id' => $agency->id, 'agency_name' => $agency->name]);
        } catch (\Exception $e) {
            \Log::error('Agência não encontrada:', ['agency_id' => $agencyId, 'error' => $e->getMessage()]);
            return response()->json([
                'error' => 'Agência não encontrada com o ID: ' . $agencyId,
                'timestamp' => now()->toIso8601String(),
            ], 404)->header('X-No-Redirect', 'true');
        }
        
        $validated = $request->validate([
            'segmento' => 'required|string',
            'publico' => 'required|string',
            'diferencial' => 'required|string',
            'objetivo' => 'required|string',
        ]);

        // Monta o prompt para a OpenAI
        $prompt = "Gere sugestões para uma landing page de agência com as seguintes informações:\n" .
            "Segmento: {$validated['segmento']}\n" .
            "Público-alvo: {$validated['publico']}\n" .
            "Diferencial: {$validated['diferencial']}\n" .
            "Objetivo: {$validated['objetivo']}\n" .
            "Nome da agência: {$agency->name}\n" .
            "Sugira: headline, subheadline, texto do botão (CTA), título da seção de recursos, 3 recursos (título e descrição). Responda em JSON no formato: {headline, subheadline, cta_text, features_title, features: [{title, description}]}";

        \Log::info('Prompt montado para OpenAI', ['prompt' => $prompt]);
        
        try {
            \Log::info('Verificando configuração da OpenAI', [
                'api_key_exists' => !empty(config('openai.api_key')),
                'api_key_length' => strlen(config('openai.api_key')),
                'organization' => config('openai.organization'),
            ]);
            
            // Define um timeout para a requisição
            ini_set('default_socket_timeout', 10);
            
            $result = OpenAI::chat()->create([
                'model' => 'gpt-3.5-turbo',
                'messages' => [
                    ['role' => 'system', 'content' => 'Você é um especialista em copywriting para landing pages.'],
                    ['role' => 'user', 'content' => $prompt],
                ],
                'temperature' => 0.7,
                'max_tokens' => 600,
            ]);
            
            \Log::info('Resposta recebida da OpenAI', ['result' => json_encode($result)]);
            
            $content = $result->choices[0]->message->content;
            \Log::info('Conteúdo da resposta', ['content' => $content]);
            
            // Tenta extrair JSON da resposta (caso venha com texto adicional)
            $jsonContent = $content;
            if (preg_match('/```json\s*(.*?)\s*```/s', $content, $matches)) {
                $jsonContent = $matches[1];
                \Log::info('Extraído JSON de código formatado', ['extracted' => $jsonContent]);
            } elseif (preg_match('/\{.*\}/s', $content, $matches)) {
                $jsonContent = $matches[0];
                \Log::info('Extraído JSON por regex', ['extracted' => $jsonContent]);
            }
            
            // Tenta decodificar o JSON
            $json = json_decode($jsonContent, true);
            if (!$json) {
                // Último recurso: tentar criar um JSON válido a partir do texto
                \Log::warning('Resposta não é um JSON válido, tentando fallback', ['content' => $content]);
                
                // Estrutura básica para fallback
                $fallbackJson = [
                    'headline' => 'Aumente suas vendas com nossa solução completa',
                    'subheadline' => 'Criado com base no segmento: ' . $validated['segmento'],
                    'cta_text' => 'Começar agora',
                    'features_title' => 'Nossos diferenciais',
                    'features' => [
                        [
                            'title' => 'Soluções para ' . $validated['publico'],
                            'description' => 'Atendemos perfeitamente seu público-alvo com estratégias personalizadas.'
                        ],
                        [
                            'title' => 'Diferencial exclusivo',
                            'description' => $validated['diferencial']
                        ],
                        [
                            'title' => 'Resultados comprovados',
                            'description' => 'Focados em atingir: ' . $validated['objetivo']
                        ]
                    ]
                ];
                
                \Log::info('Gerado JSON de fallback', ['fallback' => $fallbackJson]);
                return response()->json(['suggestion' => $fallbackJson, 'used_fallback' => true], 200)
                    ->header('X-No-Redirect', 'true');
            }
            
            \Log::info('Sugestão gerada com sucesso', ['json' => $json]);
            return response()->json(['suggestion' => $json], 200)
                ->header('X-No-Redirect', 'true');
        } catch (\Exception $e) {
            \Log::error('Erro ao chamar OpenAI: ' . $e->getMessage(), [
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json(['error' => 'Erro ao gerar sugestão com IA: ' . $e->getMessage()], 500)
                ->header('X-No-Redirect', 'true');
        }
    }

    /**
     * Subpágina: Identidade Visual
     */
    public function visual()
    {
        // Verificar se está impersonando uma agência
        $agencyId = null;
        $impersonating = session()->get('impersonate.target');
        
        if ($impersonating && $impersonating['type'] === 'agency') {
            // Se está impersonando, usar o ID da agência da sessão
            $agencyId = $impersonating['id'];
        } else {
            // Caso contrário, obter o ID da agência do usuário autenticado
            $agencyId = Auth::user()->agency_id;
        }
        
        // Buscar a agência com o ID correto
        $agency = Agency::findOrFail($agencyId);
        
        // Obter URL completa do subdomínio para exibição
        $subdomain_url = '';
        if (!empty($agency->subdomain)) {
            $subdomain_url = 'https://' . $agency->subdomain . '.' . config('app.domain', 'onsell.com.br');
        }
        
        return Inertia::render('Agency/Branding/Visual', [
            'agency' => [
                'id' => $agency->id,
                'name' => $agency->name,
                'logo' => $agency->logo,
                'favicon' => $agency->favicon,
                'primary_color' => $agency->primary_color,
                'secondary_color' => $agency->secondary_color,
                'accent_color' => $agency->accent_color,
                'custom_domain' => $agency->custom_domain,
                'domain_status' => $agency->domain_status,
                'subdomain' => $agency->subdomain,
                'subdomain_url' => $subdomain_url,
                'landing_page' => $agency->landing_page ? json_decode($agency->landing_page, true) : null,
            ]
        ]);
    }

    /**
     * Subpágina: Domínio
     */
    public function domain()
    {
        // Verificar se está impersonando uma agência
        $agencyId = null;
        $impersonating = session()->get('impersonate.target');
        
        if ($impersonating && $impersonating['type'] === 'agency') {
            // Se está impersonando, usar o ID da agência da sessão
            $agencyId = $impersonating['id'];
        } else {
            // Caso contrário, obter o ID da agência do usuário autenticado
            $agencyId = Auth::user()->agency_id;
        }
        
        // Buscar a agência com o ID correto
        $agency = Agency::findOrFail($agencyId);
        
        // Obter URL completa do subdomínio para exibição
        $subdomain_url = '';
        if (!empty($agency->subdomain)) {
            $subdomain_url = 'https://' . $agency->subdomain . '.' . config('app.domain', 'onsell.com.br');
        }
        
        return Inertia::render('Agency/Branding/Domain', [
            'agency' => [
                'id' => $agency->id,
                'name' => $agency->name,
                'logo' => $agency->logo,
                'favicon' => $agency->favicon,
                'primary_color' => $agency->primary_color,
                'secondary_color' => $agency->secondary_color,
                'accent_color' => $agency->accent_color,
                'custom_domain' => $agency->custom_domain,
                'domain_status' => $agency->domain_status,
                'subdomain' => $agency->subdomain,
                'subdomain_url' => $subdomain_url,
                'landing_page' => $agency->landing_page ? json_decode($agency->landing_page, true) : null,
            ]
        ]);
    }

    /**
     * Subpágina: Landing Page
     */
    public function landing()
    {
        // Verificar se está impersonando uma agência
        $agencyId = null;
        $impersonating = session()->get('impersonate.target');
        
        if ($impersonating && $impersonating['type'] === 'agency') {
            // Se está impersonando, usar o ID da agência da sessão
            $agencyId = $impersonating['id'];
        } else {
            // Caso contrário, obter o ID da agência do usuário autenticado
            $agencyId = Auth::user()->agency_id;
        }
        
        // Buscar a agência com o ID correto
        $agency = Agency::findOrFail($agencyId);
        
        // Obter URL completa do subdomínio para exibição
        $subdomain_url = '';
        if (!empty($agency->subdomain)) {
            $subdomain_url = 'https://' . $agency->subdomain . '.' . config('app.domain', 'onsell.com.br');
        }
        
        return Inertia::render('Agency/Branding/Landing', [
            'agency' => [
                'id' => $agency->id,
                'name' => $agency->name,
                'logo' => $agency->logo,
                'favicon' => $agency->favicon,
                'primary_color' => $agency->primary_color,
                'secondary_color' => $agency->secondary_color,
                'accent_color' => $agency->accent_color,
                'custom_domain' => $agency->custom_domain,
                'domain_status' => $agency->domain_status,
                'subdomain' => $agency->subdomain,
                'subdomain_url' => $subdomain_url,
                'landing_page' => $agency->landing_page ? json_decode($agency->landing_page, true) : null,
            ]
        ]);
    }
} 