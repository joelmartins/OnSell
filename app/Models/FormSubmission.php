<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FormSubmission extends Model
{
    use HasFactory;

    /**
     * Os atributos que podem ser atribuídos em massa.
     *
     * @var array<string>
     */
    protected $fillable = [
        'form_id',
        'contact_id',
        'data',
        'ip_address',
        'user_agent',
        'referer_url',
        'page_url',
        'utm_source',
        'utm_medium',
        'utm_campaign',
        'utm_term',
        'utm_content',
        'is_processed',
        'processed_at',
    ];

    /**
     * Os atributos que devem ser convertidos para tipos nativos.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'data' => 'array',
        'is_processed' => 'boolean',
        'processed_at' => 'datetime',
    ];

    /**
     * Obtenha o formulário associado a esta submissão.
     */
    public function form(): BelongsTo
    {
        return $this->belongsTo(Form::class);
    }

    /**
     * Obtenha o contato criado a partir desta submissão.
     */
    public function contact(): BelongsTo
    {
        return $this->belongsTo(Contact::class);
    }

    /**
     * Marca a submissão como processada.
     *
     * @param int|null $contactId ID do contato criado
     * @return bool
     */
    public function markAsProcessed(?int $contactId = null): bool
    {
        $this->is_processed = true;
        $this->processed_at = now();
        
        if ($contactId) {
            $this->contact_id = $contactId;
        }
        
        return $this->save();
    }

    /**
     * Obtenha um valor específico da submissão.
     *
     * @param string $key
     * @return mixed|null
     */
    public function getValue(string $key)
    {
        return $this->data[$key] ?? null;
    }

    /**
     * Formata os dados UTM para exibição.
     *
     * @return array
     */
    public function getUtmData(): array
    {
        return array_filter([
            'UTM Source' => $this->utm_source,
            'UTM Medium' => $this->utm_medium,
            'UTM Campaign' => $this->utm_campaign,
            'UTM Term' => $this->utm_term,
            'UTM Content' => $this->utm_content,
        ]);
    }
}
