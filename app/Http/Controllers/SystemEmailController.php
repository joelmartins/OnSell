<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Auth;

class SystemEmailController extends Controller
{
    // Envia e-mail de boas-vindas real
    public function sendWelcomeEmail(Request $request)
    {
        $user = Auth::user();
        Mail::to($user->email)->send(new \App\Mail\WelcomeMail($user));
        return response('E-mail de boas-vindas enviado para ' . $user->email, 200);
    }

    // Envia e-mail de redefinição de senha real
    public function sendPasswordResetEmail(Request $request)
    {
        $user = Auth::user();
        Mail::to($user->email)->send(new \App\Mail\PasswordResetMail($user));
        return response('E-mail de redefinição de senha enviado para ' . $user->email, 200);
    }

    // Envia e-mail de ativação de conta real
    public function sendAccountActivationEmail(Request $request)
    {
        $user = Auth::user();
        Mail::to($user->email)->send(new \App\Mail\AccountActivationMail($user));
        return response('E-mail de ativação de conta enviado para ' . $user->email, 200);
    }
} 