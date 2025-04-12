<?php

namespace App\Exceptions;

use Exception;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Inertia\Inertia;

class ClientDeletedException extends Exception
{
    protected $client;
    
    public function __construct($client = null, $message = 'Este cliente não está mais disponível pois foi excluído.')
    {
        parent::__construct($message);
        $this->client = $client;
    }
    
    /**
     * Renderizar a exceção como uma resposta HTTP
     */
    public function render(Request $request)
    {
        if ($request->wantsJson()) {
            return response()->json([
                'error' => 'Cliente excluído',
                'message' => $this->getMessage(),
                'client_id' => $this->client ? $this->client->id : null
            ], 404);
        }
        
        // Se for uma requisição Inertia
        if ($request->header('X-Inertia')) {
            return Inertia::render('Errors/ClientDeleted', [
                'message' => $this->getMessage(),
                'client_id' => $this->client ? $this->client->id : null
            ])->toResponse($request)->setStatusCode(404);
        }
        
        // Para requisições normais, mostrar uma página de erro específica
        return response()->view('redirect.client_deleted', [
            'message' => $this->getMessage(),
            'client_id' => $this->client ? $this->client->id : null
        ], 404);
    }
}
