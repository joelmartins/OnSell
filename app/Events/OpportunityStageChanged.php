<?php

namespace App\Events;

use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use App\Models\Opportunity;
use App\Models\Stage;

class OpportunityStageChanged
{
    use Dispatchable, SerializesModels;

    public $opportunity;
    public $oldStage;
    public $newStage;

    /**
     * Create a new event instance.
     */
    public function __construct(Opportunity $opportunity, ?Stage $oldStage, Stage $newStage)
    {
        $this->opportunity = $opportunity;
        $this->oldStage = $oldStage;
        $this->newStage = $newStage;
    }
} 