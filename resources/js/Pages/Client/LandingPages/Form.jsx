import React, { useState, useEffect, useRef } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import ClientLayout from '@/Layouts/ClientLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { Switch } from '@/Components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { AlertCircle, ArrowLeft, Eye, Palette, Settings, Code } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/Components/ui/alert';
import 'grapesjs/dist/css/grapes.min.css';

export default function LandingPageForm({ landingPage = null, templates = [], isEditing = false }) {
  const [activeTab, setActiveTab] = useState('editor');
  const [previewMode, setPreviewMode] = useState(false);
  const editorRef = useRef(null);
  const [editor, setEditor] = useState(null);
  
  const { data, setData, post, put, processing, errors } = useForm({
    name: landingPage?.name || '',
    description: landingPage?.description || '',
    template_id: landingPage?.template_id || '',
    content: landingPage?.content || '',
    css: landingPage?.css || '',
    js: landingPage?.js || '',
    is_active: landingPage?.is_active ?? true,
    meta_title: landingPage?.meta_title || '',
    meta_description: landingPage?.meta_description || '',
    thank_you_message: landingPage?.thank_you_message || 'Obrigado pelo seu interesse. Entraremos em contato em breve.',
    thank_you_redirect_url: landingPage?.thank_you_redirect_url || '',
    primary_color: landingPage?.primary_color || '#3B82F6',
    secondary_color: landingPage?.secondary_color || '#10B981',
    button_text: landingPage?.button_text || 'Enviar',
  });

  // Inicializar o editor GrapesJS
  useEffect(() => {
    if (activeTab === 'editor' && !editor) {
      Promise.all([
        import('grapesjs'),
        import('grapesjs-preset-webpage'),
        import('grapesjs-blocks-basic'),
        import('grapesjs-plugin-forms'),
        import('grapesjs-custom-code'),
        import('grapesjs-touch'),
        import('grapesjs-style-bg'),
        import('grapesjs-style-gradient')
      ]).then(([
        { default: grapesjs },
        {},
        {},
        {},
        {},
        {},
        {},
        {}
      ]) => {
        // Inicializar o editor com configurações
        const newEditor = grapesjs.init({
          container: editorRef.current,
          height: '700px',
          width: 'auto',
          storageManager: false,
          panels: { defaults: [] },
          deviceManager: {
            devices: [
              { name: 'Desktop', width: '1024px' },
              { name: 'Tablet', width: '768px' },
              { name: 'Mobile', width: '320px' }
            ]
          },
          plugins: [
            'gjs-preset-webpage', 
            'gjs-blocks-basic',
            'gjs-plugin-forms',
            'gjs-custom-code',
            'gjs-touch',
            'gjs-style-bg',
            'gjs-style-gradient'
          ],
          pluginsOpts: {
            'gjs-preset-webpage': {
              blocks: ['column1', 'column2', 'column3', 'column3-7', 'text', 'link', 'image', 'video', 'map'],
              modalImportTitle: 'Importar HTML',
              modalImportLabel: 'Cole seu HTML aqui:',
              modalImportContent: '',
            },
            'gjs-blocks-basic': {},
            'gjs-plugin-forms': {
              blocks: ['form', 'input', 'textarea', 'select', 'button', 'label', 'checkbox', 'radio'],
              labels: {
                form: 'Formulário',
                input: 'Campo de texto',
                textarea: 'Área de texto',
                select: 'Lista suspensa',
                button: 'Botão',
                label: 'Rótulo',
                checkbox: 'Caixa de Seleção',
                radio: 'Botão de opção'
              }
            },
          },
          canvas: {
            styles: [
              'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css',
            ],
            scripts: [
              'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js',
            ],
          },
        });

        // Adicionar blocos personalizados de formulários do OnSell
        const blockManager = newEditor.BlockManager;
        blockManager.add('onsell-form', {
          label: 'Formulário OnSell',
          category: 'Formulários',
          content: `
            <form class="onsell-form" data-form-id="${formId || ''}">
              <div class="mb-3">
                <label class="form-label">Nome</label>
                <input class="form-control" name="name" placeholder="Digite seu nome completo" required/>
              </div>
              <div class="mb-3">
                <label class="form-label">E-mail</label>
                <input class="form-control" type="email" name="email" placeholder="Digite seu e-mail" required/>
              </div>
              <div class="mb-3">
                <label class="form-label">Telefone</label>
                <input class="form-control" type="tel" name="phone" placeholder="Digite seu telefone"/>
              </div>
              <div class="mb-3">
                <button class="btn btn-primary" type="submit">Enviar</button>
              </div>
            </form>
          `,
          attributes: {
            class: 'fa fa-wpforms'
          }
        });

        blockManager.add('onsell-form-cpf', {
          label: 'Campo CPF/CNPJ',
          category: 'Formulários',
          content: `
            <div class="mb-3">
              <label class="form-label">CPF/CNPJ</label>
              <input class="form-control" type="text" name="document" placeholder="Digite seu CPF ou CNPJ" data-onsell-mask="document"/>
            </div>
          `,
          attributes: {
            class: 'fa fa-id-card'
          }
        });

        blockManager.add('onsell-form-consent', {
          label: 'Consentimento LGPD',
          category: 'Formulários',
          content: `
            <div class="mb-3 form-check">
              <input type="checkbox" class="form-check-input" id="lgpd_consent" name="lgpd_consent" required>
              <label class="form-check-label" for="lgpd_consent">
                Concordo com a coleta e processamento dos meus dados de acordo com a Política de Privacidade.
              </label>
            </div>
          `,
          attributes: {
            class: 'fa fa-shield-alt'
          }
        });
        
        // Configurar painel personalizado
        newEditor.Panels.addPanel({
          id: 'custom-panel',
          visible: true,
          buttons: [
            {
              id: 'visibility',
              active: true,
              className: 'btn-toggle-borders',
              label: '<i class="fa fa-eye"></i>',
              command: 'sw-visibility',
              togglable: false,
            },
            {
              id: 'export',
              className: 'btn-open-export',
              label: 'Exportar',
              command: 'export-template',
              context: 'export-template',
            },
            {
              id: 'preview',
              className: 'btn-open-preview',
              label: 'Pré-visualizar',
              command: {
                run: function(editor) {
                  editor.runCommand('preview');
                }
              }
            },
            {
              id: 'device-desktop',
              label: 'Desktop',
              command: 'set-device-desktop',
              className: 'fa fa-desktop',
              active: true,
            },
            {
              id: 'device-tablet',
              label: 'Tablet',
              command: 'set-device-tablet',
              className: 'fa fa-tablet',
            },
            {
              id: 'device-mobile',
              label: 'Mobile',
              command: 'set-device-mobile',
              className: 'fa fa-mobile',
            }
          ]
        });
        
        // Comandos para alternar dispositivos
        newEditor.Commands.add('set-device-desktop', {
          run: (editor) => editor.setDevice('Desktop')
        });
        
        newEditor.Commands.add('set-device-tablet', {
          run: (editor) => editor.setDevice('Tablet')
        });
        
        newEditor.Commands.add('set-device-mobile', {
          run: (editor) => editor.setDevice('Mobile')
        });
        
        // Script personalizado para integrar os formulários do OnSell
        const onsellFormScript = `
          <script>
            document.addEventListener('DOMContentLoaded', function() {
              const onsellForms = document.querySelectorAll('.onsell-form');
              
              onsellForms.forEach(form => {
                form.addEventListener('submit', function(e) {
                  e.preventDefault();
                  
                  const formData = new FormData(form);
                  const formId = form.getAttribute('data-form-id');
                  
                  fetch('/api/form-submissions', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
                    },
                    body: JSON.stringify({
                      form_id: formId,
                      data: Object.fromEntries(formData),
                      page_url: window.location.href,
                      referer_url: document.referrer,
                    }),
                  })
                  .then(response => response.json())
                  .then(data => {
                    if (data.success) {
                      if (data.redirect_url) {
                        window.location.href = data.redirect_url;
                      } else {
                        form.innerHTML = '<div class="alert alert-success">' + data.message + '</div>';
                      }
                    } else {
                      console.error('Erro ao enviar o formulário:', data.error);
                      
                      if (form.querySelector('.form-error-message')) {
                        form.querySelector('.form-error-message').textContent = data.error;
                      } else {
                        form.insertAdjacentHTML('beforeend', '<div class="alert alert-danger form-error-message">' + data.error + '</div>');
                      }
                    }
                  })
                  .catch(error => {
                    console.error('Erro ao processar o formulário:', error);
                    form.insertAdjacentHTML('beforeend', '<div class="alert alert-danger">Ocorreu um erro ao processar seu formulário. Por favor, tente novamente mais tarde.</div>');
                  });
                });
              });
              
              // Máscaras para campos específicos
              const maskFields = document.querySelectorAll('[data-onsell-mask]');
              
              maskFields.forEach(field => {
                const maskType = field.getAttribute('data-onsell-mask');
                
                if (maskType === 'document') {
                  field.addEventListener('input', function(e) {
                    let value = e.target.value.replace(/\D/g, '');
                    
                    if (value.length <= 11) {
                      // Máscara de CPF: 000.000.000-00
                      value = value.replace(/(\d{3})(\d)/, '$1.$2');
                      value = value.replace(/(\d{3})(\d)/, '$1.$2');
                      value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
                    } else {
                      // Máscara de CNPJ: 00.000.000/0000-00
                      value = value.replace(/(\d{2})(\d)/, '$1.$2');
                      value = value.replace(/(\d{3})(\d)/, '$1.$2');
                      value = value.replace(/(\d{3})(\d)/, '$1/$2');
                      value = value.replace(/(\d{4})(\d{1,2})$/, '$1-$2');
                    }
                    
                    e.target.value = value;
                  });
                }
              });
            });
          </script>
        `;
        
        // Adicionar o script ao final do corpo para ativar os formulários
        newEditor.on('component:add', (component) => {
          if (component.attributes.tagName === 'form' && component.getClasses().includes('onsell-form')) {
            const htmlComponents = newEditor.DomComponents.getWrapper().find('html')[0];
            
            if (htmlComponents) {
              const bodyComponent = htmlComponents.find('body')[0];
              
              if (bodyComponent) {
                // Verifica se já existe um script do OnSell
                const existingScripts = bodyComponent.find('script').filter(script => 
                  script.get('content')?.includes('onsellForms.forEach'));
                  
                if (existingScripts.length === 0) {
                  bodyComponent.append(onsellFormScript);
                }
              }
            }
          }
        });
        
        // Carregar conteúdo existente, se disponível
        if (data.content) {
          newEditor.setComponents(data.content);
        }
        
        if (data.css) {
          newEditor.setStyle(data.css);
        }
        
        // Atualizar estado do formulário quando o editor muda
        newEditor.on('change:changesCount', () => {
          setData({
            ...data,
            content: newEditor.getHtml(),
            css: newEditor.getCss(),
          });
        });
        
        setEditor(newEditor);
      });
    }
    
    // Limpeza ao desmontar o componente
    return () => {
      if (editor) {
        editor.destroy();
        setEditor(null);
      }
    };
  }, [activeTab]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Atualizar conteúdo HTML e CSS do editor antes de enviar
    if (editor) {
      setData({
        ...data,
        content: editor.getHtml(),
        css: editor.getCss(),
      });
    }
    
    if (isEditing) {
      put(route('client.landing-pages.update', landingPage.id));
    } else {
      post(route('client.landing-pages.store'));
    }
  };

  const renderPreview = () => {
    if (!previewMode) return null;
    
    // Aqui poderia ser implementada a pré-visualização em tempo real
    return (
      <div className="fixed inset-0 bg-white z-50 overflow-auto">
        <div className="p-4 bg-gray-100 border-b flex justify-between items-center sticky top-0 z-10">
          <h2 className="text-lg font-medium">Pré-visualização</h2>
          <Button onClick={() => setPreviewMode(false)} variant="ghost">
            Fechar pré-visualização
          </Button>
        </div>
        <div className="py-8">
          <iframe
            className="w-full h-screen border-none"
            srcDoc={`
              <!DOCTYPE html>
              <html>
                <head>
                  <meta charset="utf-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                  <title>${data.meta_title || data.name}</title>
                  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
                  <style>
                    :root {
                      --primary-color: ${data.primary_color};
                      --secondary-color: ${data.secondary_color};
                    }
                    ${data.css}
                  </style>
                </head>
                <body>
                  ${data.content}
                  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
                  <script>
                    ${data.js}
                  </script>
                </body>
              </html>
            `}
          />
        </div>
      </div>
    );
  };

  const handleTemplateChange = (templateId) => {
    setData({
      ...data,
      template_id: templateId
    });
    
    // Se um template foi selecionado, carregar seu conteúdo no editor
    if (templateId && editor) {
      const template = templates.find(t => t.id.toString() === templateId.toString());
      if (template && template.content) {
        editor.setComponents(template.content);
        if (template.css) {
          editor.setStyle(template.css);
        }
      }
    }
  };

  return (
    <ClientLayout>
      <Head title={isEditing ? "Editar Landing Page" : "Criar Landing Page"} />
      
      {renderPreview()}
      
      <div className="container mx-auto py-6">
        <div className="flex items-center mb-6">
          <Button variant="ghost" className="mr-4" asChild>
            <Link href={route('client.landing-pages.index')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">
              {isEditing ? "Editar Landing Page" : "Criar Landing Page"}
            </h1>
            <p className="text-gray-500">
              {isEditing 
                ? "Atualize as informações da sua página de captura" 
                : "Configure uma nova página de captura para obter mais leads"}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Informações Básicas</CardTitle>
                  <CardDescription>Dados gerais da landing page</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome da Landing Page</Label>
                    <Input 
                      id="name" 
                      value={data.name}
                      onChange={(e) => setData('name', e.target.value)}
                      placeholder="Ex: Promoção Verão 2023"
                    />
                    {errors.name && (
                      <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Descrição (opcional)</Label>
                    <Textarea 
                      id="description" 
                      value={data.description}
                      onChange={(e) => setData('description', e.target.value)}
                      placeholder="Descreva o objetivo desta landing page"
                      rows={3}
                    />
                  </div>

                  {!isEditing && (
                    <div className="space-y-2">
                      <Label htmlFor="template_id">Template</Label>
                      <Select 
                        value={data.template_id} 
                        onValueChange={handleTemplateChange}
                      >
                        <SelectTrigger id="template_id">
                          <SelectValue placeholder="Selecione um template" />
                        </SelectTrigger>
                        <SelectContent>
                          {templates.map((template) => (
                            <SelectItem key={template.id} value={template.id.toString()}>
                              {template.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.template_id && (
                        <p className="text-red-500 text-sm mt-1">{errors.template_id}</p>
                      )}
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="is_active">Status</Label>
                    <div className="flex items-center space-x-2">
                      <Switch 
                        id="is_active" 
                        checked={data.is_active}
                        onCheckedChange={(checked) => setData('is_active', checked)}
                      />
                      <Label htmlFor="is_active" className="cursor-pointer">
                        {data.is_active ? 'Ativa' : 'Inativa'}
                      </Label>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>SEO e Conversão</CardTitle>
                  <CardDescription>Otimize sua página para buscadores</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="meta_title">Título SEO</Label>
                    <Input 
                      id="meta_title" 
                      value={data.meta_title}
                      onChange={(e) => setData('meta_title', e.target.value)}
                      placeholder="Título da página para SEO"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="meta_description">Descrição SEO</Label>
                    <Textarea 
                      id="meta_description" 
                      value={data.meta_description}
                      onChange={(e) => setData('meta_description', e.target.value)}
                      placeholder="Breve descrição para exibição em buscadores"
                      rows={3}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="thank_you_message">Mensagem de Agradecimento</Label>
                    <Textarea 
                      id="thank_you_message" 
                      value={data.thank_you_message}
                      onChange={(e) => setData('thank_you_message', e.target.value)}
                      placeholder="Mensagem após o envio do formulário"
                      rows={2}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="thank_you_redirect_url">URL de Redirecionamento (opcional)</Label>
                    <Input 
                      id="thank_you_redirect_url" 
                      value={data.thank_you_redirect_url}
                      onChange={(e) => setData('thank_you_redirect_url', e.target.value)}
                      placeholder="https://exemplo.com/obrigado"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Main content */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-center">
                    <CardTitle>Editor</CardTitle>
                    <Button type="button" onClick={() => setPreviewMode(true)} variant="outline">
                      <Eye className="mr-2 h-4 w-4" /> Pré-visualizar
                    </Button>
                  </div>
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid grid-cols-3">
                      <TabsTrigger value="editor">
                        <Palette className="mr-2 h-4 w-4" /> Editor Visual
                      </TabsTrigger>
                      <TabsTrigger value="code">
                        <Code className="mr-2 h-4 w-4" /> Código HTML/CSS
                      </TabsTrigger>
                      <TabsTrigger value="settings">
                        <Settings className="mr-2 h-4 w-4" /> Personalização
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </CardHeader>
                <CardContent>
                  <TabsContent value="editor" className="mt-0">
                    <div ref={editorRef} className="gjs-editor-cont"></div>
                  </TabsContent>
                  
                  <TabsContent value="code" className="mt-0">
                    <div className="grid grid-cols-1 gap-6">
                      <div>
                        <Label className="mb-2 block">HTML</Label>
                        <Textarea 
                          value={data.content}
                          onChange={(e) => {
                            setData('content', e.target.value);
                            if (editor) {
                              editor.setComponents(e.target.value);
                            }
                          }}
                          placeholder="Insira o código HTML da sua landing page"
                          className="font-mono resize-none h-[300px]"
                        />
                      </div>
                      
                      <div>
                        <Label className="mb-2 block">CSS</Label>
                        <Textarea 
                          value={data.css}
                          onChange={(e) => {
                            setData('css', e.target.value);
                            if (editor) {
                              editor.setStyle(e.target.value);
                            }
                          }}
                          placeholder="Insira os estilos CSS da sua landing page"
                          className="font-mono resize-none h-[300px]"
                        />
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="settings" className="mt-0">
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="primary_color">Cor Primária</Label>
                          <div className="flex">
                            <Input 
                              id="primary_color" 
                              value={data.primary_color}
                              onChange={(e) => setData('primary_color', e.target.value)}
                              className="rounded-r-none"
                              type="color"
                            />
                            <Input 
                              value={data.primary_color}
                              onChange={(e) => setData('primary_color', e.target.value)}
                              className="rounded-l-none"
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="secondary_color">Cor Secundária</Label>
                          <div className="flex">
                            <Input 
                              id="secondary_color" 
                              value={data.secondary_color}
                              onChange={(e) => setData('secondary_color', e.target.value)}
                              className="rounded-r-none"
                              type="color"
                            />
                            <Input 
                              value={data.secondary_color}
                              onChange={(e) => setData('secondary_color', e.target.value)}
                              className="rounded-l-none"
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="button_text">Texto do Botão</Label>
                        <Input 
                          id="button_text" 
                          value={data.button_text}
                          onChange={(e) => setData('button_text', e.target.value)}
                          placeholder="Ex: Enviar, Quero Saber Mais, etc."
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="js">JavaScript Personalizado (opcional)</Label>
                        <Textarea 
                          id="js" 
                          value={data.js}
                          onChange={(e) => setData('js', e.target.value)}
                          placeholder="Insira código JavaScript personalizado (opcional)"
                          className="font-mono resize-none h-[150px]"
                        />
                      </div>
                    </div>
                  </TabsContent>
                </CardContent>
                <CardFooter className="border-t bg-gray-50 px-6 py-3">
                  <Alert variant="warning" className="mb-0">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Importante!</AlertTitle>
                    <AlertDescription>
                      Teste sua landing page em diferentes dispositivos antes de publicá-la.
                    </AlertDescription>
                  </Alert>
                </CardFooter>
              </Card>
              
              <div className="flex justify-end space-x-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  asChild
                >
                  <Link href={route('client.landing-pages.index')}>
                    Cancelar
                  </Link>
                </Button>
                <Button 
                  type="submit" 
                  disabled={processing}
                >
                  {processing ? 'Processando...' : isEditing ? 'Atualizar' : 'Criar Landing Page'}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </ClientLayout>
  );
} 