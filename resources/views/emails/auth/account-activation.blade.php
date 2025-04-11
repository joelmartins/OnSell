@extends('emails.layouts.base')

@section('title', 'Ativação de Conta')

@section('content')
<p>Olá, <strong>{{ $user->name }}</strong>!</p>

<p>Obrigado por se registrar em {{ config('app.name') }}! Para começar a usar sua conta, é necessário ativá-la clicando no botão abaixo:</p>

<p style="text-align: center;">
    <a href="{{ $activationUrl }}" class="btn" target="_blank">Ativar Minha Conta</a>
</p>

<div class="info-box">
    <p><strong>Importante:</strong> Este link é válido por 24 horas. Após este período, você precisará solicitar um novo link de ativação.</p>
</div>

<p>Se o botão acima não funcionar, copie e cole o seguinte link no seu navegador:</p>
<p style="word-break: break-all;">{{ $activationUrl }}</p>

<p>Se você não criou uma conta em nossa plataforma, por favor, ignore este e-mail.</p>

<p>Se tiver alguma dúvida ou precisar de ajuda, não hesite em entrar em contato com nossa equipe de suporte.</p>
@endsection 