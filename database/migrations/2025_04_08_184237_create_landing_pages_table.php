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
        Schema::create('landing_pages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('client_id')->constrained()->cascadeOnDelete();
            $table->foreignId('template_id')->nullable()->constrained('landing_page_templates')->nullOnDelete();
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('slug')->unique();
            $table->longText('content');
            $table->longText('css')->nullable();
            $table->longText('js')->nullable();
            $table->boolean('is_active')->default(true);
            $table->string('meta_title')->nullable();
            $table->text('meta_description')->nullable();
            $table->text('thank_you_message')->nullable();
            $table->string('thank_you_redirect_url')->nullable();
            $table->string('primary_color')->default('#3B82F6');
            $table->string('secondary_color')->default('#10B981');
            $table->string('button_text')->default('Enviar');
            $table->unsignedInteger('views_count')->default(0);
            $table->unsignedInteger('leads_count')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('landing_pages');
    }
};
