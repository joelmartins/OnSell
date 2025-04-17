<?php

namespace App\Http\Controllers\Agency;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Laravel\Cashier\Checkout;
use App\Models\Plan;

class BillingController extends Controller
{
    /**
     * Inicia o checkout Stripe para a agência autenticada.
     * POST /agency/settings/billing/checkout
     */
    public function checkout(Request $request)
    {
        $impersonate = session('impersonate.target');
        if ($impersonate && $impersonate['type'] === 'agency') {
            $agency = \App\Models\Agency::find($impersonate['id']);
        } else {
            $agency = Auth::user()->agency;
        }
        if (!$agency) {
            abort(403, 'Agência não encontrada.');
        }
        if (!$agency->stripe_account_id) {
            abort(400, 'Agência sem Stripe Connect.');
        }

        $planId = $request->input('plan_id');
        $plan = Plan::findOrFail($planId);
        if (!$plan->is_active) {
            abort(400, 'Plano inativo.');
        }
        if (!$plan->price_id) {
            abort(400, 'Plano sem integração Stripe.');
        }

        // Criar sessão de checkout Stripe via API, usando a conta da agência
        try {
            $stripe = new \Stripe\StripeClient(config('services.stripe.secret'));
            $session = $stripe->checkout->sessions->create([
                'payment_method_types' => ['card'],
                'line_items' => [[
                    'price' => $plan->price_id,
                    'quantity' => 1,
                ]],
                'mode' => 'subscription',
                'success_url' => route('agency.settings.billing') . '?success=1',
                'cancel_url' => route('agency.settings.billing') . '?canceled=1',
                'metadata' => [
                    'agency_id' => $agency->id,
                    'plan_id' => $plan->id,
                ],
            ], [
                'stripe_account' => $agency->stripe_account_id
            ]);
            return redirect($session->url);
        } catch (\Exception $e) {
            \Log::error('Erro ao criar sessão de checkout Stripe Connect', ['error' => $e->getMessage()]);
            abort(500, 'Erro ao criar sessão de checkout Stripe: ' . $e->getMessage());
        }
    }

    /**
     * Exibe status de cobrança e histórico real de invoices da agência autenticada.
     * GET /agency/settings/billing
     */
    public function show(Request $request)
    {
        $impersonate = session('impersonate.target');
        if ($impersonate && $impersonate['type'] === 'agency') {
            $agency = \App\Models\Agency::find($impersonate['id']);
        } else {
            $agency = Auth::user()->agency;
        }
        if (!$agency) {
            abort(403, 'Agência não encontrada.');
        }

        // Buscar o owner da agência
        $owner = $agency->users()->whereHas('roles', function($q) {
            $q->where('name', 'agency.owner');
        })->first();
        if (!$owner) {
            abort(403, 'Owner da agência não encontrado.');
        }

        // Plano atual
        $plan = $agency->plan;
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
                'amount' => 'R$ ' . number_format($invoice->total() / 100, 2, ',', '.'),
                'status' => $invoice->paid ? 'Pago' : 'Pendente',
                'url' => $invoice->hosted_invoice_url,
            ];
        });

        return inertia('Agency/Settings/Billing', [
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
     * Cancela a assinatura Stripe da agência autenticada.
     * POST /agency/settings/billing/cancel
     */
    public function cancel(Request $request)
    {
        $impersonate = session('impersonate.target');
        if ($impersonate && $impersonate['type'] === 'agency') {
            $agency = \App\Models\Agency::find($impersonate['id']);
        } else {
            $agency = Auth::user()->agency;
        }
        if (!$agency) {
            return response()->json(['message' => 'Agência não encontrada.'], 403);
        }
        $owner = $agency->users()->whereHas('roles', function($q) {
            $q->where('name', 'agency.owner');
        })->first();
        if (!$owner) {
            return response()->json(['message' => 'Owner da agência não encontrado.'], 403);
        }
        $subscription = $owner->subscription('default');
        if ($subscription && $subscription->valid()) {
            $subscription->cancel();
            $agency->is_active = false;
            $agency->save();
            return response()->json(['success' => true]);
        }
        return response()->json(['message' => 'Assinatura não encontrada ou já cancelada.'], 400);
    }
} 