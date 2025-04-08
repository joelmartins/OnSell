<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AutomationLog extends Model
{
    use HasFactory;

    /**
     * Os atributos que são atribuíveis em massa.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'automation_id',
        'contact_id',
        'opportunity_id',
        'node_id',
        'status',
        'message',
        'context',
        'result',
        'started_at',
        'completed_at',
    ];

    /**
     * Os atributos que devem ser convertidos.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'context' => 'array',
        'result' => 'array',
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    /**
     * Obter a automação associada a este log.
     */
    public function automation(): BelongsTo
    {
        return $this->belongsTo(Automation::class);
    }

    /**
     * Obter o contato associado a este log.
     */
    public function contact(): BelongsTo
    {
        return $this->belongsTo(Contact::class);
    }

    /**
     * Obter a oportunidade associada a este log.
     */
    public function opportunity(): BelongsTo
    {
        return $this->belongsTo(Opportunity::class);
    }

    /**
     * Escopo para logs pendentes.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Escopo para logs em execução.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeRunning($query)
    {
        return $query->where('status', 'running');
    }

    /**
     * Escopo para logs concluídos.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    /**
     * Escopo para logs com falha.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeFailed($query)
    {
        return $query->where('status', 'failed');
    }

    /**
     * Marcar o log como em execução.
     *
     * @return $this
     */
    public function markAsRunning()
    {
        $this->status = 'running';
        $this->started_at = now();
        $this->save();

        return $this;
    }

    /**
     * Marcar o log como concluído.
     *
     * @param  array|null  $result
     * @return $this
     */
    public function markAsCompleted($result = null)
    {
        $this->status = 'completed';
        $this->completed_at = now();
        
        if ($result) {
            $this->result = $result;
        }
        
        $this->save();

        return $this;
    }

    /**
     * Marcar o log como falha.
     *
     * @param  string  $message
     * @param  array|null  $result
     * @return $this
     */
    public function markAsFailed($message, $result = null)
    {
        $this->status = 'failed';
        $this->message = $message;
        $this->completed_at = now();
        
        if ($result) {
            $this->result = $result;
        }
        
        $this->save();

        return $this;
    }
} 