<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Form extends Model
{
    use HasFactory;

    /**
     * Os atributos que podem ser atribuídos em massa.
     *
     * @var array<string>
     */
    protected $fillable = [
        'client_id',
        'name',
        'description',
        'submit_button_text',
        'success_message',
        'redirect_url',
        'styles',
        'store_submissions',
        'is_active',
        'webhook_url',
        'embed_code',
    ];

    /**
     * Os atributos que devem ser convertidos para tipos nativos.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'is_active' => 'boolean',
        'store_submissions' => 'boolean',
    ];

    /**
     * Os atributos que devem ser anexados aos resultados da consulta.
     *
     * @var array<string>
     */
    protected $appends = [
        'submission_count',
        'form_url',
    ];

    /**
     * Hook para quando o modelo é criado
     */
    protected static function booted()
    {
        static::created(function (Form $form) {
            // Gerar código de incorporação quando o formulário for criado
            $form->generateEmbedCode();
        });
    }

    /**
     * Obtém o cliente proprietário deste formulário.
     */
    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    /**
     * Obtém os campos deste formulário.
     */
    public function fields(): HasMany
    {
        return $this->hasMany(FormField::class)->orderBy('order');
    }

    /**
     * Obtém as submissões deste formulário.
     */
    public function submissions(): HasMany
    {
        return $this->hasMany(FormSubmission::class);
    }

    /**
     * Gera o código de incorporação para o formulário.
     */
    public function generateEmbedCode(): bool
    {
        $token = Str::random(32);
        $embedCode = '<iframe src="' . route('forms.embed', ['token' => $token]) . '" frameborder="0" width="100%" style="min-height:400px;"></iframe>';
        
        $this->embed_code = $embedCode;
        return $this->save();
    }

    /**
     * Obtém o total de submissões do formulário.
     */
    public function getSubmissionCountAttribute(): int
    {
        return $this->submissions()->count();
    }

    /**
     * Obtém a URL pública do formulário.
     */
    public function getFormUrlAttribute(): string
    {
        return route('forms.show', $this->id);
    }

    /**
     * Verifica se o formulário pertence a um determinado cliente.
     */
    public function belongsToClient(int $clientId): bool
    {
        return $this->client_id === $clientId;
    }
}
