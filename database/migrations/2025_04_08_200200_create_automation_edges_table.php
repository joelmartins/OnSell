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
        Schema::create('automation_edges', function (Blueprint $table) {
            $table->id();
            $table->foreignId('automation_id')->constrained()->cascadeOnDelete();
            $table->string('edge_id')->comment('ID único da conexão no fluxo');
            $table->string('source_node_id');
            $table->string('target_node_id');
            $table->string('source_handle')->nullable()->comment('Handle de saída do nó fonte');
            $table->string('target_handle')->nullable()->comment('Handle de entrada do nó alvo');
            $table->string('label')->nullable();
            $table->json('config')->nullable();
            $table->timestamps();
            
            $table->unique(['automation_id', 'edge_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('automation_edges');
    }
}; 