<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AgencyRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->hasRole('admin.super');
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        $agency = $this->route('agency');
        $agencyId = $agency ? $agency->id : null;
        
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => [
                'required', 
                'string', 
                'email', 
                'max:255', 
                Rule::unique('agencies', 'email')->ignore($agencyId)
            ],
            'phone' => ['nullable', 'string', 'max:20'],
            'document' => ['nullable', 'string', 'max:20'],
            'description' => ['nullable', 'string'],
            'domain' => [
                'nullable', 
                'string', 
                'max:255', 
                Rule::unique('agencies', 'domain')->ignore($agencyId)
            ],
            'is_active' => ['required', 'boolean'],
            'parent_agency_id' => ['nullable', 'exists:agencies,id'],
            'primary_color' => ['nullable', 'string', 'max:20'],
            'secondary_color' => ['nullable', 'string', 'max:20'],
            'accent_color' => ['nullable', 'string', 'max:20'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'name.required' => 'O nome da agência é obrigatório.',
            'email.required' => 'O email da agência é obrigatório.',
            'email.email' => 'O email deve ser um endereço válido.',
            'email.unique' => 'Este email já está sendo utilizado por outra agência.',
            'domain.unique' => 'Este domínio já está sendo utilizado por outra agência.',
            'parent_agency_id.exists' => 'A agência pai selecionada não existe.',
        ];
    }
} 