<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

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
        'total_leads',
        'monthly_leads',
        'total_landing_pages',
        'total_pipelines',
        'total_automations',
        'total_messages'
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
     * Get current month usage for a client
     *
     * @param int $clientId
     * @return ClientUsage
     */
    public static function getCurrentMonthUsage(int $clientId): self
    {
        $currentYear = date('Y');
        $currentMonth = date('m');

        $usage = self::where('client_id', $clientId)
            ->where('year', $currentYear)
            ->where('month', $currentMonth)
            ->first();

        if (!$usage) {
            $usage = self::create([
                'client_id' => $clientId,
                'year' => $currentYear,
                'month' => $currentMonth,
                'total_leads' => 0,
                'monthly_leads' => 0,
                'total_landing_pages' => 0,
                'total_pipelines' => 0,
                'total_automations' => 0,
                'total_messages' => 0
            ]);
        }

        return $usage;
    }

    /**
     * Check if the client has reached the limit of pipelines
     *
     * @param int $clientId
     * @return bool
     */
    public function hasReachedPipelinesLimit(int $clientId): bool
    {
        $client = Client::find($clientId);
        if (!$client || !$client->plan) {
            return true;
        }

        $limit = $client->plan->pipeline_limit;
        if ($limit === null || $limit === -1) {
            return false; // Sem limite
        }

        return $this->total_pipelines >= $limit;
    }

    /**
     * Check if the client has reached the limit of landing pages
     *
     * @param int $clientId
     * @return bool
     */
    public function hasReachedLandingPagesLimit(int $clientId): bool
    {
        $client = Client::find($clientId);
        if (!$client || !$client->plan) {
            return true;
        }

        $limit = $client->plan->landing_page_limit;
        if ($limit === null || $limit === -1) {
            return false; // Sem limite
        }

        return $this->total_landing_pages >= $limit;
    }

    /**
     * Get remaining monthly leads for a client
     *
     * @param int $clientId
     * @return int
     */
    public function getRemainingMonthlyLeads(int $clientId): int
    {
        $client = Client::find($clientId);
        if (!$client || !$client->plan) {
            return 0;
        }

        $limit = $client->plan->monthly_lead_limit;
        if ($limit === null || $limit === -1) {
            return PHP_INT_MAX; // Sem limite
        }

        return max(0, $limit - $this->monthly_leads);
    }

    /**
     * Get remaining total leads for a client
     *
     * @param int $clientId
     * @return int
     */
    public function getRemainingTotalLeads(int $clientId): int
    {
        $client = Client::find($clientId);
        if (!$client || !$client->plan) {
            return 0;
        }

        $limit = $client->plan->total_lead_limit;
        if ($limit === null || $limit === -1) {
            return PHP_INT_MAX; // Sem limite
        }

        return max(0, $limit - $this->total_leads);
    }

    /**
     * Increment lead count for a client
     *
     * @param int $clientId
     * @param int $count
     * @return bool
     */
    public static function incrementLeads(int $clientId, int $count = 1): bool
    {
        $usage = self::getCurrentMonthUsage($clientId);
        $usage->monthly_leads += $count;
        $usage->total_leads += $count;
        return $usage->save();
    }

    /**
     * Increment landing pages count for a client
     *
     * @param int $clientId
     * @param int $count
     * @return bool
     */
    public static function incrementLandingPages(int $clientId, int $count = 1): bool
    {
        $usage = self::getCurrentMonthUsage($clientId);
        $usage->total_landing_pages += $count;
        return $usage->save();
    }

    /**
     * Increment pipelines count for a client
     *
     * @param int $clientId
     * @param int $count
     * @return bool
     */
    public static function incrementPipelines(int $clientId, int $count = 1): bool
    {
        $usage = self::getCurrentMonthUsage($clientId);
        $usage->total_pipelines += $count;
        return $usage->save();
    }
}
