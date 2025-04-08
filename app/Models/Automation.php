<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Stancl\Tenancy\Database\Concerns\BelongsToTenant;

class Automation extends Model
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
        'trigger_type',
        'trigger_config',
        'json_structure',
        'active',
    ];

    /**
     * Os atributos que devem ser convertidos.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'trigger_config' => 'array',
        'json_structure' => 'array',
        'active' => 'boolean',
    ];

    /**
     * Obter os nós associados a esta automação.
     */
    public function nodes(): HasMany
    {
        return $this->hasMany(AutomationNode::class);
    }

    /**
     * Obter as arestas associadas a esta automação.
     */
    public function edges(): HasMany
    {
        return $this->hasMany(AutomationEdge::class);
    }

    /**
     * Obter os logs associados a esta automação.
     */
    public function logs(): HasMany
    {
        return $this->hasMany(AutomationLog::class);
    }

    /**
     * Buscar automações pelo tipo de gatilho.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @param  string  $triggerType
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeByTriggerType($query, $triggerType)
    {
        return $query->where('trigger_type', $triggerType)->where('active', true);
    }

    /**
     * Verificar se a automação está ativa.
     *
     * @return bool
     */
    public function isActive(): bool
    {
        return $this->active;
    }

    /**
     * Ativar a automação.
     *
     * @return $this
     */
    public function activate()
    {
        $this->active = true;
        $this->save();

        return $this;
    }

    /**
     * Desativar a automação.
     *
     * @return $this
     */
    public function deactivate()
    {
        $this->active = false;
        $this->save();

        return $this;
    }
} 