<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use OwenIt\Auditing\Contracts\Auditable;
use OwenIt\Auditing\Auditable as AuditableTrait;

class Agency extends Model implements Auditable
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
        'domain',
        'is_active',
        'parent_agency_id',
        'logo',
        'favicon',
        'primary_color',
        'secondary_color',
        'accent_color',
        'custom_domain',
        'domain_status',
        'subdomain',
        'landing_page',
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
     * Get the users for the agency.
     */
    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    /**
     * Get the clients for the agency.
     */
    public function clients(): HasMany
    {
        return $this->hasMany(Client::class);
    }

    /**
     * Get the sub-agencies for the agency.
     */
    public function subAgencies(): HasMany
    {
        return $this->hasMany(Agency::class, 'parent_agency_id');
    }

    /**
     * Get the plans for the agency.
     */
    public function plans(): HasMany
    {
        return $this->hasMany(Plan::class);
    }

    /**
     * Get the parent agency.
     */
    public function parentAgency(): BelongsTo
    {
        return $this->belongsTo(Agency::class, 'parent_agency_id');
    }
} 