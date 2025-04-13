<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('subscriptions', function (Blueprint $table) {
            $table->id();
            $table->morphs('subscriber'); // Pode ser client ou agency
            $table->foreignId('plan_id')->constrained('plans');
            $table->date('start_date');
            $table->date('end_date')->nullable();
            $table->date('trial_ends_at')->nullable();
            $table->enum('status', ['active', 'trial', 'canceled', 'expired'])->default('trial');
            $table->boolean('is_trial')->default(true);
            $table->string('billing_frequency')->default('monthly'); // monthly, yearly
            $table->decimal('price', 10, 2);
            $table->date('next_billing_date')->nullable();
            $table->boolean('auto_renew')->default(false);
            $table->text('cancellation_reason')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('subscriptions');
    }
};
