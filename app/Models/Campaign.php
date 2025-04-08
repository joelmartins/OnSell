<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Stancl\Tenancy\Database\Concerns\BelongsToTenant;

class Campaign extends Model
{
    use HasFactory, SoftDeletes, BelongsToTenant;

    /**
     * Os atributos que são atribuíveis em massa.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'description',
        'status',
        'scheduled_at',
        'started_at',
        'completed_at',
        'target_audience',
        'messages',
        'settings',
    ];

    /**
     * Os atributos que devem ser convertidos.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'target_audience' => 'array',
        'messages' => 'array',
        'settings' => 'array',
        'scheduled_at' => 'datetime',
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    /**
     * Obter as mensagens associadas a esta campanha.
     */
    public function campaignMessages(): HasMany
    {
        return $this->hasMany(CampaignMessage::class);
    }

    /**
     * Escopo para campanhas com status específico.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @param  string  $status
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeWithStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Escopo para campanhas agendadas.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeScheduled($query)
    {
        return $query->where('status', 'scheduled');
    }

    /**
     * Escopo para campanhas em progresso.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeInProgress($query)
    {
        return $query->where('status', 'in_progress');
    }

    /**
     * Escopo para campanhas que devem iniciar agora.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeShouldStart($query)
    {
        return $query->where('status', 'scheduled')
            ->where('scheduled_at', '<=', now());
    }

    /**
     * Verificar se a campanha está agendada.
     *
     * @return bool
     */
    public function isScheduled(): bool
    {
        return $this->status === 'scheduled';
    }

    /**
     * Verificar se a campanha está em progresso.
     *
     * @return bool
     */
    public function isInProgress(): bool
    {
        return $this->status === 'in_progress';
    }

    /**
     * Verificar se a campanha está pausada.
     *
     * @return bool
     */
    public function isPaused(): bool
    {
        return $this->status === 'paused';
    }

    /**
     * Verificar se a campanha está concluída.
     *
     * @return bool
     */
    public function isCompleted(): bool
    {
        return $this->status === 'completed';
    }

    /**
     * Iniciar a campanha.
     *
     * @return $this
     */
    public function start()
    {
        $this->status = 'in_progress';
        $this->started_at = now();
        $this->save();

        return $this;
    }

    /**
     * Pausar a campanha.
     *
     * @return $this
     */
    public function pause()
    {
        $this->status = 'paused';
        $this->save();

        return $this;
    }

    /**
     * Retomar a campanha.
     *
     * @return $this
     */
    public function resume()
    {
        $this->status = 'in_progress';
        $this->save();

        return $this;
    }

    /**
     * Concluir a campanha.
     *
     * @return $this
     */
    public function complete()
    {
        $this->status = 'completed';
        $this->completed_at = now();
        $this->save();

        return $this;
    }

    /**
     * Cancelar a campanha.
     *
     * @return $this
     */
    public function cancel()
    {
        $this->status = 'cancelled';
        $this->save();

        return $this;
    }
} 