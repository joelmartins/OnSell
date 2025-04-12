"use client";

import { Head } from '@inertiajs/react';
import AgencyLayout from '@/Layouts/AgencyLayout';
import { Link } from '@inertiajs/react';
import { ArrowLeft, DollarSign, Calendar, Tag, BarChart, File, Users, Award } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Separator } from '@/Components/ui/separator';

export default function Show({ plan }) {
  return (
    <AgencyLayout>
      <Head title={`Plano - ${plan.name}`} />
      
      <div className="flex items-start mb-4">
        <Link
          href={route('agency.plans.index')}
          className="flex items-center text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          <span>Voltar para Planos</span>
        </Link>
      </div>
      
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 gap-4">
        <div>
          <h2 className="text-3xl font-bold">{plan.name}</h2>
          <p className="text-muted-foreground mt-1">{plan.description}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={route('agency.plans.edit', plan.id)}>
            <Button variant="outline">Editar</Button>
          </Link>
          <Link href={route('agency.plans.duplicate', plan.id)}>
            <Button variant="outline">Duplicar</Button>
          </Link>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-lg">
              <DollarSign className="h-5 w-5 mr-2 text-primary" />
              Detalhes de Preço
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <span className="text-muted-foreground text-sm">Preço:</span>
                <div className="text-2xl font-bold">{plan.price}</div>
              </div>
              <div>
                <span className="text-muted-foreground text-sm">Período:</span>
                <div className="font-medium">
                  {plan.period === 'monthly' && 'Mensal'}
                  {plan.period === 'quarterly' && 'Trimestral'}
                  {plan.period === 'semiannual' && 'Semestral'}
                  {plan.period === 'annual' && 'Anual'}
                  {plan.period === 'lifetime' && 'Vitalício'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-lg">
              <Award className="h-5 w-5 mr-2 text-primary" />
              Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <span className="text-muted-foreground text-sm">Status:</span>
                <div className="font-medium">
                  {plan.is_active ? (
                    <span className="text-green-600 font-semibold">Ativo</span>
                  ) : (
                    <span className="text-red-600 font-semibold">Inativo</span>
                  )}
                </div>
              </div>
              <div>
                <span className="text-muted-foreground text-sm">Destaque:</span>
                <div className="font-medium">
                  {plan.is_featured ? (
                    <span className="text-amber-600 font-semibold">Destacado</span>
                  ) : (
                    <span className="text-gray-600">Sem destaque</span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-lg">
              <Users className="h-5 w-5 mr-2 text-primary" />
              Uso
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <span className="text-muted-foreground text-sm">Clientes usando este plano:</span>
                <div className="text-2xl font-bold">{plan.clients_count}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <BarChart className="h-5 w-5 mr-2 text-primary" />
              Limites
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li className="flex justify-between">
                <span className="text-muted-foreground">Leads mensais:</span>
                <span className="font-medium">{plan.monthly_leads || 'Ilimitado'}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-muted-foreground">Total de leads:</span>
                <span className="font-medium">{plan.total_leads || 'Ilimitado'}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-muted-foreground">Landing Pages:</span>
                <span className="font-medium">{plan.max_landing_pages || 'Ilimitado'}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-muted-foreground">Pipelines:</span>
                <span className="font-medium">{plan.max_pipelines || 'Ilimitado'}</span>
              </li>
              {plan.max_clients && (
                <li className="flex justify-between">
                  <span className="text-muted-foreground">Clientes:</span>
                  <span className="font-medium">{plan.max_clients || 'Ilimitado'}</span>
                </li>
              )}
            </ul>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <Tag className="h-5 w-5 mr-2 text-primary" />
              Recursos Incluídos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {plan.features && Array.isArray(plan.features) && plan.features.length > 0 ? (
              <ul className="space-y-2">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <div className="mr-2 mt-0.5 text-green-500">•</div>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            ) : plan.features && typeof plan.features === 'object' && !Array.isArray(plan.features) ? (
              <ul className="space-y-2">
                {Object.values(plan.features).map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <div className="mr-2 mt-0.5 text-green-500">•</div>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground italic">Nenhum recurso específico definido.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </AgencyLayout>
  );
} 