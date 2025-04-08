<?php

namespace App\Models;

use App\Models\Agency;
use App\Models\ClientUsage;
use App\Models\Concerns\Auditable;
use App\Models\Pipeline;
use App\Models\Plan;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use OwenIt\Auditing\Contracts\Auditable as AuditableContract;
use OwenIt\Auditing\Auditable as AuditableTrait;

class Client extends Model implements AuditableContract
{
    use HasFactory, SoftDeletes, AuditableTrait;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'document',
        'email',
        'phone',
        'description',
        'is_active',
        'agency_id',
        'plan_id',
        'logo',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'is_active' => 'boolean',
    ];

    /**
     * Get the users for the client.
     */
    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    /**
     * Get the agency that owns the client.
     */
    public function agency(): BelongsTo
    {
        return $this->belongsTo(Agency::class);
    }

    /**
     * Get the plan that the client is subscribed to.
     */
    public function plan(): BelongsTo
    {
        return $this->belongsTo(Plan::class);
    }

    /**
     * Get the contacts for the client.
     */
    public function contacts(): HasMany
    {
        return $this->hasMany(Contact::class);
    }

    /**
     * Get the pipelines for the client.
     */
    public function pipelines(): HasMany
    {
        return $this->hasMany(Pipeline::class);
    }

    /**
     * Get the monthly usage records for the client.
     */
    public function usages(): HasMany
    {
        return $this->hasMany(ClientUsage::class);
    }

    /**
     * Get the current month's usage.
     */
    public function getCurrentMonthUsage()
    {
        return ClientUsage::getCurrentMonthUsage($this->id);
    }

    /**
     * Verifica se o cliente já atingiu o limite mensal de leads
     */
    public function hasReachedMonthlyLeadsLimit(): bool
    {
        $usage = $this->getCurrentMonthUsage();
        return $usage->hasReachedMonthlyLeadsLimit($this->id);
    }

    /**
     * Verifica se o cliente já atingiu o limite total de leads
     */
    public function hasReachedTotalLeadsLimit(): bool
    {
        $usage = $this->getCurrentMonthUsage();
        return $usage->hasReachedTotalLeadsLimit($this->id);
    }

    /**
     * Retorna o número restante de leads mensais
     */
    public function getRemainingMonthlyLeads(): int
    {
        $usage = $this->getCurrentMonthUsage();
        return $usage->getRemainingMonthlyLeads($this->id);
    }

    /**
     * Retorna o número restante de leads totais
     */
    public function getRemainingTotalLeads(): int
    {
        $usage = $this->getCurrentMonthUsage();
        return $usage->getRemainingTotalLeads($this->id);
    }

    /**
     * Verifica se o cliente já atingiu o limite mensal de pipelines
     */
    public function hasReachedPipelinesLimit(): bool
    {
        $usage = $this->getCurrentMonthUsage();
        return $usage->hasReachedPipelinesLimit($this->id);
    }

    /**
     * Retorna o número restante de pipelines para o mês atual
     */
    public function getRemainingPipelines(): int
    {
        $usage = $this->getCurrentMonthUsage();
        return $usage->getRemainingPipelines($this->id);
    }

    /**
     * Verifica se o cliente já atingiu o limite mensal de landing pages
     */
    public function hasReachedLandingPagesLimit(): bool
    {
        $usage = $this->getCurrentMonthUsage();
        return $usage->hasReachedLandingPagesLimit($this->id);
    }

    /**
     * Retorna o número restante de landing pages para o mês atual
     */
    public function getRemainingLandingPages(): int
    {
        $usage = $this->getCurrentMonthUsage();
        return $usage->getRemainingLandingPages($this->id);
    }
} 