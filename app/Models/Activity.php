<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use OwenIt\Auditing\Contracts\Auditable;
use OwenIt\Auditing\Auditable as AuditableTrait;

class Activity extends Model implements Auditable
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
        'opportunity_id',
        'user_id',
        'type',
        'scheduled_at',
        'completed_at',
        'result',
        'is_completed',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'scheduled_at' => 'datetime',
        'completed_at' => 'datetime',
        'is_completed' => 'boolean',
    ];

    /**
     * Get the opportunity that owns the activity.
     */
    public function opportunity(): BelongsTo
    {
        return $this->belongsTo(Opportunity::class);
    }

    /**
     * Get the user that owns the activity.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get activity type label
     */
    public function getTypeLabelAttribute(): string
    {
        $types = [
            'call' => 'Ligação',
            'meeting' => 'Reunião',
            'email' => 'E-mail',
            'whatsapp' => 'WhatsApp',
            'task' => 'Tarefa',
            'note' => 'Anotação',
        ];

        return $types[$this->type] ?? 'Outro';
    }
} 