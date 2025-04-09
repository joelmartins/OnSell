"use client";

import { useEffect } from 'react';
import { Head } from '@inertiajs/react';
import { CheckCircle, ArrowRight } from 'lucide-react';

export default function AgencySignupSuccess({ agency, client, loginUrl }) {
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
    document.title = `Cadastro Realizado | ${agency.name}` || 'OnSell';
    
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
  
  const navStyle = {
    backgroundColor: agency.primary_color || '#0f172a',
    color: getContrastColor(agency.primary_color || '#0f172a'),
  };

  return (
    <>
      <Head title={`Cadastro Realizado | ${agency.name}`} />
      
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
      
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="max-w-lg mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="bg-white shadow-lg rounded-lg p-8 text-center">
            <div className="mb-6 flex justify-center">
              <div className="rounded-full w-20 h-20 flex items-center justify-center" style={primaryButtonStyle}>
                <CheckCircle className="h-10 w-10" />
              </div>
            </div>
            
            <h1 className="text-2xl font-bold mb-4">Cadastro realizado com sucesso!</h1>
            
            <p className="text-gray-600 mb-8">
              Parabéns! Seu cadastro para {client.name} foi concluído. Use seu e-mail e senha para acessar o sistema.
            </p>
            
            <div className="mb-8 p-4 bg-gray-50 border rounded-lg">
              <h3 className="font-medium mb-2">Informações da conta:</h3>
              <p className="mb-1"><strong>Empresa:</strong> {client.name}</p>
              <p><strong>Domínio:</strong> {client.domain}</p>
            </div>
            
            <a
              href={loginUrl}
              className="inline-flex items-center justify-center px-6 py-3 rounded-md font-medium w-full"
              style={primaryButtonStyle}
            >
              Acessar sistema <ArrowRight className="ml-2 h-5 w-5" />
            </a>
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