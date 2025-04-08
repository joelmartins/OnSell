<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AutomationNode extends Model
{
    use HasFactory;

    /**
     * Os atributos que são atribuíveis em massa.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'automation_id',
        'node_id',
        'type',
        'name',
        'config',
        'position_x',
        'position_y',
    ];

    /**
     * Os atributos que devem ser convertidos.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'config' => 'array',
        'position_x' => 'integer',
        'position_y' => 'integer',
    ];

    /**
     * Obter a automação a que este nó pertence.
     */
    public function automation(): BelongsTo
    {
        return $this->belongsTo(Automation::class);
    }

    /**
     * Obter as arestas de saída deste nó.
     */
    public function outgoingEdges()
    {
        return AutomationEdge::where('automation_id', $this->automation_id)
            ->where('source_node_id', $this->node_id)
            ->get();
    }

    /**
     * Obter as arestas de entrada deste nó.
     */
    public function incomingEdges()
    {
        return AutomationEdge::where('automation_id', $this->automation_id)
            ->where('target_node_id', $this->node_id)
            ->get();
    }

    /**
     * Verificar se este nó é do tipo trigger.
     *
     * @return bool
     */
    public function isTrigger(): bool
    {
        return $this->type === 'trigger';
    }

    /**
     * Verificar se este nó é do tipo action.
     *
     * @return bool
     */
    public function isAction(): bool
    {
        return $this->type === 'action';
    }

    /**
     * Verificar se este nó é do tipo condition.
     *
     * @return bool
     */
    public function isCondition(): bool
    {
        return $this->type === 'condition';
    }

    /**
     * Verificar se este nó é do tipo delay.
     *
     * @return bool
     */
    public function isDelay(): bool
    {
        return $this->type === 'delay';
    }
} 