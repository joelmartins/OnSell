<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use OwenIt\Auditing\Contracts\Auditable;
use OwenIt\Auditing\Auditable as AuditableTrait;

class Interaction extends Model implements Auditable
{
    use HasFactory, SoftDeletes, AuditableTrait;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'contact_id',
        'user_id',
        'channel',
        'direction',
        'content',
        'metadata',
        'external_id',
        'is_read',
        'sentiment',
        'ai_processed',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'metadata' => 'array',
        'is_read' => 'boolean',
        'ai_processed' => 'boolean',
    ];

    /**
     * Get the contact that owns the interaction.
     */
    public function contact(): BelongsTo
    {
        return $this->belongsTo(Contact::class);
    }

    /**
     * Get the user that owns the interaction.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get interaction channel label
     */
    public function getChannelLabelAttribute(): string
    {
        $channels = [
            'whatsapp' => 'WhatsApp',
            'email' => 'E-mail',
            'sms' => 'SMS',
            'phone' => 'Telefone',
            'chat' => 'Chat',
            'facebook' => 'Facebook',
            'instagram' => 'Instagram',
        ];

        return $channels[$this->channel] ?? 'Outro';
    }

    /**
     * Get interaction direction label
     */
    public function getDirectionLabelAttribute(): string
    {
        $directions = [
            'in' => 'Recebida',
            'out' => 'Enviada',
        ];

        return $directions[$this->direction] ?? 'Desconhecida';
    }
} 