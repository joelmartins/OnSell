"use client";
import { useState, useEffect } from "react";
import { router, Head, Link } from "@inertiajs/react";
import ClientLayout from '@/Layouts/ClientLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/Components/ui/card';
import { FormItem, FormLabel, FormControl, FormMessage } from '@/Components/ui/form';
import { Input } from '@/Components/ui/input';
import { Button } from '@/Components/ui/button';
import { toast } from 'react-toastify';

const steps = [
  { name: 'Diagnosis', route: 'client.salesintelligence.diagnosis' },
  { name: 'Emotional Mapping', route: 'client.salesintelligence.emotional-mapping' },
  { name: 'Access Strategy', route: 'client.salesintelligence.access-strategy' },
  { name: 'Intelligence Map', route: 'client.salesintelligence.intelligence-map' },
];

const questions = [
  { name: "product", label: "O que você vende? (Produto/serviço principal)", type: "text" },
  { name: "customer_benefit", label: "Qual tipo de cliente mais se beneficia disso? (Segmento de mercado, tipo de empresa, perfil demográfico)", type: "text" },
  { name: "decision_role", label: "Qual é o cargo da pessoa que geralmente toma a decisão de compra? (CEO, Diretor, Gerente, Comprador, etc.)", type: "text" },
  { name: "decides_alone", label: "Essa pessoa decide sozinha ou precisa envolver outras pessoas? (Se não, quem mais influencia?)", type: "text" },
  { name: "purchase_frequency", label: "Com que frequência esse tipo de cliente faz compras como a sua? (Compras únicas, trimestrais, anuais...)", type: "text" },
  { name: "sales_cycle", label: "Qual é o ciclo médio de vendas? (Ex: 7 dias, 30 dias, 90 dias)", type: "text" },
];

export default function Diagnosis({ existing }) {
  console.log('Existing data received:', existing);
  const [answers, setAnswers] = useState(existing?.customer_answers || {});
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Atualiza as respostas quando os dados existentes mudarem
  useEffect(() => {
    if (existing?.customer_answers) {
      console.log('Updating form with existing data:', existing.customer_answers);
      setAnswers(existing.customer_answers);
    }
  }, [existing]);

  // Considera preenchido se todos os campos obrigatórios estão preenchidos
  const isStepComplete = questions.every(q => answers[q.name] && answers[q.name].trim() !== "");

  function handleChange(e) {
    setAnswers({ ...answers, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: undefined });
  }

  function validate() {
    const newErrors = {};
    questions.forEach(q => {
      if (!answers[q.name] || answers[q.name].trim() === "") {
        newErrors[q.name] = 'Campo obrigatório';
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) {
      toast.error('Preencha todos os campos obrigatórios.');
      return;
    }
    setLoading(true);
    router.post(
      route("client.salesintelligence.storeAnswers"),
      { customer_answers: answers },
      {
        onSuccess: () => {
          toast.success('Respostas salvas com sucesso!');
          setLoading(false);
          // Avançar para próxima etapa
          router.visit(route('client.salesintelligence.emotional-mapping'));
        },
        onError: () => {
          toast.error('Erro ao salvar respostas.');
          setLoading(false);
        },
      }
    );
  }

  // Stepper visual
  function Stepper() {
    const currentStep = 0;
    return (
      <div className="flex items-center justify-center gap-4 mb-8">
        {steps.map((step, idx) => {
          const complete = idx < currentStep || (idx === 0 && isStepComplete);
          const active = idx === currentStep;
          return (
            <Link
              key={step.name}
              href={route(step.route)}
              className={`flex items-center gap-2 px-3 py-1 rounded-full border transition-colors text-sm font-medium
                ${active ? 'bg-blue-600 text-white border-blue-600' : complete ? 'bg-green-100 text-green-800 border-green-300' : 'bg-zinc-100 text-zinc-500 border-zinc-200 hover:bg-blue-50'}
              `}
            >
              <span>{step.name}</span>
              {complete && <span className="ml-1 text-green-500">✓</span>}
            </Link>
          );
        })}
      </div>
    );
  }

  return (
    <ClientLayout title="Diagnóstico do ICP e Tomador de Decisão">
      <Head title="Diagnóstico do ICP e Tomador de Decisão" />
      <Stepper />
      <div className="mb-8">
        <h2 className="text-2xl font-semibold">Diagnóstico do ICP e Tomador de Decisão</h2>
        <p className="text-muted-foreground">Responda as perguntas para mapear seu ICP e o perfil do decisor.</p>
      </div>
      <Card className="w-full mx-auto">
        <CardHeader>
          <CardTitle>Diagnosis</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {questions.map((q) => (
              <FormItem key={q.name}>
                <FormLabel htmlFor={q.name}>{q.label}</FormLabel>
                <FormControl>
                  <Input
                    id={q.name}
                    name={q.name}
                    type={q.type}
                    value={answers[q.name] || ""}
                    onChange={handleChange}
                    required
                  />
                </FormControl>
                <FormMessage>{errors[q.name]}</FormMessage>
              </FormItem>
            ))}
            <div className="flex gap-2 justify-end">
              <Button type="submit" disabled={loading}>
                {loading ? "Salvando..." : "Salvar e Avançar"}
              </Button>
              <Link href={route('client.salesintelligence.emotional-mapping')} className="inline-flex items-center px-4 py-2 border border-zinc-300 rounded bg-zinc-100 text-zinc-700 hover:bg-zinc-200 text-sm">
                Próxima etapa
              </Link>
            </div>
          </form>
          {existing && (
            <div className="mt-8">
              <h2 className="text-lg font-semibold mb-2">Respostas anteriores:</h2>
              <pre className="bg-zinc-100 dark:bg-zinc-800 p-3 rounded text-sm overflow-x-auto">
                {JSON.stringify(existing.customer_answers, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </ClientLayout>
  );
} 