<?php

namespace App\Http\Controllers\Agency;

use App\Http\Controllers\Controller;
use App\Models\Agency;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Illuminate\Support\Facades\Validator;

class BrandingController extends Controller
{
    /**
     * Exibe a página de configurações de marca
     */
    public function index()
    {
        return Inertia::render('Agency/Branding/Index');
    }

    /**
     * Atualiza as configurações de marca da agência
     */
    public function update(Request $request)
    {
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
        
        // Obtém a agência do usuário atual
        $agency = Agency::findOrFail(Auth::user()->agency_id);
        
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