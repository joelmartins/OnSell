<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Models\Agency;
use Illuminate\Support\Facades\Log;

class ResolveDomain
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle(Request $request, Closure $next)
    {
        $host = $request->getHost();
        $appDomain = config('app.domain', 'onsell.com.br');
        
        // Se for um subdomínio do domínio principal
        if (preg_match('/^([^.]+)\.' . preg_quote($appDomain) . '$/', $host, $matches)) {
            $subdomain = $matches[1];
            
            // Verifica se não é um subdomínio reservado (como 'www')
            if ($subdomain !== 'www') {
                $agency = Agency::where('subdomain', $subdomain)
                    ->where('is_active', true)
                    ->first();
                
                if ($agency) {
                    // Adiciona a agency à request para uso posterior
                    $request->attributes->add(['resolved_agency' => $agency]);
                    
                    // Loga o acesso
                    Log::info("Acesso via subdomínio: {$subdomain}.{$appDomain}", [
                        'agency_id' => $agency->id,
                        'agency_name' => $agency->name,
                        'subdomain' => $subdomain
                    ]);
                }
            }
        } 
        // Verifica se é um domínio personalizado
        else {
            $agency = Agency::where('custom_domain', $host)
                ->where('domain_status', 'active')
                ->where('is_active', true)
                ->first();
            
            if ($agency) {
                // Adiciona a agency à request para uso posterior
                $request->attributes->add(['resolved_agency' => $agency]);
                
                // Loga o acesso
                Log::info("Acesso via domínio personalizado: {$host}", [
                    'agency_id' => $agency->id,
                    'agency_name' => $agency->name,
                    'custom_domain' => $host
                ]);
            }
        }

        return $next($request);
    }
} 