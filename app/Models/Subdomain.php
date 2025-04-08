<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Subdomain extends Model
{
    use HasFactory;

    /**
     * Os atributos que podem ser atribuídos em massa.
     *
     * @var array<string>
     */
    protected $fillable = [
        'client_id',
        'name',
        'domain',
        'description',
        'is_verified',
        'is_active',
        'ssl_enabled',
        'cname_record',
        'verified_at',
        'expires_at',
    ];

    /**
     * Os atributos que devem ser convertidos para tipos nativos.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'is_verified' => 'boolean',
        'is_active' => 'boolean',
        'ssl_enabled' => 'boolean',
        'verified_at' => 'datetime',
        'expires_at' => 'datetime',
    ];

    /**
     * Os atributos que devem ser anexados aos resultados da consulta.
     *
     * @var array<string>
     */
    protected $appends = [
        'full_url',
        'status_label',
    ];

    /**
     * Obtenha o cliente proprietário deste subdomínio.
     */
    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    /**
     * Obtém a URL completa do subdomínio.
     */
    public function getFullUrlAttribute(): string
    {
        return ($this->ssl_enabled ? 'https://' : 'http://') . $this->name . '.' . $this->domain;
    }

    /**
     * Obtém o rótulo de status do subdomínio.
     */
    public function getStatusLabelAttribute(): string
    {
        if (!$this->is_active) {
            return 'Inativo';
        }
        
        if (!$this->is_verified) {
            return 'Pendente de verificação';
        }
        
        return 'Ativo';
    }

    /**
     * Marca o subdomínio como verificado.
     */
    public function markAsVerified(): bool
    {
        $this->is_verified = true;
        $this->verified_at = now();
        
        return $this->save();
    }

    /**
     * Verifica se o subdomínio pertence a um determinado cliente.
     */
    public function belongsToClient(int $clientId): bool
    {
        return $this->client_id === $clientId;
    }

    /**
     * Verifica se o subdomínio está disponível.
     */
    public static function isAvailable(string $name, string $domain): bool
    {
        return !static::where('name', $name)
            ->where('domain', $domain)
            ->exists();
    }

    /**
     * Gera um nome de CNAME aleatório para verificação.
     */
    public function generateCnameRecord(): bool
    {
        $this->cname_record = 'verify-' . strtolower(str_replace(['-', '.'], '', $this->name)) . '-' . rand(1000, 9999);
        
        return $this->save();
    }
}
