<?php

namespace App\Services;

use App\Models\Agency;
use App\Models\Client;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class DomainService
{
    /**
     * Verifica se um subdomínio está disponível
     *
     * @param string $subdomain
     * @return bool
     */
    public function isSubdomainAvailable(string $subdomain): bool
    {
        // Verifica se o subdomínio já está em uso
        return !Agency::where('subdomain', $subdomain)->exists();
    }

    /**
     * Verifica se um domínio personalizado está disponível
     *
     * @param string $domain
     * @param int|null $exceptAgencyId
     * @return bool
     */
    public function isCustomDomainAvailable(string $domain, ?int $exceptAgencyId = null): bool
    {
        $query = Agency::where('custom_domain', $domain);

        if ($exceptAgencyId) {
            $query->where('id', '!=', $exceptAgencyId);
        }

        return !$query->exists();
    }

    /**
     * Verifica se um domínio está apontando para o servidor correto
     *
     * @param string $domain
     * @return bool
     */
    public function verifyDomainDNS(string $domain): bool
    {
        try {
            // IP do servidor que deve estar configurado no registro A
            $expectedIP = '34.95.121.61'; // Este deve ser o IP real do seu servidor
            
            // Obter registros A do domínio
            $dnsRecords = dns_get_record($domain, DNS_A);
            
            if (empty($dnsRecords)) {
                Log::warning("Nenhum registro A encontrado para o domínio: {$domain}");
                return false;
            }
            
            foreach ($dnsRecords as $record) {
                if (isset($record['ip']) && $record['ip'] === $expectedIP) {
                    return true;
                }
            }
            
            Log::warning("Registro A incorreto para o domínio: {$domain}. Esperado: {$expectedIP}, Encontrado: " . json_encode($dnsRecords));
            return false;
        } catch (\Exception $e) {
            Log::error("Erro ao verificar DNS do domínio {$domain}: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Atualiza o status do domínio personalizado
     *
     * @param Agency $agency
     * @return string Status do domínio após verificação
     */
    public function updateDomainStatus(Agency $agency): string
    {
        if (empty($agency->custom_domain)) {
            return 'empty';
        }

        $isValid = $this->verifyDomainDNS($agency->custom_domain);
        
        if ($isValid) {
            $agency->domain_status = 'active';
            $agency->save();
            return 'active';
        } else {
            $agency->domain_status = 'pending';
            $agency->save();
            return 'pending';
        }
    }

    /**
     * Verifica o formato do subdomínio
     *
     * @param string $subdomain
     * @return bool
     */
    public function validateSubdomainFormat(string $subdomain): bool
    {
        return preg_match('/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/', $subdomain) === 1;
    }

    /**
     * Verifica o formato do domínio personalizado
     *
     * @param string $domain
     * @return bool
     */
    public function validateDomainFormat(string $domain): bool
    {
        return preg_match('/^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/', $domain) === 1;
    }

    /**
     * Gera um subdomínio único baseado no nome da agência
     *
     * @param string $agencyName
     * @return string
     */
    public function generateUniqueSubdomain(string $agencyName): string
    {
        $base = Str::slug($agencyName);
        $subdomain = $base;
        $counter = 1;

        while (!$this->isSubdomainAvailable($subdomain)) {
            $subdomain = $base . $counter;
            $counter++;
        }

        return $subdomain;
    }
} 