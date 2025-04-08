<?php

namespace App\Http\Controllers\Agency;

use App\Http\Controllers\Controller;
use App\Models\Agency;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Illuminate\Support\Facades\Validator;

class BrandingController extends Controller
{
    /**
     * Exibe a página de configurações de marca
     */
    public function index()
    {
        // Verificar se está impersonando uma agência
        $agencyId = null;
        $impersonating = session()->get('impersonate.target');
        
        if ($impersonating && $impersonating['type'] === 'agency') {
            // Se está impersonando, usar o ID da agência da sessão
            $agencyId = $impersonating['id'];
        } else {
            // Caso contrário, obter o ID da agência do usuário autenticado
            $agencyId = Auth::user()->agency_id;
        }
        
        // Buscar a agência com o ID correto
        $agency = Agency::findOrFail($agencyId);
        
        // Log para depuração
        Log::channel('audit')->info('Acessando página de branding da agência', [
            'user_id' => Auth::id(),
            'agency_id' => $agencyId,
            'agency_name' => $agency->name,
            'is_impersonating' => $impersonating ? true : false,
            'impersonation_data' => $impersonating
        ]);
        
        // Passar agency para a view
        return Inertia::render('Agency/Branding/Index', [
            'agency' => [
                'id' => $agency->id,
                'name' => $agency->name,
                'logo' => $agency->logo,
                'favicon' => $agency->favicon,
                'primary_color' => $agency->primary_color,
                'secondary_color' => $agency->secondary_color,
                'accent_color' => $agency->accent_color,
            ]
        ]);
    }

    /**
     * Atualiza as configurações de marca da agência
     */
    public function update(Request $request)
    {
        // Verificar se está impersonando uma agência
        $agencyId = null;
        $impersonating = session()->get('impersonate.target');
        
        if ($impersonating && $impersonating['type'] === 'agency') {
            // Se está impersonando, usar o ID da agência da sessão
            $agencyId = $impersonating['id'];
        } else {
            // Caso contrário, obter o ID da agência do usuário autenticado
            $agencyId = Auth::user()->agency_id;
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|min:3',
            'logo' => 'nullable|url',
            'favicon' => 'nullable|url',
            'primary_color' => 'required|regex:/^#[0-9A-Fa-f]{6}$/',
            'secondary_color' => 'required|regex:/^#[0-9A-Fa-f]{6}$/',
            'accent_color' => 'required|regex:/^#[0-9A-Fa-f]{6}$/',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $validated = $validator->validated();
        
        // Obtém a agência do ID determinado
        $agency = Agency::findOrFail($agencyId);
        
        // Atualiza as configurações de marca
        $agency->update([
            'name' => $validated['name'],
            'logo' => $validated['logo'],
            'favicon' => $validated['favicon'],
            'primary_color' => $validated['primary_color'],
            'secondary_color' => $validated['secondary_color'],
            'accent_color' => $validated['accent_color'],
        ]);
        
        return response()->json(['message' => 'Configurações de marca atualizadas com sucesso!']);
    }
} 