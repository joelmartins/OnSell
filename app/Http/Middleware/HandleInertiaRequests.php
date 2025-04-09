<?php

namespace App\Http\Middleware;

use App\Models\Agency;
use App\Models\Client;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        // Verificar se estamos impersonando
        $isImpersonating = $request->session()->has('impersonate.target');
        $target = $request->session()->get('impersonate.target');
        
        $defaultShared = [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user(),
            ],
            'flash' => [
                'message' => fn () => $request->session()->get('message'),
                'error' => fn () => $request->session()->get('error'),
                'success' => fn () => $request->session()->get('success'),
                'warning' => fn () => $request->session()->get('warning'),
                'info' => fn () => $request->session()->get('info'),
            ],
            'impersonation' => [
                'active' => $isImpersonating,
                'target' => $target,
                'original' => $request->session()->get('impersonate.original_user'),
            ],
        ];
        
        // Obter o branding da agência
        $agencyId = null;
        $clientId = null;
        
        // Cenário 1: Impersonando um cliente diretamente
        if ($isImpersonating && $target && $target['type'] === 'client') {
            $clientId = $target['id'];
            Log::channel('audit')->info('Impersonando cliente, buscando agência associada', [
                'target_id' => $clientId,
                'target_type' => 'client'
            ]);
        }
        // Cenário 2: Impersonando via cascata (admin -> agência -> cliente)
        elseif ($isImpersonating && $target && $target['type'] === 'client' && $request->session()->has('impersonate.cascade')) {
            $clientId = $target['id'];
            $cascade = $request->session()->get('impersonate.cascade');
            Log::channel('audit')->info('Impersonando cliente via cascata', [
                'target_id' => $clientId,
                'cascade' => $cascade
            ]);
        }
        // Cenário 3: Usuário normal de cliente
        elseif ($request->user() && $request->user()->client_id) {
            $clientId = $request->user()->client_id;
        }
        
        // Se temos um ID de cliente, buscar a agência associada
        if ($clientId) {
            $client = Client::find($clientId);
            if ($client && $client->agency_id) {
                $agencyId = $client->agency_id;
            }
        }
        // Cenário 4: Impersonando uma agência
        elseif ($isImpersonating && $target && $target['type'] === 'agency') {
            $agencyId = $target['id'];
        }
        // Cenário 5: Usuário normal de agência
        elseif ($request->user() && $request->user()->agency_id) {
            $agencyId = $request->user()->agency_id;
        }
        
        // Se temos um ID de agência, buscar as informações de branding
        if ($agencyId) {
            $agency = Agency::find($agencyId);
            
            if ($agency) {
                Log::channel('audit')->info('Aplicando branding da agência', [
                    'agency_id' => $agencyId,
                    'agency_name' => $agency->name,
                    'request_path' => $request->path(),
                    'is_client_route' => strpos($request->path(), 'client') === 0,
                ]);
                
                // Adicionar informações de branding às props compartilhadas
                $defaultShared['branding'] = [
                    'agency_name' => $agency->name,
                    'logo' => $agency->logo,
                    'favicon' => $agency->favicon,
                    'primary_color' => $agency->primary_color,
                    'secondary_color' => $agency->secondary_color,
                    'accent_color' => $agency->accent_color,
                ];
                
                // Se o navegador solicita o favicon, configurar
                if ($request->path() === 'favicon.ico' && $agency->favicon) {
                    header('Location: ' . $agency->favicon);
                    exit;
                }
            }
        }
        
        // Se estamos impersonando, registrar para depuração
        if ($isImpersonating) {
            Log::channel('audit')->info('Carregando props do Inertia durante impersonação', [
                'user_id' => $request->user()?->id,
                'path' => $request->path(),
                'session_data' => [
                    'target' => $target,
                    'original_user' => $request->session()->get('impersonate.original_user'),
                    'cascade' => $request->session()->has('impersonate.cascade') ? $request->session()->get('impersonate.cascade') : null,
                ],
                'has_branding' => isset($defaultShared['branding']),
                'has_ziggy' => array_key_exists('ziggy', parent::share($request)),
            ]);
            
            // Garantir que o Ziggy ainda tenha a URL base no ambiente de impersonação
            if (array_key_exists('ziggy', parent::share($request))) {
                $ziggy = parent::share($request)['ziggy'];
                if (!isset($ziggy['url']) || empty($ziggy['url'])) {
                    $ziggy['url'] = url('');
                    $defaultShared['ziggy'] = $ziggy;
                }
            }
        }
        
        return $defaultShared;
    }
}
