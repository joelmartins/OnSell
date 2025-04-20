<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Models\Contact;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use League\Csv\Reader;
use League\Csv\Writer;

class ContactController extends Controller
{
    /**
     * Exibe a lista de contatos do cliente atual
     */
    public function index(Request $request)
    {
        // Obter o cliente - verificar primeiro se está impersonando um cliente
        $client = null;
        
        if (session()->has('impersonate.target') && session()->get('impersonate.target')['type'] === 'client') {
            // Carregar o cliente pela ID na sessão de impersonação
            $clientId = session()->get('impersonate.target')['id'];
            $client = \App\Models\Client::find($clientId);
            
            Log::channel('audit')->info('Carregando cliente via impersonação', [
                'client_id' => $clientId,
                'client_found' => $client ? true : false
            ]);
        } else {
            // Modo normal - obter cliente do usuário autenticado
            $client = auth()->user()->client;
        }
        
        if (!$client) {
            abort(403, 'Você não está associado a um cliente');
        }
        
        $query = Contact::query()
            ->where('client_id', $client->id)
            ->with(['interactions' => function($query) {
                $query->latest()->limit(1);
            }]);
            
        // Filtrar por status
        if ($request->has('status') && !empty($request->status)) {
            $query->where('status', $request->status);
        }
        
        // Filtrar por origem
        if ($request->has('source') && !empty($request->source)) {
            $query->where('source', $request->source);
        }
        
        // Busca por nome, email, telefone, etc
        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%")
                  ->orWhere('whatsapp', 'like', "%{$search}%")
                  ->orWhere('company', 'like', "%{$search}%");
            });
        }
        
        // Ordenação
        $sortBy = $request->input('sort_by', 'name');
        $sortDirection = $request->input('sort_direction', 'asc');
        $query->orderBy($sortBy, $sortDirection);
        
        $contacts = $query->paginate(10)->withQueryString();
        
        // Obter fontes e status únicos para filtros
        $sources = Contact::where('client_id', $client->id)
            ->distinct()
            ->whereNotNull('source')
            ->pluck('source');
            
        $statuses = Contact::where('client_id', $client->id)
            ->distinct()
            ->whereNotNull('status')
            ->pluck('status');
        
        // Registrar auditoria
        Log::channel('audit')->info('Acessou lista de contatos', [
            'user_id' => auth()->id(),
            'ip' => request()->ip()
        ]);
        
        return Inertia::render('Client/Contacts/Index', [
            'contacts' => $contacts,
            'sources' => $sources,
            'statuses' => $statuses,
            'filters' => $request->only(['search', 'status', 'source', 'sort_by', 'sort_direction'])
        ]);
    }
    
    /**
     * Mostra o formulário de criação de contato
     */
    public function create()
    {
        return Inertia::render('Client/Contacts/Create');
    }
    
    /**
     * Armazena um novo contato
     */
    public function store(Request $request)
    {
        // Obter o cliente - verificar primeiro se está impersonando um cliente
        $client = null;
        
        if (session()->has('impersonate.target') && session()->get('impersonate.target')['type'] === 'client') {
            // Carregar o cliente pela ID na sessão de impersonação
            $clientId = session()->get('impersonate.target')['id'];
            $client = \App\Models\Client::find($clientId);
            
            Log::channel('audit')->info('Carregando cliente via impersonação para criação de contato', [
                'client_id' => $clientId,
                'client_found' => $client ? true : false
            ]);
        } else {
            // Modo normal - obter cliente do usuário autenticado
            $client = auth()->user()->client;
        }
        
        if (!$client) {
            abort(403, 'Você não está associado a um cliente');
        }
        
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:20',
            'whatsapp' => 'nullable|string|max:20',
            'document' => 'nullable|string|max:20',
            'company' => 'nullable|string|max:255',
            'position' => 'nullable|string|max:255',
            'address' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:100',
            'state' => 'nullable|string|max:100',
            'postal_code' => 'nullable|string|max:20',
            'country' => 'nullable|string|max:100',
            'source' => 'nullable|string|max:100',
            'status' => 'nullable|string|max:100',
            'notes' => 'nullable|string',
            'custom_fields' => 'nullable|array',
        ]);
        
        $validated['client_id'] = $client->id;
        
        $contact = Contact::create($validated);
        
        // Disparar evento de criação de contato
        event(new \App\Events\ContactCreated($contact, $request->input('source', 'manual')));
        
        // Registrar auditoria
        Log::channel('audit')->info('Criou novo contato', [
            'user_id' => auth()->id(),
            'contact_id' => $contact->id,
            'ip' => request()->ip()
        ]);
        
        return redirect()->route('client.contacts.index')
            ->with('success', 'Contato criado com sucesso!');
    }
    
    /**
     * Exibe os detalhes de um contato específico
     */
    public function show(Contact $contact)
    {
        // Verificar se o contato pertence ao cliente atual
        $this->authorize('view', $contact);
        
        $contact->load(['interactions' => function($query) {
            $query->latest()->limit(20);
        }]);
        
        // Registrar auditoria
        Log::channel('audit')->info('Visualizou detalhes do contato', [
            'user_id' => auth()->id(),
            'contact_id' => $contact->id,
            'ip' => request()->ip()
        ]);
        
        return Inertia::render('Client/Contacts/Show', [
            'contact' => $contact
        ]);
    }
    
    /**
     * Mostra o formulário de edição de contato
     */
    public function edit(Contact $contact)
    {
        // Verificar se o contato pertence ao cliente atual
        $this->authorize('update', $contact);
        
        return Inertia::render('Client/Contacts/Edit', [
            'contact' => $contact
        ]);
    }
    
    /**
     * Atualiza um contato específico
     */
    public function update(Request $request, Contact $contact)
    {
        // Verificar se o contato pertence ao cliente atual
        $this->authorize('update', $contact);
        
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:20',
            'whatsapp' => 'nullable|string|max:20',
            'document' => 'nullable|string|max:20',
            'company' => 'nullable|string|max:255',
            'position' => 'nullable|string|max:255',
            'address' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:100',
            'state' => 'nullable|string|max:100',
            'postal_code' => 'nullable|string|max:20',
            'country' => 'nullable|string|max:100',
            'source' => 'nullable|string|max:100',
            'status' => 'nullable|string|max:100',
            'notes' => 'nullable|string',
            'custom_fields' => 'nullable|array',
        ]);
        
        $contact->update($validated);
        
        // Registrar auditoria
        Log::channel('audit')->info('Atualizou contato', [
            'user_id' => auth()->id(),
            'contact_id' => $contact->id,
            'ip' => request()->ip()
        ]);
        
        return redirect()->route('client.contacts.index')
            ->with('success', 'Contato atualizado com sucesso!');
    }
    
    /**
     * Remove um contato específico
     */
    public function destroy(Contact $contact)
    {
        // Verificar se o contato pertence ao cliente atual
        $this->authorize('delete', $contact);
        
        $contact->delete();
        
        // Registrar auditoria
        Log::channel('audit')->info('Excluiu contato', [
            'user_id' => auth()->id(),
            'contact_id' => $contact->id,
            'ip' => request()->ip()
        ]);
        
        return redirect()->route('client.contacts.index')
            ->with('success', 'Contato excluído com sucesso!');
    }
    
    /**
     * Importa contatos via CSV
     */
    public function importForm()
    {
        return Inertia::render('Client/Contacts/Import');
    }
    
    /**
     * Processa a importação de contatos
     */
    public function importProcess(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:csv,txt|max:10240',
            'column_mapping' => 'required|array',
            'has_header' => 'boolean',
        ]);
        
        // Obter o cliente - verificar primeiro se está impersonando um cliente
        $client = null;
        
        if (session()->has('impersonate.target') && session()->get('impersonate.target')['type'] === 'client') {
            // Carregar o cliente pela ID na sessão de impersonação
            $clientId = session()->get('impersonate.target')['id'];
            $client = \App\Models\Client::find($clientId);
            
            Log::channel('audit')->info('Carregando cliente via impersonação para importação', [
                'client_id' => $clientId,
                'client_found' => $client ? true : false
            ]);
        } else {
            // Modo normal - obter cliente do usuário autenticado
            $client = auth()->user()->client;
        }
        
        if (!$client) {
            abort(403, 'Você não está associado a um cliente');
        }
        
        $file = $request->file('file');
        $hasHeader = $request->boolean('has_header', true);
        $columnMapping = $request->input('column_mapping');
        
        // Salvar o arquivo temporariamente usando o disco 'local' explicitamente
        $path = $file->store('temp', 'local');
        $fullPath = Storage::disk('local')->path($path);
        
        // Ler o arquivo CSV
        $csv = Reader::createFromPath($fullPath, 'r');
        $csv->setDelimiter(',');
        
        // Pular a primeira linha se tiver cabeçalho
        if ($hasHeader) {
            $csv->setHeaderOffset(0);
        }
        
        $records = $csv->getRecords();
        $importedCount = 0;
        $errorCount = 0;
        $errors = [];
        
        // Mapeamento de campos do CSV para campos do modelo
        foreach ($records as $offset => $record) {
            $contactData = [];
            
            // Mapear os campos do CSV para os campos do modelo
            foreach ($columnMapping as $modelField => $csvColumn) {
                if (isset($record[$csvColumn])) {
                    $contactData[$modelField] = $record[$csvColumn];
                }
            }
            
            // Definir o cliente_id
            $contactData['client_id'] = $client->id;
            
            // Validar os dados
            $validator = Validator::make($contactData, [
                'name' => 'required|string|max:255',
                'email' => 'nullable|email|max:255',
                'phone' => 'nullable|string|max:20',
                'whatsapp' => 'nullable|string|max:20',
                'document' => 'nullable|string|max:20',
                'company' => 'nullable|string|max:255',
                'position' => 'nullable|string|max:255',
                'address' => 'nullable|string|max:255',
                'city' => 'nullable|string|max:100',
                'state' => 'nullable|string|max:100',
                'postal_code' => 'nullable|string|max:20',
                'country' => 'nullable|string|max:100',
                'source' => 'nullable|string|max:100',
                'status' => 'nullable|string|max:100',
                'notes' => 'nullable|string',
            ]);
            
            if ($validator->fails()) {
                $errorCount++;
                $errors[] = [
                    'line' => $offset + 1,
                    'errors' => $validator->errors()->toArray(),
                    'data' => $contactData
                ];
                continue;
            }
            
            try {
                // Criar o contato
                $contact = Contact::create($contactData);
                
                // Disparar evento de criação de contato
                event(new \App\Events\ContactCreated($contact, 'import'));
                
                $importedCount++;
            } catch (\Exception $e) {
                $errorCount++;
                $errors[] = [
                    'line' => $offset + 1,
                    'errors' => [$e->getMessage()],
                    'data' => $contactData
                ];
            }
        }
        
        // Remover o arquivo temporário explicitamente do disco 'local'
        Storage::disk('local')->delete($path);
        
        // Registrar auditoria
        Log::channel('audit')->info('Importou contatos', [
            'user_id' => auth()->id(),
            'imported_count' => $importedCount,
            'error_count' => $errorCount,
            'ip' => request()->ip()
        ]);
        
        return redirect()->route('client.contacts.index')
            ->with('success', "Importação concluída: $importedCount contatos importados com sucesso. $errorCount erros encontrados.");
    }
    
    /**
     * Exporta contatos para CSV
     */
    public function export(Request $request)
    {
        // Obter o cliente - verificar primeiro se está impersonando um cliente
        $client = null;
        
        if (session()->has('impersonate.target') && session()->get('impersonate.target')['type'] === 'client') {
            // Carregar o cliente pela ID na sessão de impersonação
            $clientId = session()->get('impersonate.target')['id'];
            $client = \App\Models\Client::find($clientId);
            
            Log::channel('audit')->info('Carregando cliente via impersonação para exportação', [
                'client_id' => $clientId,
                'client_found' => $client ? true : false
            ]);
        } else {
            // Modo normal - obter cliente do usuário autenticado
            $client = auth()->user()->client;
        }
        
        if (!$client) {
            abort(403, 'Você não está associado a um cliente');
        }
        
        // Construir a query com os mesmos filtros da página de índice
        $query = Contact::query()
            ->where('client_id', $client->id);
            
        // Filtrar por status
        if ($request->has('status') && !empty($request->status)) {
            $query->where('status', $request->status);
        }
        
        // Filtrar por origem
        if ($request->has('source') && !empty($request->source)) {
            $query->where('source', $request->source);
        }
        
        // Busca por nome, email, telefone, etc
        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%")
                  ->orWhere('whatsapp', 'like', "%{$search}%")
                  ->orWhere('company', 'like', "%{$search}%");
            });
        }
        
        // Ordenação
        $sortBy = $request->input('sort_by', 'name');
        $sortDirection = $request->input('sort_direction', 'asc');
        $query->orderBy($sortBy, $sortDirection);
        
        $contacts = $query->get();
        
        // Criar um CSV Writer
        $csv = Writer::createFromString('');
        
        // Adicionar o cabeçalho
        $headers = [
            'ID',
            'Nome',
            'Email',
            'Telefone',
            'WhatsApp',
            'Documento',
            'Empresa',
            'Cargo',
            'Endereço',
            'Cidade',
            'Estado',
            'CEP',
            'País',
            'Origem',
            'Status',
            'Notas',
            'Criado em',
            'Atualizado em',
            'Última interação'
        ];
        
        $csv->insertOne($headers);
        
        // Adicionar os registros
        foreach ($contacts as $contact) {
            $csv->insertOne([
                $contact->id,
                $contact->name,
                $contact->email,
                $contact->phone,
                $contact->whatsapp,
                $contact->document,
                $contact->company,
                $contact->position,
                $contact->address,
                $contact->city,
                $contact->state,
                $contact->postal_code,
                $contact->country,
                $contact->source,
                $contact->status,
                $contact->notes,
                $contact->created_at->format('Y-m-d H:i:s'),
                $contact->updated_at->format('Y-m-d H:i:s'),
                $contact->last_interaction_at ? $contact->last_interaction_at->format('Y-m-d H:i:s') : '',
            ]);
        }
        
        // Registrar auditoria
        Log::channel('audit')->info('Exportou contatos', [
            'user_id' => auth()->id(),
            'exported_count' => $contacts->count(),
            'ip' => request()->ip()
        ]);
        
        // Gerar o nome do arquivo
        $filename = 'contatos_' . $client->slug . '_' . date('Y-m-d_H-i-s') . '.csv';
        
        // Retornar o CSV como download
        return response($csv->getContent())
            ->header('Content-Type', 'text/csv')
            ->header('Content-Disposition', 'attachment; filename="' . $filename . '"')
            ->header('Cache-Control', 'no-cache');
    }
} 