<?php

namespace App\Providers;

use Illuminate\Auth\Events\Registered;
use Illuminate\Auth\Listeners\SendEmailVerificationNotification;
use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Event;

// Eventos de Automação
use App\Events\FormSubmitted;
use App\Events\OpportunityStageChanged;
use App\Events\ContactCreated;

// Listeners de Automação
use App\Listeners\TriggerAutomationsOnFormSubmission;
use App\Listeners\TriggerAutomationsOnStageChange;
use App\Listeners\TriggerAutomationsOnContactCreated;

class EventServiceProvider extends ServiceProvider
{
    /**
     * The event to listener mappings for the application.
     *
     * @var array<class-string, array<int, class-string>>
     */
    protected $listen = [
        Registered::class => [
            SendEmailVerificationNotification::class,
        ],
        
        // Eventos de automação
        FormSubmitted::class => [
            TriggerAutomationsOnFormSubmission::class,
        ],
        
        OpportunityStageChanged::class => [
            TriggerAutomationsOnStageChange::class,
        ],
        
        ContactCreated::class => [
            TriggerAutomationsOnContactCreated::class,
        ],
    ];

    /**
     * Register any events for your application.
     */
    public function boot(): void
    {
        //
    }

    /**
     * Determine if events and listeners should be automatically discovered.
     */
    public function shouldDiscoverEvents(): bool
    {
        return false;
    }
} 