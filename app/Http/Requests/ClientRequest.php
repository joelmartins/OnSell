<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ClientRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->hasRole('admin.super') || $this->user()->hasRole('agency.owner');
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        $client = $this->route('client');
        $clientId = $client ? $client->id : null;
        
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => [
                'required', 
                'string', 
                'email', 
                'max:255', 
                Rule::unique('clients', 'email')->ignore($clientId)
            ],
            'phone' => ['nullable', 'string', 'max:20'],
            'document' => ['nullable', 'string', 'max:20'],
            'description' => ['nullable', 'string'],
            'is_active' => ['required', 'boolean'],
            'agency_id' => ['nullable', 'exists:agencies,id'],
            'plan_id' => ['nullable', 'exists:plans,id'],
            
            // Campos do usuário
            'create_user' => 'sometimes|boolean',
            'user_name' => 'required_if:create_user,true|string|min:3|max:255',
            'user_email' => 'required_if:create_user,true|string|email|max:255|unique:users,email',
            'user_password' => 'required_if:create_user,true|string|min:8',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'name.required' => 'O nome é obrigatório.',
            'email.required' => 'O e-mail é obrigatório.',
            'email.email' => 'Informe um e-mail válido.',
            'email.unique' => 'Este e-mail já está em uso.',
            'agency_id.exists' => 'A agência selecionada não existe.',
            'plan_id.exists' => 'O plano selecionado não existe.',
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'name' => 'nome do cliente',
            'email' => 'email',
            'phone' => 'telefone',
            'document' => 'CNPJ/CPF',
            'description' => 'descrição',
            'is_active' => 'status ativo',
            'agency_id' => 'agência',
            'plan_id' => 'plano',
            'create_user' => 'criar usuário',
            'user_name' => 'nome do usuário',
            'user_email' => 'email do usuário',
            'user_password' => 'senha do usuário',
        ];
    }
} 