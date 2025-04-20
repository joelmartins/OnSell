"use client";
import { useState, useEffect, useMemo, useRef } from "react";
import { router, Head } from "@inertiajs/react";
import ClientLayout from '@/Layouts/ClientLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { MarkdownEditor } from '@/Components/ui/markdown-editor';
import ReactMarkdown from 'react-markdown';
import { AlertCircle, CheckCircle2, RefreshCw, Eye, Edit } from 'lucide-react';
import axios from 'axios';

// Função auxiliar para converter markdown para HTML (duplicada de markdown-editor.jsx)
const markdownToHtml = (markdown) => {
  try {
    let html = markdown || '';
    
    // Cabeçalhos
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
    
    // Negrito e itálico
    html = html.replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>');
    html = html.replace(/\*(.*)\*/gim, '<em>$1</em>');
    html = html.replace(/\_\_(.*)\_\_/gim, '<strong>$1</strong>');
    html = html.replace(/\_(.*)\_/gim, '<em>$1</em>');
    
    // Listas
    html = html.replace(/^\s*\n\* (.*)/gim, '<ul>\n<li>$1</li>\n</ul>');
    html = html.replace(/^\s*\n\- (.*)/gim, '<ul>\n<li>$1</li>\n</ul>');
    html = html.replace(/^\s*\n\d\. (.*)/gim, '<ol>\n<li>$1</li>\n</ol>');
    
    // Links
    html = html.replace(/\[(.*)]\((.*)\)/gim, '<a href="$2">$1</a>');
    
    // Parágrafos
    html = html.replace(/^\s*(\n)?(.+)/gim, function(m) {
      return /\<(\/)?(h\d|ul|ol|li|blockquote|pre|img)/.test(m) ? m : '<p>'+m+'</p>';
    });
    
    // Quebra de linha
    html = html.replace(/\n/gim, '<br />');
    
    return html.trim();
  } catch (e) {
    console.error('Erro ao converter markdown para HTML:', e);
    return markdown || '';
  }
};

const DELIVERABLE_TYPES = [
  'product_definition',
  'icp_profile',
  'decision_maker',
  'mental_triggers',
  'common_objections',
  'barriers_and_breaks',
  'prospection_strategies',
  'sales_scripts',
  'copy_anchors',
  'communication_pattern',
];

// Adicione um objeto para tradução dos nomes dos entregáveis
const DELIVERABLE_NAMES = {
  'product_definition': 'Definição de Produto',
  'icp_profile': 'Perfil de Cliente Ideal',
  'decision_maker': 'Tomador de Decisão',
  'mental_triggers': 'Gatilhos Mentais',
  'common_objections': 'Objeções Comuns',
  'barriers_and_breaks': 'Barreiras e Quebras',
  'prospection_strategies': 'Estratégias de Prospecção',
  'sales_scripts': 'Scripts de Vendas',
  'copy_anchors': 'Âncoras de Copy',
  'communication_pattern': 'Padrão de Comunicação',
};

