@extends('emails.layouts.base')

@section('title', 'Recuperação de Senha')

@section('content')
<p>Olá, <strong>{{ $user->name }}</strong>!</p>

<p>Recebemos uma solicitação para redefinir a senha da sua conta. Para continuar o processo, clique no botão abaixo:</p>

<p style="text-align: center;">
    <a href="{{ $url }}" class="btn" target="_blank">Redefinir Senha</a>
</p>

<div class="alert-box">
    <p><strong>Importante:</strong> Este link é válido por 60 minutos. Se você não solicitou a redefinição de senha, por favor, ignore este e-mail.</p>
</div>

<p>Se o botão acima não funcionar, copie e cole o seguinte link no seu navegador:</p>
<p style="word-break: break-all;">{{ $url }}</p>

<p>Se você tiver alguma dúvida ou precisar de ajuda, não hesite em entrar em contato com nossa equipe de suporte.</p>
@endsection 