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
        Schema::create('forms', function (Blueprint $table) {
            $table->id();
            $table->foreignId('client_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('submit_button_text')->default('Enviar');
            $table->text('success_message')->nullable();
            $table->string('redirect_url')->nullable();
            $table->longText('styles')->nullable();
            $table->boolean('store_submissions')->default(true);
            $table->boolean('is_active')->default(true);
            $table->string('webhook_url')->nullable();
            $table->string('embed_code')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('forms');
    }
};
