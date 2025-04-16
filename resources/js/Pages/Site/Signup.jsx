import { useState } from 'react';
import { Head } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { toast } from 'react-toastify';
import { Building2, User, Mail, Phone, Key, CheckCircle2 } from 'lucide-react';

// Função utilitária para formatar telefone brasileiro (com DDD) em tempo real
// Exemplo: (11) 91234-5678
function formatPhone(value) {
  let v = value.replace(/\D/g, '');
  if (v.length > 11) v = v.slice(0, 11);
  if (v.length > 0) v = '(' + v;
  if (v.length > 3) v = v.slice(0, 3) + ') ' + v.slice(3);
  if (v.length > 10) v = v.slice(0, 10) + '-' + v.slice(10);
  else if (v.length > 6) v = v.slice(0, 9) + '-' + v.slice(9);
  return v;
}

function formatCpfCnpj(value) {
  let v = value.replace(/\D/g, '');
  if (v.length <= 11) {
    // CPF: 000.000.000-00
    v = v.replace(/(\d{3})(\d)/, '$1.$2');
    v = v.replace(/(\d{3})(\d)/, '$1.$2');
    v = v.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  } else {
    // CNPJ: 00.000.000/0000-00
    v = v.replace(/(\d{2})(\d)/, '$1.$2');
    v = v.replace(/(\d{3})(\d)/, '$1.$2');
    v = v.replace(/(\d{3})(\d)/, '$1/$2');
    v = v.replace(/(\d{4})(\d{1,2})$/, '$1-$2');
  }
  return v.slice(0, 18);
}

