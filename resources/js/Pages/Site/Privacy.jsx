import { Head, usePage } from '@inertiajs/react';
import Header from './Components/Header';
import Footer from './Components/Footer';

export default function Privacy() {
    const { auth } = usePage().props;
    
    return (
        <>
            <Head title="Política de Privacidade - OnSell" />
            <div className="flex flex-col min-h-screen">
                <Header auth={auth} />
                <main className="flex-1">
                <section className="py-12 md:py-20">
                        <div className="container mx-auto max-w-4xl px-4 md:px-6">
                            <div className="flex flex-col items-center text-center space-y-4 mb-10">
                                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                                    Política de Privacidade
                                </h1>
                                <p className="max-w-[700px] text-gray-500 md:text-lg">
                                    Última atualização: 01 de Agosto de 2023
                                </p>
                            </div>
                            
                            <div className="prose prose-gray max-w-none">
                                <p>
                                    A OnSell ("nós", "nosso", ou "empresa") está comprometida em proteger sua privacidade. Esta Política de Privacidade explica como coletamos, usamos, divulgamos e protegemos suas informações pessoais quando você usa nossa plataforma online e serviços relacionados ("Serviços").
                                </p>
                                <p>
                                    Ao usar nossos Serviços, você concorda com a coleta, uso e divulgação de informações de acordo com esta política. Se você não concordar com esta Política de Privacidade, por favor, não use nossos Serviços.
                                </p>
                                
                                <h2 className="text-2xl font-bold mt-8 mb-4">1. Informações que Coletamos</h2>
                                <p>
                                    Coletamos os seguintes tipos de informações:
                                </p>
                                
                                <h3 className="text-xl font-medium mt-6 mb-3">1.1 Informações Fornecidas por Você</h3>
                                <ul className="list-disc ml-6 mt-2 mb-4">
                                    <li><strong>Informações de Cadastro:</strong> Quando você se registra em nossa plataforma, coletamos seu nome, endereço de e-mail, número de telefone, cargo e nome da empresa.</li>
                                    <li><strong>Informações de Pagamento:</strong> Para processamento de pagamentos, coletamos dados de faturamento, informações de cartão de crédito ou outros detalhes de pagamento.</li>
                                    <li><strong>Conteúdo do Usuário:</strong> Informações que você fornece ao usar nossos Serviços, como dados de clientes, mensagens, e-mails, campanhas de marketing e outros materiais relacionados aos seus negócios.</li>
                                    <li><strong>Comunicações:</strong> Quando você se comunica conosco, registramos o conteúdo dessas comunicações, bem como quaisquer informações adicionais fornecidas durante tais interações.</li>
                                </ul>
                                
                                <h3 className="text-xl font-medium mt-6 mb-3">1.2 Informações Coletadas Automaticamente</h3>
                                <ul className="list-disc ml-6 mt-2 mb-4">
                                    <li><strong>Dados de Uso:</strong> Registramos informações sobre como você interage com nossos Serviços, como o tempo de acesso, páginas visualizadas, ações realizadas e rotas de navegação.</li>
                                    <li><strong>Informações do Dispositivo:</strong> Coletamos informações sobre seu dispositivo, incluindo modelo, sistema operacional, navegador, endereço IP e identificadores únicos do dispositivo.</li>
                                    <li><strong>Cookies e Tecnologias Similares:</strong> Utilizamos cookies, web beacons e tecnologias similares para coletar informações sobre sua navegação e uso dos Serviços.</li>
                                    <li><strong>Dados de Analytics:</strong> Dados agregados ou estatísticos que nos ajudam a entender como os usuários interagem com nossos Serviços.</li>
                                </ul>
                                
                                <h2 className="text-2xl font-bold mt-8 mb-4">2. Como Usamos Suas Informações</h2>
                                <p>
                                    Utilizamos as informações coletadas para:
                                </p>
                                <ul className="list-disc ml-6 mt-2 mb-4">
                                    <li>Fornecer, manter e melhorar nossos Serviços</li>
                                    <li>Processar transações e enviar notificações relacionadas</li>
                                    <li>Personalizar sua experiência e oferecer conteúdo relevante</li>
                                    <li>Desenvolver novos produtos e serviços</li>
                                    <li>Comunicar-nos com você, incluindo atendimento ao cliente e atualizações de produtos</li>
                                    <li>Enviar e-mails de marketing (com opção de cancelamento)</li>
                                    <li>Proteger contra fraudes, abusos e uso não autorizado</li>
                                    <li>Cumprir obrigações legais e regulatórias</li>
                                    <li>Analisar tendências de uso e eficácia dos nossos Serviços</li>
                                </ul>
                                
                                <h2 className="text-2xl font-bold mt-8 mb-4">3. Compartilhamento de Informações</h2>
                                <p>
                                    Podemos compartilhar suas informações nas seguintes circunstâncias:
                                </p>
                                <ul className="list-disc ml-6 mt-2 mb-4">
                                    <li><strong>Prestadores de Serviços:</strong> Compartilhamos informações com terceiros que nos auxiliam na operação, manutenção e melhoria dos nossos Serviços, como processadores de pagamento, serviços de hospedagem e ferramentas de análise.</li>
                                    <li><strong>Parceiros Comerciais:</strong> Podemos compartilhar informações não identificáveis com parceiros de negócios para desenvolver ofertas conjuntas de produtos ou serviços.</li>
                                    <li><strong>Conformidade Legal:</strong> Podemos divulgar informações quando acreditamos, de boa-fé, que a divulgação é necessária para cumprir a lei, proteger nossos direitos, proteger sua segurança ou a segurança de outros, investigar fraudes ou responder a uma solicitação governamental.</li>
                                    <li><strong>Transações Corporativas:</strong> Em caso de fusão, aquisição ou venda de ativos, suas informações podem ser transferidas como parte dos ativos comerciais.</li>
                                    <li><strong>Com Seu Consentimento:</strong> Compartilharemos suas informações pessoais para outros fins com seu consentimento.</li>
                                </ul>
                                <p>
                                    Não vendemos suas informações pessoais a terceiros para fins de marketing.
                                </p>
                                
                                <h2 className="text-2xl font-bold mt-8 mb-4">4. Segurança de Dados</h2>
                                <p>
                                    Implementamos medidas de segurança técnicas, administrativas e físicas para proteger suas informações pessoais contra acesso não autorizado, alteração ou destruição. No entanto, nenhum método de transmissão pela Internet ou método de armazenamento eletrônico é 100% seguro. Portanto, não podemos garantir sua segurança absoluta.
                                </p>
                                
                                <h2 className="text-2xl font-bold mt-8 mb-4">5. Retenção de Dados</h2>
                                <p>
                                    Mantemos suas informações pessoais pelo tempo necessário para cumprir os propósitos descritos nesta Política de Privacidade, a menos que um período de retenção mais longo seja exigido ou permitido por lei.
                                </p>
                                
                                <h2 className="text-2xl font-bold mt-8 mb-4">6. Seus Direitos</h2>
                                <p>
                                    Dependendo da sua localização, você pode ter certos direitos em relação às suas informações pessoais, incluindo:
                                </p>
                                <ul className="list-disc ml-6 mt-2 mb-4">
                                    <li>Acesso às suas informações pessoais</li>
                                    <li>Correção de informações imprecisas ou incompletas</li>
                                    <li>Exclusão de suas informações pessoais</li>
                                    <li>Restrição ou objeção ao processamento de suas informações</li>
                                    <li>Portabilidade de dados</li>
                                    <li>Retirada do consentimento a qualquer momento</li>
                                </ul>
                                <p>
                                    Para exercer esses direitos, entre em contato conosco usando as informações fornecidas na seção "Contato" abaixo. Responderemos à sua solicitação dentro do prazo exigido pela lei aplicável.
                                </p>
                                
                                <h2 className="text-2xl font-bold mt-8 mb-4">7. Privacidade de Crianças</h2>
                                <p>
                                    Nossos Serviços não são destinados a menores de 18 anos. Não coletamos intencionalmente informações pessoais de crianças. Se você acredita que coletamos informações de uma criança, entre em contato conosco e tomaremos as medidas necessárias para remover tais informações.
                                </p>
                                
                                <h2 className="text-2xl font-bold mt-8 mb-4">8. Transferências Internacionais de Dados</h2>
                                <p>
                                    Suas informações podem ser transferidas e processadas em países diferentes daquele em que você reside. Esses países podem ter leis de proteção de dados diferentes das do seu país. Ao usar nossos Serviços, você concorda com essa transferência de informações.
                                </p>
                                
                                <h2 className="text-2xl font-bold mt-8 mb-4">9. Alterações a Esta Política</h2>
                                <p>
                                    Podemos atualizar esta Política de Privacidade periodicamente. A versão mais recente estará sempre disponível em nosso site, com a data da última atualização. Recomendamos que você revise esta política regularmente para estar ciente de quaisquer alterações.
                                </p>
                                
                                <h2 className="text-2xl font-bold mt-8 mb-4">10. Contato</h2>
                                <p>
                                    Se você tiver dúvidas, preocupações ou solicitações relacionadas a esta Política de Privacidade ou às suas informações pessoais, entre em contato conosco pelo e-mail privacy@onsell.com.br ou por meio da nossa página de contato.
                                </p>
                            </div>
                        </div>
                    </section>
                </main>
                <Footer />
            </div>
        </>
    );
} 