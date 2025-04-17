import AgencyLayout from '@/Layouts/AgencyLayout';
import { Head } from '@inertiajs/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Button } from '@/Components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/Components/ui/form';
import { Separator } from '@/Components/ui/separator';
import { Textarea } from '@/Components/ui/textarea';
import { Checkbox } from '@/Components/ui/checkbox';
import { Save, Bot, Sparkles } from 'lucide-react';
import { toast } from 'react-toastify';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/Components/ui/dialog';
import { motion } from "framer-motion";

const landingPageSchema = z.object({
  headline: z.string().min(5, { message: 'Headline deve ter pelo menos 5 caracteres' }),
  subheadline: z.string().min(5, { message: 'Subheadline deve ter pelo menos 5 caracteres' }),
  hero_image: z.string().url({ message: 'URL inválida para a imagem principal' }).optional().or(z.literal('')),
  cta_text: z.string().min(2, { message: 'Texto do botão deve ter pelo menos 2 caracteres' }),
  features_title: z.string().min(3, { message: 'Título da seção de recursos deve ter pelo menos 3 caracteres' }),
  features: z.array(z.object({
    title: z.string().min(3, { message: 'Título do recurso deve ter pelo menos 3 caracteres' }),
    description: z.string().min(10, { message: 'Descrição do recurso deve ter pelo menos 10 caracteres' }),
    icon: z.string().optional(),
  })).min(1, { message: 'Adicione pelo menos um recurso' }),
  display_plans: z.boolean().optional(),
});

