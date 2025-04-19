"use client";
import { useState, useEffect } from "react";
import { router, Head } from "@inertiajs/react";
import ClientLayout from '@/Layouts/ClientLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import MDEditor from '@uiw/react-md-editor';
import '@uiw/react-md-editor/markdown-editor.css';
import '@uiw/react-markdown-preview/markdown.css';

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
  
  // Verificar se todos os entregáveis estão vazios
  useEffect(() => {
    const isEmpty = safeDeliverables.every(d => !d.output_markdown || d.output_markdown.trim() === '');
    setAllEmpty(isEmpty);
    console.log('Todos os entregáveis estão vazios:', isEmpty);
  }, [safeDeliverables]);

  function handleEditChange(type, value) {
    setEditing({ ...editing, [type]: value });
  }

  function handleRegenerate(type) {
    setLoading({ ...loading, [type]: true });
    router.post(
      route('client.salesintelligence.generate', { type }),
      {},
      {
        onSuccess: (page) => {
          toast.success('Entregável gerado!');
          setLoading({ ...loading, [type]: false });
          const novo = page.props?.deliverable || safeDeliverables.find(d => d.type === type);
          setEditing({ ...editing, [type]: novo.output_markdown });
        },
        onError: () => {
          toast.error('Erro ao gerar entregável.');
          setLoading({ ...loading, [type]: false });
        },
      }
    );
  }
  
  function handleGenerateAll() {
    setLoading({ all: true });
    toast.info('Iniciando geração de todos os entregáveis. Isso pode levar alguns minutos...');
    
    let processedCount = 0;
    
    // Gerar entregáveis sequencialmente para evitar sobrecarga
    const generateNext = (index = 0) => {
      if (index >= DELIVERABLE_TYPES.length) {
        setLoading({ all: false });
        toast.success('Todos os entregáveis foram gerados!');
        // Recarregar a página para mostrar os novos entregáveis
        router.reload();
        return;
      }
      
      const type = DELIVERABLE_TYPES[index];
      router.post(
        route('client.salesintelligence.generate', { type }),
        {},
        {
          onSuccess: () => {
            processedCount++;
            toast.info(`Entregável ${processedCount} de ${DELIVERABLE_TYPES.length} gerado.`);
            // Continuar com o próximo após um breve delay
            setTimeout(() => generateNext(index + 1), 1000);
          },
          onError: () => {
            toast.error(`Erro ao gerar entregável ${type}`);
            // Continuar mesmo em caso de erro
            setTimeout(() => generateNext(index + 1), 1000);
          }
        }
      );
    };
    
    // Iniciar a geração
    generateNext();
  }

  function handleSave(type) {
    setLoading({ ...loading, [type]: true });
    router.post(
      route('client.salesintelligence.save', { type }),
      { output_markdown: editing[type] },
      {
        onSuccess: () => {
          toast.success('Entregável salvo!');
          setLoading({ ...loading, [type]: false });
        },
        onError: () => {
          toast.error('Erro ao salvar entregável.');
          setLoading({ ...loading, [type]: false });
        },
      }
    );
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
              <p className="text-amber-800 mb-3">Nenhum entregável foi gerado ainda. Você pode gerar todos de uma vez clicando no botão abaixo.</p>
              <Button 
                onClick={handleGenerateAll} 
                disabled={loading.all} 
                className="bg-amber-600 hover:bg-amber-700 text-white"
              >
                {loading.all ? 'Gerando entregáveis...' : 'Gerar Todos os Entregáveis'}
              </Button>
            </div>
          )}
        </div>
        <div className="space-y-6">
          {safeDeliverables.map((d) => (
            <Card key={d.type} className="w-full">
              <CardHeader>
                <CardTitle>{d.type.replace(/_/g, ' ').toUpperCase()}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-2 text-sm text-muted-foreground">Edite o conteúdo abaixo usando o editor visual. Você pode formatar títulos, listas, tabelas e visualizar em tempo real.</div>
                <div className="w-full" data-color-mode="light">
                  <MDEditor
                    value={editing[d.type] !== undefined ? editing[d.type] : d.output_markdown || ''}
                    height={300}
                    onChange={val => handleEditChange(d.type, val || '')}
                    preview="edit"
                    textareaProps={{
                      placeholder: "Digite ou cole seu conteúdo em markdown aqui...",
                      'aria-label': 'Editor de markdown',
                    }}
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