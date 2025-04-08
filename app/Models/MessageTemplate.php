<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Stancl\Tenancy\Database\Concerns\BelongsToTenant;

class MessageTemplate extends Model
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
        'type',
        'content',
        'variables',
        'media',
        'active',
    ];

    /**
     * Os atributos que devem ser convertidos.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'variables' => 'array',
        'media' => 'array',
        'active' => 'boolean',
    ];

    /**
     * Escopo para templates de WhatsApp.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeWhatsapp($query)
    {
        return $query->where('type', 'whatsapp');
    }

    /**
     * Escopo para templates de e-mail.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeEmail($query)
    {
        return $query->where('type', 'email');
    }

    /**
     * Escopo para templates de SMS.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeSms($query)
    {
        return $query->where('type', 'sms');
    }

    /**
     * Escopo para templates ativos.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeActive($query)
    {
        return $query->where('active', true);
    }

    /**
     * Verificar se este template é do tipo WhatsApp.
     *
     * @return bool
     */
    public function isWhatsapp(): bool
    {
        return $this->type === 'whatsapp';
    }

    /**
     * Verificar se este template é do tipo e-mail.
     *
     * @return bool
     */
    public function isEmail(): bool
    {
        return $this->type === 'email';
    }

    /**
     * Verificar se este template é do tipo SMS.
     *
     * @return bool
     */
    public function isSms(): bool
    {
        return $this->type === 'sms';
    }

    /**
     * Processar o conteúdo do template com as variáveis fornecidas.
     *
     * @param  array  $variables
     * @return string
     */
    public function processContent(array $variables): string
    {
        $content = $this->content;

        foreach ($variables as $key => $value) {
            $content = str_replace('{{' . $key . '}}', $value, $content);
        }

        // Remover variáveis não processadas
        $content = preg_replace('/\{\{[^}]+\}\}/', '', $content);

        return $content;
    }
} 