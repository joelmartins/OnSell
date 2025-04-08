<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class LandingPageTemplate extends Model
{
    use HasFactory;

    /**
     * Os atributos que podem ser atribuídos em massa.
     *
     * @var array<string>
     */
    protected $fillable = [
        'name',
        'description',
        'thumbnail',
        'content',
        'css',
        'js',
        'category',
        'is_active',
        'is_premium',
    ];

    /**
     * Os atributos que devem ser convertidos para tipos nativos.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'is_active' => 'boolean',
        'is_premium' => 'boolean',
    ];

    /**
     * Obtenha as landing pages que usam este template.
     */
    public function landingPages(): HasMany
    {
        return $this->hasMany(LandingPage::class, 'template_id');
    }

    /**
     * Categorias de templates disponíveis.
     *
     * @return array
     */
    public static function categories(): array
    {
        return [
            'lead-capture' => 'Captura de Leads',
            'product-landing' => 'Página de Produto',
            'event-registration' => 'Eventos',
            'webinar-registration' => 'Webinar',
            'ebook-download' => 'Download de E-book',
            'service-presentation' => 'Apresentação de Serviço',
            'thank-you' => 'Página de Agradecimento',
            'coming-soon' => 'Em Breve',
            'error-404' => 'Página de Erro 404',
            'other' => 'Outros',
        ];
    }

    /**
     * Obtenha o nome formatado da categoria.
     *
     * @return string
     */
    public function getCategoryNameAttribute(): string
    {
        $categories = self::categories();
        return $categories[$this->category] ?? 'Outros';
    }
} 