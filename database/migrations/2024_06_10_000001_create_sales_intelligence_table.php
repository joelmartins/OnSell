<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Tabela para respostas brutas do formulário
        Schema::create('intelligence_answers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('agency_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('client_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->json('answers'); // Respostas do formulário (campos simples)
            $table->timestamps();
            $table->softDeletes();
        });

        // Tabela para entregáveis IA (um registro por tipo de entregável)
        Schema::create('intelligence_deliverables', function (Blueprint $table) {
            $table->id();
            $table->foreignId('agency_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('client_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('type'); // Ex: product_definition, icp_profile, scripts, etc.
            $table->text('prompt'); // Prompt usado para gerar o entregável
            $table->json('input_data')->nullable(); // Dados de entrada (respostas do formulário)
            $table->longText('output_markdown')->nullable(); // Resposta da IA ou edição manual (markdown)
            $table->json('output_json')->nullable(); // Estrutura JSON opcional para campos estruturados
            $table->integer('version')->default(1);
            $table->timestamps();
            $table->softDeletes();
        });

        // Remover tabela antiga
        Schema::dropIfExists('sales_intelligence');
    }

    public function down(): void
    {
        Schema::dropIfExists('intelligence_deliverables');
        Schema::dropIfExists('intelligence_answers');
        // (Opcional) recriar sales_intelligence se necessário
    }
}; 