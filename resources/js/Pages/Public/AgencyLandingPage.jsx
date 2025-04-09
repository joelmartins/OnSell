"use client";

import { useState, useEffect } from 'react';
import { Head, usePage } from '@inertiajs/react';
import { 
  Users, 
  Zap, 
  BarChart, 
  Star,
  CheckCircle,
  ArrowRight,
  Menu,
  X
} from 'lucide-react';

export default function AgencyLandingPage({ agency, landing, plans }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { url } = usePage();
  
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
  
  // Função para renderizar ícones
  function renderIcon(iconName, className = "h-6 w-6") {
    switch (iconName) {
      case 'Users':
        return <Users className={className} />;
      case 'Zap':
        return <Zap className={className} />;
      case 'BarChart':
        return <BarChart className={className} />;
      case 'Star':
        return <Star className={className} />;
      default:
        return <Star className={className} />;
    }
  }
  
  // Atualizar título e favicon
  useEffect(() => {
    // Definir título da página
    document.title = agency.name || 'OnSell';
    
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

  // Função para construir URLs de registro
  const getSignupUrl = (planId = null) => {
    // Se estiver usando subdomínio
    if (url.startsWith(`https://${agency.subdomain}.`) || url.startsWith(`http://${agency.subdomain}.`)) {
      return planId 
        ? `/signup/plan/${planId}` 
        : '/signup';
    }
    
    // Se estiver usando rota padrão
    return planId 
      ? `/agency/${agency.id}/signup/${planId}` 
      : `/agency/${agency.id}/signup`;
  };

  return (
    <>
      <Head title={agency.name} />
      
      {/* Navbar */}
      <nav className="sticky top-0 w-full z-50 shadow-sm" style={navStyle}>
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
            
            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                type="button"
                className="inline-flex items-center justify-center p-2 rounded-md focus:outline-none"
                onClick={() => setMenuOpen(!menuOpen)}
              >
                {menuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
            
            {/* Desktop nav links */}
            <div className="hidden md:flex md:items-center md:space-x-4">
              <a href="#recursos" className="px-3 py-2 rounded-md text-sm font-medium hover:opacity-80">
                Recursos
              </a>
              {plans.length > 0 && (
                <a href="#planos" className="px-3 py-2 rounded-md text-sm font-medium hover:opacity-80">
                  Planos
                </a>
              )}
              <a href="#faq" className="px-3 py-2 rounded-md text-sm font-medium hover:opacity-80">
                FAQ
              </a>
              <a
                href={getSignupUrl()}
                className="ml-2 px-4 py-2 rounded-md text-sm font-medium"
                style={secondaryButtonStyle}
              >
                Comece agora
              </a>
            </div>
          </div>
        </div>
        
        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden" style={navStyle}>
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <a
                href="#recursos"
                className="block px-3 py-2 rounded-md text-base font-medium"
                onClick={() => setMenuOpen(false)}
              >
                Recursos
              </a>
              {plans.length > 0 && (
                <a
                  href="#planos"
                  className="block px-3 py-2 rounded-md text-base font-medium"
                  onClick={() => setMenuOpen(false)}
                >
                  Planos
                </a>
              )}
              <a
                href="#faq"
                className="block px-3 py-2 rounded-md text-base font-medium"
                onClick={() => setMenuOpen(false)}
              >
                FAQ
              </a>
              <a
                href={getSignupUrl()}
                className="block px-3 py-2 rounded-md text-base font-medium"
                onClick={() => setMenuOpen(false)}
              >
                Comece agora
              </a>
            </div>
          </div>
        )}
      </nav>
      
      {/* Hero Section */}
      <section className="py-12 md:py-24 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                {landing.headline}
              </h1>
              <p className="text-lg md:text-xl text-gray-600">
                {landing.subheadline}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <a 
                  href={getSignupUrl()}
                  className="px-6 py-3 rounded-md text-center font-medium text-lg flex items-center justify-center gap-2"
                  style={primaryButtonStyle}
                >
                  {landing.cta_text} <ArrowRight className="h-5 w-5" />
                </a>
              </div>
            </div>
            <div className="flex justify-center">
              {landing.hero_image ? (
                <img
                  src={landing.hero_image}
                  alt={agency.name}
                  className="rounded-lg shadow-lg max-h-96 object-cover"
                />
              ) : (
                <div className="bg-gray-200 rounded-lg w-full h-64 md:h-80 flex items-center justify-center">
                  <span className="text-gray-500 text-lg">Imagem Principal</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section id="recursos" className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">{landing.features_title}</h2>
            <div className="mt-2 h-1 w-20 mx-auto rounded-full" style={accentStyle}></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
            {landing.features.map((feature, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
                <div className="rounded-full w-12 h-12 flex items-center justify-center mb-4" style={accentStyle}>
                  {renderIcon(feature.icon)}
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Plans Section */}
      {plans.length > 0 && (
        <section id="planos" className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold">Nossos Planos</h2>
              <p className="mt-4 text-lg text-gray-600">Escolha o plano ideal para o seu negócio</p>
              <div className="mt-2 h-1 w-20 mx-auto rounded-full" style={accentStyle}></div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
              {plans.map((plan, index) => (
                <div 
                  key={index}
                  className={`bg-white p-6 rounded-lg shadow-lg flex flex-col ${
                    plan.is_featured 
                      ? 'ring-2 relative transform hover:-translate-y-1' 
                      : 'hover:shadow-xl'
                  } transition-all`}
                  style={plan.is_featured ? { borderColor: agency.accent_color } : {}}
                >
                  {plan.is_featured && (
                    <span 
                      className="absolute top-0 right-0 transform translate-x-2 -translate-y-2 px-3 py-1 rounded-full text-sm font-semibold"
                      style={accentStyle}
                    >
                      Destaque
                    </span>
                  )}
                  
                  <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                  <p className="text-gray-600 mb-4">{plan.description}</p>
                  
                  <div className="mb-6">
                    <span className="text-3xl font-bold">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(plan.price)}
                    </span>
                    <span className="text-gray-500">/{plan.period_label}</span>
                  </div>
                  
                  <ul className="mb-8 flex-grow space-y-3">
                    {Array.isArray(plan.features) && plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <a
                    href={getSignupUrl(plan.id)}
                    className="w-full px-4 py-2 rounded-md font-medium text-center mt-auto"
                    style={plan.is_featured ? primaryButtonStyle : secondaryButtonStyle}
                  >
                    Escolher plano
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
      
      {/* FAQ Section - Nova seção que substituirá o formulário de contato */}
      <section id="faq" className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">Perguntas Frequentes</h2>
            <p className="mt-4 text-lg text-gray-600">Tire suas dúvidas sobre nossos serviços</p>
            <div className="mt-2 h-1 w-20 mx-auto rounded-full" style={accentStyle}></div>
          </div>
          
          <div className="max-w-3xl mx-auto mt-12">
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold mb-2">Como funciona o período de teste?</h3>
                <p className="text-gray-600">
                  Oferecemos um período de teste de 14 dias em todos os nossos planos. 
                  Durante este período, você terá acesso a todas as funcionalidades sem 
                  compromisso e sem necessidade de cartão de crédito.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold mb-2">Posso mudar de plano depois?</h3>
                <p className="text-gray-600">
                  Sim, você pode fazer upgrade ou downgrade do seu plano a qualquer momento. 
                  As mudanças serão aplicadas imediatamente e o valor será ajustado proporcionalmente.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold mb-2">Como funciona o suporte?</h3>
                <p className="text-gray-600">
                  Oferecemos suporte por e-mail, chat e telefone em todos os planos. 
                  Os planos premium incluem um gerente de conta dedicado e suporte prioritário.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold mb-2">Como posso cancelar minha assinatura?</h3>
                <p className="text-gray-600">
                  Você pode cancelar sua assinatura a qualquer momento através do painel 
                  administrativo. Não há taxas de cancelamento ou contratos de fidelidade.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold mb-2">O que acontece com meus dados se eu cancelar?</h3>
                <p className="text-gray-600">
                  Seus dados ficarão disponíveis por 30 dias após o cancelamento, permitindo que 
                  você exporte todas as informações. Após este período, eles serão excluídos permanentemente.
                </p>
              </div>
            </div>
            
            <div className="mt-12 text-center">
              <p className="text-lg mb-6">Ainda tem dúvidas? Entre em contato conosco!</p>
              <a
                href={getSignupUrl()}
                className="inline-flex items-center justify-center px-6 py-3 rounded-md font-medium"
                style={primaryButtonStyle}
              >
                Comece agora <ArrowRight className="ml-2 h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 text-center" style={navStyle}>
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