"use client";
import ClientLayout from '@/Layouts/ClientLayout';
import { Head, router, usePage } from '@inertiajs/react';
import { Card, CardHeader, CardTitle, CardContent } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Progress } from '@/Components/ui/progress';
import { motion, AnimatePresence } from 'framer-motion';

export default function IntelligenceMap({ existing, customer_answers, page_title }) {
  const { flash } = usePage().props;

  const [loading, setLoading] = useState(false);
  const [aiResult, setAiResult] = useState(existing?.ai_analysis || null);
  const [customerAnswers, setCustomerAnswers] = useState(customer_answers || {});
  const [processingAI, setProcessingAI] = useState(false);

  const loadingPhrases = [
    'Enviando informações para a IA...',
    'A IA está analisando os dados...',
    'Gerando recomendações inteligentes...',
    'Quase pronto! Finalizando análise...'
  ];
  const [loadingPhraseIdx, setLoadingPhraseIdx] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Se tivermos dados existentes, atualizamos o estado local
    if (existing && existing.customer_answers) {
      setCustomerAnswers(existing.customer_answers);
    }
  
    console.log('Intelligence Map - Dados recebidos:', {
      existing,
      hasCustomerAnswers: existing?.customer_answers ? Object.keys(existing.customer_answers).length > 0 : false,
      hasAiAnalysis: existing?.ai_analysis ? true : false
    });

    // Verificar flash messages quando o componente montar ou atualizar
    if (flash.success) {
      toast.success(flash.message || 'Operação realizada com sucesso!');
      
      // Se temos uma análise de IA nas flash messages, atualizar o estado
      if (flash.ai_analysis) {
        setAiResult(flash.ai_analysis);
      }
    }
    
    if (flash.error) {
      toast.error(flash.error);
    }
  }, [existing, flash]);

  useEffect(() => {
    let phraseInterval, progressInterval;
    if (processingAI) {
      setLoadingPhraseIdx(0);
      setProgress(0);
      phraseInterval = setInterval(() => {
        setLoadingPhraseIdx((idx) => (idx + 1) % loadingPhrases.length);
      }, 1500);
      progressInterval = setInterval(() => {
        setProgress((p) => (p >= 100 ? 0 : p + 5 + Math.random() * 10));
      }, 200);
    } else {
      setProgress(0);
    }
    return () => {
      clearInterval(phraseInterval);
      clearInterval(progressInterval);
    };
  }, [processingAI]);

  // Verificar se temos dados suficientes para gerar a análise
  const hasEnoughData = () => {
    // Verifica se existe pelo menos um objeto customerAnswers com dados básicos
    if (!customerAnswers || Object.keys(customerAnswers).length === 0) {
      return false;
    }
    
    // Verifica se há dados básicos do diagnóstico (etapa 1)
    const hasDiagnosisData = customerAnswers.product && 
                             customerAnswers.decision_role;
                             
    // Verificar dados da etapa 1 ou dados suficientes nas outras etapas
    return hasDiagnosisData || 
           (customerAnswers.emotional && Object.keys(customerAnswers.emotional).length > 2) ||
           (customerAnswers.access && Object.keys(customerAnswers.access).length > 2);
  };

  const handleProcessAI = () => {
    if (!hasEnoughData()) {
      toast.error("Preencha pelo menos os campos básicos do diagnóstico para gerar a análise.");
      return;
    }
    
    setProcessingAI(true);
    toast.info("Enviando dados para análise de IA...");
    
    // Usando o router do Inertia para enviar a requisição POST para a rota nomeada
    router.post(route('client.salesintelligence.process-ai'), 
      { customer_answers: customerAnswers },
      {
        preserveState: true,
        onSuccess: (page) => {
          setProcessingAI(false);
          // Se obtivemos ai_analysis diretamente na resposta, atualizamos o estado
          if (page.props.flash.ai_analysis) {
            setAiResult(page.props.flash.ai_analysis);
            toast.success("Análise de IA gerada com sucesso!");
          }
        },
        onError: (errors) => {
          setProcessingAI(false);
          const errorMessage = errors.error || "Erro ao processar análise de IA. Tente novamente.";
          toast.error(errorMessage);
          console.error("Erro no processamento de IA:", errors);
        },
        onFinish: () => {
          setProcessingAI(false);
        }
      }
    );
  };

  return (
    <ClientLayout title="Intelligence Map">
      <Head title="Intelligence Map" />
      <div className="mb-8">
        <h2 className="text-2xl font-semibold">Intelligence Map</h2>
        <p className="text-muted-foreground">Resumo do ICP, perfil do decisor, objeções, gatilhos e estratégias.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Dados do Cliente</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-sm space-y-2">
              {Object.entries(customerAnswers).length === 0 && (
                <li className="text-zinc-400">Nenhum dado preenchido ainda. Complete o diagnóstico na primeira etapa.</li>
              )}
              {Object.entries(customerAnswers).map(([key, value]) => (
                <li key={key}>
                  <span className="font-medium capitalize">{key.replace(/_/g, ' ')}:</span> {typeof value === 'string' ? value : JSON.stringify(value)}
                </li>
              ))}
            </ul>
            {Object.entries(customerAnswers).length === 0 && (
              <div className="mt-4">
                <Button onClick={() => router.visit(route('salesintelligence.diagnosis'))}>
                  Ir para Diagnóstico
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Resultado da IA</CardTitle>
          </CardHeader>
          <CardContent className="relative">
            <AnimatePresence>
              {processingAI && (
                <motion.div
                  key="ai-loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm rounded"
                >
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="w-full max-w-xs flex flex-col items-center"
                  >
                    <Progress value={progress} className="mb-4 h-2 w-full" />
                    <div className="text-base font-medium text-blue-700 dark:text-blue-200 text-center animate-pulse">
                      {loadingPhrases[loadingPhraseIdx]}
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
            {aiResult ? (
              <div className="space-y-3">
                <div>
                  <span className="font-medium">Perfil do Decisor:</span> <span className="inline-block rounded px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">{aiResult.profile}</span>
                </div>
                <div>
                  <span className="font-medium">Tom de Comunicação:</span> <span className="inline-block rounded px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">{aiResult.communication_tone}</span>
                </div>
                <div>
                  <span className="font-medium">Resumo:</span> <span className="text-zinc-700 dark:text-zinc-200">{aiResult.summary}</span>
                </div>
                <div>
                  <span className="font-medium">Gatilhos Emocionais:</span>
                  <ul className="list-disc ml-6">
                    {aiResult.emotional_triggers?.map((t, i) => (
                      <li key={i}>{t}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <span className="font-medium">Objeções Prováveis:</span>
                  <ul className="list-disc ml-6">
                    {aiResult.objections?.map((o, i) => (
                      <li key={i}>{o}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <span className="font-medium">Copy Anchors:</span>
                  <ul className="list-disc ml-6">
                    {aiResult.copy_anchors?.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </div>
                <Button onClick={handleProcessAI} disabled={processingAI || !hasEnoughData()} variant="outline" className="mt-3">
                  {processingAI ? 'Reprocessando...' : 'Reprocessar Análise de IA'}
                </Button>
              </div>
            ) : (
              <div>
                <p className="mb-4">Nenhuma análise de IA gerada ainda.</p>
                <Button onClick={handleProcessAI} disabled={processingAI || !hasEnoughData()}>
                  {processingAI ? 'Processando...' : 'Gerar Análise de IA'}
                </Button>
                {!hasEnoughData() && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Preencha pelo menos o diagnóstico básico para gerar a análise.
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ClientLayout>
  );
} 