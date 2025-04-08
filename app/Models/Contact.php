<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use OwenIt\Auditing\Contracts\Auditable;
use OwenIt\Auditing\Auditable as AuditableTrait;

class Contact extends Model implements Auditable
{
    use HasFactory, SoftDeletes, AuditableTrait;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'phone',
        'whatsapp',
        'document',
        'company',
        'position',
        'address',
        'city',
        'state',
        'postal_code',
        'country',
        'client_id',
        'source',
        'status',
        'custom_fields',
        'last_interaction_at',
        'notes',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'custom_fields' => 'array',
        'last_interaction_at' => 'datetime',
    ];

    /**
     * Get the client that owns the contact.
     */
    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    /**
     * Get the interactions for the contact.
     */
    public function interactions(): HasMany
    {
        return $this->hasMany(Interaction::class);
    }

    /**
     * Get the opportunities related to this contact.
     */
    public function opportunities(): HasMany
    {
        return $this->hasMany(Opportunity::class);
    }
} 