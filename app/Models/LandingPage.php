<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LandingPage extends Model
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
        'description',
        'template_id',
        'slug',
        'content',
        'css',
        'js',
        'is_active',
        'meta_title',
        'meta_description',
        'thank_you_message',
        'thank_you_redirect_url',
        'primary_color',
        'secondary_color',
        'button_text',
        'views_count',
        'leads_count',
    ];

    /**
     * Os atributos que devem ser convertidos para tipos nativos.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'is_active' => 'boolean',
        'views_count' => 'integer',
        'leads_count' => 'integer',
    ];

    /**
     * Os atributos que devem ser anexados aos resultados da consulta.
     *
     * @var array<string>
     */
    protected $appends = [
        'conversion_rate',
        'public_url',
    ];

    /**
     * Obtenha o cliente proprietário desta landing page.
     */
    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    /**
     * Obtenha o template usado por esta landing page.
     */
    public function template(): BelongsTo
    {
        return $this->belongsTo(LandingPageTemplate::class, 'template_id');
    }

    /**
     * Calcula a taxa de conversão.
     *
     * @return float
     */
    public function getConversionRateAttribute(): float
    {
        if ($this->views_count <= 0) {
            return 0;
        }

        return round(($this->leads_count / $this->views_count) * 100, 2);
    }

    /**
     * Obtém a URL pública da landing page.
     *
     * @return string
     */
    public function getPublicUrlAttribute(): string
    {
        // A URL deve levar em consideração o domínio do tenant
        return route('landing-pages.show', $this->slug);
    }

    /**
     * Incrementa o contador de visualizações.
     *
     * @return bool
     */
    public function incrementViews(): bool
    {
        $this->views_count++;
        return $this->save();
    }

    /**
     * Incrementa o contador de leads.
     *
     * @return bool
     */
    public function incrementLeads(): bool
    {
        $this->leads_count++;
        
        // Também incrementa o contador de leads do cliente
        ClientUsage::incrementLeadsCount($this->client_id);
        
        return $this->save();
    }

    /**
     * Verifica se a landing page pertence a um determinado cliente.
     *
     * @param int $clientId
     * @return bool
     */
    public function belongsToClient(int $clientId): bool
    {
        return $this->client_id === $clientId;
    }
} 