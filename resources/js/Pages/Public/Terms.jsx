import { Head, Link } from '@inertiajs/react';

export default function Terms() {
    return (
        <>
            <Head title="Termos e Condições - OnSell" />
            <div className="flex flex-col min-h-screen">
                <header className="border-b">
                    <div className="container mx-auto max-w-6xl flex h-16 items-center justify-between px-4">
                        <div className="flex items-center gap-2">
                            <Link href={route('home')}>
                                <img src="/img/onsell_logo.svg" alt="OnSell" className="h-8" />
                            </Link>
                        </div>
                        <nav className="hidden md:flex items-center gap-6">
                            <Link href={route('home') + "#features"} className="text-sm font-medium hover:underline underline-offset-4">
                                Funcionalidades
                            </Link>
                            <Link href={route('home') + "#how-it-works"} className="text-sm font-medium hover:underline underline-offset-4">
                                Como Funciona
                            </Link>
                            <Link href={route('home') + "#pricing"} className="text-sm font-medium hover:underline underline-offset-4">
                                Preços
                            </Link>
                            <Link href={route('public.contact')} className="text-sm font-medium hover:underline underline-offset-4">
                                Contato
                            </Link>
                        </nav>
                        <div className="flex items-center gap-4">
                            <Link href={route('login')} className="text-sm font-medium hover:underline underline-offset-4">
                                Login
                            </Link>
                            <Link href={route('register')} className="px-4 py-2 rounded-md bg-primary text-white text-sm font-medium hover:bg-primary/90">
                                Começar Grátis
                            </Link>
                        </div>
                    </div>
                </header>
                <main className="flex-1">
                    <section className="py-12 md:py-20">
                        <div className="container mx-auto max-w-4xl px-4 md:px-6">
                            <div className="flex flex-col items-center text-center space-y-4 mb-10">
                                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                                    Termos e Condições
                                </h1>
                                <p className="max-w-[700px] text-gray-500 md:text-lg">
                                    Última atualização: 01 de Agosto de 2023
                                </p>
                            </div>
                            
                            <div className="prose prose-gray max-w-none">
                                <h2 className="text-2xl font-bold mt-8 mb-4">1. Aceitação dos Termos</h2>
                                <p>
                                    Ao acessar ou usar a plataforma OnSell ("Plataforma"), você concorda em cumprir e estar vinculado a estes Termos e Condições de Uso ("Termos"). Se você não concordar com algum aspecto destes Termos, não deverá usar nossos serviços.
                                </p>
                                
                                <h2 className="text-2xl font-bold mt-8 mb-4">2. Definições</h2>
                                <p>
                                    <strong>"Usuário"</strong> refere-se a qualquer indivíduo ou entidade que acesse ou use a Plataforma.
                                </p>
                                <p>
                                    <strong>"Conteúdo"</strong> refere-se a qualquer informação, dados, textos, software, gráficos, mensagens ou outros materiais.
                                </p>
                                <p>
                                    <strong>"Serviços"</strong> refere-se a todos os serviços oferecidos pela OnSell através da Plataforma.
                                </p>
                                
                                <h2 className="text-2xl font-bold mt-8 mb-4">3. Descrição dos Serviços</h2>
                                <p>
                                    A OnSell é uma plataforma SaaS (Software as a Service) que fornece ferramentas automatizadas de marketing e vendas movidas por inteligência artificial para empresas. Nossos serviços incluem, mas não estão limitados a:
                                </p>
                                <ul className="list-disc ml-6 mt-2 mb-4">
                                    <li>Criação e gestão de campanhas de marketing digital</li>
                                    <li>Landing pages automatizadas</li>
                                    <li>Qualificação automática de leads</li>
                                    <li>CRM e gestão de pipeline de vendas</li>
                                    <li>Comunicação multicanal automatizada</li>
                                    <li>Analytics e inteligência de negócios</li>
                                </ul>
                                
                                <h2 className="text-2xl font-bold mt-8 mb-4">4. Uso da Plataforma</h2>
                                <p>
                                    O usuário concorda em:
                                </p>
                                <ul className="list-disc ml-6 mt-2 mb-4">
                                    <li>Fornecer informações precisas e completas durante o registro e uso da plataforma</li>
                                    <li>Manter a confidencialidade de sua senha e conta</li>
                                    <li>Ser responsável por todas as atividades que ocorram em sua conta</li>
                                    <li>Notificar imediatamente a OnSell sobre qualquer uso não autorizado de sua conta</li>
                                    <li>Não usar a plataforma para fins ilegais ou não autorizados</li>
                                    <li>Não interferir ou prejudicar o funcionamento da plataforma</li>
                                </ul>
                                
                                <h2 className="text-2xl font-bold mt-8 mb-4">5. Planos e Pagamentos</h2>
                                <p>
                                    A OnSell oferece diferentes planos de assinatura com preços e recursos variados. Os detalhes de cada plano estão disponíveis na página de preços da Plataforma.
                                </p>
                                <p>
                                    Ao assinar um plano pago, o usuário concorda em:
                                </p>
                                <ul className="list-disc ml-6 mt-2 mb-4">
                                    <li>Fornecer informações de pagamento precisas e completas</li>
                                    <li>Autorizar a OnSell a cobrar as taxas aplicáveis via método de pagamento selecionado</li>
                                    <li>Manter suas informações de pagamento atualizadas</li>
                                </ul>
                                <p>
                                    Os pagamentos são recorrentes e serão processados automaticamente de acordo com o ciclo de cobrança escolhido (mensal ou anual). Os preços estão sujeitos a alterações, e notificaremos os usuários com antecedência sobre qualquer alteração.
                                </p>
                                
                                <h2 className="text-2xl font-bold mt-8 mb-4">6. Cancelamento e Reembolso</h2>
                                <p>
                                    O usuário pode cancelar sua assinatura a qualquer momento através da página de configurações da conta. Após o cancelamento, o acesso aos serviços será mantido até o final do período de cobrança atual.
                                </p>
                                <p>
                                    Não oferecemos reembolsos pelos períodos parciais de serviço não utilizados. Em casos excepcionais, podemos oferecer reembolso a nosso critério.
                                </p>
                                
                                <h2 className="text-2xl font-bold mt-8 mb-4">7. Propriedade Intelectual</h2>
                                <p>
                                    A OnSell e seus licenciadores detêm todos os direitos, títulos e interesses, incluindo todos os direitos de propriedade intelectual, relativos à Plataforma e aos Serviços. Os usuários não adquirem qualquer direito de propriedade sobre a Plataforma ou os Serviços.
                                </p>
                                <p>
                                    O usuário mantém todos os direitos sobre o conteúdo que criar, carregar ou compartilhar na Plataforma. Ao usar nossos serviços, o usuário concede à OnSell uma licença mundial, não exclusiva, isenta de royalties para usar, modificar, reproduzir e distribuir tal conteúdo exclusivamente para fornecer os Serviços.
                                </p>
                                
                                <h2 className="text-2xl font-bold mt-8 mb-4">8. Privacidade</h2>
                                <p>
                                    O uso da Plataforma está sujeito à nossa Política de Privacidade, que descreve como coletamos, usamos e compartilhamos informações. Ao usar nossos Serviços, você concorda com nossa Política de Privacidade.
                                </p>
                                
                                <h2 className="text-2xl font-bold mt-8 mb-4">9. Limitação de Responsabilidade</h2>
                                <p>
                                    Em nenhuma circunstância a OnSell será responsável por quaisquer danos indiretos, incidentais, especiais, punitivos ou consequentes, incluindo perda de lucros, resultantes do uso ou da incapacidade de usar a Plataforma ou os Serviços.
                                </p>
                                <p>
                                    Nossa responsabilidade total para com você por todas as reivindicações decorrentes ou relacionadas ao uso da Plataforma ou dos Serviços não excederá o valor que você pagou à OnSell pelos Serviços nos 12 meses anteriores à reivindicação.
                                </p>
                                
                                <h2 className="text-2xl font-bold mt-8 mb-4">10. Modificações nos Termos</h2>
                                <p>
                                    A OnSell reserva-se o direito de modificar estes Termos a qualquer momento. As alterações entrarão em vigor após a publicação dos Termos atualizados na Plataforma. O uso contínuo da Plataforma após as alterações constitui aceitação dos novos Termos.
                                </p>
                                
                                <h2 className="text-2xl font-bold mt-8 mb-4">11. Rescisão</h2>
                                <p>
                                    A OnSell pode, a seu exclusivo critério, suspender ou encerrar o acesso do usuário à Plataforma a qualquer momento, por qualquer motivo, incluindo violação destes Termos.
                                </p>
                                
                                <h2 className="text-2xl font-bold mt-8 mb-4">12. Lei Aplicável</h2>
                                <p>
                                    Estes Termos são regidos pelas leis do Brasil. Qualquer disputa decorrente ou relacionada a estes Termos será submetida à jurisdição exclusiva dos tribunais de São Paulo, SP.
                                </p>
                                
                                <h2 className="text-2xl font-bold mt-8 mb-4">13. Contato</h2>
                                <p>
                                    Se você tiver alguma dúvida sobre estes Termos, entre em contato conosco pelo e-mail legal@onsell.com.br ou através da nossa página de contato.
                                </p>
                            </div>
                        </div>
                    </section>
                </main>
                <footer className="border-t py-6 md:py-0">
                    <div className="container mx-auto max-w-6xl flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row px-4">
                        <div className="flex items-center gap-2 font-bold">
                            <Link href={route('home')}>
                                <img src="/img/onsell_logo.svg" alt="OnSell" className="h-6" />
                            </Link>
                        </div>
                        <p className="text-center text-sm leading-loose text-gray-500 md:text-left">
                            © 2025 OnSell. Todos os direitos reservados.
                        </p>
                        <div className="flex items-center gap-4">
                            <Link href={route('public.terms')} className="text-sm text-gray-500 hover:underline underline-offset-4">
                                Termos
                            </Link>
                            <Link href={route('public.privacy')} className="text-sm text-gray-500 hover:underline underline-offset-4">
                                Privacidade
                            </Link>
                            <Link href={route('public.contact')} className="text-sm text-gray-500 hover:underline underline-offset-4">
                                Contato
                            </Link>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
} 