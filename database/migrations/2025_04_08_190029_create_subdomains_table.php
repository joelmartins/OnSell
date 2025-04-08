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
        Schema::create('subdomains', function (Blueprint $table) {
            $table->id();
            $table->foreignId('client_id')->constrained()->cascadeOnDelete();
            $table->string('name')->unique(); // O subdomínio em si (ex: cliente-abc)
            $table->string('domain'); // O domínio principal (ex: onsell.app)
            $table->text('description')->nullable();
            $table->boolean('is_verified')->default(false);
            $table->boolean('is_active')->default(true);
            $table->boolean('ssl_enabled')->default(true);
            $table->string('cname_record')->nullable(); // O registro CNAME que o cliente precisa adicionar
            $table->timestamp('verified_at')->nullable();
            $table->timestamp('expires_at')->nullable(); // Se o subdomínio tem validade
            $table->timestamps();
            
            // Índice composto para garantir a unicidade do subdomínio completo
            $table->unique(['name', 'domain']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('subdomains');
    }
};
