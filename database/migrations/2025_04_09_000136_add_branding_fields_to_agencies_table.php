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
        Schema::table('agencies', function (Blueprint $table) {
            // Adicionar campos para domínio personalizado
            $table->string('custom_domain')->nullable()->after('domain');
            $table->enum('domain_status', ['pending', 'active', 'failed'])->default('pending')->after('custom_domain');
            $table->string('subdomain')->nullable()->unique()->after('domain_status');
            
            // Adicionar campo para configurações da landing page (armazenado como JSON)
            $table->json('landing_page')->nullable()->after('accent_color');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('agencies', function (Blueprint $table) {
            $table->dropColumn([
                'custom_domain',
                'domain_status',
                'subdomain',
                'landing_page'
            ]);
        });
    }
};
