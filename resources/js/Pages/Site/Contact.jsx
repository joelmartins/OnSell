import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowRight, Mail, MessageSquare, Phone, MapPin } from "lucide-react";
import Header from './Components/Header';
import Footer from './Components/Footer';

export default function Contact() {
    const { auth } = usePage().props;
    
    return (
        <>
            <Head title="Contato - OnSell" />
            <div className="flex flex-col min-h-screen">
                <Header auth={auth} />
                <main className="flex-1">
                    {/* Hero Section */}
                    <section className="py-12 md:py-20">
                        <div className="container mx-auto max-w-6xl px-4 md:px-6">
                            <div className="flex flex-col items-center text-center space-y-4">
                                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                                    Entre em Contato Conosco
                                </h1>
                                <p className="max-w-[600px] text-gray-500 md:text-xl/relaxed">
                                    Estamos aqui para ajudar com quaisquer dúvidas ou solicitações.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Contact Info Section */}
                    <section className="py-8 md:py-12">
                        <div className="container mx-auto max-w-6xl px-4 md:px-6">
                            <div className="grid gap-8 md:grid-cols-3">
                                <div className="flex flex-col items-center space-y-3 rounded-lg border p-6 bg-background shadow-sm">
                                    <div className="rounded-full bg-primary/10 p-3">
                                        <Mail className="h-6 w-6 text-primary" />
                                    </div>
                                    <h2 className="text-xl font-bold">Email</h2>
                                    <p className="text-gray-500 text-center">
                                        <a href="mailto:contato@onsell.com.br" className="text-primary hover:underline">
                                            contato@onsell.com.br
                                        </a>
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        Respondemos em até 24 horas úteis
                                    </p>
                                </div>
                                <div className="flex flex-col items-center space-y-3 rounded-lg border p-6 bg-background shadow-sm">
                                    <div className="rounded-full bg-primary/10 p-3">
                                        <Phone className="h-6 w-6 text-primary" />
                                    </div>
                                    <h2 className="text-xl font-bold">Telefone</h2>
                                    <p className="text-gray-500 text-center">
                                        <a href="tel:+551140028922" className="text-primary hover:underline">
                                            +55 (11) 4002-8922
                                        </a>
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        Seg - Sex, 9:00 - 18:00
                                    </p>
                                </div>
                                <div className="flex flex-col items-center space-y-3 rounded-lg border p-6 bg-background shadow-sm">
                                    <div className="rounded-full bg-primary/10 p-3">
                                        <MapPin className="h-6 w-6 text-primary" />
                                    </div>
                                    <h2 className="text-xl font-bold">Endereço</h2>
                                    <p className="text-gray-500 text-center">
                                        Av. Paulista, 1000<br />
                                        São Paulo, SP<br />
                                        CEP 01310-100
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Contact Form Section */}
                    <section className="py-12 md:py-16">
                        <div className="container mx-auto max-w-3xl px-4 md:px-6">
                            <div className="flex flex-col items-center text-center space-y-4 mb-10">
                                <h2 className="text-2xl font-bold tracking-tighter sm:text-3xl">
                                    Envie-nos uma Mensagem
                                </h2>
                                <p className="max-w-[600px] text-gray-500">
                                    Preencha o formulário abaixo e entraremos em contato o mais breve possível.
                                </p>
                            </div>
                            <form className="space-y-6">
                                <div className="grid gap-6 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <label htmlFor="name" className="text-sm font-medium">
                                            Nome
                                        </label>
                                        <input
                                            id="name"
                                            type="text"
                                            className="w-full rounded-md border border-gray-300 p-3 text-sm"
                                            placeholder="Seu nome completo"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="email" className="text-sm font-medium">
                                            Email
                                        </label>
                                        <input
                                            id="email"
                                            type="email"
                                            className="w-full rounded-md border border-gray-300 p-3 text-sm"
                                            placeholder="seu@email.com"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="subject" className="text-sm font-medium">
                                        Assunto
                                    </label>
                                    <input
                                        id="subject"
                                        type="text"
                                        className="w-full rounded-md border border-gray-300 p-3 text-sm"
                                        placeholder="Assunto da mensagem"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="message" className="text-sm font-medium">
                                        Mensagem
                                    </label>
                                    <textarea
                                        id="message"
                                        className="w-full rounded-md border border-gray-300 p-3 text-sm"
                                        rows="5"
                                        placeholder="Digite sua mensagem..."
                                        required
                                    ></textarea>
                                </div>
                                <div className="mt-4">
                                    <button 
                                        type="submit" 
                                        className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium rounded-md bg-primary text-white hover:bg-primary/90 transition-colors gap-1"
                                    >
                                        Enviar mensagem
                                        <ArrowRight className="h-4 w-4" />
                                    </button>
                                </div>
                            </form>
                        </div>
                    </section>

                    {/* FAQ Section */}
                    <section className="py-12 md:py-16 bg-muted">
                        <div className="container mx-auto max-w-6xl px-4 md:px-6">
                            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-10">
                                <h2 className="text-2xl font-bold tracking-tighter sm:text-3xl">
                                    Perguntas Frequentes
                                </h2>
                                <p className="max-w-[600px] text-gray-500">
                                    Encontre respostas rápidas para dúvidas comuns
                                </p>
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2 w-full max-w-4xl mx-auto">
                                <div className="rounded-lg border p-4 bg-background">
                                    <h3 className="text-lg font-semibold">Qual o horário de atendimento?</h3>
                                    <p className="mt-2 text-gray-500 text-left">
                                        Nosso suporte está disponível de segunda a sexta, das 9h às 18h. Emails e mensagens são respondidos em até 24 horas úteis.
                                    </p>
                                </div>
                                <div className="rounded-lg border p-4 bg-background">
                                    <h3 className="text-lg font-semibold">Posso agendar uma demonstração?</h3>
                                    <p className="mt-2 text-gray-500 text-left">
                                        Sim! Você pode agendar uma demonstração personalizada através deste formulário ou pelo email contato@onsell.com.br.
                                    </p>
                                </div>
                                <div className="rounded-lg border p-4 bg-background">
                                    <h3 className="text-lg font-semibold">Oferecem suporte técnico?</h3>
                                    <p className="mt-2 text-gray-500 text-left">
                                        Sim, todos os planos incluem suporte técnico. Os planos Enterprise contam com suporte prioritário e gerente de conta dedicado.
                                    </p>
                                </div>
                                <div className="rounded-lg border p-4 bg-background">
                                    <h3 className="text-lg font-semibold">Como posso conhecer o escritório?</h3>
                                    <p className="mt-2 text-gray-500 text-left">
                                        Você pode agendar uma visita ao nosso escritório entrando em contato via email. Teremos o maior prazer em recebê-lo.
                                    </p>
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