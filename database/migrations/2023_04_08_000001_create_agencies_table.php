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
        Schema::create('agencies', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('document')->nullable();
            $table->string('email');
            $table->string('phone')->nullable();
            $table->text('description')->nullable();
            $table->string('domain')->nullable()->unique();
            $table->boolean('is_active')->default(true);
            $table->foreignId('parent_agency_id')->nullable()->constrained('agencies')->nullOnDelete();
            
            // Campos de branding
            $table->string('logo')->nullable();
            $table->string('favicon')->nullable();
            $table->string('primary_color', 20)->default('#3b82f6');
            $table->string('secondary_color', 20)->default('#10b981');
            $table->string('accent_color', 20)->default('#f97316');
            
            $table->string('stripe_account_id')->nullable()->index();
            
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('agencies');
    }
}; 