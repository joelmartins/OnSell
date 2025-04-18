import { useState } from 'react';
import { Head } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { toast } from 'react-toastify';
import { Building2, User, Mail, Phone, Key, CheckCircle2, Loader2, ChevronLeft, ArrowRight } from 'lucide-react';

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

function validateCpfCnpj(value) {
  value = value.replace(/\D/g, '');
  if (value.length === 11) {
    // Validação CPF
    let sum = 0;
    let rest;
    if (value === "00000000000") return false;
    for (let i = 1; i <= 9; i++) sum = sum + parseInt(value.substring(i - 1, i)) * (11 - i);
    rest = (sum * 10) % 11;
    if ((rest === 10) || (rest === 11)) rest = 0;
    if (rest !== parseInt(value.substring(9, 10))) return false;
    sum = 0;
    for (let i = 1; i <= 10; i++) sum = sum + parseInt(value.substring(i - 1, i)) * (12 - i);
    rest = (sum * 10) % 11;
    if ((rest === 10) || (rest === 11)) rest = 0;
    if (rest !== parseInt(value.substring(10, 11))) return false;
    return true;
  } else if (value.length === 14) {
    // Validação CNPJ
    let size = value.length - 2;
    let numbers = value.substring(0, size);
    let digits = value.substring(size);
    let sum = 0;
    let pos = size - 7;
    for (let i = size; i >= 1; i--) {
      sum += numbers.charAt(size - i) * pos--;
      if (pos < 2) pos = 9;
    }
    let result = sum % 11 < 2 ? 0 : 11 - sum % 11;
    if (result !== parseInt(digits.charAt(0))) return false;
    size = size + 1;
    numbers = value.substring(0, size);
    sum = 0;
    pos = size - 7;
    for (let i = size; i >= 1; i--) {
      sum += numbers.charAt(size - i) * pos--;
      if (pos < 2) pos = 9;
    }
    result = sum % 11 < 2 ? 0 : 11 - sum % 11;
    if (result !== parseInt(digits.charAt(1))) return false;
    return true;
  }
  return false;
}

