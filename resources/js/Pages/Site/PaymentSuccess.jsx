import { Head } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { CheckCircle } from 'lucide-react';

export default function PaymentSuccess({ loginUrl }) {
  return (
    <>
      <Head title="Pagamento Confirmado" />
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-background py-12 px-4">
        <Card className="w-full max-w-md mx-auto shadow-xl border-0">
          <CardHeader className="text-center pb-2">
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight">Pagamento Confirmado!</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center space-y-6">
              <div className="text-gray-600 text-center">
                <p className="mb-2">Seu pagamento foi processado com sucesso e sua conta foi ativada.</p>
                <p className="mb-4">Você já pode acessar o sistema e começar a utilizar todos os recursos contratados.</p>
              </div>
              
              <Button
                onClick={() => window.location.href = loginUrl}
                className="w-full max-w-xs"
              >
                Acessar o Sistema
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
} 