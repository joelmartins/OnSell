<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Mail\DocumentoCompartilhado;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ExemploController extends Controller
{
    /**
     * Demonstração de upload de arquivo para R2 e compartilhamento via e-mail
     */
    public function compartilharDocumento(Request $request)
    {
        // Valida a requisição
        $request->validate([
            'arquivo' => 'required|file|max:10240', // Máximo 10MB
            'destinatario_id' => 'required|exists:users,id',
            'mensagem' => 'nullable|string|max:500',
            'anexar_ao_email' => 'nullable|boolean',
        ]);

        // Usuário atual (remetente)
        $remetente = auth()->user();
        
        // Destinatário
        $destinatario = User::findOrFail($request->destinatario_id);
        
        // Upload do arquivo para o R2
        $arquivo = $request->file('arquivo');
        $nomeOriginal = $arquivo->getClientOriginalName();
        $extensao = $arquivo->getClientOriginalExtension();
        
        // Cria um nome único para o arquivo
        $nomeArquivo = Str::slug(pathinfo($nomeOriginal, PATHINFO_FILENAME)) . '-' . Str::random(8) . '.' . $extensao;
        
        // Define o caminho onde o arquivo será armazenado
        $caminhoArquivo = 'documentos/' . $remetente->id . '/' . $nomeArquivo;
        
        // Faz o upload do arquivo para o R2
        Storage::disk('r2')->put(
            $caminhoArquivo, 
            file_get_contents($arquivo->getRealPath())
        );
        
        // Envia o e-mail com o link para o documento
        Mail::to($destinatario->email)
            ->send(new DocumentoCompartilhado(
                $remetente,
                $destinatario,
                $nomeOriginal,
                $caminhoArquivo,
                $request->mensagem ?? '',
                $request->anexar_ao_email ?? false
            ));
        
        // Retorna resposta de sucesso
        return response()->json([
            'message' => 'Documento compartilhado com sucesso.',
            'documento' => [
                'nome' => $nomeOriginal,
                'caminho' => $caminhoArquivo,
                'tamanho' => $arquivo->getSize(),
                'tipo' => $arquivo->getMimeType(),
            ]
        ]);
    }
    
    /**
     * Demonstração de listagem de arquivos do R2
     */
    public function listarDocumentos()
    {
        // Usuário atual
        $user = auth()->user();
        
        // Lista todos os documentos do usuário no R2
        $arquivos = Storage::disk('r2')->files('documentos/' . $user->id);
        
        $documentos = [];
        
        foreach ($arquivos as $arquivo) {
            // Obtem metadados do arquivo
            $metadata = [
                'nome' => basename($arquivo),
                'caminho' => $arquivo,
                'url_temporaria' => Storage::disk('r2')->temporaryUrl($arquivo, now()->addHours(1)),
                'tamanho' => Storage::disk('r2')->size($arquivo),
                'ultima_modificacao' => Storage::disk('r2')->lastModified($arquivo),
            ];
            
            $documentos[] = $metadata;
        }
        
        return response()->json([
            'documentos' => $documentos
        ]);
    }
    
    /**
     * Demonstração de exclusão de arquivo do R2
     */
    public function excluirDocumento(Request $request)
    {
        $request->validate([
            'caminho' => 'required|string',
        ]);
        
        // Usuário atual
        $user = auth()->user();
        
        // Verifica se o caminho pertence ao usuário atual
        $prefixoUsuario = 'documentos/' . $user->id . '/';
        if (!Str::startsWith($request->caminho, $prefixoUsuario)) {
            return response()->json([
                'message' => 'Você não tem permissão para excluir este documento.'
            ], 403);
        }
        
        // Verifica se o arquivo existe
        if (!Storage::disk('r2')->exists($request->caminho)) {
            return response()->json([
                'message' => 'Documento não encontrado.'
            ], 404);
        }
        
        // Exclui o arquivo
        Storage::disk('r2')->delete($request->caminho);
        
        return response()->json([
            'message' => 'Documento excluído com sucesso.'
        ]);
    }
} 