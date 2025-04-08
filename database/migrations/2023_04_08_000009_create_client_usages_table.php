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
        Schema::create('client_usages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('client_id')->constrained()->cascadeOnDelete();
            $table->integer('year');
            $table->integer('month');
            $table->integer('contacts_count')->default(0);
            $table->integer('pipelines_count')->default(0);
            $table->integer('automation_flows_count')->default(0);
            $table->timestamps();

            // Índice único para garantir apenas um registro por cliente/mês/ano
            $table->unique(['client_id', 'year', 'month']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('client_usages');
    }
}; 