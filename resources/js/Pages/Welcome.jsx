import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowRight, Bot, BarChart3, MessageSquare, Zap, CheckCircle2, Users, Calendar, Target, Star } from "lucide-react";

export default function Welcome() {
    const { auth, laravelVersion, phpVersion, canLogin, canRegister, featuredPlans } = usePage().props;
    return (
        <>
            <Head title="OnSell - Venda sem equipe. A IA cuida disso para você." />
            <div className="flex flex-col min-h-screen">
                <header className="border-b">
                    <div className="container mx-auto max-w-6xl flex h-16 items-center justify-between px-4">
                        <div className="flex items-center gap-2">
                            <img src="/img/onsell_logo.svg" alt="OnSell" className="h-8" />
                        </div>
                        <nav className="hidden md:flex items-center gap-6">
                            <Link href="#features" className="text-sm font-medium hover:underline underline-offset-4">
                                Funcionalidades
                            </Link>
                            <Link href="#how-it-works" className="text-sm font-medium hover:underline underline-offset-4">
                                Como Funciona
                            </Link>
                            <Link href="#pricing" className="text-sm font-medium hover:underline underline-offset-4">
                                Preços
                            </Link>
                            {auth.user ? (
                                <Link href={route('dashboard')} className="text-sm font-medium hover:underline underline-offset-4">
                                    Dashboard
                                </Link>
                            ) : (
                                <Link href={route('login')} className="text-sm font-medium hover:underline underline-offset-4">
                                    Login
                                </Link>
                            )}
                        </nav>
                        <div className="flex items-center gap-4">
                            {auth.user ? (
                                <Link href={route('dashboard')} className="px-4 py-2 rounded-md bg-primary text-white text-sm font-medium hover:bg-primary/90">
                                    Dashboard
                                </Link>
                            ) : (
                                <Link href={route('register')} className="px-4 py-2 rounded-md bg-primary text-white text-sm font-medium hover:bg-primary/90">
                                    Começar Grátis
                                </Link>
                            )}
                        </div>
                    </div>
                </header>
                <main className="flex-1">
                    {/* Hero Section */}
                    <section className="py-20 md:py-28">
                        <div className="container mx-auto max-w-6xl px-4 md:px-6">
                            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
                                <div className="flex flex-col justify-center space-y-4">
                                    <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary">
                                        Plataforma SaaS para pequenas empresas
                                    </div>
                                    <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
                                        Venda sem equipe. <br />
                                        <span className="text-primary">A IA cuida disso para você.</span>
                                    </h1>
                                    <p className="max-w-[600px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                                        Gere, qualifique e converta leads automaticamente — sem depender de equipe de marketing ou vendas.
                                    </p>
                                    <div className="flex flex-col gap-2 min-[400px]:flex-row">
                                        <Link href={route('register')} className="inline-flex items-center justify-center px-8 py-2 text-sm font-medium transition-colors rounded-md h-10 bg-primary text-primary-foreground shadow hover:bg-primary/90 gap-1">
                                            Criar conta grátis
                                            <ArrowRight className="h-4 w-4" />
                                        </Link>
                                        <Link href="#" className="inline-flex items-center justify-center px-8 py-2 text-sm font-medium transition-colors rounded-md h-10 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground">
                                            Ver demonstração
                                        </Link>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm">
                                        <div className="flex items-center gap-1">
                                            <CheckCircle2 className="h-4 w-4 text-primary" />
                                            <span>Pronto em 15 minutos</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <CheckCircle2 className="h-4 w-4 text-primary" />
                                            <span>Sem conhecimento técnico</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="mx-auto lg:order-last">
                                    <div className="rounded-lg border bg-background p-2 shadow-lg">
                                        <img
                                            src="/img/onsell-banner.png"
                                            alt="Dashboard do OnSell"
                                            className="aspect-video overflow-hidden rounded-lg object-cover"
                                            width={600}
                                            height={300}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Problems Section */}
                    <section className="py-16">
                        <div className="container mx-auto max-w-6xl px-4 md:px-6">
                            <div className="flex flex-col items-center justify-center space-y-4 text-center">
                                <div className="space-y-2">
                                    <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                                        Problemas que resolvemos
                                    </h2>
                                    <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                                        Pequenos empresários enfrentam 3 grandes desafios:
                                    </p>
                                </div>
                                <div className="grid gap-6 sm:grid-cols-3 pt-8">
                                    <div className="flex flex-col items-center space-y-3 rounded-lg border p-6 bg-background shadow-sm">
                                        <h3 className="text-xl font-bold">Falta de tempo</h3>
                                        <p className="text-gray-500 text-center">
                                            Sem tempo ou conhecimento técnico para montar estratégias de marketing e vendas.
                                        </p>
                                    </div>
                                    <div className="flex flex-col items-center space-y-3 rounded-lg border p-6 bg-background shadow-sm">
                                        <h3 className="text-xl font-bold">Baixo orçamento</h3>
                                        <p className="text-gray-500 text-center">
                                            Impossibilidade de contratar uma equipe ou agência especializada.
                                        </p>
                                    </div>
                                    <div className="flex flex-col items-center space-y-3 rounded-lg border p-6 bg-background shadow-sm">
                                        <h3 className="text-xl font-bold">Baixa conversão</h3>
                                        <p className="text-gray-500 text-center">
                                            Perda de leads por falta de qualificação e follow-up estruturado.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Features Section */}
                    <section id="features" className="py-16">
                        <div className="container mx-auto max-w-6xl px-4 md:px-6">
                            <div className="flex flex-col items-center justify-center space-y-4 text-center">
                                <div className="space-y-2">
                                    <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                                        Principais Funcionalidades
                                    </h2>
                                    <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                                        Uma plataforma all-in-one para automatizar seu marketing e vendas
                                    </p>
                                </div>
                                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 pt-8">
                                    <div className="flex flex-col items-start space-y-3 rounded-lg border p-6 bg-background shadow-sm">
                                        <div className="rounded-full bg-primary/10 p-3">
                                            <Bot className="h-6 w-6 text-primary" />
                                        </div>
                                        <h3 className="text-xl font-bold">Campanhas com IA</h3>
                                        <p className="text-gray-500 text-left">
                                            Geração de copy, criativos e públicos para Google Ads e Meta Ads com integração direta.
                                        </p>
                                    </div>
                                    <div className="flex flex-col items-start space-y-3 rounded-lg border p-6 bg-background shadow-sm">
                                        <div className="rounded-full bg-primary/10 p-3">
                                            <Zap className="h-6 w-6 text-primary" />
                                        </div>
                                        <h3 className="text-xl font-bold">Landing Pages Automáticas</h3>
                                        <p className="text-gray-500 text-left">
                                            Criadas com base no seu produto e público, otimizadas para conversão.
                                        </p>
                                    </div>
                                    <div className="flex flex-col items-start space-y-3 rounded-lg border p-6 bg-background shadow-sm">
                                        <div className="rounded-full bg-primary/10 p-3">
                                            <MessageSquare className="h-6 w-6 text-primary" />
                                        </div>
                                        <h3 className="text-xl font-bold">Qualificação Automática</h3>
                                        <p className="text-gray-500 text-left">
                                            Chatbot de WhatsApp e ligações automáticas com voz realista usando IA.
                                        </p>
                                    </div>
                                    <div className="flex flex-col items-start space-y-3 rounded-lg border p-6 bg-background shadow-sm">
                                        <div className="rounded-full bg-primary/10 p-3">
                                            <Users className="h-6 w-6 text-primary" />
                                        </div>
                                        <h3 className="text-xl font-bold">CRM e Funil Visual</h3>
                                        <p className="text-gray-500 text-left">
                                            Pipeline com arraste de leads por estágio e qualificação automática.
                                        </p>
                                    </div>
                                    <div className="flex flex-col items-start space-y-3 rounded-lg border p-6 bg-background shadow-sm">
                                        <div className="rounded-full bg-primary/10 p-3">
                                            <MessageSquare className="h-6 w-6 text-primary" />
                                        </div>
                                        <h3 className="text-xl font-bold">Central Multicanal</h3>
                                        <p className="text-gray-500 text-left">
                                            Respostas automáticas via WhatsApp, e-mail, Instagram e Facebook.
                                        </p>
                                    </div>
                                    <div className="flex flex-col items-start space-y-3 rounded-lg border p-6 bg-background shadow-sm">
                                        <div className="rounded-full bg-primary/10 p-3">
                                            <BarChart3 className="h-6 w-6 text-primary" />
                                        </div>
                                        <h3 className="text-xl font-bold">Dashboard Inteligente</h3>
                                        <p className="text-gray-500 text-left">
                                            Métricas em tempo real e sugestões da IA para melhorar resultados.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* How It Works Section */}
                    <section id="how-it-works" className="py-16">
                        <div className="container mx-auto max-w-6xl px-4 md:px-6">
                            <div className="flex flex-col items-center justify-center space-y-4 text-center">
                                <div className="space-y-2">
                                    <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Como Funciona</h2>
                                    <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                                        Jornada simples para começar a vender automaticamente
                                    </p>
                                </div>
                                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 pt-8 w-full">
                                    <div className="flex flex-col items-center space-y-3 relative">
                                        <div className="rounded-full bg-primary/10 p-3 relative z-10">
                                            <Bot className="h-6 w-6 text-primary" />
                                        </div>
                                        <div className="hidden md:block absolute top-6 left-[calc(50%+2rem)] w-[calc(100%-4rem)] h-0.5 bg-primary/30 z-0"></div>
                                        <h3 className="text-xl font-bold">1. Crie sua conta</h3>
                                        <p className="text-gray-500 text-center">
                                            Responda perguntas simples no onboarding para configurar seu perfil.
                                        </p>
                                    </div>
                                    <div className="flex flex-col items-center space-y-3 relative">
                                        <div className="rounded-full bg-primary/10 p-3 relative z-10">
                                            <Zap className="h-6 w-6 text-primary" />
                                        </div>
                                        <div className="hidden md:block absolute top-6 left-[calc(50%+2rem)] w-[calc(100%-4rem)] h-0.5 bg-primary/30 z-0"></div>
                                        <h3 className="text-xl font-bold">2. IA gera sua campanha</h3>
                                        <p className="text-gray-500 text-center">
                                            Nossa IA cria campanhas, páginas e fluxos de qualificação automaticamente.
                                        </p>
                                    </div>
                                    <div className="flex flex-col items-center space-y-3 relative">
                                        <div className="rounded-full bg-primary/10 p-3 relative z-10">
                                            <MessageSquare className="h-6 w-6 text-primary" />
                                        </div>
                                        <div className="hidden md:block absolute top-6 left-[calc(50%+2rem)] w-[calc(100%-4rem)] h-0.5 bg-primary/30 z-0"></div>
                                        <h3 className="text-xl font-bold">3. Conecte seus canais</h3>
                                        <p className="text-gray-500 text-center">Integre WhatsApp, anúncios e outros canais em poucos cliques.</p>
                                    </div>
                                    <div className="flex flex-col items-center space-y-3">
                                        <div className="rounded-full bg-primary/10 p-3 relative z-10">
                                            <BarChart3 className="h-6 w-6 text-primary" />
                                        </div>
                                        <h3 className="text-xl font-bold">4. Acompanhe resultados</h3>
                                        <p className="text-gray-500 text-center">Veja leads sendo qualificados e convertidos automaticamente.</p>
                                    </div>
                                </div>
                                <div className="pt-8 flex flex-col items-center">
                                    <div className="max-w-3xl text-center">
                                        <p className="text-gray-500 mb-4">
                                            Em apenas 15 minutos, sua plataforma estará ativa e pronta para gerar leads qualificados. Você acompanha
                                            e interage com leads via central unificada, enquanto a IA cuida da qualificação e follow-up.
                                        </p>
                                        <div className="inline-flex items-center text-primary hover:underline cursor-pointer">
                                            <span>Ver demonstração em vídeo</span>
                                            <ArrowRight className="ml-1 h-4 w-4" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* AI Features Section */}
                    <section className="py-16">
                        <div className="container mx-auto max-w-6xl px-4 md:px-6">
                            <div className="flex flex-col items-center justify-center space-y-4 text-center">
                                <div className="space-y-2">
                                    <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                                        Recursos de Inteligência Artificial
                                    </h2>
                                    <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                                        Tecnologia avançada para automatizar seu processo de vendas
                                    </p>
                                </div>
                                <div className="grid gap-6 sm:grid-cols-2 lg:gap-12 pt-8">
                                    <div className="flex flex-col space-y-3 rounded-lg border p-6 bg-background shadow-sm">
                                        <h3 className="text-xl font-bold">GPT-4 Turbo</h3>
                                        <p className="text-gray-500 text-left">
                                            Para copywriting, diálogos, scripts de vendas e geração de conteúdo personalizado para sua empresa.
                                        </p>
                                    </div>
                                    <div className="flex flex-col space-y-3 rounded-lg border p-6 bg-background shadow-sm">
                                        <h3 className="text-xl font-bold">IA de Qualificação</h3>
                                        <p className="text-gray-500 text-left">
                                            Baseada em regras e machine learning para identificar os leads mais propensos a comprar.
                                        </p>
                                    </div>
                                    <div className="flex flex-col space-y-3 rounded-lg border p-6 bg-background shadow-sm">
                                        <h3 className="text-xl font-bold">Voz Sintetizada</h3>
                                        <p className="text-gray-500 text-left">
                                            Com ElevenLabs ou Azure Speech para ligações automáticas que soam naturais.
                                        </p>
                                    </div>
                                    <div className="flex flex-col space-y-3 rounded-lg border p-6 bg-background shadow-sm">
                                        <h3 className="text-xl font-bold">Análises em Tempo Real</h3>
                                        <p className="text-gray-500 text-left">
                                            Insights baseados no comportamento dos leads para otimizar suas campanhas continuamente.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Target Audience Section */}
                    <section className="bg-muted py-16">
                        <div className="container mx-auto max-w-6xl px-4 md:px-6">
                            <div className="flex flex-col items-center justify-center space-y-4 text-center">
                                <div className="space-y-2">
                                    <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Para Quem é o OnSell?</h2>
                                    <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                                        Ideal para pequenos negócios que precisam vender mais sem contratar equipe
                                    </p>
                                </div>
                                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 pt-8">
                                    <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 bg-background shadow-sm">
                                        <h3 className="text-xl font-bold">PMEs de Serviços</h3>
                                        <p className="text-gray-500 text-center">
                                            Empresas de serviços que precisam de um fluxo constante de leads qualificados.
                                        </p>
                                    </div>
                                    <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 bg-background shadow-sm">
                                        <h3 className="text-xl font-bold">Profissionais Autônomos</h3>
                                        <p className="text-gray-500 text-center">
                                            Consultores, corretores, dentistas e outros profissionais liberais.
                                        </p>
                                    </div>
                                    <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 bg-background shadow-sm">
                                        <h3 className="text-xl font-bold">Negócios Locais</h3>
                                        <p className="text-gray-500 text-center">
                                            Correspondentes bancários, clínicas, imobiliárias e academias.
                                        </p>
                                    </div>
                                    <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 bg-background shadow-sm">
                                        <h3 className="text-xl font-bold">Franquias e MEIs</h3>
                                        <p className="text-gray-500 text-center">
                                            Pequenos empreendedores que precisam escalar sem aumentar custos.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Problem Section */}
                    <section className="py-16">
                        <div className="container mx-auto max-w-6xl px-4 md:px-6">
                            <div className="flex flex-col items-center justify-center space-y-4 text-center">
                                <div className="space-y-2">
                                    <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                                        Problema que o OnSell resolve
                                    </h2>
                                    <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                                        Descubra como o OnSell pode resolver problemas comuns de marketing e vendas para pequenos negócios.
                                    </p>
                                </div>
                                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 pt-8">
                                    <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 bg-background shadow-sm">
                                        <h3 className="text-xl font-bold">Marketing Digital</h3>
                                        <p className="text-gray-500 text-center">
                                            Como alcançar e converter leads de forma eficiente no mundo digital.
                                        </p>
                                    </div>
                                    <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 bg-background shadow-sm">
                                        <h3 className="text-xl font-bold">Equipe de Vendas</h3>
                                        <p className="text-gray-500 text-center">
                                            Como vender mais sem contratar uma equipe completa de vendas.
                                        </p>
                                    </div>
                                    <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 bg-background shadow-sm">
                                        <h3 className="text-xl font-bold">Gestão de Leads</h3>
                                        <p className="text-gray-500 text-center">
                                            Como gerenciar e qualificar leads de forma eficiente.
                                        </p>
                                    </div>
                                    <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 bg-background shadow-sm">
                                        <h3 className="text-xl font-bold">Atendimento ao Cliente</h3>
                                        <p className="text-gray-500 text-center">
                                            Como fornecer um atendimento ao cliente excepcional e personalizado.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Metrics Section */}
                    <section className="bg-primary text-primary-foreground py-16">
                        <div className="container mx-auto max-w-6xl px-4 md:px-6">
                            <div className="flex flex-col items-center justify-center space-y-4 text-center">
                                <div className="space-y-2">
                                    <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                                        Resultados que Entregamos
                                    </h2>
                                    <p className="max-w-[900px] md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed opacity-90">
                                        Métricas-chave que nossos clientes alcançam com o OnSell
                                    </p>
                                </div>
                                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 pt-8">
                                    <div className="flex flex-col items-center space-y-2">
                                        <span className="text-4xl font-bold">{"<"} 15 min</span>
                                        <p className="opacity-90">Tempo médio para ativar primeira campanha</p>
                                    </div>
                                    <div className="flex flex-col items-center space-y-2">
                                        <span className="text-4xl font-bold">{">"} 25%</span>
                                        <p className="opacity-90">Taxa de conversão de lead qualificado</p>
                                    </div>
                                    <div className="flex flex-col items-center space-y-2">
                                        <span className="text-4xl font-bold">{">"} 3x</span>
                                        <p className="opacity-90">Retorno sobre investimento médio</p>
                                    </div>
                                    <div className="flex flex-col items-center space-y-2">
                                        <span className="text-4xl font-bold">{">"} 85%</span>
                                        <p className="opacity-90">Retenção mensal de clientes</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Testimonials Section */}
                    <section id="testimonials" className="py-16 bg-muted">
                        <div className="container mx-auto max-w-6xl px-4 md:px-6">
                            <div className="flex flex-col items-center justify-center space-y-4 text-center">
                                <div className="space-y-2">
                                    <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                                        O que nossos clientes dizem
                                    </h2>
                                    <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                                        Empresários que transformaram seus negócios com o OnSell
                                    </p>
                                </div>
                                <div className="grid gap-8 sm:grid-cols-3 pt-8">
                                    <div className="flex flex-col space-y-3 rounded-lg border p-6 bg-background shadow-sm">
                                        <div className="flex space-x-1 mb-2">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} className="h-5 w-5 fill-primary text-primary" />
                                            ))}
                                        </div>
                                        <p className="text-gray-500 italic">
                                            "Antes do OnSell, eu perdia 70% dos leads por falta de follow-up. Agora a plataforma qualifica automaticamente e só me chama quando o cliente está pronto para fechar."
                                        </p>
                                        <div className="flex items-center pt-4">
                                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                                CS
                                            </div>
                                            <div className="ml-3">
                                                <p className="text-sm font-medium">Carlos Silva</p>
                                                <p className="text-xs text-gray-500">Corretor de Imóveis</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col space-y-3 rounded-lg border p-6 bg-background shadow-sm">
                                        <div className="flex space-x-1 mb-2">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} className="h-5 w-5 fill-primary text-primary" />
                                            ))}
                                        </div>
                                        <p className="text-gray-500 italic">
                                            "Minha clínica odontológica triplicou o número de novos pacientes em 2 meses. O melhor é que não precisei contratar ninguém para marketing ou atendimento inicial."
                                        </p>
                                        <div className="flex items-center pt-4">
                                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                                AO
                                            </div>
                                            <div className="ml-3">
                                                <p className="text-sm font-medium">Dra. Ana Oliveira</p>
                                                <p className="text-xs text-gray-500">Dentista</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col space-y-3 rounded-lg border p-6 bg-background shadow-sm">
                                        <div className="flex space-x-1 mb-2">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} className="h-5 w-5 fill-primary text-primary" />
                                            ))}
                                        </div>
                                        <p className="text-gray-500 italic">
                                            "Como MEI, eu não tinha como pagar uma agência. O OnSell me deu um ROI de 4x no primeiro mês, com campanhas e atendimento totalmente automatizados."
                                        </p>
                                        <div className="flex items-center pt-4">
                                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                                MP
                                            </div>
                                            <div className="ml-3">
                                                <p className="text-sm font-medium">Marcos Pereira</p>
                                                <p className="text-xs text-gray-500">Consultor Financeiro</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Pricing Section */}
                    <section id="pricing" className="py-16">
                        <div className="container mx-auto max-w-6xl px-4 md:px-6">
                            <div className="flex flex-col items-center justify-center space-y-4 text-center">
                                <div className="space-y-2">
                                    <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                                        Planos Simples e Transparentes
                                    </h2>
                                    <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                                        Escolha o plano ideal para o seu negócio
                                    </p>
                                </div>
                                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 pt-8">
                                    {featuredPlans && featuredPlans.length > 0 ? (
                                        featuredPlans.map((plan, index) => (
                                            <div key={plan.id} className={`flex flex-col rounded-lg border bg-background p-6 shadow-sm ${index === 1 ? 'relative' : ''}`}>
                                                {index === 1 && (
                                                    <div className="absolute -top-4 left-0 right-0 mx-auto w-fit px-4 py-1 rounded-full bg-primary text-xs font-medium text-primary-foreground">
                                                        Mais popular
                                                    </div>
                                                )}
                                                <div className="flex-1">
                                                    <h3 className="text-2xl font-bold">{plan.name}</h3>
                                                    <p className="text-sm text-gray-500 mt-1">{plan.description}</p>
                                                    <div className="mt-2 text-4xl font-bold">
                                                        {typeof plan.price === 'string' && plan.price.startsWith('R$') 
                                                            ? plan.price 
                                                            : `R$ ${typeof plan.price === 'number' 
                                                                ? plan.price.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2}) 
                                                                : parseFloat(plan.price).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`
                                                        }
                                                        <span className="text-base font-normal text-gray-500">/mês</span>
                                                    </div>
                                                    <p className="mt-3 text-gray-500">{plan.leads_limit ? `Até ${plan.leads_limit} leads/mês` : 'Leads ilimitados'}</p>
                                                    <ul className="mt-6 space-y-2">
                                                        {plan.features && plan.features.split(',').map((feature, i) => (
                                                            <li key={i} className="flex items-center">
                                                                <CheckCircle2 className="mr-2 h-4 w-4 text-primary" />
                                                                <span>{feature.trim()}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                                <div className="mt-6">
                                                    <Link 
                                                        href={plan.price > 0 ? route('register') : route('register')} 
                                                        className="w-full inline-flex justify-center items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90"
                                                    >
                                                        {plan.price === 0 ? 'Começar Grátis' : plan.price >= 400 ? 'Falar com Vendas' : 'Assinar Agora'}
                                                    </Link>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <>
                                            <div className="flex flex-col rounded-lg border bg-background p-6 shadow-sm">
                                                <div className="flex-1">
                                                    <h3 className="text-2xl font-bold">Starter</h3>
                                                    <p className="text-sm text-gray-500 mt-1">Para quem está começando</p>
                                                    <div className="mt-2 text-4xl font-bold">R$ 0<span className="text-base font-normal text-gray-500">/mês</span></div>
                                                    <p className="mt-3 text-gray-500">Até 20 leads/mês</p>
                                                    <ul className="mt-6 space-y-2">
                                                        <li className="flex items-center">
                                                            <CheckCircle2 className="mr-2 h-4 w-4 text-primary" />
                                                            <span>1 campanha ativa</span>
                                                        </li>
                                                        <li className="flex items-center">
                                                            <CheckCircle2 className="mr-2 h-4 w-4 text-primary" />
                                                            <span>1 landing page</span>
                                                        </li>
                                                        <li className="flex items-center">
                                                            <CheckCircle2 className="mr-2 h-4 w-4 text-primary" />
                                                            <span>WhatsApp básico</span>
                                                        </li>
                                                        <li className="flex items-center">
                                                            <CheckCircle2 className="mr-2 h-4 w-4 text-primary" />
                                                            <span>CRM simples</span>
                                                        </li>
                                                    </ul>
                                                </div>
                                                <div className="mt-6">
                                                    <Link href={route('register')} className="w-full inline-flex justify-center items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90">
                                                        Começar Grátis
                                                    </Link>
                                                </div>
                                            </div>
                                            <div className="flex flex-col rounded-lg border bg-background p-6 shadow-sm relative">
                                                <div className="absolute -top-4 left-0 right-0 mx-auto w-fit px-4 py-1 rounded-full bg-primary text-xs font-medium text-primary-foreground">
                                                    Mais popular
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="text-2xl font-bold">Pro</h3>
                                                    <p className="text-sm text-gray-500 mt-1">Para negócios em crescimento</p>
                                                    <div className="mt-2 text-4xl font-bold">R$ 197<span className="text-base font-normal text-gray-500">/mês</span></div>
                                                    <p className="mt-3 text-gray-500">Até 100 leads/mês</p>
                                                    <ul className="mt-6 space-y-2">
                                                        <li className="flex items-center">
                                                            <CheckCircle2 className="mr-2 h-4 w-4 text-primary" />
                                                            <span>5 campanhas ativas</span>
                                                        </li>
                                                        <li className="flex items-center">
                                                            <CheckCircle2 className="mr-2 h-4 w-4 text-primary" />
                                                            <span>3 landing pages</span>
                                                        </li>
                                                        <li className="flex items-center">
                                                            <CheckCircle2 className="mr-2 h-4 w-4 text-primary" />
                                                            <span>WhatsApp + Ligações</span>
                                                        </li>
                                                        <li className="flex items-center">
                                                            <CheckCircle2 className="mr-2 h-4 w-4 text-primary" />
                                                            <span>CRM completo</span>
                                                        </li>
                                                        <li className="flex items-center">
                                                            <CheckCircle2 className="mr-2 h-4 w-4 text-primary" />
                                                            <span>Automações avançadas</span>
                                                        </li>
                                                    </ul>
                                                </div>
                                                <div className="mt-6">
                                                    <Link href={route('register')} className="w-full inline-flex justify-center items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90">
                                                        Assinar Agora
                                                    </Link>
                                                </div>
                                            </div>
                                            <div className="flex flex-col rounded-lg border bg-background p-6 shadow-sm">
                                                <div className="flex-1">
                                                    <h3 className="text-2xl font-bold">Enterprise</h3>
                                                    <p className="text-sm text-gray-500 mt-1">Para negócios estabelecidos</p>
                                                    <div className="mt-2 text-4xl font-bold">R$ 497<span className="text-base font-normal text-gray-500">/mês</span></div>
                                                    <p className="mt-3 text-gray-500">Leads ilimitados</p>
                                                    <ul className="mt-6 space-y-2">
                                                        <li className="flex items-center">
                                                            <CheckCircle2 className="mr-2 h-4 w-4 text-primary" />
                                                            <span>Campanhas ilimitadas</span>
                                                        </li>
                                                        <li className="flex items-center">
                                                            <CheckCircle2 className="mr-2 h-4 w-4 text-primary" />
                                                            <span>Landing pages ilimitadas</span>
                                                        </li>
                                                        <li className="flex items-center">
                                                            <CheckCircle2 className="mr-2 h-4 w-4 text-primary" />
                                                            <span>Todos os canais</span>
                                                        </li>
                                                        <li className="flex items-center">
                                                            <CheckCircle2 className="mr-2 h-4 w-4 text-primary" />
                                                            <span>CRM personalizado</span>
                                                        </li>
                                                        <li className="flex items-center">
                                                            <CheckCircle2 className="mr-2 h-4 w-4 text-primary" />
                                                            <span>API e integrações</span>
                                                        </li>
                                                        <li className="flex items-center">
                                                            <CheckCircle2 className="mr-2 h-4 w-4 text-primary" />
                                                            <span>Suporte prioritário</span>
                                                        </li>
                                                    </ul>
                                                </div>
                                                <div className="mt-6">
                                                    <Link href="#" className="w-full inline-flex justify-center items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90">
                                                        Falar com Vendas
                                                    </Link>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* FAQ Section */}
                    <section className="py-16 bg-muted">
                        <div className="container mx-auto max-w-6xl px-4 md:px-6">
                            <div className="flex flex-col items-center justify-center space-y-4 text-center">
                                <div className="space-y-2">
                                    <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                                        Perguntas Frequentes
                                    </h2>
                                    <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                                        Tudo o que você precisa saber sobre o OnSell
                                    </p>
                                </div>
                                <div className="grid gap-4 sm:grid-cols-2 w-full max-w-4xl pt-8">
                                    <div className="rounded-lg border p-4 bg-background">
                                        <h3 className="text-lg font-semibold">Quanto tempo leva para configurar?</h3>
                                        <p className="mt-2 text-gray-500 text-left">
                                            Em média, 15 minutos. Nosso assistente de IA guia você pelo processo de configuração com perguntas simples sobre seu negócio.
                                        </p>
                                    </div>
                                    <div className="rounded-lg border p-4 bg-background">
                                        <h3 className="text-lg font-semibold">Preciso ter conhecimento técnico?</h3>
                                        <p className="mt-2 text-gray-500 text-left">
                                            Não. O OnSell foi projetado para ser usado por qualquer pessoa, independentemente do conhecimento técnico.
                                        </p>
                                    </div>
                                    <div className="rounded-lg border p-4 bg-background">
                                        <h3 className="text-lg font-semibold">Como funciona a integração com WhatsApp?</h3>
                                        <p className="mt-2 text-gray-500 text-left">
                                            Utilizamos a API oficial do WhatsApp Business. Basta escanear um QR code e sua conta estará conectada em segundos.
                                        </p>
                                    </div>
                                    <div className="rounded-lg border p-4 bg-background">
                                        <h3 className="text-lg font-semibold">Posso usar meu próprio domínio?</h3>
                                        <p className="mt-2 text-gray-500 text-left">
                                            Sim. Você pode usar seu próprio domínio para todas as landing pages e emails gerados pelo OnSell.
                                        </p>
                                    </div>
                                    <div className="rounded-lg border p-4 bg-background">
                                        <h3 className="text-lg font-semibold">Como são feitas as ligações automáticas?</h3>
                                        <p className="mt-2 text-gray-500 text-left">
                                            Utilizamos IA de síntese de voz avançada para criar vozes naturais que seguem scripts dinâmicos, adaptados às respostas do lead.
                                        </p>
                                    </div>
                                    <div className="rounded-lg border p-4 bg-background">
                                        <h3 className="text-lg font-semibold">Posso cancelar a qualquer momento?</h3>
                                        <p className="mt-2 text-gray-500 text-left">
                                            Sim. Não exigimos contratos de longo prazo. Você pode cancelar sua assinatura a qualquer momento sem taxas adicionais.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* CTA Section */}
                    <section className="py-16">
                        <div className="container mx-auto max-w-6xl px-4 md:px-6">
                            <div className="flex flex-col items-center justify-center space-y-4 text-center">
                                <div className="space-y-2">
                                    <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                                        Pronto para vender sem equipe?
                                    </h2>
                                    <p className="max-w-[600px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                                        Comece agora e tenha sua primeira campanha rodando em menos de 15 minutos.
                                    </p>
                                </div>
                                <div className="flex flex-col gap-2 min-[400px]:flex-row pt-4">
                                    <Link href={route('register')} className="inline-flex items-center justify-center px-8 py-2 text-sm font-medium transition-colors rounded-md h-10 bg-primary text-primary-foreground shadow hover:bg-primary/90 gap-1">
                                        Criar conta grátis
                                        <ArrowRight className="h-4 w-4" />
                                    </Link>
                                    <Link href="#" className="inline-flex items-center justify-center px-8 py-2 text-sm font-medium transition-colors rounded-md h-10 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground">
                                        Agendar demonstração
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </section>
                </main>
                <footer className="border-t py-6 md:py-0">
                    <div className="container mx-auto max-w-6xl flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row px-4">
                        <div className="flex items-center gap-2 font-bold">
                            <Zap className="h-5 w-5 text-primary" />
                            <span>OnSell</span>
                        </div>
                        <p className="text-center text-sm leading-loose text-gray-500 md:text-left">
                            © 2025 OnSell. Todos os direitos reservados.
                        </p>
                        <div className="flex items-center gap-4">
                            <Link href="/terms" className="text-sm text-gray-500 hover:underline underline-offset-4">
                                Termos
                            </Link>
                            <Link href="/privacy" className="text-sm text-gray-500 hover:underline underline-offset-4">
                                Privacidade
                            </Link>
                            <Link href="/contact" className="text-sm text-gray-500 hover:underline underline-offset-4">
                                Contato
                            </Link>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
