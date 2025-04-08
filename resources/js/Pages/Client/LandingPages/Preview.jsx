import React from 'react';
import { Head, Link } from '@inertiajs/react';
import ClientLayout from '@/Layouts/ClientLayout';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { ArrowLeft, Edit, ExternalLink } from 'lucide-react';

export default function LandingPagePreview({ landingPage }) {
  return (
    <ClientLayout>
      <Head title={`Preview - ${landingPage.name}`} />
      
      <div className="container mx-auto py-6">
        <div className="flex items-center mb-6">
          <Button variant="ghost" className="mr-4" asChild>
            <Link href={route('client.landing-pages.index')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Link>
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">{landingPage.name}</h1>
            <p className="text-gray-500">{landingPage.description}</p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant={landingPage.is_active ? "success" : "secondary"}>
              {landingPage.is_active ? "Ativa" : "Inativa"}
            </Badge>
            <Button asChild>
              <Link href={route('client.landing-pages.edit', landingPage.id)}>
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Link>
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Estatísticas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Visualizações</p>
                  <p className="text-2xl font-bold">{landingPage.views_count || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Leads Capturados</p>
                  <p className="text-2xl font-bold">{landingPage.leads_count || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Taxa de Conversão</p>
                  <p className="text-2xl font-bold">
                    {landingPage.conversion_rate || 0}%
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Criada em</p>
                  <p className="font-medium">{landingPage.created_at}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Última atualização</p>
                  <p className="font-medium">{landingPage.updated_at}</p>
                </div>
              </CardContent>
              <CardFooter className="border-t flex justify-center">
                <Button variant="outline" asChild className="w-full">
                  <a 
                    href={landingPage.public_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Ver URL pública
                  </a>
                </Button>
              </CardFooter>
            </Card>
          </div>
          
          <div className="lg:col-span-3 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Visualização</CardTitle>
              </CardHeader>
              <CardContent className="h-[700px]">
                <iframe
                  className="w-full h-full border-none"
                  srcDoc={`
                    <!DOCTYPE html>
                    <html>
                      <head>
                        <meta charset="utf-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>${landingPage.meta_title || landingPage.name}</title>
                        <style>
                          :root {
                            --primary-color: ${landingPage.primary_color || '#3B82F6'};
                            --secondary-color: ${landingPage.secondary_color || '#10B981'};
                          }
                          ${landingPage.css}
                        </style>
                      </head>
                      <body>
                        ${landingPage.content}
                        <script>
                          ${landingPage.js}
                        </script>
                      </body>
                    </html>
                  `}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ClientLayout>
  );
} 