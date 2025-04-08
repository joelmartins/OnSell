<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\MessageTemplate;
use Illuminate\Support\Facades\Log;

class MessageTemplateController extends Controller
{
    /**
     * Listar todos os templates de mensagens.
     */
    public function index(Request $request)
    {
        $type = $request->type;
        $query = MessageTemplate::query();
        
        if ($type) {
            $query->where('type', $type);
        }
        
        $templates = $query->orderBy('created_at', 'desc')->get();
        
        return response()->json([
            'success' => true,
            'data' => $templates
        ]);
    }

    /**
     * Obter detalhes de um template específico.
     */
    public function show($id)
    {
        $template = MessageTemplate::findOrFail($id);
        
        return response()->json([
            'success' => true,
            'data' => $template
        ]);
    }

    /**
     * Criar um novo template de mensagem.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|string|in:whatsapp,email,sms',
            'content' => 'required|string',
            'variables' => 'nullable|array',
            'media' => 'nullable|array',
            'active' => 'nullable|boolean',
        ]);

        try {
            $template = MessageTemplate::create([
                'name' => $request->name,
                'description' => $request->description,
                'type' => $request->type,
                'content' => $request->content,
                'variables' => $request->variables,
                'media' => $request->media,
                'active' => $request->active ?? true,
            ]);
            
            return response()->json([
                'success' => true,
                'message' => 'Template criado com sucesso',
                'data' => $template
            ], 201);
        } catch (\Exception $e) {
            Log::error('Erro ao criar template de mensagem: ' . $e->getMessage(), [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Erro ao criar template: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Atualizar um template existente.
     */
    public function update(Request $request, $id)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|string|in:whatsapp,email,sms',
            'content' => 'required|string',
            'variables' => 'nullable|array',
            'media' => 'nullable|array',
            'active' => 'nullable|boolean',
        ]);

        try {
            $template = MessageTemplate::findOrFail($id);
            
            $template->update([
                'name' => $request->name,
                'description' => $request->description,
                'type' => $request->type,
                'content' => $request->content,
                'variables' => $request->variables,
                'media' => $request->media,
                'active' => $request->active ?? $template->active,
            ]);
            
            return response()->json([
                'success' => true,
                'message' => 'Template atualizado com sucesso',
                'data' => $template
            ]);
        } catch (\Exception $e) {
            Log::error('Erro ao atualizar template de mensagem: ' . $e->getMessage(), [
                'template_id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Erro ao atualizar template: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Excluir um template.
     */
    public function destroy($id)
    {
        try {
            $template = MessageTemplate::findOrFail($id);
            $template->delete();
            
            return response()->json([
                'success' => true,
                'message' => 'Template excluído com sucesso'
            ]);
        } catch (\Exception $e) {
            Log::error('Erro ao excluir template de mensagem: ' . $e->getMessage(), [
                'template_id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Erro ao excluir template: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Visualizar o preview de um template com variáveis de exemplo.
     */
    public function preview(Request $request, $id)
    {
        try {
            $template = MessageTemplate::findOrFail($id);
            
            // Variáveis de exemplo
            $exampleVariables = [
                'nome' => 'João Silva',
                'email' => 'joao.silva@exemplo.com',
                'telefone' => '(11) 98765-4321',
                'empresa' => 'Empresa Exemplo',
                'cargo' => 'Diretor',
                'oportunidade_titulo' => 'Proposta de serviço',
                'oportunidade_valor' => 'R$ 5.000,00',
                'oportunidade_data' => date('d/m/Y')
            ];
            
            // Adicionar variáveis do request, se houver
            if ($request->has('variables') && is_array($request->variables)) {
                $exampleVariables = array_merge($exampleVariables, $request->variables);
            }
            
            // Processar o conteúdo do template com as variáveis de exemplo
            $preview = $template->processContent($exampleVariables);
            
            return response()->json([
                'success' => true,
                'data' => [
                    'template' => $template,
                    'preview' => $preview,
                    'variables_used' => $exampleVariables
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Erro ao gerar preview do template: ' . $e->getMessage(), [
                'template_id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Erro ao gerar preview: ' . $e->getMessage()
            ], 500);
        }
    }
} 