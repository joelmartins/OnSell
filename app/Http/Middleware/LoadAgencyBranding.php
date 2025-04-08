<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Setting;
use App\Models\Agency;
use Symfony\Component\HttpFoundation\Response;

class LoadAgencyBranding
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        $branding = [];

        if ($user) {
            // Verificar se o usuário tem uma agência associada
            if ($user->agency_id) {
                $agency = Agency::find($user->agency_id);
                if ($agency) {
                    $branding = $this->getAgencyBranding($agency);
                }
            } 
            // Se for um cliente, verificar a agência associada
            elseif ($user->client_id && $user->client && $user->client->agency_id) {
                $agency = Agency::find($user->client->agency_id);
                if ($agency) {
                    $branding = $this->getAgencyBranding($agency);
                }
            }
        }

        // Se não encontrou branding específico, usar valores padrão
        if (empty($branding)) {
            $branding = $this->getDefaultBranding();
        }

        // Compartilhar dados de branding com todas as views
        Inertia::share('branding', $branding);

        // Definir favicon personalizado quando disponível
        if (!empty($branding['favicon'])) {
            $this->setCustomFavicon($branding['favicon']);
        }

        return $next($request);
    }

    /**
     * Obter configurações de branding de uma agência
     *
     * @param Agency $agency
     * @return array
     */
    private function getAgencyBranding(Agency $agency): array
    {
        return [
            'agency_name' => $agency->name,
            'logo' => $agency->logo,
            'primary_color' => $agency->primary_color ?? '#0f172a',
            'secondary_color' => $agency->secondary_color ?? '#64748b',
            'accent_color' => $agency->accent_color ?? '#0ea5e9',
            'favicon' => $agency->favicon,
        ];
    }

    /**
     * Obter configurações de branding padrão do sistema
     *
     * @return array
     */
    private function getDefaultBranding(): array
    {
        return [
            'agency_name' => Setting::get('app_name', 'OnSell'),
            'logo' => Setting::get('app_logo'),
            'primary_color' => Setting::get('app_primary_color', '#0f172a'),
            'secondary_color' => Setting::get('app_secondary_color', '#64748b'),
            'accent_color' => Setting::get('app_accent_color', '#0ea5e9'),
            'favicon' => Setting::get('app_favicon'),
        ];
    }

    /**
     * Configurar favicon personalizado
     *
     * @param string $faviconUrl
     * @return void
     */
    private function setCustomFavicon(string $faviconUrl): void
    {
        // O favicon será definido via JavaScript no frontend
        // usando o objeto de branding compartilhado
    }
} 