export default function Signup({ selectedPlan, plan_id, featuredPlans = [] }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    client_name: '',
    client_document: '',
    client_email: '',
    client_phone: '',
    user_name: '',
    user_email: '',
    user_phone: '',
    password: '',
    password_confirmation: '',
    plan_id: plan_id || '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPayOption, setShowPayOption] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState(plan_id || (selectedPlan ? selectedPlan.id : ''));

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'client_phone' || name === 'user_phone') {
      setForm({ ...form, [name]: formatPhone(value) });
    } else if (name === 'client_document') {
      setForm({ ...form, client_document: formatCpfCnpj(value) });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleNext = (e) => {
    e.preventDefault();
    if (!form.client_name || !form.client_email || !form.user_name || !form.user_email || !form.password) {
      toast.error('Preencha todos os campos obrigatórios.');
      return;
    }
    if (form.password !== form.password_confirmation) {
      toast.error('As senhas não coincidem.');
      return;
    }
    if (selectedPlan) {
      setStep(3);
    } else {
      setStep(2);
    }
  };

  const handlePlanSelect = (plan) => {
    setForm({ ...form, plan_id: plan.id });
    setSelectedPlanId(plan.id);
    setStep(3);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.password_confirmation) {
      toast.error('As senhas não coincidem.');
      return;
    }
    setLoading(true);
    try {
      const csrf = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
      const response = await fetch('/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(csrf ? { 'X-CSRF-TOKEN': csrf } : {}),
        },
        body: JSON.stringify({
          ...form,
          client_phone: form.client_phone.replace(/\D/g, ''),
          user_phone: form.user_phone.replace(/\D/g, ''),
          client_document: form.client_document.replace(/\D/g, ''),
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Erro ao cadastrar.');
      if (data.checkout_url) {
        toast.success('Cadastro realizado! Redirecionando para pagamento...');
        window.location.href = data.checkout_url;
      } else {
        setSuccess(true);
        setShowPayOption(true);
      }
    } catch (err) {
      toast.error(err.message || 'Erro ao cadastrar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head title="Cadastro Rápido" />
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-background py-12 px-4">
        <Card className="w-full max-w-lg mx-auto shadow-xl border-0">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl font-bold tracking-tight">Crie sua conta grátis</CardTitle>
            <p className="text-gray-500 text-base mt-2">Preencha os dados abaixo para começar a usar o OnSell</p>
          </CardHeader>
          <CardContent>
            {success ? (
              <div className="flex flex-col items-center space-y-6 py-8">
                <div className="text-2xl font-bold text-primary">Cadastro realizado com sucesso!</div>
                <div className="text-gray-600 text-center">Sua conta foi criada. Você pode acessar o sistema agora ou, se desejar, ativar um plano pago para liberar todos os recursos.</div>
                {showPayOption && (
                  <Button onClick={() => window.location.href = '/client/settings/billing'} className="w-full max-w-xs">Ativar Plano Pago</Button>
                )}
                <Button variant="outline" onClick={() => window.location.href = '/login'} className="w-full max-w-xs">Acessar Login</Button>
              </div>
            ) : (
              <>
                {step === 1 && (
                  <form onSubmit={handleNext} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white/60 rounded-lg p-4 border border-gray-100">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 mb-1">
                          <Building2 className="h-5 w-5 text-primary" />
                          <span className="font-semibold text-gray-800">Dados da Empresa</span>
                        </div>
                        <label className="block text-sm font-medium text-gray-700">Nome da empresa *</label>
                        <Input name="client_name" placeholder="Ex: Padaria do João" value={form.client_name} onChange={handleChange} required />
                        <label className="block text-sm font-medium text-gray-700">CNPJ ou CPF</label>
                        <Input name="client_document" placeholder="CNPJ ou CPF" value={form.client_document} onChange={handleChange} maxLength={18} />
                        <label className="block text-sm font-medium text-gray-700">E-mail da empresa *</label>
                        <Input name="client_email" type="email" placeholder="empresa@email.com" value={form.client_email} onChange={handleChange} required />
                        <label className="block text-sm font-medium text-gray-700">Telefone da empresa</label>
                        <Input name="client_phone" placeholder="(11) 91234-5678" value={form.client_phone} onChange={handleChange} maxLength={15} inputMode="tel" pattern="\(\d{2}\) \d{4,5}-\d{4}" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 mb-1">
                          <User className="h-5 w-5 text-primary" />
                          <span className="font-semibold text-gray-800">Seus Dados</span>
                        </div>
                        <label className="block text-sm font-medium text-gray-700">Seu nome completo *</label>
                        <Input name="user_name" placeholder="Seu nome completo" value={form.user_name} onChange={handleChange} required />
                        <label className="block text-sm font-medium text-gray-700">Seu e-mail *</label>
                        <Input name="user_email" type="email" placeholder="seu@email.com" value={form.user_email} onChange={handleChange} required />
                        <label className="block text-sm font-medium text-gray-700">Seu telefone</label>
                        <Input name="user_phone" placeholder="(11) 91234-5678" value={form.user_phone} onChange={handleChange} maxLength={15} inputMode="tel" pattern="\(\d{2}\) \d{4,5}-\d{4}" />
                        <label className="block text-sm font-medium text-gray-700">Senha de acesso *</label>
                        <div className="relative">
                          <Input name="password" type="password" placeholder="Senha de acesso" value={form.password} onChange={handleChange} required className="pr-10" />
                        </div>
                        <label className="block text-sm font-medium text-gray-700">Confirme a senha *</label>
                        <div className="relative">
                          <Input name="password_confirmation" type="password" placeholder="Repita a senha" value={form.password_confirmation} onChange={handleChange} required className="pr-10" />
                        </div>
                      </div>
                    </div>
                    <Button type="submit" className="w-full h-12 text-base font-semibold">Avançar</Button>
                  </form>
                )}
                {step === 2 && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold mb-2 text-center">Escolha seu plano</h3>
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                      {featuredPlans && featuredPlans.filter(plan => plan.type !== 'agency').length > 0 ? (
                        featuredPlans.filter(plan => plan.type !== 'agency').map((plan, idx) => (
                          <div
                            key={plan.id}
                            className={`flex flex-col rounded-lg border bg-background p-6 shadow-sm transition-all cursor-pointer ${selectedPlanId == plan.id ? 'ring-2 ring-primary border-primary' : 'hover:border-primary/60'} ${idx === 1 ? 'relative' : ''}`}
                            onClick={() => handlePlanSelect(plan)}
                          >
                            {idx === 1 && (
                              <div className="absolute -top-4 left-0 right-0 mx-auto w-fit px-4 py-1 rounded-full bg-primary text-xs font-medium text-primary-foreground">
                                Mais popular
                              </div>
                            )}
                            <div className="flex-1">
                              <h3 className="text-2xl font-bold">{plan.name}</h3>
                              <p className="text-sm text-gray-500 mt-1">{plan.description}</p>
                              <div className="mt-2 text-4xl font-bold">
                                {typeof plan.price === 'string' && plan.price.startsWith('R$')
                                  ? plan.price
                                  : `R$ ${typeof plan.price === 'number'
                                      ? plan.price.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})
                                      : parseFloat(plan.price).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`
                                }
                                <span className="text-base font-normal text-gray-500">/mês</span>
                              </div>
                              <p className="mt-3 text-gray-500">{plan.leads_limit ? `Até ${plan.leads_limit} leads/mês` : 'Leads ilimitados'}</p>
                              <ul className="mt-6 space-y-2">
                                {Array.isArray(plan.features)
                                  ? plan.features.filter(Boolean).map((feature, i) => (
                                      <li key={i} className="flex items-center">
                                        <CheckCircle2 className="mr-2 h-4 w-4 text-primary" />
                                        <span>{typeof feature === 'string' ? feature.charAt(0).toUpperCase() + feature.slice(1) : ''}</span>
                                      </li>
                                    ))
                                  : plan.features && typeof plan.features === 'object' && !Array.isArray(plan.features)
                                    ? Object.values(plan.features).filter(f => typeof f === 'string' && f.trim()).map((feature, i) => (
                                        <li key={i} className="flex items-center">
                                          <CheckCircle2 className="mr-2 h-4 w-4 text-primary" />
                                          <span>{feature.charAt(0).toUpperCase() + feature.slice(1)}</span>
                                        </li>
                                      ))
                                    : typeof plan.features === 'string' && plan.features
                                      ? (() => {
                                          try {
                                            // Tenta parsear como JSON, se falhar, faz split por vírgula
                                            const obj = JSON.parse(plan.features);
                                            return Object.values(obj).filter(f => typeof f === 'string' && f.trim()).map((feature, i) => (
                                              <li key={i} className="flex items-center">
                                                <CheckCircle2 className="mr-2 h-4 w-4 text-primary" />
                                                <span>{feature.charAt(0).toUpperCase() + feature.slice(1)}</span>
                                              </li>
                                            ));
                                          } catch {
                                            return plan.features.split(',').filter(f => f.trim()).map((feature, i) => (
                                              <li key={i} className="flex items-center">
                                                <CheckCircle2 className="mr-2 h-4 w-4 text-primary" />
                                                <span>{feature.trim().charAt(0).toUpperCase() + feature.trim().slice(1)}</span>
                                              </li>
                                            ));
                                          }
                                        })()
                                      : null
                                }
                              </ul>
                            </div>
                            <div className="mt-6">
                              <Button className="w-full" variant={selectedPlanId == plan.id ? 'default' : 'outline'}>
                                {plan.price === 0 ? 'Começar Grátis' : plan.price >= 400 ? 'Falar com Vendas' : 'Assinar Agora'}
                              </Button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-gray-500">Nenhum plano disponível</div>
                      )}
                    </div>
                    <Button onClick={() => setStep(1)} variant="outline" className="w-full mt-2">Voltar</Button>
                  </div>
                )}
                {step === 3 && (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold mb-2">Resumo do Plano</h3>
                      {selectedPlan ? (
                        <div className="p-3 rounded bg-primary/10 mb-2">
                          <div className="font-bold">{selectedPlan.name}</div>
                          <div className="text-sm text-gray-500">{selectedPlan.description}</div>
                          <div className="text-xl font-bold mt-1">{selectedPlan.price === 0 ? 'Grátis' : `R$ ${selectedPlan.price}`}</div>
                        </div>
                      ) : (
                        <div className="p-3 rounded bg-primary/10 mb-2">
                          <div className="font-bold">Plano selecionado: {form.plan_id}</div>
                        </div>
                      )}
                    </div>
                    <Button type="submit" className="w-full h-12 text-base font-semibold" disabled={loading}>{loading ? 'Processando...' : 'Ir para pagamento'}</Button>
                    <Button type="button" variant="outline" className="w-full" onClick={() => setStep(selectedPlan ? 1 : 2)}>Voltar</Button>
                  </form>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
} 