<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use OwenIt\Auditing\Contracts\Auditable;
use OwenIt\Auditing\Auditable as AuditableTrait;

class Stage extends Model implements Auditable
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
        'pipeline_id',
        'color',
        'order',
        'is_active',
        'probability',
        'is_won',
        'is_lost',
        'is_initial',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'is_active' => 'boolean',
        'probability' => 'integer',
        'order' => 'integer',
        'is_won' => 'boolean',
        'is_lost' => 'boolean',
        'is_initial' => 'boolean',
    ];

    /**
     * Get the pipeline that owns the stage.
     */
    public function pipeline(): BelongsTo
    {
        return $this->belongsTo(Pipeline::class);
    }

    /**
     * Get the opportunities for the stage.
     */
    public function opportunities(): HasMany
    {
        return $this->hasMany(Opportunity::class);
    }
} 