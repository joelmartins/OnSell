<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class IntegrationsController extends Controller
{
    /**
     * Página principal de integrações
     */
    public function index()
    {
        return Inertia::render('Admin/Integrations/Index');
    }

    /**
     * Configuração do WhatsApp
     */
    public function whatsapp()
    {
        return Inertia::render('Admin/Integrations/WhatsApp/Index');
    }

    /**
     * Configuração do Evolution API
     */
    public function evolution()
    {
        return Inertia::render('Admin/Integrations/Evolution/Index');
    }

    /**
     * Configuração do Telegram
     */
    public function telegram()
    {
        return Inertia::render('Admin/Integrations/Telegram');
    }

    /**
     * Configuração do Mailchimp
     */
    public function mailchimp()
    {
        return Inertia::render('Admin/Integrations/Mailchimp');
    }

    /**
     * Configuração do Resend
     */
    public function resend()
    {
        return Inertia::render('Admin/Integrations/Resend/Index');
    }

    /**
     * Configuração do Amazon SES
     */
    public function ses()
    {
        return Inertia::render('Admin/Integrations/Ses/Index');
    }

    /**
     * Configuração do Twilio
     */
    public function twilio()
    {
        return Inertia::render('Admin/Integrations/Twilio/Index');
    }

    /**
     * Configuração do Vapi
     */
    public function vapi()
    {
        return Inertia::render('Admin/Integrations/Vapi/Index');
    }

    /**
     * Configuração do Meta Business Suite
     */
    public function meta()
    {
        return Inertia::render('Admin/Integrations/Meta/Index');
    }

    /**
     * Configuração do Google Ads
     */
    public function google()
    {
        return Inertia::render('Admin/Integrations/Google/Index');
    }
}
