<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sales_intelligence', function (Blueprint $table) {
            $table->id();
            $table->foreignId('agency_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('client_id')->nullable()->constrained()->nullOnDelete();
            $table->string('product')->nullable();
            $table->json('icp')->nullable();
            $table->json('decision_maker')->nullable();
            $table->string('decision_profile')->nullable();
            $table->string('communication_tone')->nullable();
            $table->json('pains')->nullable();
            $table->json('desires')->nullable();
            $table->json('objections')->nullable();
            $table->json('emotional_triggers')->nullable();
            $table->json('copy_anchors')->nullable();
            $table->json('access_strategies')->nullable();
            $table->json('customer_answers')->nullable();
            $table->json('ai_analysis')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sales_intelligence');
    }
}; 