export default function Signup({ selectedPlan, plan_id, featuredPlans = [] }) {
  const [step, setStep] = useState(selectedPlan ? 1 : 0);
  const [form, setForm] = useState({
    company_name: '',
    client_document: '',
    name: '',
    email: '',
    phone: '',
    password: '',
    password_confirmation: '',
    plan_id: plan_id || (selectedPlan ? selectedPlan.id : ''),
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPayOption, setShowPayOption] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState(plan_id || (selectedPlan ? selectedPlan.id : ''));
  const [cpfCnpj, setCpfCnpj] = useState('');
  const [cpfCnpjError, setCpfCnpjError] = useState('');
  const [phoneError, setPhoneError] = useState('');

  // Filtrar planos de agência
  const clientPlans = featuredPlans.filter(plan => plan.type !== 'agency');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handlePhoneChange = (e) => {
    const formatted = formatPhone(e.target.value);
    setForm({ ...form, phone: formatted });
    if (formatted.replace(/\D/g, '').length < 10) {
      setPhoneError('Telefone inválido');
    } else {
      setPhoneError('');
    }
  };

  const handleCpfCnpjChange = (e) => {
    const formatted = formatCpfCnpj(e.target.value);
    setCpfCnpj(formatted);
    setForm({ ...form, client_document: formatted });
    if (formatted.replace(/\D/g, '').length >= 11 && !validateCpfCnpj(formatted)) {
      setCpfCnpjError('CPF ou CNPJ inválido');
    } else {
      setCpfCnpjError('');
    }
  };

  const handlePlanSelect = (plan) => {
    setForm({ ...form, plan_id: plan.id });
    setSelectedPlanId(plan.id);
    setStep(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goBackToPlanSelection = () => {
    setStep(0);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Verifique se plan_id está definido
    if (!form.plan_id) {
      toast.error('Por favor, selecione um plano para continuar.');
      return;
    }
    
    // Verifique se todos os campos obrigatórios estão preenchidos
    if (!form.company_name || !form.name || !form.email || !form.phone || !form.password || !form.password_confirmation) {
      toast.error('Preencha todos os campos obrigatórios.');
      return;
    }
    
    // Verifique se as senhas correspondem
    if (form.password !== form.password_confirmation) {
      toast.error('As senhas não coincidem.');
      return;
    }

    // Certifique-se de que o client_document está definido
    setForm({ ...form, client_document: cpfCnpj });
    
    setLoading(true);
    try {
      const csrf = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
      
      // Transformando os dados do formulário para o formato esperado pelo backend
      const requestData = {
        client_name: form.company_name,
        client_document: form.client_document.replace(/\D/g, ''),
        client_email: form.email,
        client_phone: form.phone.replace(/\D/g, ''),
        user_name: form.name,
        user_email: form.email,
        user_phone: form.phone.replace(/\D/g, ''),
        password: form.password,
        plan_id: form.plan_id
      };
      
      const response = await fetch('/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(csrf ? { 'X-CSRF-TOKEN': csrf } : {}),
        },
        body: JSON.stringify(requestData),
      });
      
      if (!response.ok) {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
          const data = await response.json();
          throw new Error(data.message || 'Erro ao cadastrar.');
        } else {
          // Em ambiente de desenvolvimento, vamos mostrar mais detalhes sobre o erro
          const responseText = await response.text();
          console.error('Erro na resposta:', responseText);
          
          // Verificar se a resposta contém HTML (possível erro 500 com stack trace)
          if (responseText.includes('<!DOCTYPE') || responseText.includes('<html')) {
            console.error('Recebeu HTML em vez de JSON. Possível erro 500 no servidor.');
            throw new Error('Erro interno do servidor. Contate o suporte técnico.');
          } else {
            throw new Error('Erro de servidor. Por favor, tente novamente mais tarde.');
          }
        }
      }
      
      const data = await response.json();
      
      if (data.checkout_url) {
        toast.success('Cadastro realizado! Redirecionando para pagamento...');
        window.location.href = data.checkout_url;
      } else {
        setSuccess(true);
        setShowPayOption(true);
      }
    } catch (err) {
      console.error('Erro durante o cadastro:', err);
      toast.error(err.message || 'Erro ao cadastrar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head title="Cadastro Rápido" />
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-background py-12 px-4">
        <Card className="w-full max-w-4xl mx-auto shadow-xl border-0">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl font-bold tracking-tight">Crie sua conta grátis</CardTitle>
            <p className="text-gray-500 text-base mt-2">
              {step === 0 
                ? "Escolha o plano que melhor se adapta às suas necessidades" 
                : "Preencha os dados abaixo para começar a usar o OnSell"}
            </p>
          </CardHeader>
          <CardContent>
            {/* Etapas do cadastro */}
            <div className="flex justify-center mb-8">
              <div className="flex items-center">
                <div
                  className="rounded-full w-8 h-8 flex items-center justify-center font-semibold bg-primary text-white"
                  style={step >= 0 ? {} : { backgroundColor: '#e5e7eb', color: '#4b5563' }}
                >
                  1
                </div>
                <div className="w-16 h-1 mx-1" style={step >= 1 ? { backgroundColor: '#0f766e' } : { backgroundColor: '#e5e7eb' }}></div>
                <div
                  className="rounded-full w-8 h-8 flex items-center justify-center font-semibold"
                  style={step >= 1 ? { backgroundColor: '#0f766e', color: '#ffffff' } : { backgroundColor: '#e5e7eb', color: '#4b5563' }}
                >
                  2
                </div>
              </div>
            </div>

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
                {/* Passo 1: Seleção de plano */}
                {step === 0 && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold mb-2 text-center">Escolha seu plano</h3>
                    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 px-2">
                      {clientPlans && clientPlans.length > 0 ? (
                        clientPlans.map((plan, idx) => (
                          <div
                            key={plan.id}
                            className={`flex flex-col rounded-lg border bg-background p-4 md:p-6 shadow-sm transition-all cursor-pointer ${selectedPlanId == plan.id ? 'ring-2 ring-primary border-primary' : 'hover:border-primary/60'} ${idx === 1 ? 'relative' : ''}`}
                            onClick={() => handlePlanSelect(plan)}
                          >
                            {idx === 1 && (
                              <div className="absolute -top-4 left-0 right-0 mx-auto w-fit px-4 py-1 rounded-full bg-primary text-xs font-medium text-primary-foreground">
                                Mais popular
                              </div>
                            )}
                            <div className="flex-1">
                              <h3 className="text-xl md:text-2xl font-bold">{plan.name}</h3>
                              <p className="text-sm text-gray-500 mt-1">{plan.description}</p>
                              <div className="mt-2 text-3xl md:text-4xl font-bold">
                                {typeof plan.price === 'string' && plan.price.startsWith('R$')
                                  ? plan.price
                                  : `R$ ${typeof plan.price === 'number'
                                      ? plan.price.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})
                                      : parseFloat(plan.price).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`
                                }
                                <span className="text-base font-normal text-gray-500">/mês</span>
                              </div>
                              <p className="mt-3 text-gray-500">{plan.leads_limit ? `Até ${plan.leads_limit} leads/mês` : 'Leads ilimitados'}</p>
                              <ul className="mt-4 space-y-2 text-sm">
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
                              <Button className="w-full flex items-center justify-center">
                                {plan.price === 0 ? 'Começar Grátis' : plan.price >= 400 ? 'Falar com Vendas' : 'Selecionar'}
                                <ArrowRight className="ml-2 h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-gray-500">Nenhum plano disponível</div>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Passo 2: Cadastro */}
                {step === 1 && (
                  <div>
                    {clientPlans && clientPlans.length > 0 && (
                      <div className="flex items-center mb-6">
                        <button 
                          type="button" 
                          onClick={goBackToPlanSelection}
                          className="inline-flex items-center text-gray-600 hover:text-gray-900"
                        >
                          <ChevronLeft className="h-5 w-5 mr-1" />
                          Voltar para planos
                        </button>
                      </div>
                    )}
                    
                    {selectedPlanId && clientPlans && clientPlans.length > 0 && (
                      <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
                        <h3 className="font-semibold">
                          Plano selecionado: {clientPlans.find(p => p.id == selectedPlanId)?.name || 'Plano'}
                        </h3>
                        <p className="text-gray-600">
                          {clientPlans.find(p => p.id == selectedPlanId)?.price
                            ? `R$ ${parseFloat(clientPlans.find(p => p.id == selectedPlanId)?.price).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}/mês`
                            : ''
                          }
                        </p>
                      </div>
                    )}
                    
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="company_name" className="block text-sm font-medium text-gray-700 mb-1">
                            Nome da Empresa *
                          </label>
                          <Input
                            type="text"
                            id="company_name"
                            name="company_name"
                            value={form.company_name}
                            onChange={handleChange}
                            placeholder="Ex: Padaria do João"
                            className="w-full"
                            required
                          />
                        </div>
                        
                        <div>
                          <label htmlFor="client_document" className="block text-sm font-medium text-gray-700 mb-1">
                            CPF ou CNPJ
                          </label>
                          <Input
                            type="text"
                            id="client_document"
                            name="client_document"
                            value={cpfCnpj}
                            onChange={handleCpfCnpjChange}
                            className={cpfCnpjError ? 'border-red-500' : ''}
                            maxLength={18}
                            placeholder="Digite o CPF ou CNPJ"
                          />
                          {cpfCnpjError && (
                            <p className="mt-1 text-sm text-red-600">{cpfCnpjError}</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                            Seu Nome *
                          </label>
                          <Input
                            type="text"
                            id="name"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            placeholder="Seu nome completo"
                            required
                          />
                        </div>
                        
                        <div>
                          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                            E-mail *
                          </label>
                          <Input
                            type="email"
                            id="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            placeholder="seu@email.com"
                            required
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                          Telefone *
                        </label>
                        <Input
                          type="tel"
                          id="phone"
                          name="phone"
                          value={form.phone}
                          onChange={handlePhoneChange}
                          className={phoneError ? 'border-red-500' : ''}
                          maxLength={15}
                          placeholder="(99) 99999-9999"
                          required
                        />
                        {phoneError && (
                          <p className="mt-1 text-sm text-red-600">{phoneError}</p>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                            Senha *
                          </label>
                          <Input
                            type="password"
                            id="password"
                            name="password"
                            value={form.password}
                            onChange={handleChange}
                            placeholder="Senha de acesso"
                            required
                            minLength={8}
                          />
                        </div>
                        
                        <div>
                          <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700 mb-1">
                            Confirmar Senha *
                          </label>
                          <Input
                            type="password"
                            id="password_confirmation"
                            name="password_confirmation"
                            value={form.password_confirmation}
                            onChange={handleChange}
                            placeholder="Repita a senha"
                            required
                            minLength={8}
                          />
                        </div>
                      </div>
                      
                      <div className="mt-8">
                        <Button
                          type="submit"
                          className="w-full h-12 text-base font-semibold flex items-center justify-center"
                          disabled={loading}
                        >
                          {loading ? (
                            <>
                              <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Processando...
                            </>
                          ) : (
                            'Finalizar Cadastro'
                          )}
                        </Button>
                      </div>
                    </form>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
} 