<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Migração para transição do modelo SalesIntelligence para IntelligenceDeliverable.
     * 
     * Esta migração garante que o modelo IntelligenceDeliverable seja 
     * utilizado corretamente em todo o sistema.
     *
     * @return void
     */
    public function up(): void
    {
        // Verificar se existem registros na tabela antiga
        if (Schema::hasTable('sales_intelligence')) {
            // Migrar dados
            $salesIntelligenceData = DB::table('sales_intelligence')->get();
            
            if ($salesIntelligenceData && count($salesIntelligenceData) > 0) {
                foreach ($salesIntelligenceData as $record) {
                    // Verificar se o registro já foi migrado
                    $exists = DB::table('intelligence_deliverables')
                        ->where('client_id', $record->client_id)
                        ->where('created_at', $record->created_at)
                        ->exists();
                        
                    if (!$exists) {
                        $data = [
                            'client_id' => $record->client_id,
                            'agency_id' => $record->agency_id,
                            'user_id' => $record->user_id,
                            'type' => 'legacy_data', // Marcar como dados legados
                            'prompt' => $record->prompt ?? '',
                            'input_data' => json_encode($record->customer_answers ?? []),
                            'output_json' => json_encode($record->ai_analysis ?? []),
                            'output_markdown' => '',
                            'version' => 1,
                            'created_at' => $record->created_at,
                            'updated_at' => $record->updated_at,
                            'deleted_at' => $record->deleted_at,
                        ];
                        
                        DB::table('intelligence_deliverables')->insert($data);
                    }
                }
            }
        }
    }

    /**
     * Reverter a migração.
     *
     * @return void
     */
    public function down(): void
    {
        // Não é necessário fazer nada na reversão da migração,
        // já que não alteramos a estrutura das tabelas.
    }
};
