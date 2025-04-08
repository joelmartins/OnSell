<?php

namespace App\Events;

use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use App\Models\Contact;

class ContactCreated
{
    use Dispatchable, SerializesModels;

    public $contact;
    public $source;

    /**
     * Create a new event instance.
     */
    public function __construct(Contact $contact, ?string $source = null)
    {
        $this->contact = $contact;
        $this->source = $source;
    }
} 