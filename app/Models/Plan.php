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