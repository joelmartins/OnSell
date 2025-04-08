<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AutomationEdge extends Model
{
    use HasFactory;

    /**
     * Os atributos que são atribuíveis em massa.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'automation_id',
        'edge_id',
        'source_node_id',
        'target_node_id',
        'source_handle',
        'target_handle',
        'label',
        'config',
    ];

    /**
     * Os atributos que devem ser convertidos.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'config' => 'array',
    ];

    /**
     * Obter a automação a que esta aresta pertence.
     */
    public function automation(): BelongsTo
    {
        return $this->belongsTo(Automation::class);
    }

    /**
     * Obter o nó de origem desta aresta.
     */
    public function sourceNode()
    {
        return AutomationNode::where('automation_id', $this->automation_id)
            ->where('node_id', $this->source_node_id)
            ->first();
    }

    /**
     * Obter o nó de destino desta aresta.
     */
    public function targetNode()
    {
        return AutomationNode::where('automation_id', $this->automation_id)
            ->where('node_id', $this->target_node_id)
            ->first();
    }

    /**
     * Verificar se esta aresta tem uma condição.
     *
     * @return bool
     */
    public function hasCondition(): bool
    {
        return isset($this->config['condition']) && !empty($this->config['condition']);
    }

    /**
     * Obter a condição desta aresta.
     *
     * @return array|null
     */
    public function getCondition()
    {
        return $this->hasCondition() ? $this->config['condition'] : null;
    }
} 