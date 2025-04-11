@extends('emails.layouts.base')

@section('title', 'Documento Compartilhado')

@section('content')
<p>Olá, <strong>{{ $recipient->name ?? 'Cliente' }}</strong>!</p>

<p>Um novo documento foi compartilhado com você por <strong>{{ $sender->name }}</strong> da <strong>{{ $agency->name }}</strong>.</p>

<div class="info-box">
    <p><strong>Documento:</strong> {{ $document->title }}</p>
    <p><strong>Descrição:</strong> {{ $document->description }}</p>
    @if(isset($message) && !empty($message))
    <p><strong>Mensagem:</strong> {{ $message }}</p>
    @endif
</div>

<p>Para visualizar e acessar o documento, clique no botão abaixo:</p>

<p style="text-align: center;">
    <a href="{{ $url }}" class="btn" target="_blank">Visualizar Documento</a>
</p>

@if(isset($expiresAt))
<div class="alert-box">
    <p><strong>Atenção:</strong> Este link de acesso expira em {{ $expiresAt->format('d/m/Y \à\s H:i') }}.</p>
</div>
@endif

<p>Se o botão acima não funcionar, copie e cole o seguinte link no seu navegador:</p>
<p style="word-break: break-all;">{{ $url }}</p>

<p>Se você tiver alguma dúvida ou precisar de ajuda, não hesite em entrar em contato com a equipe de suporte.</p>
@endsection 