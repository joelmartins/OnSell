"use client";

import { useState } from "react";
import { Head } from "@inertiajs/react";
import AgencyLayout from "@/Layouts/AgencyLayout";
import { Button } from "@/Components/ui/button";
import { toast } from "react-toastify";

export default function Integrations({ agency }) {
  const [loading, setLoading] = useState(false);

  const handleConnectStripe = async () => {
    setLoading(true);
    try {
      window.location.href = "/agency/settings/integrations/stripe/connect";
    } catch (err) {
      toast.error("Erro ao redirecionar para o Stripe.");
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnectStripe = async () => {
    if (!window.confirm("Tem certeza que deseja desconectar sua conta Stripe?")) return;
    setLoading(true);
    try {
      const response = await fetch("/agency/settings/integrations/stripe/disconnect", {
        method: "POST",
        headers: {
          "X-Requested-With": "XMLHttpRequest",
          "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
        },
      });
      if (response.ok) {
        toast.success("Conta Stripe desconectada com sucesso.");
        window.location.reload();
      } else {
        toast.error("Erro ao desconectar Stripe.");
      }
    } catch (err) {
      toast.error("Erro ao desconectar Stripe.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AgencyLayout title="Integrações">
      <Head title="Integrações" />
      <div className="mb-8">
        <h2 className="text-2xl font-semibold">Integrações</h2>
        <p className="text-muted-foreground">Gerencie integrações da sua agência, incluindo Stripe Connect.</p>
      </div>
      <div className="space-y-8">
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-2">Stripe Connect</h2>
          {agency.stripe_account_id ? (
            <>
              <div className="mb-2 text-green-600 font-semibold">Conta Stripe conectada!</div>
              <div className="mb-2 text-sm text-gray-600 dark:text-gray-300">
                <span className="font-mono">ID: {agency.stripe_account_id}</span>
              </div>
              <Button onClick={handleDisconnectStripe} variant="destructive" disabled={loading} className="mt-2">
                Desconectar Stripe
              </Button>
            </>
          ) : (
            <>
              <div className="mb-2 text-yellow-600 font-semibold">Nenhuma conta Stripe conectada.</div>
              <Button onClick={handleConnectStripe} disabled={loading} className="mt-2">
                Conectar Stripe
              </Button>
            </>
          )}
        </div>
      </div>
    </AgencyLayout>
  );
} 