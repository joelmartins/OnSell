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
        Schema::create('plans', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->decimal('price', 10, 2)->default(0);
            $table->string('period')->default('monthly'); // monthly, quarterly, yearly
            $table->foreignId('agency_id')->nullable()->constrained()->nullOnDelete();
            $table->boolean('is_active')->default(true);
            $table->json('features')->nullable();
            $table->integer('max_contacts')->nullable();
            $table->integer('max_pipelines')->nullable();
            $table->integer('max_automation_flows')->nullable();
            $table->boolean('has_whatsapp_integration')->default(false);
            $table->boolean('has_email_integration')->default(false);
            $table->boolean('has_meta_integration')->default(false);
            $table->boolean('has_google_integration')->default(false);
            $table->boolean('has_custom_domain')->default(false);
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('plans');
    }
}; 