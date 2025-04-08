<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use OwenIt\Auditing\Contracts\Auditable;
use OwenIt\Auditing\Auditable as AuditableTrait;

class Opportunity extends Model implements Auditable
{
    use HasFactory, SoftDeletes, AuditableTrait;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'title',
        'description',
        'pipeline_id',
        'stage_id',
        'contact_id',
        'value',
        'expected_close_date',
        'custom_fields',
        'status',
        'priority',
        'last_activity_at',
        'source',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'value' => 'decimal:2',
        'expected_close_date' => 'date',
        'custom_fields' => 'array',
        'last_activity_at' => 'datetime',
    ];

    /**
     * Get the pipeline that owns the opportunity.
     */
    public function pipeline(): BelongsTo
    {
        return $this->belongsTo(Pipeline::class);
    }

    /**
     * Get the stage that owns the opportunity.
     */
    public function stage(): BelongsTo
    {
        return $this->belongsTo(Stage::class);
    }

    /**
     * Get the contact that owns the opportunity.
     */
    public function contact(): BelongsTo
    {
        return $this->belongsTo(Contact::class);
    }

    /**
     * Get the activities for the opportunity.
     */
    public function activities(): HasMany
    {
        return $this->hasMany(Activity::class);
    }

    /**
     * Get opportunity status label
     */
    public function getStatusLabelAttribute(): string
    {
        $statuses = [
            'open' => 'Aberto',
            'won' => 'Ganho',
            'lost' => 'Perdido',
            'pending' => 'Pendente',
        ];

        return $statuses[$this->status] ?? 'Desconhecido';
    }
} 