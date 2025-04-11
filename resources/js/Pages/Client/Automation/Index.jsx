"use client";

import { useState } from 'react';
import { Head } from '@inertiajs/react';
import ClientLayout from '@/Layouts/ClientLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import { Card, CardContent } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { 
  LayoutTemplate, 
  PenSquare, 
  PlusCircle, 
  Settings, 
  Megaphone, 
  FileBox 
} from 'lucide-react';

export default function AutomationIndex({ auth }) {
  const [activeTab, setActiveTab] = useState('fluxos');

  const EmptyState = ({ title, description, buttonText, icon }) => (
    <div className="flex flex-col items-center justify-center text-center py-12">
      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-muted-foreground mt-2 mb-6 max-w-md">{description}</p>
      <Button>
        <PlusCircle className="mr-2 h-4 w-4" />
        {buttonText}
      </Button>
    </div>
  );

  return (
    <ClientLayout title="Automação">
      <Head title="Automação" />

      <Tabs defaultValue="fluxos" onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full justify-start mb-6">
          <TabsTrigger value="fluxos" className="flex items-center">
            <Settings className="mr-2 h-4 w-4" />
            Fluxos de Automação
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center">
            <LayoutTemplate className="mr-2 h-4 w-4" />
            Templates de Mensagens
          </TabsTrigger>
          <TabsTrigger value="campanhas" className="flex items-center">
            <Megaphone className="mr-2 h-4 w-4" />
            Campanhas
          </TabsTrigger>
        </TabsList>

        <Card>
          <CardContent className="pt-6">
            <TabsContent value="fluxos">
              <EmptyState
                title="Nenhum fluxo configurado"
                description="Comece a criar fluxos de automação para qualificar seus leads de forma automática."
                buttonText="Novo Fluxo"
                icon={<Settings className="h-6 w-6 text-muted-foreground" />}
              />
            </TabsContent>

            <TabsContent value="templates">
              <EmptyState
                title="Nenhum template criado"
                description="Crie templates de mensagens para utilizar em suas automações e campanhas."
                buttonText="Novo Template"
                icon={<FileBox className="h-6 w-6 text-muted-foreground" />}
              />
            </TabsContent>

            <TabsContent value="campanhas">
              <EmptyState
                title="Nenhuma campanha configurada"
                description="Crie campanhas para envio automático de mensagens para seus contatos."
                buttonText="Nova Campanha"
                icon={<Megaphone className="h-6 w-6 text-muted-foreground" />}
              />
            </TabsContent>
          </CardContent>
        </Card>
      </Tabs>
    </ClientLayout>
  );
} 