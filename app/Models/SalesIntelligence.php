<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class SalesIntelligence extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * Nome da tabela no banco de dados.
     *
     * @var string
     */
    protected $table = 'sales_intelligence';

    /**
     * Os atributos que são atribuíveis em massa.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'agency_id',
        'user_id',
        'customer_answers',
        'ai_analysis',
    ];

    /**
     * Os atributos que devem ser convertidos para tipos nativos.
     *
     * @var array
     */
    protected $casts = [
        'customer_answers' => 'array',
        'ai_analysis' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

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