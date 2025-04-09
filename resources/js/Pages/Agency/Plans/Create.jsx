import PlanForm from './Form';
import AgencyLayout from '@/Layouts/AgencyLayout';
import { Link } from '@inertiajs/react';
import { Head } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Create({ features }) {
  return (
    <AgencyLayout>
      <Head title="Criar Plano" />
      
      <div className="flex items-start mb-4">
        <Link
          href={route('agency.plans.index')}
          className="flex items-center text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          <span>Voltar para Planos</span>
        </Link>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Criar Novo Plano</CardTitle>
          <CardDescription>Preencha os dados para criar um novo plano para seus clientes</CardDescription>
        </CardHeader>
        <CardContent>
          <PlanForm 
            features={features} 
            isEditing={false}
          />
        </CardContent>
      </Card>
    </AgencyLayout>
  );
} 