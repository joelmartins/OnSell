<?php

use App\Http\Controllers\Api\WhatsAppWebhookController;
use App\Http\Controllers\Api\AutomationController;
use App\Http\Controllers\Api\MessageTemplateController;
use App\Http\Controllers\Api\CampaignController;
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

// Rotas para automações
Route::prefix('automations')->middleware(['auth:sanctum'])->group(function () {
    // CRUD básico
    Route::get('/', [AutomationController::class, 'index']);
    Route::post('/', [AutomationController::class, 'store']);
    Route::get('/{id}', [AutomationController::class, 'show']);
    Route::put('/{id}', [AutomationController::class, 'update']);
    Route::delete('/{id}', [AutomationController::class, 'destroy']);
    
    // Ações específicas
    Route::post('/{id}/toggle-active', [AutomationController::class, 'toggleActive']);
    Route::post('/{id}/execute', [AutomationController::class, 'executeManually']);
    Route::get('/{id}/logs', [AutomationController::class, 'logs']);
});

// Rotas para templates de mensagens
Route::prefix('message-templates')->middleware(['auth:sanctum'])->group(function () {
    // CRUD básico
    Route::get('/', [MessageTemplateController::class, 'index']);
    Route::post('/', [MessageTemplateController::class, 'store']);
    Route::get('/{id}', [MessageTemplateController::class, 'show']);
    Route::put('/{id}', [MessageTemplateController::class, 'update']);
    Route::delete('/{id}', [MessageTemplateController::class, 'destroy']);
    
    // Preview de template
    Route::post('/{id}/preview', [MessageTemplateController::class, 'preview']);
});

// Rotas para campanhas
Route::prefix('campaigns')->middleware(['auth:sanctum'])->group(function () {
    // CRUD básico
    Route::get('/', [CampaignController::class, 'index']);
    Route::post('/', [CampaignController::class, 'store']);
    Route::get('/{id}', [CampaignController::class, 'show']);
    Route::put('/{id}', [CampaignController::class, 'update']);
    Route::delete('/{id}', [CampaignController::class, 'destroy']);
    
    // Ações específicas
    Route::post('/{id}/start', [CampaignController::class, 'start']);
    Route::post('/{id}/pause', [CampaignController::class, 'pause']);
    Route::post('/{id}/cancel', [CampaignController::class, 'cancel']);
    Route::get('/{id}/stats', [CampaignController::class, 'stats']);
    Route::get('/{id}/messages', [CampaignController::class, 'messages']);
}); 