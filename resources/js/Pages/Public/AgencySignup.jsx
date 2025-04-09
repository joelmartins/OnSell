"use client";

import { useState, useEffect } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { 
  CheckCircle,
  ArrowRight,
  ChevronLeft,
  Loader2
} from 'lucide-react';

export default function AgencySignup({ agency, landing, selectedPlan, plans, formAction }) {
  const [step, setStep] = useState(selectedPlan ? 1 : 0);
  const [currentPlanId, setCurrentPlanId] = useState(selectedPlan ? selectedPlan.id : null);
  
  const { data, setData, post, processing, errors, reset } = useForm({
    plan_id: currentPlanId,
    company_name: '',
    name: '',
    email: '',
    phone: '',
    password: '',
    password_confirmation: '',
  });
  
  // Atualize o data.plan_id quando currentPlanId mudar ou quando o componente for montado
  useEffect(() => {
    if (currentPlanId) {
      setData('plan_id', currentPlanId);
    }
  }, [currentPlanId]);
  
  // Limpe o formulário quando a página for carregada
  useEffect(() => {
    reset();
    if (selectedPlan && selectedPlan.id) {
      setData('plan_id', selectedPlan.id);
    }
  }, []);
  
  // Função para obter contraste de cor
  function getContrastColor(hexColor) {
    if (!hexColor) return '#ffffff';
    
    // Converte hex para RGB
    let r = 0, g = 0, b = 0;
    
    // 3 caracteres
    if (hexColor.length === 4) {
      r = parseInt(hexColor[1] + hexColor[1], 16);
      g = parseInt(hexColor[2] + hexColor[2], 16);
      b = parseInt(hexColor[3] + hexColor[3], 16);
    }
    // 6 caracteres
    else if (hexColor.length === 7) {
      r = parseInt(hexColor.substring(1, 3), 16);
      g = parseInt(hexColor.substring(3, 5), 16);
      b = parseInt(hexColor.substring(5, 7), 16);
    } else {
      return '#ffffff';
    }
    
    // Calcula a luminância
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    
    // Retorna branco ou preto conforme a luminância
    return luminance > 0.5 ? '#000000' : '#ffffff';
  }
  
  // Atualizar título e favicon
  useEffect(() => {
    // Definir título da página
    document.title = `Cadastro | ${agency.name}` || 'OnSell';
    
    // Definir favicon se disponível
    if (agency.favicon) {
      const link = document.querySelector("link[rel*='icon']") || document.createElement('link');
      link.type = 'image/x-icon';
      link.rel = 'shortcut icon';
      link.href = agency.favicon;
      document.getElementsByTagName('head')[0].appendChild(link);
    }
  }, [agency]);
  
  // Ajuste de cores para botões primários e secundários
  const primaryButtonStyle = {
    backgroundColor: agency.primary_color || '#0f172a',
    color: getContrastColor(agency.primary_color || '#0f172a'),
  };
  
  const secondaryButtonStyle = {
    backgroundColor: agency.secondary_color || '#64748b',
    color: getContrastColor(agency.secondary_color || '#64748b'),
  };
  
  const accentStyle = {
    backgroundColor: agency.accent_color || '#0ea5e9',
    color: getContrastColor(agency.accent_color || '#0ea5e9'),
  };
  
  const navStyle = {
    backgroundColor: agency.primary_color || '#0f172a',
    color: getContrastColor(agency.primary_color || '#0f172a'),
  };
  
  // Selecionar um plano e avançar para o próximo passo
  const selectPlan = (planId) => {
    setCurrentPlanId(planId);
    setStep(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  // Voltar para a seleção de planos
  const goBackToPlanSelection = () => {
    setStep(0);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  // Enviar o formulário
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Verifique se plan_id está definido
    if (!data.plan_id) {
      alert('Por favor, selecione um plano para continuar.');
      return;
    }
    
    // Verifique se todos os campos obrigatórios estão preenchidos
    if (!data.company_name || !data.name || !data.email || !data.phone || !data.password || !data.password_confirmation) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }
    
    // Verifique se as senhas correspondem
    if (data.password !== data.password_confirmation) {
      alert('As senhas não correspondem. Por favor, verifique.');
      return;
    }
    
    // Envie o formulário
    post(formAction, {
      onSuccess: () => {
        // Limpe o formulário em caso de sucesso
        reset();
      },
      onError: (errors) => {
        console.error("Erros de validação:", errors);
      },
      preserveScroll: true,
    });
  };

  // Função para verificar se features é um array ou não e extrair os itens corretamente
  const getFeaturesList = (features) => {
    if (!features) return [];
    
    // Se for um array, retorna diretamente
    if (Array.isArray(features)) return features;
    
    // Se for um objeto, extrai os valores que poderiam ser apresentados como recursos
    if (typeof features === 'object') {
      const list = [];
      
      // Adicionar número de usuários/clientes
      if (features.users) {
        const label = features.for_agency ? 'clientes' : 'usuários';
        list.push(`${features.users} ${label} incluídos`);
      }
      
      // Adicionar número de integrações
      if (features.integrations) {
        list.push(`${features.integrations} integrações disponíveis`);
      }
      
      return list;
    }
    
    return [];
  };

  return (
    <>
      <Head title={`Cadastro | ${agency.name}`} />
      
      {/* Navbar */}
      <nav className="w-full shadow-sm" style={navStyle}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex-shrink-0 flex items-center">
              <a href={`/agency/${agency.id}/landing`} className="flex items-center">
                {agency.logo ? (
                  <img src={agency.logo} alt={agency.name} className="h-8 w-auto" />
                ) : (
                  <span className="text-xl font-bold">{agency.name}</span>
                )}
              </a>
            </div>
          </div>
        </div>
      </nav>
      
      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          {/* Cabeçalho */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold">Cadastro {agency.name}</h1>
            <p className="mt-2 text-gray-600">
              {step === 0 
                ? "Escolha o plano que melhor se adapta às suas necessidades" 
                : "Complete seu cadastro para começar"}
            </p>
          </div>
          
          {/* Etapas do cadastro */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center">
              <div 
                className="rounded-full w-8 h-8 flex items-center justify-center font-semibold"
                style={step >= 0 ? primaryButtonStyle : { backgroundColor: '#e5e7eb', color: '#4b5563' }}
              >
                1
              </div>
              <div className="w-16 h-1 mx-1" style={step >= 1 ? primaryButtonStyle : { backgroundColor: '#e5e7eb' }}></div>
              <div 
                className="rounded-full w-8 h-8 flex items-center justify-center font-semibold"
                style={step >= 1 ? primaryButtonStyle : { backgroundColor: '#e5e7eb', color: '#4b5563' }}
              >
                2
              </div>
            </div>
          </div>
          
          {/* Conteúdo do passo atual */}
          <div className="bg-white shadow-md rounded-lg p-6 md:p-8">
            {/* Passo 1: Seleção de plano */}
            {step === 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-6">Escolha seu plano</h2>
                
                <div className="space-y-6">
                  {plans.map((plan) => (
                    <div
                      key={plan.id}
                      className={`border rounded-lg p-4 hover:border-blue-500 cursor-pointer ${
                        plan.is_selected ? 'border-2 border-blue-500' : ''
                      }`}
                      onClick={() => selectPlan(plan.id)}
                    >
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <div>
                          <h3 className="text-lg font-semibold">{plan.name}</h3>
                          <p className="text-gray-600">{plan.description}</p>
                          <div className="mt-2">
                            <span className="text-xl font-bold">
                              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(plan.price)}
                            </span>
                            <span className="text-gray-500">/{plan.period_label}</span>
                          </div>
                        </div>
                        
                        <div className="mt-4 md:mt-0">
                          <button
                            type="button"
                            className="px-6 py-2 rounded-md font-medium inline-flex items-center"
                            style={primaryButtonStyle}
                            onClick={() => selectPlan(plan.id)}
                          >
                            Selecionar <ArrowRight className="ml-2 h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      
                      {plan.features && (
                        <div className="mt-4 border-t pt-4">
                          <h4 className="font-medium mb-2">Recursos inclusos:</h4>
                          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {getFeaturesList(plan.features).map((feature, idx) => (
                              <li key={idx} className="flex items-start">
                                <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                                <span>{feature}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Passo 2: Cadastro */}
            {step === 1 && (
              <div>
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
                
                <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
                  <h3 className="font-semibold">
                    Plano selecionado: {plans.find(p => p.id === currentPlanId)?.name || ''}
                  </h3>
                  <p className="text-gray-600">
                    {currentPlanId && new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(plans.find(p => p.id === currentPlanId)?.price || 0)} / 
                    {plans.find(p => p.id === currentPlanId)?.period_label || ''}
                  </p>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Exibição de erros gerais */}
                  {errors.general && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-700 mb-4">
                      {errors.general}
                    </div>
                  )}
                  
                  <div>
                    <label htmlFor="company_name" className="block text-sm font-medium text-gray-700 mb-1">
                      Nome da Empresa *
                    </label>
                    <input
                      type="text"
                      id="company_name"
                      name="company_name"
                      value={data.company_name}
                      onChange={e => setData('company_name', e.target.value)}
                      className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:outline-none ${
                        errors.company_name ? 'border-red-500' : ''
                      }`}
                      required
                    />
                    {errors.company_name && (
                      <p className="mt-1 text-sm text-red-600">{errors.company_name}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Seu Nome *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={data.name}
                      onChange={e => setData('name', e.target.value)}
                      className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:outline-none ${
                        errors.name ? 'border-red-500' : ''
                      }`}
                      required
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      E-mail *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={data.email}
                      onChange={e => setData('email', e.target.value)}
                      className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:outline-none ${
                        errors.email ? 'border-red-500' : ''
                      }`}
                      required
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Telefone *
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={data.phone}
                      onChange={e => setData('phone', e.target.value)}
                      className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:outline-none ${
                        errors.phone ? 'border-red-500' : ''
                      }`}
                      required
                    />
                    {errors.phone && (
                      <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                      Senha *
                    </label>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      value={data.password}
                      onChange={e => setData('password', e.target.value)}
                      className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:outline-none ${
                        errors.password ? 'border-red-500' : ''
                      }`}
                      required
                      minLength={8}
                    />
                    {errors.password && (
                      <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700 mb-1">
                      Confirmar Senha *
                    </label>
                    <input
                      type="password"
                      id="password_confirmation"
                      name="password_confirmation"
                      value={data.password_confirmation}
                      onChange={e => setData('password_confirmation', e.target.value)}
                      className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:outline-none"
                      required
                      minLength={8}
                    />
                  </div>
                  
                  <div className="mt-8">
                    <button
                      type="submit"
                      className="w-full px-6 py-3 rounded-md font-medium flex items-center justify-center"
                      style={primaryButtonStyle}
                      disabled={processing}
                    >
                      {processing ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Processando...
                        </>
                      ) : (
                        'Finalizar Cadastro'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="py-8 px-4 sm:px-6 lg:px-8 text-center bg-gray-100">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center">
            {agency.logo ? (
              <img src={agency.logo} alt={agency.name} className="h-10 mb-4" />
            ) : (
              <span className="text-2xl font-bold mb-4">{agency.name}</span>
            )}
            
            <p className="mb-6">
              © {new Date().getFullYear()} {agency.name}. Todos os direitos reservados.
            </p>
            
            <p className="text-sm opacity-80">
              Powered by <span className="font-semibold">OnSell</span>
            </p>
          </div>
        </div>
      </footer>
    </>
  );
} 