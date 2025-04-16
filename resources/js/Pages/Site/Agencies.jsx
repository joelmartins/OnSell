import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowRight, Building2, ShieldCheck, PieChart, Briefcase, HeartHandshake, Users, Bot, BarChart3, BadgeDollarSign, Zap, Globe } from "lucide-react";
import Header from './Components/Header';
import Footer from './Components/Footer';

export default function Agencies() {
    const { auth } = usePage().props;
    
    return (
        <>
            <Head title="Agências Parceiras - OnSell" />
            <div className="flex flex-col min-h-screen">
                <Header auth={auth} />
                <main className="flex-1">
                    {/* Hero Section */}
                    <section className="py-16 md:py-24 bg-gradient-to-b from-primary/5 to-background">
                        <div className="container mx-auto max-w-6xl px-4 md:px-6">
                            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
                                <div className="flex flex-col justify-center space-y-4">
                                    <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary">
                                        Programa de Parceria OnSell
                                    </div>
                                    <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
                                        Potencialize sua <span className="text-primary">Agência</span> com IA
                                    </h1>
                                    <p className="max-w-[600px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                                        Ofereça soluções completas de automação de vendas e marketing para seus clientes sob sua própria marca, sem investimento em desenvolvimento.
                                    </p>
                                    <div className="flex flex-col gap-2 min-[400px]:flex-row">
                                        <Link href={route('signup')} className="inline-flex items-center justify-center px-8 py-2 text-sm font-medium transition-colors rounded-md h-10 bg-primary text-primary-foreground shadow hover:bg-primary/90 gap-1">
                                            Tornar-se parceiro
                                            <ArrowRight className="h-4 w-4" />
                                        </Link>
                                        <Link href="#" className="inline-flex items-center justify-center px-8 py-2 text-sm font-medium transition-colors rounded-md h-10 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground">
                                            Agendar demonstração
                                        </Link>
                                    </div>
                                </div>
                                <div className="mx-auto lg:order-last">
                                    <div className="rounded-lg border bg-background p-2 shadow-lg">
                                        <img
                                            src="/img/onsell-agencies.png" 
                                            alt="OnSell para Agências"
                                            className="aspect-video overflow-hidden rounded-lg object-cover"
                                            width={600}
                                            height={300}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Benefits Section */}
                    <section className="py-16">
                        <div className="container mx-auto max-w-6xl px-4 md:px-6">
                            <div className="flex flex-col items-center justify-center space-y-4 text-center">
                                <div className="space-y-2">
                                    <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                                        Benefícios para Agências Parceiras
                                    </h2>
                                    <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                                        Transforme seu negócio com uma solução white label completa e pronta para usar
                                    </p>
                                </div>
                                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 pt-12">
                                    <div className="flex flex-col items-start space-y-3 rounded-lg border p-6 bg-background shadow-sm">
                                        <div className="rounded-full bg-primary/10 p-3">
                                            <Building2 className="h-6 w-6 text-primary" />
                                        </div>
                                        <h3 className="text-xl font-bold">White Label Completo</h3>
                                        <p className="text-gray-500 text-left">
                                            Ofereça uma plataforma com sua marca, logotipo, cores e domínio personalizado, sem necessidade de desenvolvimento.
                                        </p>
                                    </div>
                                    <div className="flex flex-col items-start space-y-3 rounded-lg border p-6 bg-background shadow-sm">
                                        <div className="rounded-full bg-primary/10 p-3">
                                            <PieChart className="h-6 w-6 text-primary" />
                                        </div>
                                        <h3 className="text-xl font-bold">Gestão Centralizada</h3>
                                        <p className="text-gray-500 text-left">
                                            Administre todos os seus clientes em um único dashboard, com métricas consolidadas e visão individual.
                                        </p>
                                    </div>
                                    <div className="flex flex-col items-start space-y-3 rounded-lg border p-6 bg-background shadow-sm">
                                        <div className="rounded-full bg-primary/10 p-3">
                                            <BadgeDollarSign className="h-6 w-6 text-primary" />
                                        </div>
                                        <h3 className="text-xl font-bold">Receita Recorrente</h3>
                                        <p className="text-gray-500 text-left">
                                            Estabeleça sua própria precificação e crie planos personalizados para cada cliente, garantindo margens saudáveis.
                                        </p>
                                    </div>
                                    <div className="flex flex-col items-start space-y-3 rounded-lg border p-6 bg-background shadow-sm">
                                        <div className="rounded-full bg-primary/10 p-3">
                                            <Users className="h-6 w-6 text-primary" />
                                        </div>
                                        <h3 className="text-xl font-bold">Retenção de Clientes</h3>
                                        <p className="text-gray-500 text-left">
                                            Aumente o valor entregue e reduza o churn oferecendo uma solução completa de automação de vendas.
                                        </p>
                                    </div>
                                    <div className="flex flex-col items-start space-y-3 rounded-lg border p-6 bg-background shadow-sm">
                                        <div className="rounded-full bg-primary/10 p-3">
                                            <Bot className="h-6 w-6 text-primary" />
                                        </div>
                                        <h3 className="text-xl font-bold">Tecnologia de Ponta</h3>
                                        <p className="text-gray-500 text-left">
                                            Ofereça funcionalidades avançadas de IA sem precisar desenvolver: chatbots, qualificação e voice calling.
                                        </p>
                                    </div>
                                    <div className="flex flex-col items-start space-y-3 rounded-lg border p-6 bg-background shadow-sm">
                                        <div className="rounded-full bg-primary/10 p-3">
                                            <ShieldCheck className="h-6 w-6 text-primary" />
                                        </div>
                                        <h3 className="text-xl font-bold">Suporte Especializado</h3>
                                        <p className="text-gray-500 text-left">
                                            Tenha acesso a um gerente de conta dedicado e treinamentos para sua equipe e clientes.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Business Models Section */}
                    <section className="py-16 bg-muted">
                        <div className="container mx-auto max-w-6xl px-4 md:px-6">
                            <div className="flex flex-col items-center justify-center space-y-4 text-center">
                                <div className="space-y-2">
                                    <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                                        Modelos de Negócio
                                    </h2>
                                    <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                                        Diferentes formas de agregar valor ao seu negócio
                                    </p>
                                </div>
                                <div className="grid gap-8 sm:grid-cols-3 pt-12">
                                    <div className="flex flex-col items-center space-y-4 rounded-lg border p-8 bg-background shadow-sm">
                                        <div className="rounded-full bg-primary/10 p-4">
                                            <Briefcase className="h-8 w-8 text-primary" />
                                        </div>
                                        <h3 className="text-2xl font-bold">Gestor de Tráfego</h3>
                                        <div className="flex-1">
                                            <p className="text-gray-500 text-center">
                                                Complemente seu serviço de gestão de anúncios com landing pages, qualificação automática e CRM integrado.
                                            </p>
                                        </div>
                                        <ul className="text-left space-y-2 w-full">
                                            <li className="flex items-center">
                                                <div className="rounded-full bg-green-100 p-1 mr-2">
                                                    <svg className="h-3 w-3 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                                    </svg>
                                                </div>
                                                <span className="text-sm">Landing pages otimizadas</span>
                                            </li>
                                            <li className="flex items-center">
                                                <div className="rounded-full bg-green-100 p-1 mr-2">
                                                    <svg className="h-3 w-3 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                                    </svg>
                                                </div>
                                                <span className="text-sm">Tracking das campanhas</span>
                                            </li>
                                            <li className="flex items-center">
                                                <div className="rounded-full bg-green-100 p-1 mr-2">
                                                    <svg className="h-3 w-3 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                                    </svg>
                                                </div>
                                                <span className="text-sm">Remarketing automático</span>
                                            </li>
                                        </ul>
                                    </div>
                                    <div className="flex flex-col items-center space-y-4 rounded-lg border p-8 bg-background shadow-sm">
                                        <div className="rounded-full bg-primary/10 p-4">
                                            <HeartHandshake className="h-8 w-8 text-primary" />
                                        </div>
                                        <h3 className="text-2xl font-bold">Agência de Marketing</h3>
                                        <div className="flex-1">
                                            <p className="text-gray-500 text-center">
                                                Ofereça uma solução completa de automação de vendas como diferencial competitivo para seus clientes.
                                            </p>
                                        </div>
                                        <ul className="text-left space-y-2 w-full">
                                            <li className="flex items-center">
                                                <div className="rounded-full bg-green-100 p-1 mr-2">
                                                    <svg className="h-3 w-3 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                                    </svg>
                                                </div>
                                                <span className="text-sm">White label completo</span>
                                            </li>
                                            <li className="flex items-center">
                                                <div className="rounded-full bg-green-100 p-1 mr-2">
                                                    <svg className="h-3 w-3 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                                    </svg>
                                                </div>
                                                <span className="text-sm">Planos personalizados</span>
                                            </li>
                                            <li className="flex items-center">
                                                <div className="rounded-full bg-green-100 p-1 mr-2">
                                                    <svg className="h-3 w-3 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                                    </svg>
                                                </div>
                                                <span className="text-sm">Automação completa do funil</span>
                                            </li>
                                        </ul>
                                    </div>
                                    <div className="flex flex-col items-center space-y-4 rounded-lg border p-8 bg-background shadow-sm">
                                        <div className="rounded-full bg-primary/10 p-4">
                                            <Globe className="h-8 w-8 text-primary" />
                                        </div>
                                        <h3 className="text-2xl font-bold">Consultor Especializado</h3>
                                        <div className="flex-1">
                                            <p className="text-gray-500 text-center">
                                                Adicione valor à sua consultoria com uma ferramenta que produz resultados mensuráveis para seus clientes.
                                            </p>
                                        </div>
                                        <ul className="text-left space-y-2 w-full">
                                            <li className="flex items-center">
                                                <div className="rounded-full bg-green-100 p-1 mr-2">
                                                    <svg className="h-3 w-3 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                                    </svg>
                                                </div>
                                                <span className="text-sm">Métricas em tempo real</span>
                                            </li>
                                            <li className="flex items-center">
                                                <div className="rounded-full bg-green-100 p-1 mr-2">
                                                    <svg className="h-3 w-3 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                                    </svg>
                                                </div>
                                                <span className="text-sm">Gestão de desempenho</span>
                                            </li>
                                            <li className="flex items-center">
                                                <div className="rounded-full bg-green-100 p-1 mr-2">
                                                    <svg className="h-3 w-3 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                                    </svg>
                                                </div>
                                                <span className="text-sm">Relatórios personalizados</span>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* How it Works Section */}
                    <section className="py-16">
                        <div className="container mx-auto max-w-6xl px-4 md:px-6">
                            <div className="flex flex-col items-center justify-center space-y-4 text-center">
                                <div className="space-y-2">
                                    <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                                        Como se Tornar um Parceiro
                                    </h2>
                                    <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                                        Processo simples e rápido para começar a oferecer nossa solução
                                    </p>
                                </div>
                                <div className="grid gap-8 md:grid-cols-4 pt-12 w-full">
                                    <div className="flex flex-col items-center space-y-3 relative">
                                        <div className="rounded-full bg-primary/10 p-3 relative z-10">
                                            <span className="font-bold text-primary">1</span>
                                        </div>
                                        <div className="hidden md:block absolute top-6 left-[calc(50%+2rem)] w-[calc(100%-4rem)] h-0.5 bg-primary/30 z-0"></div>
                                        <h3 className="text-xl font-bold">Cadastro</h3>
                                        <p className="text-gray-500 text-center">
                                            Crie sua conta como agência parceira e configure seu perfil.
                                        </p>
                                    </div>
                                    <div className="flex flex-col items-center space-y-3 relative">
                                        <div className="rounded-full bg-primary/10 p-3 relative z-10">
                                            <span className="font-bold text-primary">2</span>
                                        </div>
                                        <div className="hidden md:block absolute top-6 left-[calc(50%+2rem)] w-[calc(100%-4rem)] h-0.5 bg-primary/30 z-0"></div>
                                        <h3 className="text-xl font-bold">Personalização</h3>
                                        <p className="text-gray-500 text-center">
                                            Configure sua marca, domínio e crie planos para seus clientes.
                                        </p>
                                    </div>
                                    <div className="flex flex-col items-center space-y-3 relative">
                                        <div className="rounded-full bg-primary/10 p-3 relative z-10">
                                            <span className="font-bold text-primary">3</span>
                                        </div>
                                        <div className="hidden md:block absolute top-6 left-[calc(50%+2rem)] w-[calc(100%-4rem)] h-0.5 bg-primary/30 z-0"></div>
                                        <h3 className="text-xl font-bold">Treinamento</h3>
                                        <p className="text-gray-500 text-center">
                                            Participe do treinamento e tenha acesso a materiais exclusivos.
                                        </p>
                                    </div>
                                    <div className="flex flex-col items-center space-y-3">
                                        <div className="rounded-full bg-primary/10 p-3 relative z-10">
                                            <span className="font-bold text-primary">4</span>
                                        </div>
                                        <h3 className="text-xl font-bold">Lançamento</h3>
                                        <p className="text-gray-500 text-center">
                                            Comece a vender e gerencie seus clientes pela plataforma.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Pricing Section */}
                    <section id="pricing" className="py-16 bg-muted">
                        <div className="container mx-auto max-w-6xl px-4 md:px-6">
                            <div className="flex flex-col items-center justify-center space-y-4 text-center">
                                <div className="space-y-2">
                                    <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                                        Planos para Agências
                                    </h2>
                                    <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                                        Escolha o plano ideal para o tamanho da sua operação
                                    </p>
                                </div>
                                <div className="grid gap-6 sm:grid-cols-3 pt-12">
                                    <div className="flex flex-col rounded-lg border bg-background p-6 shadow-sm">
                                        <div className="flex-1">
                                            <h3 className="text-2xl font-bold">Starter</h3>
                                            <p className="text-sm text-gray-500 mt-1">Para agências iniciantes</p>
                                            <div className="mt-2 text-4xl font-bold">
                                                R$ 297<span className="text-base font-normal text-gray-500">/mês</span>
                                            </div>
                                            <p className="mt-3 text-gray-500">Até 5 clientes</p>
                                            <ul className="mt-6 space-y-2">
                                                <li className="flex items-center">
                                                    <svg className="mr-2 h-4 w-4 text-primary" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                    </svg>
                                                    <span>White label básico</span>
                                                </li>
                                                <li className="flex items-center">
                                                    <svg className="mr-2 h-4 w-4 text-primary" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                    </svg>
                                                    <span>Planos padronizados</span>
                                                </li>
                                                <li className="flex items-center">
                                                    <svg className="mr-2 h-4 w-4 text-primary" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                    </svg>
                                                    <span>Suporte por email</span>
                                                </li>
                                                <li className="flex items-center">
                                                    <svg className="mr-2 h-4 w-4 text-primary" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                    </svg>
                                                    <span>Materiais de vendas</span>
                                                </li>
                                            </ul>
                                        </div>
                                        <div className="mt-6">
                                            <Link href={route('signup')} className="w-full inline-flex justify-center items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90">
                                                Começar Agora
                                            </Link>
                                        </div>
                                    </div>
                                    <div className="flex flex-col rounded-lg border bg-background p-6 shadow-sm relative">
                                        <div className="absolute -top-4 left-0 right-0 mx-auto w-fit px-4 py-1 rounded-full bg-primary text-xs font-medium text-primary-foreground">
                                            Mais popular
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-2xl font-bold">Pro</h3>
                                            <p className="text-sm text-gray-500 mt-1">Para agências em crescimento</p>
                                            <div className="mt-2 text-4xl font-bold">
                                                R$ 497<span className="text-base font-normal text-gray-500">/mês</span>
                                            </div>
                                            <p className="mt-3 text-gray-500">Até 20 clientes</p>
                                            <ul className="mt-6 space-y-2">
                                                <li className="flex items-center">
                                                    <svg className="mr-2 h-4 w-4 text-primary" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                    </svg>
                                                    <span>White label completo</span>
                                                </li>
                                                <li className="flex items-center">
                                                    <svg className="mr-2 h-4 w-4 text-primary" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                    </svg>
                                                    <span>Planos personalizados</span>
                                                </li>
                                                <li className="flex items-center">
                                                    <svg className="mr-2 h-4 w-4 text-primary" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                    </svg>
                                                    <span>Domínio personalizado</span>
                                                </li>
                                                <li className="flex items-center">
                                                    <svg className="mr-2 h-4 w-4 text-primary" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                    </svg>
                                                    <span>Suporte prioritário</span>
                                                </li>
                                                <li className="flex items-center">
                                                    <svg className="mr-2 h-4 w-4 text-primary" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                    </svg>
                                                    <span>Treinamento exclusivo</span>
                                                </li>
                                            </ul>
                                        </div>
                                        <div className="mt-6">
                                            <Link href={route('signup')} className="w-full inline-flex justify-center items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90">
                                                Assinar Agora
                                            </Link>
                                        </div>
                                    </div>
                                    <div className="flex flex-col rounded-lg border bg-background p-6 shadow-sm">
                                        <div className="flex-1">
                                            <h3 className="text-2xl font-bold">Enterprise</h3>
                                            <p className="text-sm text-gray-500 mt-1">Para agências estabelecidas</p>
                                            <div className="mt-2 text-4xl font-bold">
                                                R$ 997<span className="text-base font-normal text-gray-500">/mês</span>
                                            </div>
                                            <p className="mt-3 text-gray-500">Clientes ilimitados</p>
                                            <ul className="mt-6 space-y-2">
                                                <li className="flex items-center">
                                                    <svg className="mr-2 h-4 w-4 text-primary" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                    </svg>
                                                    <span>Tudo do plano Pro</span>
                                                </li>
                                                <li className="flex items-center">
                                                    <svg className="mr-2 h-4 w-4 text-primary" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                    </svg>
                                                    <span>API para integrações</span>
                                                </li>
                                                <li className="flex items-center">
                                                    <svg className="mr-2 h-4 w-4 text-primary" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                    </svg>
                                                    <span>Gerente de conta dedicado</span>
                                                </li>
                                                <li className="flex items-center">
                                                    <svg className="mr-2 h-4 w-4 text-primary" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                    </svg>
                                                    <span>Funcionalidades exclusivas</span>
                                                </li>
                                                <li className="flex items-center">
                                                    <svg className="mr-2 h-4 w-4 text-primary" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                    </svg>
                                                    <span>Suporte 24/7</span>
                                                </li>
                                            </ul>
                                        </div>
                                        <div className="mt-6">
                                            <Link href="#" className="w-full inline-flex justify-center items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90">
                                                Falar com Vendas
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* FAQ Section */}
                    <section className="py-16">
                        <div className="container mx-auto max-w-6xl px-4 md:px-6">
                            <div className="flex flex-col items-center justify-center space-y-4 text-center">
                                <div className="space-y-2">
                                    <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                                        Perguntas Frequentes
                                    </h2>
                                    <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                                        Respostas para as principais dúvidas sobre o programa de parceria
                                    </p>
                                </div>
                                <div className="grid gap-4 sm:grid-cols-2 w-full max-w-4xl pt-8">
                                    <div className="rounded-lg border p-4 bg-background text-left">
                                        <h3 className="text-lg font-semibold">O que é o White Label?</h3>
                                        <p className="mt-2 text-gray-500">
                                            É a possibilidade de oferecer a plataforma OnSell com a sua marca, logotipo, cores e domínio personalizado, sem qualquer menção à OnSell para seus clientes.
                                        </p>
                                    </div>
                                    <div className="rounded-lg border p-4 bg-background text-left">
                                        <h3 className="text-lg font-semibold">Como funciona a precificação?</h3>
                                        <p className="mt-2 text-gray-500">
                                            Você paga uma mensalidade fixa para a OnSell e tem liberdade para definir o valor que cobrará de seus clientes, estabelecendo sua própria margem de lucro.
                                        </p>
                                    </div>
                                    <div className="rounded-lg border p-4 bg-background text-left">
                                        <h3 className="text-lg font-semibold">Preciso ter conhecimento técnico?</h3>
                                        <p className="mt-2 text-gray-500">
                                            Não. Nossa plataforma foi projetada para ser intuitiva. Além disso, oferecemos treinamento completo para você e sua equipe dominarem todas as funcionalidades.
                                        </p>
                                    </div>
                                    <div className="rounded-lg border p-4 bg-background text-left">
                                        <h3 className="text-lg font-semibold">Como funciona o suporte?</h3>
                                        <p className="mt-2 text-gray-500">
                                            Oferecemos suporte técnico para você (parceiro) e você oferece suporte aos seus clientes. Em planos superiores, oferecemos gerente de conta dedicado para auxiliar no crescimento da sua operação.
                                        </p>
                                    </div>
                                    <div className="rounded-lg border p-4 bg-background text-left">
                                        <h3 className="text-lg font-semibold">Posso criar meus próprios planos?</h3>
                                        <p className="mt-2 text-gray-500">
                                            Sim. Você pode criar diferentes planos com combinações de recursos e limites para atender às necessidades específicas de diferentes segmentos de clientes.
                                        </p>
                                    </div>
                                    <div className="rounded-lg border p-4 bg-background text-left">
                                        <h3 className="text-lg font-semibold">O que são os materiais de vendas?</h3>
                                        <p className="mt-2 text-gray-500">
                                            Fornecemos landing pages, apresentações, vídeos demonstrativos e outros materiais que você pode personalizar com sua marca para ajudar na venda da solução.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* CTA Section */}
                    <section className="py-16 bg-primary text-primary-foreground">
                        <div className="container mx-auto max-w-6xl px-4 md:px-6">
                            <div className="flex flex-col items-center justify-center space-y-4 text-center">
                                <div className="space-y-2">
                                    <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                                        Pronto para transformar sua Agência?
                                    </h2>
                                    <p className="max-w-[600px] md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed opacity-90">
                                        Torne-se um parceiro OnSell hoje e comece a oferecer soluções avançadas de IA para seus clientes.
                                    </p>
                                </div>
                                <div className="flex flex-col gap-2 min-[400px]:flex-row pt-4">
                                    <Link href={route('signup')} className="inline-flex items-center justify-center px-8 py-2 text-sm font-medium transition-colors rounded-md h-10 bg-white text-primary shadow hover:bg-white/90 gap-1">
                                        Criar conta de parceiro
                                        <ArrowRight className="h-4 w-4" />
                                    </Link>
                                    <Link href="#" className="inline-flex items-center justify-center px-8 py-2 text-sm font-medium transition-colors rounded-md h-10 border border-white bg-transparent shadow-sm hover:bg-white/10 hover:text-white">
                                        Agendar demonstração
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </section>
                </main>
                <Footer />
            </div>
        </>
    );
} 