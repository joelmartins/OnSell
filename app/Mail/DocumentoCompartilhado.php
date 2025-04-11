<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Storage;

class DocumentoCompartilhado extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public $remetente;
    public $destinatario;
    public $nomeDocumento;
    public $caminhoDocumento;
    public $mensagem;
    public $urlTemporaria;
    public $anexarDocumento;

    /**
     * Create a new message instance.
     */
    public function __construct(
        User $remetente,
        User $destinatario,
        string $nomeDocumento,
        string $caminhoDocumento,
        string $mensagem = '',
        bool $anexarDocumento = false
    ) {
        $this->remetente = $remetente;
        $this->destinatario = $destinatario;
        $this->nomeDocumento = $nomeDocumento;
        $this->caminhoDocumento = $caminhoDocumento;
        $this->mensagem = $mensagem;
        $this->anexarDocumento = $anexarDocumento;
        
        // Gera uma URL temporária válida por 24 horas para o documento no R2
        $this->urlTemporaria = Storage::disk('r2')->temporaryUrl(
            $this->caminhoDocumento,
            now()->addDay()
        );
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Documento Compartilhado: ' . $this->nomeDocumento,
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.documents.documento-compartilhado',
            with: [
                'remetente' => $this->remetente,
                'destinatario' => $this->destinatario,
                'nomeDocumento' => $this->nomeDocumento,
                'mensagem' => $this->mensagem,
                'urlTemporaria' => $this->urlTemporaria,
            ],
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        if (!$this->anexarDocumento) {
            return [];
        }

        return [
            Attachment::fromStorageDisk('r2', $this->caminhoDocumento)
                ->as($this->nomeDocumento)
                ->withMime(Storage::disk('r2')->mimeType($this->caminhoDocumento)),
        ];
    }
} 