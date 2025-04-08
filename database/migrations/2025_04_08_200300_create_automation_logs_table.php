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
        Schema::create('automation_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('automation_id')->constrained()->cascadeOnDelete();
            $table->foreignId('contact_id')->nullable()->constrained();
            $table->foreignId('opportunity_id')->nullable()->constrained();
            $table->string('node_id')->nullable()->comment('ID do nó que está sendo executado');
            $table->enum('status', ['pending', 'running', 'completed', 'failed', 'skipped']);
            $table->string('message')->nullable();
            $table->json('context')->nullable();
            $table->json('result')->nullable();
            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
            
            $table->index(['automation_id', 'contact_id']);
            $table->index(['automation_id', 'opportunity_id']);
            $table->index(['automation_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('automation_logs');
    }
}; 