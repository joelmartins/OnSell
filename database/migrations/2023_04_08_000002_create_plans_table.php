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
            $table->boolean('is_agency_plan')->default(false);
            $table->boolean('is_featured')->default(false)->comment('Exibir na seção de preços da home');
            $table->json('features')->nullable();
            
            // Novos campos de limitação
            $table->integer('monthly_leads')->nullable()->comment('Quantidade de leads que podem ser capturados mensalmente');
            $table->integer('max_landing_pages')->nullable()->comment('Quantidade máxima de landing pages permitidas');
            $table->integer('max_pipelines')->nullable()->comment('Quantidade máxima de pipelines permitidos');
            $table->integer('total_leads')->nullable()->comment('Capacidade total de armazenamento de leads/contatos');
            $table->integer('max_clients')->nullable()->comment('Quantidade máxima de clientes que uma agência pode gerenciar');
            
            // Campos de integração
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