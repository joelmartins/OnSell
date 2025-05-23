<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Model para entregáveis de inteligência de vendas (apenas para clientes)
 * agency_id e user_id não são utilizados.
 */
class SalesIntelligence extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * Nome da tabela no banco de dados.
     *
     * @var string
     */
    protected $table = 'intelligence_deliverables';

    /**
     * Os atributos que são atribuíveis em massa.
     * Somente client_id é obrigatório.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'client_id',
        'type',
        'prompt',
        'input_data',
        'output_markdown',
        'output_json',
        'version',
    ];

    /**
     * Os atributos que devem ser convertidos para tipos nativos.
     *
     * @var array
     */
    protected $casts = [
        'input_data' => 'array',
        'output_json' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    /**
     * Obtém o cliente relacionado a este registro.
     */
    public function client()
    {
        return $this->belongsTo(Client::class);
    }
} 