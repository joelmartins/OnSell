"use client";

import { Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/Components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import { 
  MessageSquare, 
  Mail, 
  Phone, 
  Globe, 
  Github, 
  ExternalLink,
  CheckCircle,
  XCircle,
  Settings
} from 'lucide-react';

export default function IntegrationsIndex({ auth }) {
  // Dados de exemplo para integrações
  const integrations = {
    messaging: [
      { 
        id: 1, 
        name: 'WhatsApp Business API', 
        description: 'Integração oficial com a API do WhatsApp Business',
        icon: <MessageSquare className="h-8 w-8" />,
        is_active: false,
        is_configured: false,
        docs_url: 'https://developers.facebook.com/docs/whatsapp',
        setup_route: 'admin.integrations.whatsapp'
      },
      { 
        id: 2, 
        name: 'Evolution API', 
        description: 'API alternativa para WhatsApp com mais recursos',
        icon: <MessageSquare className="h-8 w-8" />,
        is_active: true,
        is_configured: false,
        docs_url: 'https://github.com/evolution-api',
        setup_route: 'admin.integrations.evolution.index'
      }
    ],
    email: [
      { 
        id: 4, 
        name: 'Resend', 
        description: 'API de email simples e poderosa para desenvolvedores',
        icon: <Mail className="h-8 w-8" />,
        is_active: false,
        is_configured: false,
        docs_url: 'https://resend.com/docs',
        setup_route: 'admin.integrations.resend'
      },
      { 
        id: 5, 
        name: 'Amazon SES', 
        description: 'Serviço de email da Amazon Web Services',
        icon: <Mail className="h-8 w-8" />,
        is_active: false,
        is_configured: false,
        docs_url: 'https://aws.amazon.com/ses/',
        setup_route: 'admin.integrations.ses'
      }
    ],
    telephony: [
      { 
        id: 6, 
        name: 'Twilio', 
        description: 'Integração com serviços de telefonia da Twilio',
        icon: <Phone className="h-8 w-8" />,
        is_active: false,
        is_configured: false,
        docs_url: 'https://www.twilio.com/docs/usage/api',
        setup_route: 'admin.integrations.twilio'
      },
      { 
        id: 7, 
        name: 'Vapi', 
        description: 'Integração com serviços de telefonia Vapi',
        icon: <Phone className="h-8 w-8" />,
        is_active: false,
        is_configured: false,
        docs_url: 'https://vapi.com/docs/',
        setup_route: 'admin.integrations.vapi'
      }
    ],
    social: [
      { 
        id: 8, 
        name: 'Meta Business Suite', 
        description: 'Integração com Facebook e Instagram Ads',
        icon: <Globe className="h-8 w-8" />,
        is_active: false,
        is_configured: false,
        docs_url: 'https://developers.facebook.com/docs/marketing-apis/',
        setup_route: 'admin.integrations.meta'
      },
      { 
        id: 9, 
        name: 'Google Ads', 
        description: 'Integração com plataforma de anúncios do Google',
        icon: <Globe className="h-8 w-8" />,
        is_active: false,
        is_configured: false,
        docs_url: 'https://developers.google.com/google-ads/api/docs/start',
        setup_route: 'admin.integrations.google'
      }
    ]
  };

  return (
    <AdminLayout title="Integrações">
      <Head title="Integrações" />
      
      <div className="mb-8">
        <h2 className="text-2xl font-semibold">Integrações</h2>
        <p className="text-muted-foreground">Configure as integrações disponíveis na plataforma</p>
      </div>
      
      <Tabs defaultValue="messaging" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="messaging" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Mensagens
          </TabsTrigger>
          <TabsTrigger value="email" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Email
          </TabsTrigger>
          <TabsTrigger value="telephony" className="flex items-center gap-2">
            <Phone className="h-4 w-4" />
            Telefonia
          </TabsTrigger>
          <TabsTrigger value="social" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Plataformas
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="messaging" className="mt-0">
          <IntegrationGrid integrations={integrations.messaging} />
        </TabsContent>
        
        <TabsContent value="email" className="mt-0">
          <IntegrationGrid integrations={integrations.email} />
        </TabsContent>
        
        <TabsContent value="telephony" className="mt-0">
          <IntegrationGrid integrations={integrations.telephony} />
        </TabsContent>
        
        <TabsContent value="social" className="mt-0">
          <IntegrationGrid integrations={integrations.social} />
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
}

function IntegrationGrid({ integrations }) {
  // Função auxiliar para verificar se uma rota existe e retornar a URL
  const getRouteUrl = (routeName) => {
    try {
      return route(routeName);
    } catch (error) {
      console.warn(`Rota '${routeName}' não encontrada:`, error.message);
      return null;
    }
  };

  return (
    <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {integrations.map((integration) => {
        const setupUrl = getRouteUrl(integration.setup_route);
        const isEvolution = integration.name === 'Evolution API' || integration.name === 'Resend';
        
        return (
          <Card key={integration.id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="rounded-md bg-primary-100/30 dark:bg-primary-900/20 p-2">
                  {integration.icon}
                </div>
                <StatusBadge 
                  isActive={integration.is_active} 
                  isConfigured={integration.is_configured} 
                />
              </div>
              <CardTitle className="mt-4">{integration.name}</CardTitle>
              <CardDescription>{integration.description}</CardDescription>
            </CardHeader>
            <CardFooter className="flex justify-between items-center pt-0">
              <Button variant="outline" size="sm" asChild>
                <a href={integration.docs_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1">
                  <ExternalLink className="h-3.5 w-3.5" />
                  Documentação
                </a>
              </Button>
              
              {isEvolution ? (
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => (window.location.href = setupUrl)}
                >
                  <Settings className="h-3.5 w-3.5 mr-1" />
                  Configurar
                </Button>
              ) : (
                <Button
                  variant="default"
                  size="sm"
                  disabled
                  title="Funcionalidade em desenvolvimento"
                >
                  <Settings className="h-3.5 w-3.5 mr-1" />
                  Configurar
                </Button>
              )}
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}

function StatusBadge({ isActive, isConfigured }) {
  if (!isActive) {
    return (
      <Badge variant="outline" className="bg-gray-100 text-gray-800 hover:bg-gray-100 flex items-center gap-1">
        <XCircle className="h-3.5 w-3.5" />
        <span>Inativo</span>
      </Badge>
    );
  }
  
  if (!isConfigured) {
    return (
      <Badge variant="outline" className="bg-amber-100 text-amber-800 hover:bg-amber-100 flex items-center gap-1">
        <Settings className="h-3.5 w-3.5" />
        <span>Não configurado</span>
      </Badge>
    );
  }
  
  return (
    <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100 flex items-center gap-1">
      <CheckCircle className="h-3.5 w-3.5" />
      <span>Ativo</span>
    </Badge>
  );
} 