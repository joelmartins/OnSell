<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->text('value')->nullable();
            $table->string('type')->default('string'); // string, boolean, json, integer, etc.
            $table->text('description')->nullable();
            $table->boolean('is_public')->default(false); // indica se pode ser exposto publicamente
            $table->timestamps();
        });

        // Inserir configurações padrão
        $this->seedDefaultSettings();
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('settings');
    }

    /**
     * Seed default settings.
     */
    private function seedDefaultSettings(): void
    {
        $settings = [
            [
                'key' => 'branding.primary_color',
                'value' => '#3b82f6',
                'type' => 'string',
                'description' => 'Cor primária da plataforma',
                'is_public' => true,
            ],
            [
                'key' => 'branding.secondary_color',
                'value' => '#10b981',
                'type' => 'string',
                'description' => 'Cor secundária da plataforma',
                'is_public' => true,
            ],
            [
                'key' => 'branding.accent_color',
                'value' => '#f97316',
                'type' => 'string',
                'description' => 'Cor de destaque da plataforma',
                'is_public' => true,
            ],
            [
                'key' => 'branding.logo',
                'value' => null,
                'type' => 'string',
                'description' => 'URL do logo da plataforma',
                'is_public' => true,
            ],
            [
                'key' => 'app.name',
                'value' => 'OnSell',
                'type' => 'string',
                'description' => 'Nome da plataforma',
                'is_public' => true,
            ],
        ];

        DB::table('settings')->insert($settings);
    }
};
