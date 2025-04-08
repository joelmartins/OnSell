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
        'is_agency_plan',
        'is_featured',
        'features',
        'monthly_leads',
        'max_landing_pages',
        'max_pipelines',
        'total_leads',
        'max_clients',
        'has_whatsapp_integration',
        'has_email_integration',
        'has_instagram_integration',
        'has_telegram_integration',
        'has_crm_integration',
        'has_facebook_integration',
        'has_google_business_integration',
        'is_agency_plan',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'is_active' => 'boolean',
        'is_agency_plan' => 'boolean',
        'is_featured' => 'boolean',
        'price' => 'decimal:2',
        'features' => 'array',
        'monthly_leads' => 'integer',
        'max_landing_pages' => 'integer',
        'max_pipelines' => 'integer',
        'total_leads' => 'integer',
        'max_clients' => 'integer',
        'has_whatsapp_integration' => 'boolean',
        'has_email_integration' => 'boolean',
        'has_instagram_integration' => 'boolean',
        'has_telegram_integration' => 'boolean',
        'has_crm_integration' => 'boolean',
        'has_facebook_integration' => 'boolean',
        'has_google_business_integration' => 'boolean',
        'is_agency_plan' => 'boolean',
    ];

    /**
     * Constantes de período
     */
    const PERIOD_MONTHLY = 'monthly';
    const PERIOD_YEARLY = 'yearly';

    /**
     * Constantes para limites padrão de planos
     */
    const DEFAULT_MONTHLY_LEADS = 100;
    const DEFAULT_MAX_LANDING_PAGES = 1;
    const DEFAULT_MAX_PIPELINES = 1;
    const DEFAULT_TOTAL_LEADS = 500;
    const DEFAULT_MAX_CLIENTS = 5;
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
     * @param float $discountPercentage Percentual de desconto no plano anual (padrão: 20%)
     * @return float
     */
    public static function calculateYearlyPrice(float $monthlyPrice, float $discountPercentage = 20): float
    {
        return $monthlyPrice * 12 * (1 - $discountPercentage / 100);
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
     * Check if this is a system plan (not associated with any agency).
     */
    public function isSystemPlan(): bool
    {
        return is_null($this->agency_id);
    }

    /**
     * Check if this plan is meant for agencies.
     */
    public function isAgencyPlan(): bool
    {
        return $this->is_agency_plan;
    }

    /**
     * Check if this plan is for direct clients (system plan and not agency plan).
     */
    public function isDirectClientPlan(): bool
    {
        return $this->isSystemPlan() && !$this->isAgencyPlan();
    }

    /**
     * Get plan type as a human-readable string.
     * 
     * @return string
     */
    public function getPlanTypeLabel(): string
    {
        return $this->isAgencyPlan() ? 'Agência' : 'Cliente';
    }

    /**
     * Get the monthly leads limit.
     * 
     * @return int
     */
    public function getMonthlyLeadsLimit(): int
    {
        return $this->monthly_leads ?? self::DEFAULT_MONTHLY_LEADS;
    }

    /**
     * Get the landing pages limit.
     * 
     * @return int
     */
    public function getLandingPagesLimit(): int
    {
        return $this->max_landing_pages ?? self::DEFAULT_MAX_LANDING_PAGES;
    }

    /**
     * Get the pipelines limit.
     * 
     * @return int
     */
    public function getPipelinesLimit(): int
    {
        return $this->max_pipelines ?? self::DEFAULT_MAX_PIPELINES;
    }

    /**
     * Get the total leads limit.
     * 
     * @return int
     */
    public function getTotalLeadsLimit(): int
    {
        return $this->total_leads ?? self::DEFAULT_TOTAL_LEADS;
    }

    /**
     * Calculate yearly price with discount for this plan instance.
     * 
     * @param float $discountPercentage Percentual de desconto no plano anual (padrão: 20%)
     * @return float
     */
    public function getYearlyPrice(float $discountPercentage = 20): float
    {
        return self::calculateYearlyPrice($this->price, $discountPercentage);
    }
} 