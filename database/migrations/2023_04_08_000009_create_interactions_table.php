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
        Schema::create('interactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('contact_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('channel'); // whatsapp, email, sms, phone, chat, facebook, instagram
            $table->string('direction'); // in, out
            $table->text('content');
            $table->json('metadata')->nullable();
            $table->string('external_id')->nullable()->index();
            $table->boolean('is_read')->default(false);
            $table->string('sentiment')->nullable(); // positive, negative, neutral
            $table->boolean('ai_processed')->default(false);
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('interactions');
    }
}; 