export default function Deliverables({ deliverables }) {
  console.log('Entregáveis recebidos:', deliverables);
  
  const deliverablesMap = Array.isArray(deliverables)
    ? Object.fromEntries(deliverables.map(d => [d.type, d]))
    : {};
  
  const safeDeliverables = DELIVERABLE_TYPES.map(type =>
    deliverablesMap[type] || { type, output_markdown: '' }
  );

  const [editing, setEditing] = useState({});
  const [loading, setLoading] = useState({});
  const [allEmpty, setAllEmpty] = useState(false);
  const [incompleteCount, setIncompleteCount] = useState(0);
  const [reprocessingLoading, setReprocessingLoading] = useState(false);
  const [viewMode, setViewMode] = useState({}); // Para controlar modo de edição/visualização
  
  // Referências para os editores
  const editorRefs = useRef({});
  
  // Função auxiliar para preparar o markdown para exibição
  const prepareMarkdown = (markdown) => {
    if (!markdown) return '';
    
    let processed = markdown;
    
    // Remover blocos de código markdown que possam estar envolvendo o conteúdo
    processed = processed.replace(/^```markdown\s*|\s*```$/gm, '');
    processed = processed.replace(/^```md\s*|\s*```$/gm, '');
    processed = processed.replace(/^```\s*|\s*```$/gm, '');
    
    // Substituir tags <br> por quebras de linha normais no markdown
    processed = processed.replace(/<br\s*\/?>/gi, '\n');
    
    // Remover outras tags HTML potencialmente problemáticas
    processed = processed.replace(/<[^>]*>/g, (match) => {
      // Lista de tags comuns que podem ser mantidas
      const safeTags = ['b', 'i', 'strong', 'em', 'u', 'code', 'pre', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ol', 'ul', 'li', 'p'];
      // Verificar se é uma tag de abertura ou fechamento segura
      const isOpeningSafeTag = safeTags.some(tag => new RegExp(`<${tag}(\\s|>)`, 'i').test(match));
      const isClosingSafeTag = safeTags.some(tag => new RegExp(`</${tag}>`, 'i').test(match));
      
      // Manter apenas tags seguras
      if (isOpeningSafeTag || isClosingSafeTag) {
        return match;
      }
      
      // Remover tags inseguras
      return '';
    });
    
    // Normalizar quebras de linha
    processed = processed.replace(/\r\n/g, '\n');
    
    return processed.trim();
  };
  
  // Processa todos os markdowns de forma eficiente com useMemo
  const processedDeliverables = useMemo(() => {
    return safeDeliverables.map(d => ({
      ...d,
      output_markdown: prepareMarkdown(d.output_markdown)
    }));
  }, [safeDeliverables]);
  
  // Inicializar viewMode para todos os entregáveis como 'edit'
  useEffect(() => {
    const initialViewMode = {};
    DELIVERABLE_TYPES.forEach(type => {
      initialViewMode[type] = 'edit';
    });
    setViewMode(initialViewMode);
  }, []);

  // Verificar se todos os entregáveis estão vazios ou incompletos
  useEffect(() => {
    const isEmpty = processedDeliverables.every(d => !d.output_markdown || d.output_markdown.trim() === '');
    const incomplete = processedDeliverables.filter(d => !d.output_markdown || d.output_markdown.trim() === '').length;
    
    setAllEmpty(isEmpty);
    setIncompleteCount(incomplete);
    
    console.log('Todos os entregáveis estão vazios:', isEmpty);
    console.log('Entregáveis incompletos:', incomplete);
  }, [processedDeliverables]);

  function handleEditChange(type, value) {
    // Sanitizar o valor para evitar problemas com tags HTML inválidas
    const sanitizedValue = value ? value.replace(/<br\s*\/?>/gi, '\n') : '';
    setEditing({ ...editing, [type]: sanitizedValue });
  }

  function handleViewModeToggle(type) {
    setViewMode({
      ...viewMode,
      [type]: viewMode[type] === 'edit' ? 'preview' : 'edit'
    });
  }

  function handleRegenerate(type) {
    setLoading({ ...loading, [type]: true });
    
    // Usar Axios em vez de Inertia para evitar o erro de resposta JSON
    axios.post(route('client.salesintelligence.generate', { type }))
      .then(response => {
        const data = response.data;
        toast.success('Entregável gerado!');
        setLoading({ ...loading, [type]: false });
        
        // Extrair o entregável da resposta
        const deliverableData = data.deliverable || {};
        
        // Atualizar o editor
        if (deliverableData.output_markdown) {
          setEditing({ ...editing, [type]: deliverableData.output_markdown });
          
          // Atualizar o editor diretamente se disponível
          if (editorRefs.current[type]) {
            editorRefs.current[type].setMarkdown(deliverableData.output_markdown);
          }
        }
      })
      .catch(error => {
        console.error('Erro ao gerar entregável:', error);
        toast.error('Erro ao gerar entregável.');
        setLoading({ ...loading, [type]: false });
      });
  }
  
  function handleGenerateAll() {
    setLoading({ all: true });
    toast.info('Iniciando geração de todos os entregáveis. Isso pode levar alguns minutos...');
    
    let processedCount = 0;
    let remainingTypes = [...DELIVERABLE_TYPES];
    
    // Função recursiva melhorada para garantir que todos os entregáveis sejam processados
    const generateNext = () => {
      if (remainingTypes.length === 0) {
        setLoading({ all: false });
        toast.success('Todos os entregáveis foram gerados!');
        router.reload();
        return;
      }
      
      const type = remainingTypes.shift();
      setLoading(prev => ({ ...prev, [type]: true }));
      
      axios.post(route('client.salesintelligence.generate', { type }))
        .then(response => {
          processedCount++;
          
          // Extrair e atualizar o entregável se disponível
          const deliverableData = response.data.deliverable || {};
          if (deliverableData.output_markdown && editorRefs.current[type]) {
            editorRefs.current[type].setMarkdown(deliverableData.output_markdown);
            setEditing({ ...editing, [type]: deliverableData.output_markdown });
          }
          
          toast.info(`Entregável ${processedCount} de ${DELIVERABLE_TYPES.length} gerado: ${type.replace(/_/g, ' ')}`);
          setLoading(prev => ({ ...prev, [type]: false }));
          
          // Continue com o próximo após um breve delay
          setTimeout(generateNext, 2000); // Aumentado para 2 segundos
        })
        .catch(error => {
          console.error(`Erro ao gerar entregável ${type}:`, error);
          toast.error(`Erro ao gerar entregável ${type}. Tentando o próximo...`);
          setLoading(prev => ({ ...prev, [type]: false }));
          
          // Continue com o próximo mesmo em caso de erro
          setTimeout(generateNext, 2000);
        });
    };
    
    // Iniciar a geração
    generateNext();
  }

  function handleSave(type) {
    setLoading({ ...loading, [type]: true });
    
    // Obter o markdown do editor diretamente
    const markdownToSave = editorRefs.current[type] 
      ? prepareMarkdown(editorRefs.current[type].getMarkdown() || '')
      : (editing[type] ? prepareMarkdown(editing[type]) : '');
    
    // Usar Axios em vez de Inertia para evitar o erro de resposta JSON
    axios.post(route('client.salesintelligence.save', { type }), { 
      output_markdown: markdownToSave 
    })
      .then(response => {
        toast.success('Entregável salvo!');
        setLoading({ ...loading, [type]: false });
      })
      .catch(error => {
        console.error('Erro ao salvar entregável:', error);
        toast.error('Erro ao salvar entregável.');
        setLoading({ ...loading, [type]: false });
      });
  }

  function handleReprocessMissing() {
    setReprocessingLoading(true);
    toast.info('Reprocessando entregáveis pendentes...');
    
    // Identificar quais entregáveis estão pendentes usando os processedDeliverables
    const pendingTypes = DELIVERABLE_TYPES.filter(type => {
      const deliverable = processedDeliverables.find(d => d.type === type);
      return !deliverable || !deliverable.output_markdown || deliverable.output_markdown.trim() === '';
    });
    
    // Se não houver pendentes, retornar
    if (pendingTypes.length === 0) {
      toast.info('Não há entregáveis pendentes para reprocessar.');
      setReprocessingLoading(false);
      return;
    }
    
    let processedCount = 0;
    let remainingTypes = [...pendingTypes];
    
    // Função recursiva para processar cada entregável pendente
    const processNext = () => {
      if (remainingTypes.length === 0) {
        setReprocessingLoading(false);
        toast.success('Todos os entregáveis pendentes foram processados!');
        router.reload();
        return;
      }
      
      const type = remainingTypes.shift();
      setLoading(prev => ({ ...prev, [type]: true }));
      
      axios.post(route('client.salesintelligence.generate', { type }))
        .then(response => {
          processedCount++;
          
          // Extrair e atualizar o entregável se disponível
          const deliverableData = response.data.deliverable || {};
          if (deliverableData.output_markdown && editorRefs.current[type]) {
            editorRefs.current[type].setMarkdown(deliverableData.output_markdown);
            setEditing({ ...editing, [type]: deliverableData.output_markdown });
          }
          
          toast.info(`Entregável pendente ${processedCount} de ${pendingTypes.length} processado: ${type.replace(/_/g, ' ')}`);
          setLoading(prev => ({ ...prev, [type]: false }));
          
          // Continue com o próximo após um breve delay
          setTimeout(processNext, 2000);
        })
        .catch(error => {
          console.error(`Erro ao processar entregável pendente ${type}:`, error);
          toast.error(`Erro ao processar entregável ${type}. Tentando o próximo...`);
          setLoading(prev => ({ ...prev, [type]: false }));
          
          // Continue com o próximo mesmo em caso de erro
          setTimeout(processNext, 2000);
        });
    };
    
    // Iniciar o processamento
    processNext();
  }

  return (
    <ClientLayout title="Mapa de Inteligência">
      <Head title="Mapa de Inteligência" />
      <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold">Mapa de Inteligência</h2>
          <p className="text-muted-foreground">Gere, edite e salve cada entregável individualmente. Utilize o editor abaixo para formatar seu conteúdo em <b>Markdown</b> de forma visual (WYSIWYG). Todos os botões e instruções estão em português.</p>
          
          {allEmpty && (
            <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-md">
              <p className="text-amber-800 mb-3">Nenhum entregável foi gerado ainda. Você precisa preencher o formulário de diagnóstico primeiro para que possamos gerar seu mapa de inteligência.</p>
              <Button 
                onClick={() => router.visit(route('client.salesintelligence.diagnosis'))}
                className="bg-amber-600 hover:bg-amber-700 text-white"
              >
                Ir para o Formulário de Diagnóstico
              </Button>
            </div>
          )}
          
          {!allEmpty && incompleteCount > 0 && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle className="text-blue-600 w-5 h-5" />
                <p className="text-blue-800">
                  {incompleteCount === 1 
                    ? 'Existe 1 entregável faltando conteúdo.' 
                    : `Existem ${incompleteCount} entregáveis faltando conteúdo.`}
                </p>
              </div>
              <Button 
                onClick={handleReprocessMissing} 
                disabled={reprocessingLoading} 
                className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${reprocessingLoading ? 'animate-spin' : ''}`} />
                {reprocessingLoading ? 'Reprocessando... Aguarde' : 'Reprocessar Entregáveis Faltantes'}
              </Button>
            </div>
          )}
          
          {!allEmpty && incompleteCount === 0 && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="text-green-600 w-5 h-5" />
                <p className="text-green-800">Todos os entregáveis foram gerados com sucesso!</p>
              </div>
            </div>
          )}
        </div>
        
        <div className="space-y-6">
          {processedDeliverables.map((d) => (
            <Card key={d.type} className="w-full">
              <CardHeader>
                <CardTitle>{DELIVERABLE_NAMES[d.type] || d.type.replace(/_/g, ' ')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="w-full" data-color-mode="light">
                  <MarkdownEditor
                    ref={(el) => (editorRefs.current[d.type] = el)}
                    markdown={editing[d.type] !== undefined ? editing[d.type] : d.output_markdown || ''}
                    onChange={(val) => handleEditChange(d.type, val || '')}
                    placeholder="Digite ou cole seu conteúdo em markdown aqui..."
                    className="min-h-[300px]"
                  />
                </div>
                <div className="flex gap-2 justify-end mt-2">
                  <Button type="button" variant="secondary" disabled={loading[d.type]} onClick={() => handleRegenerate(d.type)}>
                    {loading[d.type] ? 'Processando...' : 'Regerar IA'}
                  </Button>
                  <Button type="button" disabled={loading[d.type]} onClick={() => handleSave(d.type)}>
                    {loading[d.type] ? 'Salvando...' : 'Salvar' }
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </motion.div>
    </ClientLayout>
  );
} 