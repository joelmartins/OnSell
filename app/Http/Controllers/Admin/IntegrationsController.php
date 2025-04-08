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
        return Inertia::render('Admin/Integrations/WhatsApp');
    }

    /**
     * Configuração do Evolution API
     */
    public function evolution()
    {
        return Inertia::render('Admin/Integrations/Evolution');
    }

    /**
     * Configuração do Telegram
     */
    public function telegram()
    {
        return Inertia::render('Admin/Integrations/Telegram');
    }

    /**
     * Configuração do SMTP
     */
    public function smtp()
    {
        return Inertia::render('Admin/Integrations/Smtp');
    }

    /**
     * Configuração do Mailchimp
     */
    public function mailchimp()
    {
        return Inertia::render('Admin/Integrations/Mailchimp');
    }

    /**
     * Configuração do Amazon SES
     */
    public function ses()
    {
        return Inertia::render('Admin/Integrations/Ses');
    }

    /**
     * Configuração do Twilio
     */
    public function twilio()
    {
        return Inertia::render('Admin/Integrations/Twilio');
    }

    /**
     * Configuração do Meta Business Suite
     */
    public function meta()
    {
        return Inertia::render('Admin/Integrations/Meta');
    }

    /**
     * Configuração do Google Ads
     */
    public function google()
    {
        return Inertia::render('Admin/Integrations/Google');
    }
}
