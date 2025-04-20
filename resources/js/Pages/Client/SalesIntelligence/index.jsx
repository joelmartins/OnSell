"use client";
import { useState, useEffect } from "react";
import { router, Head } from "@inertiajs/react";
import ClientLayout from '@/Layouts/ClientLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/Components/ui/card';
import { FormItem, FormLabel, FormControl, FormMessage } from '@/Components/ui/form';
import { Input } from '@/Components/ui/input';
import { Button } from '@/Components/ui/button';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import axios from 'axios';

// Dialog/Modal e Progress para mostrar o status de processamento
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/Components/ui/dialog";
import { Progress } from "@/Components/ui/progress";
import { Dialog as ConfirmDialog, DialogContent as ConfirmDialogContent, DialogHeader as ConfirmDialogHeader, DialogTitle as ConfirmDialogTitle, DialogDescription as ConfirmDialogDescription } from "@/Components/ui/dialog";

const sections = [
  {
    title: '🔥 Parte 1: Sobre o que você vende',
    questions: [
      { name: "product", label: "Qual é o seu produto ou serviço principal?", placeholder: "Ex.: Marketing digital, consultoria, energia solar", example: "Exemplo: Marketing digital, consultoria, energia solar" },
      { name: "transformation", label: "Em poucas palavras, qual transformação você entrega para seus clientes?", placeholder: "Ex.: Aumento de vendas, redução de custos, geração de leads", example: "Exemplo: Aumento de vendas, redução de custos, geração de leads" },
      { name: "proofs", label: "Quais provas ou resultados você pode mostrar?", placeholder: "Ex.: N° de clientes, anos no mercado, prêmios, cases", example: "Exemplo: N° de clientes, anos no mercado, prêmios, cases" },
    ]
  },
  {
    title: '💡 Parte 2: Sobre seu cliente ideal',
    questions: [
      { name: "ideal_customer", label: "Qual é o tipo de cliente que mais se beneficia?", placeholder: "Ex.: Empresas B2B, dentistas, lojas de roupas, advogados", example: "Exemplo: Empresas B2B, dentistas, lojas de roupas, advogados" },
      { name: "company_size", label: "Essas empresas geralmente são de qual porte?", placeholder: "Pequenas, médias, grandes; ou faixa de faturamento", example: "Exemplo: Pequenas, médias, grandes; ou faixa de faturamento" },
      { name: "location", label: "Onde geralmente estão localizadas?", placeholder: "Ex.: Brasil inteiro, São Paulo, EUA", example: "Exemplo: Brasil inteiro, São Paulo, EUA" },
      { name: "company_moment", label: "Qual é o momento dessas empresas?", placeholder: "Início, crescimento, crise, estabilidade", example: "Exemplo: Início, crescimento, crise, estabilidade" },
      { name: "motivators", label: "O que elas mais querem conquistar ao contratar você?", placeholder: "Ex.: aumentar vendas, reduzir custos, ganhar tempo", example: "Exemplo: aumentar vendas, reduzir custos, ganhar tempo" },
      { name: "emotional_characteristics", label: "Como você descreveria o comportamento emocional dessas empresas?", placeholder: "Ex.: conservadoras, inovadoras, técnicas, relacionais", example: "Exemplo: conservadoras, inovadoras, técnicas, relacionais" },
    ]
  },
  {
    title: '🧠 Parte 3: Sobre o tomador de decisão',
    questions: [
      { name: "decision_maker", label: "Quem toma a decisão final?", placeholder: "Ex.: Dono, CEO, diretor comercial, gerente de marketing", example: "Exemplo: Dono, CEO, diretor comercial, gerente de marketing" },
      { name: "fears", label: "Quais são os maiores medos e frustrações dele?", placeholder: "Ex.: perder vendas, escolher errado, perder dinheiro", example: "Exemplo: perder vendas, escolher errado, perder dinheiro" },
      { name: "desires", label: "Quais são os sonhos ou desejos dele?", placeholder: "Ex.: crescimento rápido, reconhecimento, liberdade financeira", example: "Exemplo: crescimento rápido, reconhecimento, liberdade financeira" },
      { name: "decision_behavior", label: "Ele é mais impulsivo, analítico, cético ou relacional na hora de decidir?", placeholder: "", example: "Exemplo: impulsivo, analítico, cético ou relacional" },
    ]
  },
  {
    title: '🚪 Parte 4: Como acessar o decisor',
    questions: [
      { name: "first_contact", label: "Normalmente você fala primeiro com quem?", placeholder: "Ex.: recepcionista, secretária, dono direto", example: "Exemplo: recepcionista, secretária, dono direto" },
      { name: "easy_access", label: "É fácil chegar até o decisor?", placeholder: "Sim/Não", example: "Exemplo: Sim/Não" },
      { name: "easy_closing", label: "Quando fala com o decisor, é fácil convencer?", placeholder: "Sim/Não", example: "Exemplo: Sim/Não" },
    ]
  },
  {
    title: '🎯 Parte 5: Emocional e objeções',
    questions: [
      { name: "objections", label: "Quais são as principais objeções que você enfrenta nas vendas?", placeholder: "Ex.: preço, desconfiança, já tem fornecedor", example: "Exemplo: preço, desconfiança, já tem fornecedor" },
      { name: "dream_promise", label: "Se pudesse fazer uma promessa dos sonhos para o seu cliente, qual seria?", placeholder: "Ex.: 'Dobrar suas vendas em 90 dias', '10 reuniões qualificadas por mês'", example: "Exemplo: 'Dobrar suas vendas em 90 dias', '10 reuniões qualificadas por mês'" },
      { name: "past_attempts", label: "O que seu cliente já tentou antes e não funcionou?", placeholder: "Ex.: campanhas de marketing ineficazes, vendas porta a porta", example: "Exemplo: campanhas de marketing ineficazes, vendas porta a porta" },
    ]
  },
];

