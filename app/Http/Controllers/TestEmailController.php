<?php

namespace App\Http\Controllers;

use App\Mail\AccountActivation;
use App\Mail\PasswordReset;
use App\Mail\WelcomeNewClient;
use App\Models\Agency;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class TestEmailController extends Controller
{
    public function testWelcomeEmail()
    {
        // Apenas para teste, usando o primeiro usuário e agência
        $user = User::first();
        $agency = Agency::first();
        
        if (!$user || !$agency) {
            return response()->json(['message' => 'Usuário ou agência não encontrados'], 404);
        }
        
        Mail::to($user->email)->send(new WelcomeNewClient($user, 'senha_exemplo', $agency));
        
        return response()->json(['message' => 'E-mail de boas-vindas enviado com sucesso!']);
    }
    
    public function testPasswordReset()
    {
        // Apenas para teste, usando o primeiro usuário
        $user = User::first();
        
        if (!$user) {
            return response()->json(['message' => 'Usuário não encontrado'], 404);
        }
        
        $url = url(route('password.reset', [
            'token' => 'token_exemplo',
            'email' => $user->email,
        ], false));
        
        Mail::to($user->email)->send(new PasswordReset($user, $url));
        
        return response()->json(['message' => 'E-mail de recuperação de senha enviado com sucesso!']);
    }
    
    public function testAccountActivation()
    {
        // Apenas para teste, usando o primeiro usuário
        $user = User::first();
        
        if (!$user) {
            return response()->json(['message' => 'Usuário não encontrado'], 404);
        }
        
        $url = url(route('login') . '?activation=token_exemplo');
        
        Mail::to($user->email)->send(new AccountActivation($user, $url));
        
        return response()->json(['message' => 'E-mail de ativação de conta enviado com sucesso!']);
    }
} 