export default function Landing({ agency }) {
  const [loading, setLoading] = useState(false);
  const [iaModalOpen, setIaModalOpen] = useState(false);
  const [iaStep, setIaStep] = useState(0);
  const [iaAnswers, setIaAnswers] = useState({});
  const [iaLoading, setIaLoading] = useState(false);

  // Perguntas para IA preencher a landing page
  const iaQuestions = [
    { key: 'segmento', label: 'Qual o segmento principal da sua agência?' },
    { key: 'publico', label: 'Quem é o público-alvo da sua agência?' },
    { key: 'diferencial', label: 'Qual o principal diferencial da sua agência?' },
    { key: 'objetivo', label: 'Qual o principal objetivo da sua landing page?' },
  ];
  
  const landingPageForm = useForm({
    resolver: zodResolver(landingPageSchema),
    defaultValues: {
      headline: agency.landing_page?.headline || 'Aumente suas vendas com nossa solução completa',
      subheadline: agency.landing_page?.subheadline || 'Captura de leads, automação de marketing e gestão de vendas em um só lugar',
      hero_image: agency.landing_page?.hero_image || 'https://placehold.co/800x600/FAFAFA/6D7280?text=Imagem+Principal',
      cta_text: agency.landing_page?.cta_text || 'Começar agora',
      features_title: agency.landing_page?.features_title || 'Recursos principais',
      features: agency.landing_page?.features || [
        {
          title: 'Captura de Leads',
          description: 'Landing pages de alta conversão para capturar leads qualificados',
          icon: 'Users'
        },
        {
          title: 'Automação de Marketing',
          description: 'Fluxos automatizados para nutrir seus leads até a venda',
          icon: 'Zap'
        },
        {
          title: 'CRM Completo',
          description: 'Gestão completa do seu funil de vendas com dashboards e relatórios',
          icon: 'BarChart'
        }
      ],
      display_plans: agency.landing_page?.display_plans || false,
    },
  });

  function onSubmitLandingPage(data) {
    setLoading(true);
    window.axios.put(route('agency.branding.update.landing.json'), data)
      .then(() => {
        toast.success('Landing page personalizada com sucesso!');
      })
      .catch((error) => {
        console.error('Erro ao salvar landing page:', error.response?.data || error);
        toast.error('Ocorreu um erro ao personalizar a landing page: ' + (error.response?.data?.error || error.message || 'Erro desconhecido'));
      })
      .finally(() => setLoading(false));
  }

  const handleIaAnswer = (value) => {
    setIaAnswers({ ...iaAnswers, [iaQuestions[iaStep].key]: value });
  };

  const handleIaNext = async () => {
    if (iaStep < iaQuestions.length - 1) {
      setIaStep(iaStep + 1);
    } else {
      setIaLoading(true);
      try {
        const response = await fetch('/agency/branding/ai-fill-json', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
          },
          credentials: 'same-origin',
          body: JSON.stringify(iaAnswers),
        });
        
        console.log('Status da resposta:', response.status);
        
        const data = await response.json();
        console.log('Dados recebidos:', data);
        
        if (response.ok && data.suggestion) {
          let suggestion = data.suggestion;
          // Se vier string, tenta converter para JSON
          if (typeof suggestion === 'string') {
            try {
              suggestion = JSON.parse(suggestion);
            } catch {}
          }
          // Preenche o formulário de landing page
          if (suggestion && suggestion.headline) {
            landingPageForm.setValue('headline', suggestion.headline);
            landingPageForm.setValue('subheadline', suggestion.subheadline || '');
            landingPageForm.setValue('cta_text', suggestion.cta_text || '');
            landingPageForm.setValue('features_title', suggestion.features_title || '');
            if (Array.isArray(suggestion.features)) {
              landingPageForm.setValue('features', suggestion.features.map(f => ({
                title: f.title || '',
                description: f.description || '',
                icon: 'Star',
              })));
            }
            toast.success('Sugestão de landing page gerada com IA!');
          } else {
            toast.error('A IA não retornou uma sugestão válida.');
          }
        } else {
          const errorMsg = data.error || 'Erro ao gerar sugestão com IA.';
          console.error('Erro detalhado da API:', errorMsg, data);
          toast.error(errorMsg);
        }
      } catch (err) {
        console.error('Erro detalhado:', err);
        const errorMsg = 'Erro de comunicação com o servidor: ' + (err.message || 'Erro desconhecido');
        console.error('Exceção completa:', errorMsg, err);
        toast.error(errorMsg);
      } finally {
        setTimeout(() => {
          setIaLoading(false);
          setIaModalOpen(false);
        }, 500);
      }
    }
  };

  const handleIaOpen = () => {
    setIaModalOpen(true);
    setIaStep(0);
    setIaAnswers({});
    setIaLoading(false);
  };

  const handleIaClose = () => {
    setIaModalOpen(false);
  };
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && iaAnswers[iaQuestions[iaStep].key]) {
      e.preventDefault();
      handleIaNext();
    }
  };

  return (
    <AgencyLayout title="Landing Page Personalizada">
      <Head title="Landing Page Personalizada" />
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold mb-2">Landing Page Personalizada</h2>
            <p className="text-muted-foreground">Personalize a landing page que seus clientes veem ao se cadastrar</p>
          </div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Button 
              onClick={handleIaOpen} 
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl px-6 py-2 h-auto"
            >
              <Sparkles className="h-5 w-5 mr-2" />
              <span className="font-medium">Gerar conteúdo com IA</span>
            </Button>
          </motion.div>
        </div>
      </div>
      <Form {...landingPageForm}>
        <form onSubmit={landingPageForm.handleSubmit(onSubmitLandingPage)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Landing Page</CardTitle>
              <CardDescription>Personalize a landing page que seus clientes veem ao se cadastrar</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={landingPageForm.control}
                name="headline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Headline Principal</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormDescription>Título principal da sua landing page</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={landingPageForm.control}
                name="subheadline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subtítulo</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={2} />
                    </FormControl>
                    <FormDescription>Texto que aparece abaixo do título principal</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={landingPageForm.control}
                name="hero_image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL da Imagem Principal</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormDescription>Imagem de destaque da sua landing page (recomendado: 1200x600px)</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={landingPageForm.control}
                name="cta_text"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Texto do Botão (CTA)</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormDescription>Texto que aparece no botão principal</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Separator />
              <FormField
                control={landingPageForm.control}
                name="features_title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título da Seção de Recursos</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormDescription>Título da seção que lista os recursos do seu produto</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="space-y-4">
                <FormLabel>Recursos</FormLabel>
                {landingPageForm.watch('features')?.map((feature, index) => (
                  <div key={index} className="p-4 border rounded-md bg-gray-50">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={landingPageForm.control}
                        name={`features.${index}.title`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Título</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={landingPageForm.control}
                        name={`features.${index}.description`}
                        render={({ field }) => (
                          <FormItem className="md:col-span-2">
                            <FormLabel>Descrição</FormLabel>
                            <FormControl>
                              <Textarea {...field} rows={1} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="mt-2"
                      onClick={() => {
                        const features = [...landingPageForm.getValues('features')];
                        if (features.length > 1) {
                          features.splice(index, 1);
                          landingPageForm.setValue('features', features);
                        } else {
                          toast.error('Você precisa manter pelo menos um recurso');
                        }
                      }}
                    >
                      Remover
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    const features = [...landingPageForm.getValues('features')];
                    features.push({
                      title: 'Novo Recurso',
                      description: 'Descrição do novo recurso',
                      icon: 'Star'
                    });
                    landingPageForm.setValue('features', features);
                  }}
                >
                  Adicionar Recurso
                </Button>
              </div>
              <Separator />
              <FormField
                control={landingPageForm.control}
                name="display_plans"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Exibir planos na landing page
                      </FormLabel>
                      <FormDescription>
                        Os planos marcados como destaque serão exibidos na sua landing page
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
              <Separator />
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Link da Landing Page</h3>
                <div className="p-4 bg-gray-50 border rounded-md space-y-4">
                  <div>
                    <h4 className="font-medium">URL personalizada:</h4>
                    {agency.subdomain ? (
                      <div className="mt-2 flex items-center space-x-2">
                        <code className="px-2 py-1 bg-gray-200 rounded text-sm">
                          https://{agency.subdomain}.{window.location.hostname.replace(/^www\./, '')}
                        </code>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            navigator.clipboard.writeText(`https://${agency.subdomain}.${window.location.hostname.replace(/^www\./, '')}`);
                            toast.success('URL copiada para a área de transferência!');
                          }}
                        >
                          Copiar
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            window.open(`https://${agency.subdomain}.${window.location.hostname.replace(/^www\./, '')}`, '_blank');
                          }}
                        >
                          Visualizar
                        </Button>
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-sm mt-2">
                        Configure um subdomínio na aba "Domínio" para ter uma URL personalizada
                      </p>
                    )}
                  </div>
                  <div>
                    <h4 className="font-medium">URL alternativa:</h4>
                    <div className="mt-2 flex items-center space-x-2">
                      <code className="px-2 py-1 bg-gray-200 rounded text-sm">
                        {window.location.origin}/agency/{agency.id}/landing
                      </code>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText(`${window.location.origin}/agency/${agency.id}/landing`);
                          toast.success('URL copiada para a área de transferência!');
                        }}
                      >
                        Copiar
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          window.open(`${window.location.origin}/agency/${agency.id}/landing`, '_blank');
                        }}
                      >
                        Visualizar
                      </Button>
                    </div>
                  </div>
                  {agency.custom_domain && agency.domain_status === 'active' && (
                    <div>
                      <h4 className="font-medium">URL com domínio personalizado:</h4>
                      <div className="mt-2 flex items-center space-x-2">
                        <code className="px-2 py-1 bg-gray-200 rounded text-sm">
                          https://{agency.custom_domain}
                        </code>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            navigator.clipboard.writeText(`https://${agency.custom_domain}`);
                            toast.success('URL copiada para a área de transferência!');
                          }}
                        >
                          Copiar
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            window.open(`https://${agency.custom_domain}`, '_blank');
                          }}
                        >
                          Visualizar
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button type="submit" disabled={loading} className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                Salvar Landing Page
              </Button>
            </CardFooter>
          </Card>
        </form>
      </Form>

      {/* Modal de perguntas IA */}
      <Dialog open={iaModalOpen} onOpenChange={setIaModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bot className="h-6 w-6 text-purple-600" />
              Preencher landing page com IA
            </DialogTitle>
            <DialogDescription>
              Responda algumas perguntas para a IA personalizar sua landing page.
            </DialogDescription>
          </DialogHeader>
          {!iaLoading ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-4 py-4"
            >
              <div className="text-sm text-muted-foreground">
                Pergunta {iaStep + 1} de {iaQuestions.length}
              </div>
              <label className="block font-medium text-lg mb-2">{iaQuestions[iaStep].label}</label>
              <Input
                value={iaAnswers[iaQuestions[iaStep].key] || ''}
                onChange={e => handleIaAnswer(e.target.value)}
                onKeyDown={handleKeyPress}
                autoFocus
                className="border-2 focus:border-purple-500 shadow-sm"
                placeholder="Digite sua resposta aqui..."
              />
              <div className="flex justify-between mt-6">
                <Button
                  variant="outline"
                  onClick={handleIaClose}
                  type="button"
                >
                  Cancelar
                </Button>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    onClick={handleIaNext}
                    type="button"
                    disabled={!iaAnswers[iaQuestions[iaStep].key]}
                    className={`bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white ${!iaAnswers[iaQuestions[iaStep].key] ? 'opacity-50' : ''}`}
                  >
                    {iaStep < iaQuestions.length - 1 ? 'Próxima' : 'Gerar com IA'}
                  </Button>
                </motion.div>
              </div>
              <div className="text-xs text-center mt-2 text-muted-foreground">
                Pressione Enter para avançar
              </div>
            </motion.div>
          ) : (
            <div className="py-12 text-center">
              <motion.div
                animate={{ 
                  rotate: 360,
                  transition: { duration: 2, repeat: Infinity, ease: "linear" }
                }}
                className="mx-auto mb-4"
              >
                <Sparkles className="h-10 w-10 text-purple-600" />
              </motion.div>
              <p>Gerando sugestões com IA...</p>
              <p className="text-sm text-muted-foreground mt-2">Isso pode levar alguns segundos</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AgencyLayout>
  );
} 