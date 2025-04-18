"use client";
import { useState } from "react";
import { router, Head } from "@inertiajs/react";
import ClientLayout from '@/Layouts/ClientLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/Components/ui/card';
import { FormItem, FormLabel, FormControl, FormMessage } from '@/Components/ui/form';
import { Input } from '@/Components/ui/input';
import { Button } from '@/Components/ui/button';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';

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
      toast.error('Preencha todos os campos obrigatórios.');
      return;
    }
    setLoading(true);
    router.post(
      route('client.salesintelligence.answers'),
      { answers },
      {
        onSuccess: () => {
          toast.success('Respostas salvas com sucesso!');
          setLoading(false);
          router.visit(route('client.salesintelligence.deliverables'));
        },
        onError: () => {
          toast.error('Erro ao salvar respostas.');
          setLoading(false);
        },
      }
    );
  }

  return (
    <ClientLayout title="Sales Intelligence Capture">
      <Head title="Sales Intelligence Capture" />
      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full py-8 space-y-10"
      >
        <div className="mb-8">
          <h2 className="text-3xl font-bold">Novo Formulário Simples — Sales Intelligence Capture</h2>
          <p className="text-muted-foreground">Responda as 19 perguntas abaixo para gerar seu mapa de inteligência de vendas.</p>
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