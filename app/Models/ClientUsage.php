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
        'contacts_count',
        'pipelines_count',
        'automation_flows_count',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'contacts_count' => 'integer',
        'pipelines_count' => 'integer',
        'automation_flows_count' => 'integer',
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
                'contacts_count' => 0,
                'pipelines_count' => 0,
                'automation_flows_count' => 0,
            ]
        );
    }

    /**
     * Increment the contacts count for a client.
     *
     * @param int $clientId
     * @param int $amount
     * @return bool
     */
    public static function incrementContactsCount(int $clientId, int $amount = 1): bool
    {
        // Verifica se a quantidade é positiva
        if ($amount < 1) {
            return false;
        }

        $usage = self::getCurrentMonthUsage($clientId);
        $usage->contacts_count += $amount;
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
     * Increment the automation flows count for a client.
     *
     * @param int $clientId
     * @param int $amount
     * @return bool
     */
    public static function incrementAutomationFlowsCount(int $clientId, int $amount = 1): bool
    {
        // Verifica se a quantidade é positiva
        if ($amount < 1) {
            return false;
        }

        $usage = self::getCurrentMonthUsage($clientId);
        $usage->automation_flows_count += $amount;
        return $usage->save();
    }

    /**
     * Check if a client has reached their monthly contacts limit.
     *
     * @param int $clientId
     * @return bool
     */
    public function hasReachedContactsLimit(int $clientId): bool
    {
        $client = Client::find($clientId);
        
        if (!$client) {
            return true; // Se o cliente não existe, consideramos que atingiu o limite
        }
        
        return $this->contacts_count >= $client->plan->contacts_limit;
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
        
        return $this->pipelines_count >= $client->plan->pipelines_limit;
    }

    /**
     * Check if a client has reached their monthly automation flows limit.
     *
     * @param int $clientId
     * @return bool
     */
    public function hasReachedAutomationFlowsLimit(int $clientId): bool
    {
        $client = Client::find($clientId);
        
        if (!$client) {
            return true; // Se o cliente não existe, consideramos que atingiu o limite
        }
        
        return $this->automation_flows_count >= $client->plan->automation_flows_limit;
    }

    /**
     * Get the remaining contacts a client can add for the month.
     *
     * @param int $clientId
     * @return int
     */
    public function getRemainingContacts(int $clientId): int
    {
        $client = Client::find($clientId);
        
        if (!$client) {
            return 0; // Se o cliente não existe, não há contatos restantes
        }
        
        $remaining = $client->plan->contacts_limit - $this->contacts_count;
        
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
        $remaining = $client->plan->pipelines_limit - $currentUsage->pipelines_count;
        
        return max(0, $remaining);
    }

    /**
     * Get the remaining automation flows a client can add for the month.
     *
     * @param int $clientId
     * @return int
     */
    public static function getRemainingAutomationFlows(int $clientId): int
    {
        $client = Client::find($clientId);
        
        if (!$client) {
            return 0; // Se o cliente não existe, não há fluxos restantes
        }
        
        $currentUsage = self::getCurrentMonthUsage($clientId);
        $remaining = $client->plan->automation_flows_limit - $currentUsage->automation_flows_count;
        
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
     * Incrementa o contador de fluxos de automação para o mês atual
     */
    public static function incrementAutomationFlows(int $clientId): void
    {
        $currentUsage = self::getCurrentMonthUsage($clientId);
        $currentUsage->automation_flows_count++;
        $currentUsage->save();
    }
}
