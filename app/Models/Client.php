<?php

namespace App\Models;

use App\Models\Agency;
use App\Models\ClientUsage;
use App\Models\Concerns\Auditable;
use App\Models\Pipeline;
use App\Models\Plan;
use App\Models\User;
use App\Notifications\ClientDeletedNotification;
use App\Notifications\ClientRestoredNotification;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use OwenIt\Auditing\Contracts\Auditable as AuditableContract;
use OwenIt\Auditing\Auditable as AuditableTrait;
use Laravel\Cashier\Billable;

class Client extends Model implements AuditableContract
{
    use HasFactory, SoftDeletes, AuditableTrait, Billable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'document',
        'email',
        'phone',
        'description',
        'is_active',
        'agency_id',
        'plan_id',
        'logo',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'is_active' => 'boolean',
    ];

    /**
     * Get the users for the client.
     */
    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    /**
     * Get the agency that owns the client.
     */
    public function agency(): BelongsTo
    {
        return $this->belongsTo(Agency::class);
    }

    /**
     * Get the plan that the client is subscribed to.
     */
    public function plan(): BelongsTo
    {
        return $this->belongsTo(Plan::class);
    }

    /**
     * Get the contacts for the client.
     */
    public function contacts(): HasMany
    {
        return $this->hasMany(Contact::class);
    }

    /**
     * Get the pipelines for the client.
     */
    public function pipelines(): HasMany
    {
        return $this->hasMany(Pipeline::class);
    }

    /**
     * Get the monthly usage records for the client.
     */
    public function usages(): HasMany
    {
        return $this->hasMany(ClientUsage::class);
    }

    /**
     * Get the current month's usage.
     */
    public function getCurrentMonthUsage()
    {
        return ClientUsage::getCurrentMonthUsage($this->id);
    }

    /**
     * Verifica se o cliente já atingiu o limite mensal de leads
     */
    public function hasReachedMonthlyLeadsLimit(): bool
    {
        $usage = $this->getCurrentMonthUsage();
        return $usage->hasReachedMonthlyLeadsLimit($this->id);
    }

    /**
     * Verifica se o cliente já atingiu o limite total de leads
     */
    public function hasReachedTotalLeadsLimit(): bool
    {
        $usage = $this->getCurrentMonthUsage();
        return $usage->hasReachedTotalLeadsLimit($this->id);
    }

    /**
     * Retorna o número restante de leads mensais
     */
    public function getRemainingMonthlyLeads(): int
    {
        $usage = $this->getCurrentMonthUsage();
        return $usage->getRemainingMonthlyLeads($this->id);
    }

    /**
     * Retorna o número restante de leads totais
     */
    public function getRemainingTotalLeads(): int
    {
        $usage = $this->getCurrentMonthUsage();
        return $usage->getRemainingTotalLeads($this->id);
    }

    /**
     * Verifica se o cliente já atingiu o limite mensal de pipelines
     */
    public function hasReachedPipelinesLimit(): bool
    {
        $usage = $this->getCurrentMonthUsage();
        return $usage->hasReachedPipelinesLimit($this->id);
    }

    /**
     * Retorna o número restante de pipelines para o mês atual
     */
    public function getRemainingPipelines(): int
    {
        $usage = $this->getCurrentMonthUsage();
        return $usage->getRemainingPipelines($this->id);
    }

    /**
     * Verifica se o cliente já atingiu o limite mensal de landing pages
     */
    public function hasReachedLandingPagesLimit(): bool
    {
        $usage = $this->getCurrentMonthUsage();
        return $usage->hasReachedLandingPagesLimit($this->id);
    }

    /**
     * Retorna o número restante de landing pages para o mês atual
     */
    public function getRemainingLandingPages(): int
    {
        $usage = $this->getCurrentMonthUsage();
        return $usage->getRemainingLandingPages($this->id);
    }

    public static function boot()
    {
        parent::boot();
        
        // Adicionar logging explícito nas operações relacionadas a soft delete
        static::deleted(function($client) {
            \Log::channel('audit')->info('Cliente excluído (evento deleted)', [
                'client_id' => $client->id,
                'client_name' => $client->name,
                'agency_id' => $client->agency_id,
                'deleted_at' => $client->deleted_at,
                'triggered_by' => auth()->id() ?? 'sistema'
            ]);
            
            // Desvincula os usuários automaticamente quando o cliente é excluído
            // Esta é uma proteção adicional, além da que foi implementada nos controladores
            if ($client->users()->count() > 0) {
                // Obter usuários antes de desabilitá-los para poder enviar notificações
                $users = $client->users()->get();
                
                // Desabilitar os usuários do cliente em vez de desvinculá-los
                $client->users()->update(['is_active' => false]);
                
                // Enviar notificação para cada usuário afetado
                foreach ($users as $user) {
                    try {
                        $user->notify(new ClientDeletedNotification($client->name));
                        
                        \Log::channel('audit')->info('Notificação enviada ao usuário sobre cliente excluído', [
                            'user_id' => $user->id,
                            'user_email' => $user->email,
                            'client_id' => $client->id,
                            'client_name' => $client->name
                        ]);
                    } catch (\Exception $e) {
                        \Log::channel('audit')->error('Erro ao enviar notificação ao usuário', [
                            'user_id' => $user->id,
                            'user_email' => $user->email,
                            'client_id' => $client->id,
                            'client_name' => $client->name,
                            'error' => $e->getMessage()
                        ]);
                    }
                }
                
                \Log::channel('audit')->info('Usuários desabilitados automaticamente no evento deleted', [
                    'client_id' => $client->id, 
                    'client_name' => $client->name,
                    'num_users' => count($users)
                ]);
            }
        });
        
        static::restored(function($client) {
            \Log::channel('audit')->info('Cliente restaurado (evento restored)', [
                'client_id' => $client->id,
                'client_name' => $client->name,
                'agency_id' => $client->agency_id,
                'restored_at' => now(),
                'triggered_by' => auth()->id() ?? 'sistema'
            ]);
            
            // Obter os usuários antes de reativá-los para poder enviar notificações
            $users = $client->users()->get();
            
            // Reativar os usuários do cliente quando ele for restaurado
            $client->users()->update(['is_active' => true]);
            
            // Enviar notificação para cada usuário afetado
            foreach ($users as $user) {
                try {
                    $user->notify(new ClientRestoredNotification($client->name));
                    
                    \Log::channel('audit')->info('Notificação enviada ao usuário sobre cliente restaurado', [
                        'user_id' => $user->id,
                        'user_email' => $user->email,
                        'client_id' => $client->id,
                        'client_name' => $client->name
                    ]);
                } catch (\Exception $e) {
                    \Log::channel('audit')->error('Erro ao enviar notificação ao usuário', [
                        'user_id' => $user->id,
                        'user_email' => $user->email,
                        'client_id' => $client->id,
                        'client_name' => $client->name,
                        'error' => $e->getMessage()
                    ]);
                }
            }
            
            \Log::channel('audit')->info('Usuários reativados após restauração do cliente', [
                'client_id' => $client->id,
                'client_name' => $client->name,
                'num_users' => count($users),
                'triggered_by' => auth()->id() ?? 'sistema'
            ]);
        });
        
        static::forceDeleted(function($client) {
            \Log::channel('audit')->info('Cliente excluído permanentemente (evento forceDeleted)', [
                'client_id' => $client->id,
                'client_name' => $client->name,
                'agency_id' => $client->agency_id,
                'force_deleted_at' => now(),
                'triggered_by' => auth()->id() ?? 'sistema'
            ]);
        });
    }
} 