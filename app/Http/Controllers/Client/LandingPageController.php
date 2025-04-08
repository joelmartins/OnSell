<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Models\Client;
use App\Models\LandingPage;
use App\Models\LandingPageTemplate;
use App\Services\ClientService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class LandingPageController extends Controller
{
    protected ClientService $clientService;

    public function __construct(ClientService $clientService)
    {
        $this->clientService = $clientService;
    }

    /**
     * Exibe a listagem de landing pages do cliente
     */
    public function index(): Response
    {
        // Obtém o ID do cliente atual a partir do usuário autenticado
        $clientId = Auth::user()->client_id;
        
        // Busca o cliente no banco de dados
        $client = Client::findOrFail($clientId);
        
        // Obtém as landing pages do cliente
        $landingPages = LandingPage::where('client_id', $clientId)
            ->orderByDesc('created_at')
            ->get()
            ->map(function ($page) {
                return [
                    'id' => $page->id,
                    'name' => $page->name,
                    'description' => $page->description,
                    'slug' => $page->slug,
                    'is_active' => $page->is_active,
                    'created_at' => $page->created_at->format('d/m/Y H:i'),
                    'updated_at' => $page->updated_at->format('d/m/Y H:i'),
                    'leads_count' => $page->leads_count,
                    'views_count' => $page->views_count,
                    'conversion_rate' => $page->conversion_rate,
                ];
            });
        
        // Obtém o número de landing pages restantes para o cliente
        $remainingPages = $client->getRemainingLandingPages();
        
        return Inertia::render('Client/LandingPages/Index', [
            'landingPages' => $landingPages,
            'remainingPages' => $remainingPages,
        ]);
    }

    /**
     * Exibe o formulário para criar uma nova landing page
     */
    public function create(): Response
    {
        // Obtém o ID do cliente atual a partir do usuário autenticado
        $clientId = Auth::user()->client_id;
        
        // Verifica se o cliente pode criar mais landing pages
        $canCreate = $this->clientService->canCreateLandingPage($clientId);
        
        if (!$canCreate['success']) {
            return Inertia::render('Client/LandingPages/Index', [
                'error' => $canCreate['message'],
            ]);
        }
        
        // Obtém o cliente para mostrar o número de landing pages restantes
        $client = Client::findOrFail($clientId);
        $remainingPages = $client->getRemainingLandingPages();
        
        // Busca os templates disponíveis
        $templates = LandingPageTemplate::where('is_active', true)
            ->orderBy('name')
            ->get()
            ->map(function ($template) {
                return [
                    'id' => $template->id,
                    'name' => $template->name,
                    'description' => $template->description,
                    'thumbnail' => $template->thumbnail,
                    'category' => $template->category,
                    'category_name' => $template->category_name,
                    'is_premium' => $template->is_premium,
                ];
            });
        
        return Inertia::render('Client/LandingPages/Create', [
            'templates' => $templates,
            'remainingPages' => $remainingPages,
        ]);
    }

    /**
     * Armazena uma nova landing page
     */
    public function store(Request $request): RedirectResponse
    {
        // Obtém o ID do cliente atual a partir do usuário autenticado
        $clientId = Auth::user()->client_id;
        
        // Verifica se o cliente pode criar mais landing pages
        $canCreate = $this->clientService->canCreateLandingPage($clientId);
        
        if (!$canCreate['success']) {
            return back()->with('error', $canCreate['message']);
        }
        
        // Valida os dados da requisição
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'template_id' => 'nullable|exists:landing_page_templates,id',
            'content' => 'required|string',
            'css' => 'nullable|string',
            'js' => 'nullable|string',
            'is_active' => 'boolean',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string',
            'thank_you_message' => 'nullable|string',
            'thank_you_redirect_url' => 'nullable|string|url',
            'primary_color' => 'nullable|string|max:50',
            'secondary_color' => 'nullable|string|max:50',
            'button_text' => 'nullable|string|max:100',
        ]);
        
        // Gera o slug a partir do nome
        $slug = Str::slug($validated['name'] . '-' . Str::random(6));
        
        // Cria a landing page
        $landingPage = LandingPage::create([
            'client_id' => $clientId,
            'name' => $validated['name'],
            'description' => $validated['description'],
            'template_id' => $validated['template_id'] ?? null,
            'slug' => $slug,
            'content' => $validated['content'],
            'css' => $validated['css'],
            'js' => $validated['js'],
            'is_active' => $validated['is_active'] ?? true,
            'meta_title' => $validated['meta_title'],
            'meta_description' => $validated['meta_description'],
            'thank_you_message' => $validated['thank_you_message'],
            'thank_you_redirect_url' => $validated['thank_you_redirect_url'],
            'primary_color' => $validated['primary_color'],
            'secondary_color' => $validated['secondary_color'],
            'button_text' => $validated['button_text'],
        ]);
        
        // Incrementa o contador de landing pages do cliente
        \App\Models\ClientUsage::incrementLandingPages($clientId);
        
        return redirect()->route('client.landing-pages.preview', $landingPage->id)
            ->with('success', 'Landing page criada com sucesso!');
    }

    /**
     * Exibe a visualização de uma landing page
     */
    public function preview(LandingPage $landingPage): Response
    {
        // Verifica se a landing page pertence ao cliente atual
        $clientId = Auth::user()->client_id;
        
        if (!$landingPage->belongsToClient($clientId)) {
            abort(403, 'Você não tem permissão para visualizar esta landing page.');
        }
        
        return Inertia::render('Client/LandingPages/Preview', [
            'landingPage' => [
                'id' => $landingPage->id,
                'name' => $landingPage->name,
                'description' => $landingPage->description,
                'slug' => $landingPage->slug,
                'content' => $landingPage->content,
                'css' => $landingPage->css,
                'js' => $landingPage->js,
                'is_active' => $landingPage->is_active,
                'meta_title' => $landingPage->meta_title,
                'meta_description' => $landingPage->meta_description,
                'thank_you_message' => $landingPage->thank_you_message,
                'thank_you_redirect_url' => $landingPage->thank_you_redirect_url,
                'primary_color' => $landingPage->primary_color,
                'secondary_color' => $landingPage->secondary_color,
                'button_text' => $landingPage->button_text,
                'views_count' => $landingPage->views_count,
                'leads_count' => $landingPage->leads_count,
                'conversion_rate' => $landingPage->conversion_rate,
                'created_at' => $landingPage->created_at->format('d/m/Y H:i'),
                'updated_at' => $landingPage->updated_at->format('d/m/Y H:i'),
                'public_url' => $landingPage->public_url,
            ],
        ]);
    }

    /**
     * Exibe o formulário para editar uma landing page
     */
    public function edit(LandingPage $landingPage): Response
    {
        // Verifica se a landing page pertence ao cliente atual
        $clientId = Auth::user()->client_id;
        
        if (!$landingPage->belongsToClient($clientId)) {
            abort(403, 'Você não tem permissão para editar esta landing page.');
        }
        
        // Busca os templates disponíveis
        $templates = LandingPageTemplate::where('is_active', true)
            ->orderBy('name')
            ->get()
            ->map(function ($template) {
                return [
                    'id' => $template->id,
                    'name' => $template->name,
                    'description' => $template->description,
                    'thumbnail' => $template->thumbnail,
                    'category' => $template->category,
                    'category_name' => $template->category_name,
                    'is_premium' => $template->is_premium,
                ];
            });
        
        return Inertia::render('Client/LandingPages/Edit', [
            'landingPage' => [
                'id' => $landingPage->id,
                'name' => $landingPage->name,
                'description' => $landingPage->description,
                'template_id' => $landingPage->template_id,
                'slug' => $landingPage->slug,
                'content' => $landingPage->content,
                'css' => $landingPage->css,
                'js' => $landingPage->js,
                'is_active' => $landingPage->is_active,
                'meta_title' => $landingPage->meta_title,
                'meta_description' => $landingPage->meta_description,
                'thank_you_message' => $landingPage->thank_you_message,
                'thank_you_redirect_url' => $landingPage->thank_you_redirect_url,
                'primary_color' => $landingPage->primary_color,
                'secondary_color' => $landingPage->secondary_color,
                'button_text' => $landingPage->button_text,
            ],
            'templates' => $templates,
        ]);
    }

    /**
     * Atualiza uma landing page
     */
    public function update(Request $request, LandingPage $landingPage): RedirectResponse
    {
        // Verifica se a landing page pertence ao cliente atual
        $clientId = Auth::user()->client_id;
        
        if (!$landingPage->belongsToClient($clientId)) {
            abort(403, 'Você não tem permissão para editar esta landing page.');
        }
        
        // Valida os dados da requisição
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'content' => 'required|string',
            'css' => 'nullable|string',
            'js' => 'nullable|string',
            'is_active' => 'boolean',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string',
            'thank_you_message' => 'nullable|string',
            'thank_you_redirect_url' => 'nullable|string|url',
            'primary_color' => 'nullable|string|max:50',
            'secondary_color' => 'nullable|string|max:50',
            'button_text' => 'nullable|string|max:100',
        ]);
        
        // Atualiza a landing page
        $landingPage->update([
            'name' => $validated['name'],
            'description' => $validated['description'],
            'content' => $validated['content'],
            'css' => $validated['css'],
            'js' => $validated['js'],
            'is_active' => $validated['is_active'] ?? true,
            'meta_title' => $validated['meta_title'],
            'meta_description' => $validated['meta_description'],
            'thank_you_message' => $validated['thank_you_message'],
            'thank_you_redirect_url' => $validated['thank_you_redirect_url'],
            'primary_color' => $validated['primary_color'],
            'secondary_color' => $validated['secondary_color'],
            'button_text' => $validated['button_text'],
        ]);
        
        return redirect()->route('client.landing-pages.preview', $landingPage->id)
            ->with('success', 'Landing page atualizada com sucesso!');
    }

    /**
     * Remove uma landing page
     */
    public function destroy(LandingPage $landingPage): RedirectResponse
    {
        // Verifica se a landing page pertence ao cliente atual
        $clientId = Auth::user()->client_id;
        
        if (!$landingPage->belongsToClient($clientId)) {
            abort(403, 'Você não tem permissão para excluir esta landing page.');
        }
        
        // Exclui a landing page
        $landingPage->delete();
        
        return redirect()->route('client.landing-pages.index')
            ->with('success', 'Landing page excluída com sucesso!');
    }

    /**
     * Duplica uma landing page
     */
    public function duplicate(LandingPage $landingPage): RedirectResponse
    {
        // Verifica se a landing page pertence ao cliente atual
        $clientId = Auth::user()->client_id;
        
        if (!$landingPage->belongsToClient($clientId)) {
            abort(403, 'Você não tem permissão para duplicar esta landing page.');
        }
        
        // Verifica se o cliente pode criar mais landing pages
        $canCreate = $this->clientService->canCreateLandingPage($clientId);
        
        if (!$canCreate['success']) {
            return back()->with('error', $canCreate['message']);
        }
        
        // Cria uma cópia com um novo slug
        $newSlug = Str::slug($landingPage->name . '-copy-' . Str::random(6));
        
        $newLandingPage = $landingPage->replicate();
        $newLandingPage->name = $landingPage->name . ' (Cópia)';
        $newLandingPage->slug = $newSlug;
        $newLandingPage->views_count = 0;
        $newLandingPage->leads_count = 0;
        $newLandingPage->save();
        
        // Incrementa o contador de landing pages do cliente
        \App\Models\ClientUsage::incrementLandingPages($clientId);
        
        return redirect()->route('client.landing-pages.edit', $newLandingPage->id)
            ->with('success', 'Landing page duplicada com sucesso!');
    }
}
