<?php

namespace App\Http\Middleware;

use App\Models\Agency;
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
                'target' => $request->session()->get('impersonate.target'),
                'original' => $request->session()->get('impersonate.original_user'),
            ],
        ];
        
        // Adicionar informações de branding da agência para os clientes
        $user = $request->user();
        if ($user && $user->client_id) {
            // Se o usuário pertence a um cliente, buscar a agência associada
            $client = $user->client;
            
            if ($client && $client->agency_id) {
                $agency = Agency::find($client->agency_id);
                
                if ($agency) {
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
        }
        
        // Se estamos impersonando, registrar para depuração
        if ($isImpersonating) {
            Log::channel('audit')->info('Carregando props do Inertia durante impersonação', [
                'user_id' => $request->user()?->id,
                'path' => $request->path(),
                'session_data' => [
                    'target' => $request->session()->get('impersonate.target'),
                    'original_user' => $request->session()->get('impersonate.original_user'),
                ],
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
