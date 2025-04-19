"use client";

import { useState } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import ClientLayout from '@/Layouts/ClientLayout';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/Components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import { ArrowLeft, Upload, Download, AlertCircle, FileText, Check } from 'lucide-react';
import { toast } from 'react-toastify';

export default function ContactImport({ auth }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [step, setStep] = useState(1);
  
  const { data, setData, post, processing, errors } = useForm({
    file: null,
    column_mapping: {}
  });
  
  const contactFields = [
    { value: 'name', label: 'Nome' },
    { value: 'email', label: 'E-mail' },
    { value: 'phone', label: 'Telefone' },
    { value: 'whatsapp', label: 'WhatsApp' },
    { value: 'document', label: 'CPF/CNPJ' },
    { value: 'company', label: 'Empresa' },
    { value: 'position', label: 'Cargo' },
    { value: 'address', label: 'Endereço' },
    { value: 'city', label: 'Cidade' },
    { value: 'state', label: 'Estado' },
    { value: 'postal_code', label: 'CEP' },
    { value: 'country', label: 'País' },
    { value: 'source', label: 'Origem' },
    { value: 'status', label: 'Status' },
    { value: 'notes', label: 'Observações' },
    { value: 'ignore', label: 'Ignorar coluna' }
  ];

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    
    if (selectedFile.type !== 'text/csv' && !selectedFile.name.endsWith('.csv')) {
      toast.error('Por favor, selecione um arquivo CSV válido');
      return;
    }
    
    setFile(selectedFile);
    setData('file', selectedFile);
    
    // Ler o arquivo para mostrar pré-visualização
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target.result;
      const lines = content.split('\n');
      
      if (lines.length > 0) {
        // Obter cabeçalhos da primeira linha
        const headerLine = lines[0];
        const headerColumns = headerLine.split(',').map(col => col.trim().replace(/^"|"$/g, ''));
        setHeaders(headerColumns);
        
        // Inicializar o mapeamento de colunas
        const initialMapping = {};
        headerColumns.forEach((col, index) => {
          // Tentar fazer um mapeamento inteligente baseado no nome da coluna
          let mappedField = 'ignore';
          
          const colLower = col.toLowerCase();
          if (colLower.includes('nome') || colLower.includes('name')) mappedField = 'name';
          else if (colLower.includes('email') || colLower.includes('e-mail')) mappedField = 'email';
          else if (colLower.includes('telefone') || colLower.includes('phone')) mappedField = 'phone';
          else if (colLower.includes('whatsapp') || colLower.includes('zap')) mappedField = 'whatsapp';
          else if (colLower.includes('cpf') || colLower.includes('cnpj') || colLower.includes('document')) mappedField = 'document';
          else if (colLower.includes('empresa') || colLower.includes('company')) mappedField = 'company';
          else if (colLower.includes('cargo') || colLower.includes('position') || colLower.includes('job')) mappedField = 'position';
          else if (colLower.includes('endereço') || colLower.includes('address')) mappedField = 'address';
          else if (colLower.includes('cidade') || colLower.includes('city')) mappedField = 'city';
          else if (colLower.includes('estado') || colLower.includes('state') || colLower.includes('uf')) mappedField = 'state';
          else if (colLower.includes('cep') || colLower.includes('postal')) mappedField = 'postal_code';
          else if (colLower.includes('país') || colLower.includes('country')) mappedField = 'country';
          else if (colLower.includes('origem') || colLower.includes('source')) mappedField = 'source';
          else if (colLower.includes('status')) mappedField = 'status';
          else if (colLower.includes('observação') || colLower.includes('notes') || colLower.includes('obs')) mappedField = 'notes';
          
          initialMapping[index] = mappedField;
        });
        
        setData('column_mapping', initialMapping);
        
        // Mostrar primeiras 5 linhas para preview
        const previewData = [];
        for (let i = 1; i < Math.min(6, lines.length); i++) {
          if (lines[i].trim()) {
            const cols = lines[i].split(',').map(col => col.trim().replace(/^"|"$/g, ''));
            previewData.push(cols);
          }
        }
        setPreview(previewData);
        
        setStep(2);
      } else {
        toast.error('O arquivo CSV parece estar vazio');
      }
    };
    
    reader.onerror = () => {
      toast.error('Erro ao ler o arquivo CSV');
    };
    
    reader.readAsText(selectedFile);
  };
  
  const handleMappingChange = (colIndex, value) => {
    setData('column_mapping', {
      ...data.column_mapping,
      [colIndex]: value
    });
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Verificar se pelo menos a coluna de nome está mapeada
    const hasNameMapping = Object.values(data.column_mapping).includes('name');
    
    if (!hasNameMapping) {
      toast.error('É necessário mapear pelo menos a coluna de Nome');
      return;
    }
    
    post(route('client.contacts.import.process'), {
      onSuccess: () => {
        toast.success('Importação de contatos iniciada com sucesso!');
        window.location.href = route('client.contacts.index');
      },
      onError: (errors) => {
        toast.error('Erro ao iniciar a importação. Verifique os dados e tente novamente.');
      }
    });
  };
  
  const downloadTemplate = () => {
    const headers = ["nome","email","telefone","whatsapp","cpf_cnpj","empresa","cargo","endereco","cidade","estado","cep","pais","origem","status","observacoes"];
    const csvContent = headers.join(',') + '\n';
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'modelo_importacao_contatos.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <ClientLayout
      user={auth.user}
      header={
        <h2 className="font-semibold text-xl text-gray-800 leading-tight">
          Importar Contatos
        </h2>
      }
    >
      <Head title="Importar Contatos" />

      <div className="py-6">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="mb-4">
            <Link href={route('client.contacts.index')}>
              <Button variant="outline" className="flex items-center gap-1">
                <ArrowLeft className="h-4 w-4" />
                Voltar para lista
              </Button>
            </Link>
          </div>
          
          <Card>
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl">Importar Contatos via CSV</CardTitle>
              <CardDescription>
                Importe seus contatos de um arquivo CSV para a plataforma.
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              {step === 1 && (
                <div className="space-y-6">
                  <div className="border rounded-lg p-6 bg-gray-50 flex flex-col items-center justify-center">
                    <FileText className="h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium mb-2">Selecione um arquivo CSV</h3>
                    <p className="text-sm text-gray-500 text-center mb-4">
                      Selecione um arquivo CSV contendo seus contatos. O arquivo deve ter cabeçalhos na primeira linha.
                    </p>
                    <div className="flex items-center gap-4">
                      <Label
                        htmlFor="csv-file-upload"
                        className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-md cursor-pointer hover:bg-primary/90"
                      >
                        <Upload className="h-4 w-4" />
                        Selecionar Arquivo
                      </Label>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={downloadTemplate}
                        className="flex items-center gap-2"
                      >
                        <Download className="h-4 w-4" />
                        Baixar Modelo
                      </Button>
                    </div>
                    <Input
                      id="csv-file-upload"
                      type="file"
                      accept=".csv"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </div>
                  
                  <div className="rounded-lg border p-4 bg-amber-50">
                    <div className="flex gap-2">
                      <AlertCircle className="h-5 w-5 text-amber-600" />
                      <div className="flex-1">
                        <h4 className="font-medium text-amber-600">Dicas para importação</h4>
                        <ul className="list-disc pl-5 text-sm text-amber-700 mt-1 space-y-1">
                          <li>Utilize um arquivo CSV com cabeçalhos na primeira linha.</li>
                          <li>Certifique-se de que a coluna de nome está preenchida para todos os contatos.</li>
                          <li>Os números de telefone devem estar no formato (XX) XXXXX-XXXX.</li>
                          <li>Se tiver dúvidas, baixe nosso modelo de importação.</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {step === 2 && (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="rounded-lg border p-4 bg-blue-50 mb-4">
                    <div className="flex gap-2">
                      <AlertCircle className="h-5 w-5 text-blue-600" />
                      <div className="flex-1">
                        <h4 className="font-medium text-blue-600">Mapeie as colunas do seu arquivo</h4>
                        <p className="text-sm text-blue-700 mt-1">
                          Selecione a qual campo cada coluna do seu arquivo corresponde. Colunas não mapeadas serão ignoradas.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="rounded-md border overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[200px]">Coluna do CSV</TableHead>
                          <TableHead className="w-[200px]">Mapear para</TableHead>
                          {preview.length > 0 && <TableHead colSpan={preview.length}>Pré-visualização</TableHead>}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {headers.map((header, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{header}</TableCell>
                            <TableCell>
                              <Select
                                value={data.column_mapping[index]}
                                onValueChange={(value) => handleMappingChange(index, value)}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione um campo" />
                                </SelectTrigger>
                                <SelectContent>
                                  {contactFields.map((field) => (
                                    <SelectItem key={field.value} value={field.value}>
                                      {field.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </TableCell>
                            {preview.map((row, rowIndex) => (
                              <TableCell key={rowIndex}>
                                {row[index] || ''}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  
                  <div className="rounded-lg border p-4 bg-gray-50">
                    <div className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium">Confirme os dados</h4>
                        <p className="text-sm text-gray-500 mt-1">
                          Verifique se o mapeamento acima está correto antes de prosseguir. A importação irá adicionar todos os contatos do arquivo à sua base.
                        </p>
                      </div>
                    </div>
                  </div>
                </form>
              )}
            </CardContent>
            
            <CardFooter className="flex justify-between border-t p-6">
              {step === 1 ? (
                <div className="w-full flex justify-between">
                  <Link href={route('client.contacts.index')}>
                    <Button type="button" variant="outline">Cancelar</Button>
                  </Link>
                  <Button type="button" disabled={true}>
                    Próximo
                  </Button>
                </div>
              ) : (
                <div className="w-full flex justify-between">
                  <Button type="button" variant="outline" onClick={() => setStep(1)}>
                    Voltar
                  </Button>
                  <Button type="submit" onClick={handleSubmit} disabled={processing}>
                    {processing ? 'Importando...' : 'Iniciar Importação'}
                  </Button>
                </div>
              )}
            </CardFooter>
          </Card>
        </div>
      </div>
    </ClientLayout>
  );
} 