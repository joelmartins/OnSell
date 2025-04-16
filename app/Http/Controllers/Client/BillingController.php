<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Laravel\Cashier\Checkout;
use App\Models\Plan;

class BillingController extends Controller
{
    /**
     * Inicia o checkout Stripe para o cliente autenticado.
     * POST /client/settings/billing/checkout
     */
    public function checkout(Request $request)
    {
        $impersonate = session('impersonate.target');
        if ($impersonate && $impersonate['type'] === 'client') {
            $client = \App\Models\Client::find($impersonate['id']);
        } else {
            $client = Auth::user()->client;
        }
        if (!$client) {
            abort(403, 'Cliente não encontrado.');
        }

        // Buscar o owner do cliente
        $owner = $client->users()->whereHas('roles', function($q) {
            $q->where('name', 'client.user');
        })->first();
        if (!$owner) {
            abort(403, 'Owner do cliente não encontrado.');
        }

        $planId = $request->input('plan_id');
        $plan = Plan::findOrFail($planId);
        if (!$plan->is_active) {
            abort(400, 'Plano inativo.');
        }
        if (!$plan->price_id) {
            abort(400, 'Plano sem integração Stripe.');
        }

        // Cria sessão de checkout Stripe
        $checkout = $owner->newSubscription('default', $plan->price_id)
            ->checkout([
                'success_url' => route('client.settings.billing') . '?success=1',
                'cancel_url' => route('client.settings.billing') . '?canceled=1',
                'metadata' => [
                    'client_id' => $client->id,
                    'plan_id' => $plan->id,
                ],
            ]);

        // Redireciona para o Stripe
        return redirect($checkout->url);
    }

    /**
     * Exibe status de cobrança e histórico real de invoices do cliente autenticado.
     * GET /client/settings/billing
     */
    public function show(Request $request)
    {
        $impersonate = session('impersonate.target');
        if ($impersonate && $impersonate['type'] === 'client') {
            $client = \App\Models\Client::find($impersonate['id']);
        } else {
            $client = Auth::user()->client;
        }
        if (!$client) {
            abort(403, 'Cliente não encontrado.');
        }

        // Buscar o owner do cliente
        $owner = $client->users()->whereHas('roles', function($q) {
            $q->where('name', 'client.user');
        })->first();
        if (!$owner) {
            abort(403, 'Owner do cliente não encontrado.');
        }

        // Plano atual
        $plan = $client->plan;
        // Status da assinatura
        $subscription = $owner->subscription('default');
        $status = $subscription ? $subscription->stripe_status : 'trial';
        // Dias restantes de trial
        $trialDaysLeft = $subscription && $subscription->onTrial() ? $subscription->trial_ends_at?->diffInDays(now()) : null;
        // Histórico de invoices reais
        $invoices = collect($owner->invoices())->map(function($invoice) {
            return [
                'id' => $invoice->id,
                'date' => $invoice->date()->format('Y-m-d'),
                'amount' => 'R$ ' . number_format(((float) $invoice->total()) / 100, 2, ',', '.'),
                'status' => $invoice->paid ? 'Pago' : 'Pendente',
                'url' => $invoice->hosted_invoice_url,
            ];
        });

        return inertia('Client/Settings/Billing', [
            'billing' => [
                'plan' => $plan ? [
                    'name' => $plan->name,
                ] : null,
                'status' => $status,
                'trial_days_left' => $trialDaysLeft,
                'charges' => $invoices,
            ]
        ]);
    }

    /**
     * Cancela a assinatura Stripe do cliente autenticado.
     * POST /client/settings/billing/cancel
     */
    public function cancel(Request $request)
    {
        $impersonate = session('impersonate.target');
        if ($impersonate && $impersonate['type'] === 'client') {
            $client = \App\Models\Client::find($impersonate['id']);
        } else {
            $client = Auth::user()->client;
        }
        if (!$client) {
            return response()->json(['message' => 'Cliente não encontrado.'], 403);
        }
        $owner = $client->users()->whereHas('roles', function($q) {
            $q->where('name', 'client.user');
        })->first();
        if (!$owner) {
            return response()->json(['message' => 'Owner do cliente não encontrado.'], 403);
        }
        $subscription = $owner->subscription('default');
        if ($subscription && $subscription->valid()) {
            $subscription->cancel();
            $client->is_active = false;
            $client->save();
            return response()->json(['success' => true]);
        }
        return response()->json(['message' => 'Assinatura não encontrada ou já cancelada.'], 400);
    }
} 