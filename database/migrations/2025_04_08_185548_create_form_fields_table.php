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
        Schema::create('form_fields', function (Blueprint $table) {
            $table->id();
            $table->foreignId('form_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('label');
            $table->string('type'); // text, email, tel, number, select, textarea, checkbox, radio, etc.
            $table->string('placeholder')->nullable();
            $table->text('options')->nullable(); // Para select, checkbox, radio (JSON)
            $table->text('validation_rules')->nullable(); // required, min, max, email, etc. (JSON)
            $table->text('error_messages')->nullable(); // Mensagens de erro personalizadas (JSON)
            $table->string('default_value')->nullable();
            $table->string('css_class')->nullable();
            $table->string('map_to_contact_field')->nullable(); // Mapeia para o campo do contato/lead no CRM
            $table->integer('order')->default(0);
            $table->boolean('is_required')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('form_fields');
    }
};
