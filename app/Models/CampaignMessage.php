<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CampaignMessage extends Model
{
    use HasFactory;

    /**
     * Os atributos que são atribuíveis em massa.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'campaign_id',
        'contact_id',
        'message_template_id',
        'channel',
        'status',
        'content',
        'variables_used',
        'media',
        'metadata',
        'scheduled_at',
        'sent_at',
        'delivered_at',
        'read_at',
    ];

    /**
     * Os atributos que devem ser convertidos.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'variables_used' => 'array',
        'media' => 'array',
        'metadata' => 'array',
        'scheduled_at' => 'datetime',
        'sent_at' => 'datetime',
        'delivered_at' => 'datetime',
        'read_at' => 'datetime',
    ];

    /**
     * Obter a campanha associada a esta mensagem.
     */
    public function campaign(): BelongsTo
    {
        return $this->belongsTo(Campaign::class);
    }

    /**
     * Obter o contato associado a esta mensagem.
     */
    public function contact(): BelongsTo
    {
        return $this->belongsTo(Contact::class);
    }

    /**
     * Obter o template de mensagem associado a esta mensagem.
     */
    public function messageTemplate(): BelongsTo
    {
        return $this->belongsTo(MessageTemplate::class);
    }

    /**
     * Escopo para mensagens agendadas.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeScheduled($query)
    {
        return $query->where('status', 'scheduled');
    }

    /**
     * Escopo para mensagens enviadas.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeSent($query)
    {
        return $query->where('status', 'sent');
    }

    /**
     * Escopo para mensagens entregues.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeDelivered($query)
    {
        return $query->where('status', 'delivered');
    }

    /**
     * Escopo para mensagens lidas.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeRead($query)
    {
        return $query->where('status', 'read');
    }

    /**
     * Escopo para mensagens com falha.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeFailed($query)
    {
        return $query->where('status', 'failed');
    }

    /**
     * Escopo para mensagens que devem ser enviadas agora.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeShouldSend($query)
    {
        return $query->where('status', 'scheduled')
            ->where('scheduled_at', '<=', now());
    }

    /**
     * Marcar a mensagem como enviada.
     *
     * @param  array|null  $metadata
     * @return $this
     */
    public function markAsSent($metadata = null)
    {
        $this->status = 'sent';
        $this->sent_at = now();
        
        if ($metadata) {
            $this->metadata = array_merge($this->metadata ?? [], $metadata);
        }
        
        $this->save();

        return $this;
    }

    /**
     * Marcar a mensagem como entregue.
     *
     * @param  array|null  $metadata
     * @return $this
     */
    public function markAsDelivered($metadata = null)
    {
        $this->status = 'delivered';
        $this->delivered_at = now();
        
        if ($metadata) {
            $this->metadata = array_merge($this->metadata ?? [], $metadata);
        }
        
        $this->save();

        return $this;
    }

    /**
     * Marcar a mensagem como lida.
     *
     * @param  array|null  $metadata
     * @return $this
     */
    public function markAsRead($metadata = null)
    {
        $this->status = 'read';
        $this->read_at = now();
        
        if ($metadata) {
            $this->metadata = array_merge($this->metadata ?? [], $metadata);
        }
        
        $this->save();

        return $this;
    }

    /**
     * Marcar a mensagem como falha.
     *
     * @param  array|null  $metadata
     * @return $this
     */
    public function markAsFailed($metadata = null)
    {
        $this->status = 'failed';
        
        if ($metadata) {
            $this->metadata = array_merge($this->metadata ?? [], $metadata);
        }
        
        $this->save();

        return $this;
    }
} 