export default function SalesIntelligence({ existing }) {
  const [answers, setAnswers] = useState(existing?.answers || {});
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  // Estados para a modal de processamento
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  
  // Estado para modal de confirmação de sobrescrita
  const [showConfirm, setShowConfirm] = useState(false);
  const [hasDeliverables, setHasDeliverables] = useState(false);
  const [pendingSubmit, setPendingSubmit] = useState(false);
  
  // Checagem inicial de entregáveis existentes
  useEffect(() => {
    axios.get(route('client.salesintelligence.check-progress'))
      .then(response => {
        const existingDeliverables = response.data?.deliverables || {};
        if (Object.keys(existingDeliverables).length > 0) {
          setHasDeliverables(true);
        }
      })
      .catch(() => {});
  }, []);
  
  // Função para verificar o progresso real da geração dos entregáveis
  const checkDeliverableProgress = (options = {}) => {
    const { polling = false } = options;
    const types = [
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
    const typeMessages = {
      'product_definition': "Processando definição do produto...",
      'icp_profile': "Analisando perfil do cliente ideal (ICP)...",
      'decision_maker': "Criando perfil do tomador de decisão...",
      'mental_triggers': "Identificando gatilhos mentais principais...",
      'common_objections': "Mapeando objeções comuns de venda...",
      'barriers_and_breaks': "Definindo barreiras e estratégias...",
      'prospection_strategies': "Elaborando estratégias de prospecção...",
      'sales_scripts': "Criando scripts de vendas personalizados...",
      'copy_anchors': "Gerando âncoras de comunicação...",
      'communication_pattern': "Definindo padrão de comunicação...",
    };
    setCurrentStep("Iniciando geração dos entregáveis...");
    setProgress(5);
    setTimeout(() => {
      axios.get(route('client.salesintelligence.check-progress'))
        .then(response => {
          const existingDeliverables = response.data?.deliverables || {};
          const existingTypes = Object.keys(existingDeliverables);
          const pendingTypes = types.filter(type => !existingTypes.includes(type));
          const initialProgress = Math.min(5 + Math.floor((existingTypes.length / types.length) * 90), 95);
          setProgress(initialProgress);
          if (pendingTypes.length === 0) {
            setProgress(100);
            setCurrentStep("Todos os entregáveis já estão prontos! Redirecionando...");
            setTimeout(() => {
              router.visit(route('client.salesintelligence.deliverables'));
            }, 1500);
            return;
          }
          let processedCount = existingTypes.length;
          let remainingTypes = [...pendingTypes];
          const processNext = () => {
            if (remainingTypes.length === 0) {
              setProgress(100);
              setCurrentStep("Pronto! Redirecionando para os resultados...");
              setTimeout(() => {
                router.visit(route('client.salesintelligence.deliverables'), {
                  onSuccess: () => {
                    setProcessing(false);
                    setLoading(false);
                  }
                });
              }, 1500);
              return;
            }
            const type = remainingTypes.shift();
            setCurrentStep(typeMessages[type] || `Processando ${type.replace(/_/g, ' ')}...`);
            processedCount++;
            const newProgress = Math.min(5 + Math.floor((processedCount / types.length) * 90), 95);
            setProgress(newProgress);
            axios.post(route('client.salesintelligence.generate', { type }))
              .then(() => {
                setTimeout(processNext, 2000);
              })
              .catch(error => {
                console.error(`Erro ao gerar entregável ${type}:`, error);
                setTimeout(processNext, 2000);
              });
          };
          processNext();
        })
        .catch(error => {
          console.error('Erro ao verificar progresso inicial:', error);
          generateAllDirectly();
        });
    }, 3000);
    // Função alternativa para gerar todos diretamente em caso de falha na verificação
    const generateAllDirectly = () => {
      let processedCount = 0;
      let remainingTypes = [...types];
      const processNext = () => {
        if (remainingTypes.length === 0) {
          setProgress(100);
          setCurrentStep("Pronto! Redirecionando para os resultados...");
          setTimeout(() => {
            router.visit(route('client.salesintelligence.deliverables'), {
              onSuccess: () => {
                setProcessing(false);
                setLoading(false);
              }
            });
          }, 1500);
          return;
        }
        const type = remainingTypes.shift();
        setCurrentStep(typeMessages[type] || `Processando ${type.replace(/_/g, ' ')}...`);
        processedCount++;
        const newProgress = Math.min(5 + Math.floor((processedCount / types.length) * 90), 95);
        setProgress(newProgress);
        axios.post(route('client.salesintelligence.generate', { type }))
          .then(() => {
            setTimeout(processNext, 2000);
          })
          .catch(error => {
            console.error(`Erro ao gerar entregável ${type}:`, error);
            setTimeout(processNext, 2000);
          });
      };
      processNext();
    };
    // Se estiver em modo polling, repetir a checagem até todos estarem prontos
    if (polling) {
      let interval = setInterval(() => {
        axios.get(route('client.salesintelligence.check-progress'))
          .then(response => {
            const existingDeliverables = response.data?.deliverables || {};
            const existingTypes = Object.keys(existingDeliverables);
            if (existingTypes.length === types.length) {
              clearInterval(interval);
              setProgress(100);
              setCurrentStep("Todos os entregáveis já estão prontos! Redirecionando...");
              setTimeout(() => {
                router.visit(route('client.salesintelligence.deliverables'));
              }, 1500);
            } else {
              setProgress(Math.min(5 + Math.floor((existingTypes.length / types.length) * 90), 95));
              setCurrentStep(`Aguardando geração dos entregáveis... (${existingTypes.length}/${types.length})`);
            }
          })
          .catch(() => {});
      }, 5000);
    }
  };

  function handleChange(e) {
    setAnswers({ ...answers, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: undefined });
  }

  function validateAll() {
    const newErrors = {};
    sections.forEach(section => {
      section.questions.forEach(q => {
        if (!answers[q.name] || answers[q.name].trim() === "") {
          newErrors[q.name] = 'Campo obrigatório';
        }
      });
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!validateAll()) {
      toast.error('Preencha todos os campos obrigatórios. Quanto mais completo e detalhado, maior a qualidade da nossa inteligência em vendas.');
      return;
    }
    if (hasDeliverables) {
      setShowConfirm(true);
      setPendingSubmit(true);
      return;
    }
    submitAnswers();
  }

  function submitAnswers(forceAll = false) {
    setLoading(true);
    axios.post(route('client.salesintelligence.answers'), { answers })
      .then(response => {
        if (response.data && response.data.success) {
          toast.success('Respostas salvas com sucesso!');
          setProcessing(true);
          if (forceAll) {
            // Chamar rota de reprocessamento com force_all=true
            axios.post(route('client.salesintelligence.reprocess'), { force_all: true })
              .then(() => {
                // Iniciar polling para aguardar reprocessamento
                checkDeliverableProgress({ polling: true });
              })
              .catch(() => {
                checkDeliverableProgress({ polling: true });
              });
          } else {
            checkDeliverableProgress();
          }
        } else {
          toast.error('Erro ao processar respostas.');
          setLoading(false);
        }
      })
      .catch(error => {
        console.error('Erro ao enviar respostas:', error);
        toast.error('Erro ao salvar respostas.');
        setLoading(false);
      });
  }

  function handleConfirmGenerate() {
    setShowConfirm(false);
    setPendingSubmit(false);
    submitAnswers(true); // Forçar sobrescrita
  }

  function handleCancelGenerate() {
    setShowConfirm(false);
    setPendingSubmit(false);
  }

  return (
    <ClientLayout title="Sales Intelligence Capture">
      <Head title="Sales Intelligence Capture" />
      
      {/* Modal de confirmação para sobrescrever entregáveis */}
      <ConfirmDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <ConfirmDialogContent className="sm:max-w-md">
          <ConfirmDialogHeader>
            <ConfirmDialogTitle className="text-xl">Entregáveis já existem</ConfirmDialogTitle>
            <ConfirmDialogDescription className="text-center text-sm text-muted-foreground">
              Já existem entregáveis gerados anteriormente. Deseja gerar novos entregáveis e sobrescrever os atuais?<br />
              <span className="font-semibold text-red-600">Esta ação irá substituir os entregáveis anteriores.</span>
            </ConfirmDialogDescription>
          </ConfirmDialogHeader>
          <div className="flex justify-center gap-4 mt-6">
            <Button variant="outline" onClick={handleCancelGenerate} disabled={loading}>Cancelar</Button>
            <Button onClick={handleConfirmGenerate} disabled={loading} className="bg-red-600 hover:bg-red-700 text-white">Gerar Novos</Button>
          </div>
        </ConfirmDialogContent>
      </ConfirmDialog>
      
      {/* Modal de processamento */}
      <Dialog open={processing} onOpenChange={setProcessing}>
        <DialogContent className="sm:max-w-md processing-dialog">
          <DialogHeader>
            <DialogTitle className="text-xl">Gerando Mapa de Inteligência</DialogTitle>
            <DialogDescription className="text-center text-sm text-muted-foreground">
              Isso pode levar alguns minutos. Por favor, não feche esta janela.
            </DialogDescription>
          </DialogHeader>
          <div className="py-6">
            <Progress value={progress} className="h-2 mb-4" />
            <p className="text-center text-muted-foreground">{currentStep}</p>
          </div>
          
          {/* CSS para esconder o botão de fechar */}
          <style>{`
            .processing-dialog [aria-label="Close"] {
              display: none !important;
            }
          `}</style>
        </DialogContent>
      </Dialog>
      
      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full py-8 space-y-10"
      >
        <div className="mb-8">
          <h2 className="text-3xl font-bold">Sales Intelligence Capture</h2>
          <p className="text-muted-foreground">Responda as 19 perguntas abaixo para gerar seu mapa de inteligência de vendas.<br /><span className='font-semibold text-orange-600'>Atenção: quanto mais completas e detalhadas suas respostas, maior a qualidade da inteligência gerada para o seu negócio.</span></p>
        </div>
        {sections.map((section, idx) => (
          <Card key={section.title} className="w-full">
            <CardHeader>
              <CardTitle>{section.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {section.questions.map((q) => (
                <FormItem key={q.name}>
                  <FormLabel htmlFor={q.name}>{q.label}</FormLabel>
                  <FormControl>
                    <Input
                      id={q.name}
                      name={q.name}
                      type="text"
                      placeholder={q.placeholder}
                      value={answers[q.name] || ""}
                      onChange={handleChange}
                      required
                    />
                  </FormControl>
                  <div className="text-xs text-muted-foreground mt-1">{q.example}</div>
                  <FormMessage>{errors[q.name]}</FormMessage>
                </FormItem>
              ))}
            </CardContent>
          </Card>
        ))}
        <div className="flex justify-end pt-4">
          <Button type="submit" size="lg" className="px-8" disabled={loading}>
            {loading ? "Salvando..." : "Salvar e Gerar Intelligence Map"}
          </Button>
        </div>
      </motion.form>
    </ClientLayout>
  );
} 