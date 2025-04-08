<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Carbon\Carbon;

class ClientUsage extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'client_id',
        'year',
        'month',
        'leads_count',
        'pipelines_count',
        'landing_pages_count',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'leads_count' => 'integer',
        'pipelines_count' => 'integer',
        'landing_pages_count' => 'integer',
        'year' => 'integer',
        'month' => 'integer',
    ];

    /**
     * Get the client that owns the usage record.
     */
    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    /**
     * Get or create a usage record for the current month.
     *
     * @param int $clientId
     * @return ClientUsage
     */
    public static function getCurrentMonthUsage(int $clientId): self
    {
        $now = Carbon::now();
        $year = $now->year;
        $month = $now->month;

        // Verifica se o cliente existe
        if (!Client::find($clientId)) {
            throw new \InvalidArgumentException("Cliente com ID {$clientId} não encontrado");
        }

        // Busca ou cria o registro de uso para o mês atual
        return self::firstOrCreate(
            ['client_id' => $clientId, 'year' => $year, 'month' => $month],
            [
                'leads_count' => 0,
                'pipelines_count' => 0,
                'landing_pages_count' => 0,
            ]
        );
    }

    /**
     * Increment the leads count for a client.
     *
     * @param int $clientId
     * @param int $amount
     * @return bool
     */
    public static function incrementLeadsCount(int $clientId, int $amount = 1): bool
    {
        // Verifica se a quantidade é positiva
        if ($amount < 1) {
            return false;
        }

        $usage = self::getCurrentMonthUsage($clientId);
        $usage->leads_count += $amount;
        return $usage->save();
    }

    /**
     * Increment the pipelines count for a client.
     *
     * @param int $clientId
     * @param int $amount
     * @return bool
     */
    public static function incrementPipelinesCount(int $clientId, int $amount = 1): bool
    {
        // Verifica se a quantidade é positiva
        if ($amount < 1) {
            return false;
        }

        $usage = self::getCurrentMonthUsage($clientId);
        $usage->pipelines_count += $amount;
        return $usage->save();
    }

    /**
     * Increment the landing pages count for a client.
     *
     * @param int $clientId
     * @param int $amount
     * @return bool
     */
    public static function incrementLandingPagesCount(int $clientId, int $amount = 1): bool
    {
        // Verifica se a quantidade é positiva
        if ($amount < 1) {
            return false;
        }

        $usage = self::getCurrentMonthUsage($clientId);
        $usage->landing_pages_count += $amount;
        return $usage->save();
    }

    /**
     * Check if a client has reached their monthly leads limit.
     *
     * @param int $clientId
     * @return bool
     */
    public function hasReachedMonthlyLeadsLimit(int $clientId): bool
    {
        $client = Client::find($clientId);
        
        if (!$client) {
            return true; // Se o cliente não existe, consideramos que atingiu o limite
        }
        
        return $this->leads_count >= $client->plan->monthly_leads;
    }

    /**
     * Check if a client has reached their total leads limit.
     *
     * @param int $clientId
     * @return bool
     */
    public function hasReachedTotalLeadsLimit(int $clientId): bool
    {
        $client = Client::find($clientId);
        
        if (!$client) {
            return true; // Se o cliente não existe, consideramos que atingiu o limite
        }
        
        // Aqui precisamos somar todos os leads do cliente em todos os meses
        $totalLeads = self::where('client_id', $clientId)
            ->sum('leads_count');
            
        return $totalLeads >= $client->plan->total_leads;
    }

    /**
     * Check if a client has reached their monthly pipelines limit.
     *
     * @param int $clientId
     * @return bool
     */
    public function hasReachedPipelinesLimit(int $clientId): bool
    {
        $client = Client::find($clientId);
        
        if (!$client) {
            return true; // Se o cliente não existe, consideramos que atingiu o limite
        }
        
        return $this->pipelines_count >= $client->plan->max_pipelines;
    }

    /**
     * Check if a client has reached their landing pages limit.
     *
     * @param int $clientId
     * @return bool
     */
    public function hasReachedLandingPagesLimit(int $clientId): bool
    {
        $client = Client::find($clientId);
        
        if (!$client) {
            return true; // Se o cliente não existe, consideramos que atingiu o limite
        }
        
        return $this->landing_pages_count >= $client->plan->max_landing_pages;
    }

    /**
     * Get the remaining monthly leads a client can add.
     *
     * @param int $clientId
     * @return int
     */
    public function getRemainingMonthlyLeads(int $clientId): int
    {
        $client = Client::find($clientId);
        
        if (!$client) {
            return 0; // Se o cliente não existe, não há leads restantes
        }
        
        $remaining = $client->plan->monthly_leads - $this->leads_count;
        
        return max(0, $remaining);
    }

    /**
     * Get the remaining total leads a client can add.
     *
     * @param int $clientId
     * @return int
     */
    public function getRemainingTotalLeads(int $clientId): int
    {
        $client = Client::find($clientId);
        
        if (!$client) {
            return 0; // Se o cliente não existe, não há leads restantes
        }
        
        $totalLeads = self::where('client_id', $clientId)
            ->sum('leads_count');
            
        $remaining = $client->plan->total_leads - $totalLeads;
        
        return max(0, $remaining);
    }

    /**
     * Get the remaining pipelines a client can add for the month.
     *
     * @param int $clientId
     * @return int
     */
    public static function getRemainingPipelines(int $clientId): int
    {
        $client = Client::find($clientId);
        
        if (!$client) {
            return 0; // Se o cliente não existe, não há pipelines restantes
        }
        
        $currentUsage = self::getCurrentMonthUsage($clientId);
        $remaining = $client->plan->max_pipelines - $currentUsage->pipelines_count;
        
        return max(0, $remaining);
    }

    /**
     * Get the remaining landing pages a client can add.
     *
     * @param int $clientId
     * @return int
     */
    public static function getRemainingLandingPages(int $clientId): int
    {
        $client = Client::find($clientId);
        
        if (!$client) {
            return 0; // Se o cliente não existe, não há landing pages restantes
        }
        
        $currentUsage = self::getCurrentMonthUsage($clientId);
        $remaining = $client->plan->max_landing_pages - $currentUsage->landing_pages_count;
        
        return max(0, $remaining);
    }

    /**
     * Incrementa o contador de pipelines para o mês atual
     */
    public static function incrementPipelines(int $clientId): void
    {
        $currentUsage = self::getCurrentMonthUsage($clientId);
        $currentUsage->pipelines_count++;
        $currentUsage->save();
    }

    /**
     * Incrementa o contador de landing pages para o mês atual
     */
    public static function incrementLandingPages(int $clientId): void
    {
        $currentUsage = self::getCurrentMonthUsage($clientId);
        $currentUsage->landing_pages_count++;
        $currentUsage->save();
    }
}
