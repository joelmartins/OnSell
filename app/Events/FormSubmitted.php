<?php

namespace App\Events;

use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use App\Models\Form;
use App\Models\FormSubmission;
use App\Models\Contact;

class FormSubmitted
{
    use Dispatchable, SerializesModels;

    public $form;
    public $submission;
    public $contact;
    public $formData;

    /**
     * Create a new event instance.
     */
    public function __construct(Form $form, FormSubmission $submission, Contact $contact, array $formData = [])
    {
        $this->form = $form;
        $this->submission = $submission;
        $this->contact = $contact;
        $this->formData = $formData;
    }
} 