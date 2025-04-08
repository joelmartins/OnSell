<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'resend' => [
        'key' => env('RESEND_KEY'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Evolution API (WhatsApp)
    |--------------------------------------------------------------------------
    |
    | Configurações para a Evolution API, que é usada para integração com
    | WhatsApp. Inclui URL base da API, chave de autenticação, nome da 
    | instância padrão e URL do webhook para receber mensagens.
    |
    */
    'evolution_api' => [
        'url' => env('EVOLUTION_API_URL', 'http://localhost:8080'),
        'key' => env('EVOLUTION_API_KEY'),
        'default_instance' => env('EVOLUTION_API_DEFAULT_INSTANCE', 'default'),
        'webhook_url' => env('EVOLUTION_API_WEBHOOK_URL'),
    ],

    /*
    |--------------------------------------------------------------------------
    | VAPI (Telefonia)
    |--------------------------------------------------------------------------
    |
    | Configurações para a API de telefonia VAPI, usada para chamadas
    | de voz, SMS e outras integrações de telefonia. Inclui URL base
    | da API, chave de autenticação e URL do webhook.
    |
    */
    'vapi' => [
        'url' => env('VAPI_API_URL', 'https://api.vapi.com/v1'),
        'key' => env('VAPI_API_KEY'),
        'webhook_url' => env('VAPI_WEBHOOK_URL'),
    ],

];
