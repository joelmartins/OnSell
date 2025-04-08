<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use OwenIt\Auditing\Contracts\Auditable;
use OwenIt\Auditing\Auditable as AuditableTrait;

class Plan extends Model implements Auditable
{
    use HasFactory, SoftDeletes, AuditableTrait;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'description',
        'price',
        'period',
        'agency_id',
        'is_active',
        'features',
        'max_contacts',
        'max_pipelines',
        'max_automation_flows',
        'has_whatsapp_integration',
        'has_email_integration',
        'has_meta_integration',
        'has_google_integration',
        'has_custom_domain',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'is_active' => 'boolean',
        'price' => 'decimal:2',
        'features' => 'array',
        'max_contacts' => 'integer',
        'max_pipelines' => 'integer',
        'max_automation_flows' => 'integer',
        'has_whatsapp_integration' => 'boolean',
        'has_email_integration' => 'boolean',
        'has_meta_integration' => 'boolean',
        'has_google_integration' => 'boolean',
        'has_custom_domain' => 'boolean',
    ];

    /**
     * Constantes de período
     */
    const PERIOD_MONTHLY = 'monthly';
    const PERIOD_YEARLY = 'yearly';

    /**
     * Constantes para limites padrão de planos
     */
    const DEFAULT_CONTACTS_LIMIT = 100;
    const DEFAULT_PIPELINES_LIMIT = 3;
    const DEFAULT_AUTOMATION_FLOWS_LIMIT = 5;
    const DEFAULT_USERS_LIMIT = 2;

    /**
     * Opções de período disponíveis
     *
     * @return array
     */
    public static function periodOptions(): array
    {
        return [
            self::PERIOD_MONTHLY => 'Mensal',
            self::PERIOD_YEARLY => 'Anual',
        ];
    }

    /**
     * Calcula o desconto para planos anuais
     *
     * @param float $monthlyPrice
     * @return float
     */
    public static function calculateYearlyPrice(float $monthlyPrice): float
    {
        // 20% de desconto para planos anuais (equivalente a 2 meses grátis)
        return $monthlyPrice * 12 * 0.8;
    }

    /**
     * Get the agency that owns the plan.
     */
    public function agency(): BelongsTo
    {
        return $this->belongsTo(Agency::class);
    }

    /**
     * Get the clients subscribed to this plan.
     */
    public function clients(): HasMany
    {
        return $this->hasMany(Client::class);
    }

    /**
     * Check if this is a system plan (not created by an agency).
     */
    public function isSystemPlan(): bool
    {
        return is_null($this->agency_id);
    }
} 