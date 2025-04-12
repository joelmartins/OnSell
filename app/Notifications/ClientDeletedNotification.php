<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ClientDeletedNotification extends Notification implements ShouldQueue
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
            ->subject('Alteração na sua conta')
            ->greeting('Olá ' . $notifiable->name)
            ->line('Informamos que o cliente "' . $this->clientName . '" foi excluído do sistema.')
            ->line('Como resultado, sua conta foi desabilitada temporariamente.')
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
            'title' => 'Cliente excluído',
            'message' => 'O cliente "' . $this->clientName . '" foi excluído e sua conta foi desabilitada temporariamente.',
            'client_name' => $this->clientName
        ];
    }
} 