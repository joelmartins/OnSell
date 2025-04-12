<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ClientRestoredNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected $clientName;

    /**
     * Create a new notification instance.
     *
     * @return void
     */
    public function __construct($clientName)
    {
        $this->clientName = $clientName;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @param  mixed  $notifiable
     * @return array
     */
    public function via($notifiable)
    {
        return ['mail', 'database'];
    }

    /**
     * Get the mail representation of the notification.
     *
     * @param  mixed  $notifiable
     * @return \Illuminate\Notifications\Messages\MailMessage
     */
    public function toMail($notifiable)
    {
        return (new MailMessage)
            ->subject('Sua conta foi reativada')
            ->greeting('Olá ' . $notifiable->name)
            ->line('Informamos que o cliente "' . $this->clientName . '" foi restaurado no sistema.')
            ->line('Como resultado, sua conta foi reativada e você já pode acessar o sistema normalmente.')
            ->line('Para maiores informações, entre em contato com o administrador do sistema.')
            ->salutation('Atenciosamente, Equipe OnSell');
    }

    /**
     * Get the array representation of the notification.
     *
     * @param  mixed  $notifiable
     * @return array
     */
    public function toArray($notifiable)
    {
        return [
            'title' => 'Cliente restaurado',
            'message' => 'O cliente "' . $this->clientName . '" foi restaurado e sua conta foi reativada.',
            'client_name' => $this->clientName
        ];
    }
} 