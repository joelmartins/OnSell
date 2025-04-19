<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Model para entregáveis de inteligência de vendas (apenas para clientes)
 * Representa cada tipo de entregável gerado pelo sistema de inteligência de vendas.
 */
class IntelligenceDeliverable extends Model
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
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'client_id',
        'agency_id',
        'user_id',
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

    /**
     * Obtém a agência relacionada a este registro.
     */
    public function agency()
    {
        return $this->belongsTo(Agency::class);
    }

    /**
     * Obtém o usuário relacionado a este registro.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
} 