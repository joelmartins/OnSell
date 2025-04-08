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
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $rules = [
            'name' => 'required|string|min:3|max:255',
            'email' => 'required|string|email|max:255',
            'phone' => 'nullable|string|max:20',
            'document' => 'nullable|string|max:20',
            'description' => 'nullable|string',
            'domain' => 'nullable|string|min:3|max:255',
            'parent_agency_id' => 'nullable|exists:agencies,id',
            'is_active' => 'boolean',
            'primary_color' => 'nullable|string|regex:/^#[0-9A-Fa-f]{6}$/',
            'secondary_color' => 'nullable|string|regex:/^#[0-9A-Fa-f]{6}$/',
            'accent_color' => 'nullable|string|regex:/^#[0-9A-Fa-f]{6}$/',
            
            // Campos do usuário
            'create_user' => 'sometimes|boolean',
            'user_name' => 'required_if:create_user,true|string|min:3|max:255',
            'user_email' => 'required_if:create_user,true|string|email|max:255|unique:users,email',
            'user_password' => 'required_if:create_user,true|string|min:8',
        ];
        
        // Se estamos atualizando uma agência existente
        if ($this->isMethod('PUT') || $this->isMethod('PATCH')) {
            // Adicionar regra para verificar se a agência não está definindo a si mesma como pai
            $rules['parent_agency_id'] .= '|different:id';
        }
        
        return $rules;
    }

    /**
     * Get custom attributes for validator errors.
     *
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'name' => 'nome da agência',
            'email' => 'email',
            'phone' => 'telefone',
            'document' => 'CNPJ/CPF',
            'description' => 'descrição',
            'domain' => 'domínio',
            'parent_agency_id' => 'agência pai',
            'is_active' => 'status ativo',
            'primary_color' => 'cor primária',
            'secondary_color' => 'cor secundária',
            'accent_color' => 'cor de destaque',
            'create_user' => 'criar usuário',
            'user_name' => 'nome do usuário',
            'user_email' => 'email do usuário',
            'user_password' => 'senha do usuário',
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