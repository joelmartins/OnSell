<?php

use App\Http\Controllers\Api\WhatsAppWebhookController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// Rotas para webhooks e gerenciamento do WhatsApp (Evolution API)
Route::prefix('webhooks/whatsapp/{domain}')->group(function () {
    // Rota para receber mensagens (webhook)
    Route::post('/', [WhatsAppWebhookController::class, 'handle']);
});

// Rotas para gerenciamento da instância do WhatsApp
Route::prefix('whatsapp/{domain}')->middleware(['auth:sanctum'])->group(function () {
    // Verificar status da instância
    Route::get('/status', [WhatsAppWebhookController::class, 'instanceStatus']);
    
    // Iniciar instância
    Route::post('/start', [WhatsAppWebhookController::class, 'startInstance']);
    
    // Obter QR Code
    Route::get('/qrcode', [WhatsAppWebhookController::class, 'getQrCode']);
}); 