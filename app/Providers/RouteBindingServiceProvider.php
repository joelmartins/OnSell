<?php

namespace App\Providers;

use App\Models\Client;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\ServiceProvider;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Route;
use App\Exceptions\ClientDeletedException;

class RouteBindingServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        // Modificar a lógica de resolução do Route Model Binding para o modelo Client
        // Isso garante que clientes com soft delete não sejam acessíveis normalmente via URL
        Route::bind('client', function ($value) {
            // Se o valor for 'trashed', retornar nulo para evitar problemas com rotas especiais
            if ($value === 'trashed') {
                return null;
            }
            
            // Buscar somente clientes que não foram excluídos via soft delete
            $client = Client::where('id', $value)->first();
            
            if (!$client) {
                // Log detalhado sobre a tentativa de acesso a cliente não encontrado ou excluído
                \Log::channel('audit')->info('Tentativa de acesso a cliente não encontrado ou excluído via URL', [
                    'client_id' => $value,
                    'user_id' => auth()->id() ?? 'guest',
                    'route' => request()->route() ? request()->route()->getName() : 'unknown',
                    'path' => request()->path(),
                    'ip' => request()->ip(),
                    'user_agent' => request()->userAgent()
                ]);
                
                // Verificar se o cliente existe, mas foi excluído via soft delete
                $clientWithTrashed = Client::withTrashed()->where('id', $value)->first();
                if ($clientWithTrashed && $clientWithTrashed->deleted_at) {
                    \Log::channel('audit')->warning('Tentativa de acesso a cliente excluído via URL', [
                        'client_id' => $value,
                        'client_name' => $clientWithTrashed->name,
                        'deleted_at' => $clientWithTrashed->deleted_at,
                        'user_id' => auth()->id() ?? 'guest'
                    ]);
                    
                    // Lançar exceção personalizada para clientes excluídos
                    throw new ClientDeletedException($clientWithTrashed);
                }
                
                // Cliente não existe no banco de dados
                abort(404, 'Cliente não encontrado.');
            }
            
            return $client;
        });
    }
}
