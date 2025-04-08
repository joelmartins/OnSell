<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FormField extends Model
{
    use HasFactory;

    /**
     * Os atributos que podem ser atribuídos em massa.
     *
     * @var array<string>
     */
    protected $fillable = [
        'form_id',
        'name',
        'label',
        'type',
        'placeholder',
        'options',
        'validation_rules',
        'error_messages',
        'default_value',
        'css_class',
        'map_to_contact_field',
        'order',
        'is_required',
    ];

    /**
     * Os atributos que devem ser convertidos para tipos nativos.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'options' => 'array',
        'validation_rules' => 'array',
        'error_messages' => 'array',
        'is_required' => 'boolean',
        'order' => 'integer',
    ];

    /**
     * Constantes para tipos de campos
     */
    const TYPE_TEXT = 'text';
    const TYPE_TEXTAREA = 'textarea';
    const TYPE_EMAIL = 'email';
    const TYPE_TEL = 'tel';
    const TYPE_NUMBER = 'number';
    const TYPE_SELECT = 'select';
    const TYPE_CHECKBOX = 'checkbox';
    const TYPE_RADIO = 'radio';
    const TYPE_DATE = 'date';
    const TYPE_FILE = 'file';
    const TYPE_HIDDEN = 'hidden';
    const TYPE_PASSWORD = 'password';
    const TYPE_CPFCNPJ = 'cpfcnpj';

    /**
     * Obtenha o formulário proprietário deste campo.
     */
    public function form(): BelongsTo
    {
        return $this->belongsTo(Form::class);
    }

    /**
     * Obtenha os tipos de campos disponíveis
     * 
     * @return array
     */
    public static function getFieldTypes(): array
    {
        return [
            self::TYPE_TEXT => 'Texto',
            self::TYPE_TEXTAREA => 'Área de texto',
            self::TYPE_EMAIL => 'E-mail',
            self::TYPE_TEL => 'Telefone',
            self::TYPE_NUMBER => 'Número',
            self::TYPE_SELECT => 'Lista suspensa',
            self::TYPE_CHECKBOX => 'Caixa de seleção',
            self::TYPE_RADIO => 'Opções (Radio)',
            self::TYPE_DATE => 'Data',
            self::TYPE_FILE => 'Arquivo',
            self::TYPE_HIDDEN => 'Campo oculto',
            self::TYPE_CPFCNPJ => 'CPF/CNPJ',
        ];
    }

    /**
     * Obtenha os campos do contato disponíveis para mapeamento
     * 
     * @return array
     */
    public static function getContactFieldsMapping(): array
    {
        return [
            'name' => 'Nome',
            'email' => 'E-mail',
            'phone' => 'Telefone',
            'address' => 'Endereço',
            'city' => 'Cidade',
            'state' => 'Estado',
            'zip' => 'CEP',
            'company' => 'Empresa',
            'job_title' => 'Cargo',
            'document' => 'CPF/CNPJ',
            'website' => 'Website',
            'instagram' => 'Instagram',
            'facebook' => 'Facebook',
            'linkedin' => 'LinkedIn',
            'twitter' => 'Twitter',
            'custom_field_1' => 'Campo personalizado 1',
            'custom_field_2' => 'Campo personalizado 2',
            'custom_field_3' => 'Campo personalizado 3',
        ];
    }
}
