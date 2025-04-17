<?php

namespace App\Http\Controllers\Agency;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\URL;
use Laravel\Socialite\Facades\Socialite;
use Stripe\StripeClient;

class StripeIntegrationController extends Controller
{
    /**
     * Redireciona para o Stripe Connect (OAuth) para a agência conectar sua conta.
     */
    public function redirectToStripe(Request $request)
    {
        $clientId = config('services.stripe.oauth_client_id') ?? env('STRIPE_OAUTH_CLIENT_ID');
        $redirectUri = URL::route('agency.stripe.callback');
        $state = csrf_token();
        $scopes = 'read_write';
        $url = 'https://connect.stripe.com/oauth/authorize?response_type=code'
            . '&client_id=' . $clientId
            . '&scope=' . $scopes
            . '&redirect_uri=' . urlencode($redirectUri)
            . '&state=' . $state;
        return Redirect::to($url);
    }

    /**
     * Recebe o callback do Stripe, troca o código pelo stripe_account_id e salva na agência.
     */
    public function handleStripeCallback(Request $request)
    {
        $code = $request->input('code');
        $error = $request->input('error');
        if ($error) {
            return redirect()->route('agency.settings.index')->with('error', 'Erro ao conectar Stripe: ' . $error);
        }
        if (!$code) {
            return redirect()->route('agency.settings.index')->with('error', 'Código de autorização não recebido.');
        }
        $clientId = config('services.stripe.oauth_client_id') ?? env('STRIPE_OAUTH_CLIENT_ID');
        $secret = config('services.stripe.oauth_secret') ?? env('STRIPE_OAUTH_SECRET');
        $http = new \GuzzleHttp\Client();
        try {
            $response = $http->post('https://connect.stripe.com/oauth/token', [
                'form_params' => [
                    'client_secret' => $secret,
                    'code' => $code,
                    'grant_type' => 'authorization_code',
                ],
            ]);
            $data = json_decode((string) $response->getBody(), true);
            if (isset($data['stripe_user_id'])) {
                $impersonating = session()->get('impersonate.target');
                if ($impersonating && $impersonating['type'] === 'agency') {
                        $agency = \App\Models\Agency::find($impersonating['id']);
                    } else {
                        $agency = Auth::user()->agency;
                }
                $agency->stripe_account_id = $data['stripe_user_id'];
                $agency->save();
                return redirect()->route('agency.settings.integrations')->with('success', 'Conta Stripe conectada com sucesso!');
            } else {
                Log::error('Stripe Connect: resposta inesperada', ['data' => $data]);
                return redirect()->route('agency.settings.index')->with('error', 'Não foi possível conectar ao Stripe.');
            }
        } catch (\Exception $e) {
            Log::error('Stripe Connect: erro ao trocar código', ['error' => $e->getMessage()]);
            return redirect()->route('agency.settings.index')->with('error', 'Erro ao conectar Stripe: ' . $e->getMessage());
        }
    }

    /**
     * Desconecta a conta Stripe da agência (remove stripe_account_id).
     */
    public function disconnectStripe(Request $request)
    {
        $impersonating = session()->get('impersonate.target');
        if ($impersonating && $impersonating['type'] === 'agency') {
            $agency = \App\Models\Agency::find($impersonating['id']);
        } else {
            $agency = Auth::user()->agency;
        }
        if (!$agency) {
            return redirect()->route('agency.settings.integrations')->with('error', 'Agência não encontrada.');
        }
        $agency->stripe_account_id = null;
        $agency->save();
        return redirect()->route('agency.settings.integrations')->with('success', 'Conta Stripe desconectada com sucesso.');
    }
} 