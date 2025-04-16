"use client";

import { Head } from '@inertiajs/react';
import ClientLayout from '@/Layouts/ClientLayout';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { UserCog } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'react-toastify';

export default function Billing({ billing = {} }) {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const res = await fetch('/client/settings/billing/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
        },
        body: JSON.stringify({ plan_id: billing.plan?.id }),
      });
      if (res.redirected) {
        window.location.href = res.url;
        return;
      }
      const data = await res.json();
      if (data.checkout_url) {
        window.location.href = data.checkout_url;
      } else {
        toast.error('Não foi possível iniciar o checkout.');
      }
    } catch (err) {
      toast.error('Erro ao iniciar checkout: ' + (err.message || 'Erro desconhecido.'));
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('Tem certeza que deseja cancelar sua assinatura?')) return;
    setLoading(true);
    try {
      const res = await fetch('/client/settings/billing/cancel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
        },
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Assinatura cancelada com sucesso!');
        window.location.reload();
      } else {
        toast.error(data.message || 'Erro ao cancelar assinatura.');
      }
    } catch (err) {
      toast.error('Erro ao cancelar assinatura: ' + (err.message || 'Erro desconhecido.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ClientLayout title="Cobrança e Assinatura">
      <Head title="Cobrança e Assinatura" />
      <div className="mb-8">
        <h2 className="text-2xl font-semibold">Cobrança e Assinatura</h2>
        <p className="text-muted-foreground">Gerencie seu plano, pagamentos e histórico de cobranças</p>
      </div>
      <div className="space-y-8">
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-2">Status do Plano</h2>
          <div className="mb-2">Plano atual: <span className="font-semibold">{billing.plan?.name || 'N/A'}</span></div>
          <div className="mb-2">Status: <span className="font-semibold">{billing.status || 'trial'}</span></div>
          <div className="mb-2">Dias restantes do trial: <span className="font-semibold">{billing.trial_days_left ?? 'N/A'}</span></div>
          <Button onClick={handleCheckout} disabled={loading} className="mt-2">Ativar com Stripe</Button>
          {billing.status !== 'trial' && (
            <Button onClick={handleCancel} variant="destructive" className="mt-2 ml-2">Cancelar Assinatura</Button>
          )}
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-2">Histórico de Cobranças</h2>
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {(billing.charges || [{id: 1, date: '2024-06-01', amount: 'R$ 99,00', status: 'Pago'}]).map(charge => (
              <li key={charge.id} className="py-2 flex justify-between">
                <span>{charge.date}</span>
                <span>{charge.amount}</span>
                <span className={charge.status === 'Pago' ? 'text-green-600' : 'text-red-600'}>{charge.status}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </ClientLayout>
  );
} 