"use client";
import { useState } from "react";
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
  { name: "first_contact", label: "Com quem você geralmente fala primeiro ao abordar novas empresas? (Ex: recepcionista, analista, secretário)", type: "text" },
  { name: "intermediaries", label: "É comum cair com intermediários antes de chegar ao decisor? (Sim/Não)", type: "text" },
  { name: "direct_success", label: "Já teve sucesso falando direto com o decisor? Como foi?", type: "text" },
];

export default function AccessStrategy({ existing }) {
  const initial = existing?.customer_answers?.access || {};
  const [answers, setAnswers] = useState(initial);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

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
    console.log('Enviando dados para salvamento (Access Strategy):', { access: answers });
    router.post(
      route("client.salesintelligence.storeAnswers"),
      { customer_answers: { access: answers } },
      {
        onSuccess: () => {
          toast.success('Respostas salvas com sucesso!');
          setLoading(false);
          router.visit(route('client.salesintelligence.intelligence-map'));
        },
        onError: (errors) => {
          console.error('Erro ao salvar:', errors);
          toast.error('Erro ao salvar respostas.');
          setLoading(false);
        },
      }
    );
  }

  function Stepper() {
    const currentStep = 2;
    return (
      <div className="flex items-center justify-center gap-4 mb-8">
        {steps.map((step, idx) => {
          const complete = idx < currentStep || (idx === 2 && isStepComplete);
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
    <ClientLayout title="Access Strategy">
      <Head title="Access Strategy" />
      <Stepper />
      <div className="mb-8">
        <h2 className="text-2xl font-semibold">Access Strategy</h2>
        <p className="text-muted-foreground">Mapeie como acessar o decisor e superar barreiras iniciais.</p>
      </div>
      <Card className="w-full mx-auto">
        <CardHeader>
          <CardTitle>Access Strategy</CardTitle>
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
              <Link href={route('client.salesintelligence.intelligence-map')} className="inline-flex items-center px-4 py-2 border border-zinc-300 rounded bg-zinc-100 text-zinc-700 hover:bg-zinc-200 text-sm">
                Próxima etapa
              </Link>
            </div>
          </form>
          {initial && Object.keys(initial).length > 0 && (
            <div className="mt-8">
              <h2 className="text-lg font-semibold mb-2">Respostas anteriores:</h2>
              <pre className="bg-zinc-100 dark:bg-zinc-800 p-3 rounded text-sm overflow-x-auto">
                {JSON.stringify(initial, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </ClientLayout>
  );
} 