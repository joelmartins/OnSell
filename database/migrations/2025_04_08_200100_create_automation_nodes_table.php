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
        Schema::create('automation_nodes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('automation_id')->constrained()->cascadeOnDelete();
            $table->string('node_id')->comment('ID único do nó no fluxo');
            $table->enum('type', [
                'trigger', 
                'action', 
                'condition', 
                'delay',
                'group'
            ]);
            $table->string('name')->nullable();
            $table->json('config')->nullable();
            $table->integer('position_x')->default(0);
            $table->integer('position_y')->default(0);
            $table->timestamps();
            
            $table->unique(['automation_id', 'node_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('automation_nodes');
    }
}; 