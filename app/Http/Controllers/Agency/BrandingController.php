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
        
        // Passar agency para a view com dados adicionais para as novas abas
        return Inertia::render('Agency/Branding/Index', [
            'agency' => [
                'id' => $agency->id,
                'name' => $agency->name,
                'logo' => $agency->logo,
                'favicon' => $agency->favicon,
                'primary_color' => $agency->primary_color,
                'secondary_color' => $agency->secondary_color,
                'accent_color' => $agency->accent_color,
                'custom_domain' => $agency->custom_domain,
                'domain_status' => $agency->domain_status,
                'subdomain' => $agency->subdomain,
                'landing_page' => $agency->landing_page ? json_decode($agency->landing_page, true) : null,
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
        
        return redirect()->back()->with('success', 'Configurações de marca atualizadas com sucesso!');
    }

    /**
     * Atualiza as configurações de domínio da agência
     */
    public function updateDomain(Request $request)
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
            'subdomain' => 'required|string|regex:/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/|unique:agencies,subdomain,' . $agencyId,
            'custom_domain' => 'nullable|string|regex:/^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $validated = $validator->validated();
        
        // Obtém a agência do ID determinado
        $agency = Agency::findOrFail($agencyId);
        
        // Se o domínio personalizado foi alterado, definir status como pendente
        $domainStatus = $agency->domain_status;
        if ($validated['custom_domain'] !== $agency->custom_domain) {
            $domainStatus = 'pending';
        }
        
        // Atualiza as configurações de domínio
        $agency->update([
            'subdomain' => $validated['subdomain'],
            'custom_domain' => $validated['custom_domain'],
            'domain_status' => $domainStatus,
        ]);
        
        // Log para auditoria
        Log::channel('audit')->info('Domínio da agência atualizado', [
            'user_id' => Auth::id(),
            'agency_id' => $agencyId,
            'subdomain' => $validated['subdomain'],
            'custom_domain' => $validated['custom_domain'],
            'domain_status' => $domainStatus,
        ]);
        
        return redirect()->back()->with('success', 'Configurações de domínio atualizadas com sucesso!');
    }

    /**
     * Atualiza as configurações da landing page da agência
     */
    public function updateLandingPage(Request $request)
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
            'headline' => 'required|string|min:5',
            'subheadline' => 'required|string|min:5',
            'hero_image' => 'nullable|url',
            'cta_text' => 'required|string|min:2',
            'features_title' => 'required|string|min:3',
            'features' => 'required|array|min:1',
            'features.*.title' => 'required|string|min:3',
            'features.*.description' => 'required|string|min:10',
            'display_plans' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $validated = $validator->validated();
        
        // Obtém a agência do ID determinado
        $agency = Agency::findOrFail($agencyId);
        
        // Atualiza as configurações da landing page, armazenando como JSON
        $agency->update([
            'landing_page' => json_encode($validated),
        ]);
        
        // Log para auditoria
        Log::channel('audit')->info('Landing page da agência atualizada', [
            'user_id' => Auth::id(),
            'agency_id' => $agencyId,
            'headline' => $validated['headline'],
        ]);
        
        return redirect()->back()->with('success', 'Landing page personalizada com sucesso!');
    }
} 