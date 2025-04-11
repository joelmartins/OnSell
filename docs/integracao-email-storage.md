# Integração com Resend e Cloudflare R2

Este documento explica como configurar e usar as integrações com Resend para envio de e-mails e Cloudflare R2 para armazenamento de arquivos no OnSell.

## Configuração do Resend (E-mail)

O Resend é uma plataforma moderna para envio de e-mails transacionais. Para configurá-lo:

1. Crie uma conta no [Resend](https://resend.com)
2. Obtenha sua API Key no painel do Resend
3. Configure seu domínio e verifique-o seguindo as instruções da plataforma
4. Adicione a API Key ao arquivo `.env`:

```
MAIL_MAILER=resend
RESEND_API_KEY=sua_api_key_aqui
MAIL_FROM_ADDRESS=seu-email@seudominio.com
MAIL_FROM_NAME=OnSell
```

### Teste da Integração com Resend

Para testar a integração com o Resend, execute o comando:

```bash
php artisan test:resend-email seu-email@exemplo.com
```

## Configuração do Cloudflare R2 (Armazenamento)

O Cloudflare R2 é uma solução de armazenamento compatível com S3, sem custos de egress. Para configurá-lo:

1. Crie uma conta no [Cloudflare](https://www.cloudflare.com/)
2. Vá até R2 e crie um bucket
3. Crie uma chave de API com permissões para o bucket
4. Adicione as configurações ao arquivo `.env`:

```
R2_ACCESS_KEY_ID=sua_access_key_id
R2_SECRET_ACCESS_KEY=sua_secret_access_key
R2_DEFAULT_REGION=auto
R2_BUCKET=nome_do_seu_bucket
R2_URL=https://nome_do_seu_bucket.seu_account_id.r2.cloudflarestorage.com
R2_ENDPOINT=https://seu_account_id.r2.cloudflarestorage.com
R2_USE_PATH_STYLE_ENDPOINT=true
```

Para alterar o disco padrão de armazenamento para R2, atualize a seguinte linha:

```
FILESYSTEM_DISK=r2
```

### Teste da Integração com Cloudflare R2

Para testar a integração com o Cloudflare R2, execute o comando:

```bash
php artisan test:r2-storage
```

Este comando irá testar as operações de upload, download e exclusão de arquivos no R2.

## Uso na Aplicação

### Envio de E-mails

```php
use Illuminate\Support\Facades\Mail;
use App\Mail\NotificacaoExemplo;

// Envio de e-mail usando uma Mailable
Mail::to('usuario@exemplo.com')->send(new NotificacaoExemplo($dados));

// Envio de e-mail simples
Mail::raw('Conteúdo do e-mail', function($message) {
    $message->to('usuario@exemplo.com')
            ->subject('Assunto do e-mail');
});
```

### Upload de Arquivos para R2

```php
use Illuminate\Support\Facades\Storage;

// Upload de um arquivo
Storage::disk('r2')->put('caminho/arquivo.txt', $conteudo);

// Upload de um arquivo do formulário
$path = $request->file('arquivo')->store('uploads', 'r2');

// Gerar URL temporária (signed URL)
$url = Storage::disk('r2')->temporaryUrl('caminho/arquivo.txt', now()->addMinutes(30));

// Verificar se um arquivo existe
if (Storage::disk('r2')->exists('caminho/arquivo.txt')) {
    // ...
}

// Excluir um arquivo
Storage::disk('r2')->delete('caminho/arquivo.txt');
```

## Solução de Problemas

### Resend
- Verifique se a API Key está correta
- Confirme se o domínio foi verificado corretamente
- Verifique os logs em `storage/logs/laravel.log`

### Cloudflare R2
- Verifique se as credenciais estão corretas
- Confirme se o bucket existe e está acessível
- Verifique se os endpoints estão formatados corretamente
- Verifique os logs em `storage/logs/laravel.log` 