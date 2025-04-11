@extends('emails.layouts.base')

@section('title', 'Boas-vindas, ' . $user->name . '!')

@section('content')
<p>Olá, <strong>{{ $user->name }}</strong>!</p>

<p>Bem-vindo(a) à plataforma <strong>{{ $agency->name }}</strong>! Estamos animados em ter você conosco.</p>

<p>Sua conta foi criada com sucesso, e você já pode começar a utilizar nossa plataforma. Aqui estão suas credenciais de acesso:</p>

<div class="credentials-box">
    <p><strong>Email:</strong> {{ $user->email }}</p>
    <p><strong>Senha temporária:</strong></p>
    <p class="password">{{ $password }}</p>
    <p><em>Por questões de segurança, recomendamos que você altere sua senha após o primeiro acesso.</em></p>
</div>

<p>Para acessar a plataforma, clique no botão abaixo:</p>

<p style="text-align: center;">
    <a href="{{ $loginUrl }}" class="btn" target="_blank">Acessar a Plataforma</a>
</p>

<p>Se você tiver alguma dúvida ou precisar de ajuda, não hesite em entrar em contato com nossa equipe de suporte.</p>
@endsection 