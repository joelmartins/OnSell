<?php

namespace Database\Seeders;

use App\Models\LandingPageTemplate;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class LandingPageTemplateSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $templates = [
            [
                'name' => 'Captura de Lead Simples',
                'description' => 'Template básico para captura de leads com formulário simples.',
                'thumbnail' => 'templates/lead-simple.jpg',
                'category' => 'lead-capture',
                'is_active' => true,
                'is_premium' => false,
                'content' => $this->getLeadSimpleHtml(),
                'css' => $this->getLeadSimpleCss(),
            ],
            [
                'name' => 'Landing Page Promocional',
                'description' => 'Template para promoções com destaque para ofertas.',
                'thumbnail' => 'templates/promo.jpg',
                'category' => 'product-landing',
                'is_active' => true,
                'is_premium' => false,
                'content' => $this->getPromoHtml(),
                'css' => $this->getPromoCss(),
            ],
            [
                'name' => 'Página de Agradecimento',
                'description' => 'Template para página de agradecimento após conversão.',
                'thumbnail' => 'templates/thank-you.jpg',
                'category' => 'thank-you',
                'is_active' => true,
                'is_premium' => false,
                'content' => $this->getThankYouHtml(),
                'css' => $this->getThankYouCss(),
            ],
        ];

        foreach ($templates as $template) {
            LandingPageTemplate::create($template);
        }
    }

    private function getLeadSimpleHtml(): string
    {
        return <<<HTML
<div class="container mt-5">
  <div class="row justify-content-center">
    <div class="col-md-6">
      <div class="card shadow">
        <div class="card-body">
          <h1 class="text-center mb-4">Receba Nossas Novidades</h1>
          <p class="text-center mb-4">Inscreva-se para receber conteúdo exclusivo e ofertas especiais!</p>
          
          <form>
            <div class="mb-3">
              <label for="name" class="form-label">Nome Completo</label>
              <input type="text" class="form-control" id="name" placeholder="Digite seu nome">
            </div>
            <div class="mb-3">
              <label for="email" class="form-label">E-mail</label>
              <input type="email" class="form-control" id="email" placeholder="Digite seu e-mail">
            </div>
            <div class="mb-3">
              <label for="phone" class="form-label">Telefone (opcional)</label>
              <input type="tel" class="form-control" id="phone" placeholder="(00) 00000-0000">
            </div>
            <div class="d-grid gap-2">
              <button type="submit" class="btn btn-primary btn-lg">Quero Receber</button>
            </div>
          </form>
          
          <div class="text-center mt-4">
            <p class="small text-muted">Seus dados estão seguros conosco.<br>Não compartilhamos suas informações.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
HTML;
    }

    private function getLeadSimpleCss(): string
    {
        return <<<CSS
body {
  background-color: #f8f9fa;
  font-family: 'Open Sans', sans-serif;
}

.card {
  border-radius: 10px;
  border: none;
}

h1 {
  color: var(--primary-color, #3B82F6);
  font-weight: 700;
}

.btn-primary {
  background-color: var(--primary-color, #3B82F6);
  border-color: var(--primary-color, #3B82F6);
  font-weight: 600;
  padding: 12px;
}

.btn-primary:hover {
  background-color: var(--secondary-color, #2563EB);
  border-color: var(--secondary-color, #2563EB);
}
CSS;
    }

    private function getPromoHtml(): string
    {
        return <<<HTML
<div class="container-fluid hero-section py-5">
  <div class="container py-5">
    <div class="row align-items-center">
      <div class="col-lg-6">
        <h1 class="display-4 fw-bold mb-4">Oferta Especial por Tempo Limitado!</h1>
        <p class="lead mb-4">Aproveite descontos exclusivos em nossos produtos. Promoção válida até o final do mês.</p>
        <div class="countdown mb-4">
          <div class="row">
            <div class="col-3 countdown-item">
              <div class="countdown-number">12</div>
              <div class="countdown-label">Dias</div>
            </div>
            <div class="col-3 countdown-item">
              <div class="countdown-number">08</div>
              <div class="countdown-label">Horas</div>
            </div>
            <div class="col-3 countdown-item">
              <div class="countdown-number">45</div>
              <div class="countdown-label">Minutos</div>
            </div>
            <div class="col-3 countdown-item">
              <div class="countdown-number">33</div>
              <div class="countdown-label">Segundos</div>
            </div>
          </div>
        </div>
        <button class="btn btn-primary btn-lg">Aproveitar Agora</button>
      </div>
      <div class="col-lg-6 text-center">
        <img src="https://placehold.co/600x400/EFEFEF/333333" alt="Produto em promoção" class="img-fluid rounded shadow">
      </div>
    </div>
  </div>
</div>

<div class="container py-5">
  <div class="row">
    <div class="col-12 text-center mb-5">
      <h2 class="display-5 fw-bold">Nossos Produtos em Destaque</h2>
      <p class="lead">Confira os itens mais vendidos com preços imperdíveis</p>
    </div>
    
    <div class="col-md-4 mb-4">
      <div class="card h-100 product-card">
        <div class="badge bg-danger position-absolute" style="top: 10px; right: 10px">-25%</div>
        <img src="https://placehold.co/300x200/FAFAFA/333333" class="card-img-top" alt="Produto 1">
        <div class="card-body">
          <h5 class="card-title">Produto Especial 1</h5>
          <p class="card-text">Descrição breve do produto com seus principais benefícios.</p>
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <span class="text-decoration-line-through text-muted">R$ 299,90</span>
              <span class="fw-bold ms-2">R$ 224,90</span>
            </div>
            <button class="btn btn-sm btn-primary">Ver detalhes</button>
          </div>
        </div>
      </div>
    </div>
    
    <div class="col-md-4 mb-4">
      <div class="card h-100 product-card">
        <div class="badge bg-danger position-absolute" style="top: 10px; right: 10px">-30%</div>
        <img src="https://placehold.co/300x200/FAFAFA/333333" class="card-img-top" alt="Produto 2">
        <div class="card-body">
          <h5 class="card-title">Produto Especial 2</h5>
          <p class="card-text">Descrição breve do produto com seus principais benefícios.</p>
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <span class="text-decoration-line-through text-muted">R$ 499,90</span>
              <span class="fw-bold ms-2">R$ 349,90</span>
            </div>
            <button class="btn btn-sm btn-primary">Ver detalhes</button>
          </div>
        </div>
      </div>
    </div>
    
    <div class="col-md-4 mb-4">
      <div class="card h-100 product-card">
        <div class="badge bg-danger position-absolute" style="top: 10px; right: 10px">-15%</div>
        <img src="https://placehold.co/300x200/FAFAFA/333333" class="card-img-top" alt="Produto 3">
        <div class="card-body">
          <h5 class="card-title">Produto Especial 3</h5>
          <p class="card-text">Descrição breve do produto com seus principais benefícios.</p>
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <span class="text-decoration-line-through text-muted">R$ 199,90</span>
              <span class="fw-bold ms-2">R$ 169,90</span>
            </div>
            <button class="btn btn-sm btn-primary">Ver detalhes</button>
          </div>
        </div>
      </div>
    </div>
    
  </div>
</div>

<div class="container-fluid cta-section py-5 mt-4">
  <div class="container py-4">
    <div class="row justify-content-center">
      <div class="col-md-8 text-center">
        <h2 class="display-6 fw-bold text-white mb-4">Não Perca Esta Oportunidade!</h2>
        <p class="lead text-white mb-4">Preencha o formulário e receba acesso antecipado às nossas próximas promoções.</p>
        <div class="card p-4">
          <form>
            <div class="row g-3">
              <div class="col-md-6">
                <input type="text" class="form-control" placeholder="Nome completo">
              </div>
              <div class="col-md-6">
                <input type="email" class="form-control" placeholder="E-mail">
              </div>
              <div class="col-12">
                <div class="d-grid">
                  <button type="submit" class="btn btn-primary btn-lg">Quero Receber Ofertas</button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</div>
HTML;
    }

    private function getPromoCss(): string
    {
        return <<<CSS
body {
  font-family: 'Poppins', sans-serif;
}

.hero-section {
  background-color: #f8f9fa;
}

.cta-section {
  background-color: var(--primary-color, #3B82F6);
}

.btn-primary {
  background-color: var(--primary-color, #3B82F6);
  border-color: var(--primary-color, #3B82F6);
  font-weight: 600;
  padding: 12px 24px;
}

.btn-primary:hover {
  background-color: var(--secondary-color, #2563EB);
  border-color: var(--secondary-color, #2563EB);
}

.countdown {
  background-color: white;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

.countdown-number {
  font-size: 2rem;
  font-weight: 700;
  color: var(--primary-color, #3B82F6);
}

.countdown-label {
  font-size: 0.9rem;
  color: #6c757d;
}

.product-card {
  transition: transform 0.3s;
  border: none;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

.product-card:hover {
  transform: translateY(-10px);
}
CSS;
    }

    private function getThankYouHtml(): string
    {
        return <<<HTML
<div class="container py-5">
  <div class="row justify-content-center">
    <div class="col-md-8 text-center">
      <div class="thank-you-container py-5">
        <div class="success-checkmark">
          <div class="check-icon">
            <span class="icon-line line-tip"></span>
            <span class="icon-line line-long"></span>
            <div class="icon-circle"></div>
            <div class="icon-fix"></div>
          </div>
        </div>
        <h1 class="display-4 fw-bold mb-4">Obrigado!</h1>
        <p class="lead mb-4">Seu cadastro foi realizado com sucesso. Em breve entraremos em contato.</p>
        <div class="card p-4 mb-4 next-steps">
          <h4>Próximos passos:</h4>
          <ul class="list-group list-group-flush text-start">
            <li class="list-group-item d-flex align-items-center">
              <span class="badge bg-primary rounded-circle me-3">1</span>
              <span>Verifique sua caixa de entrada para confirmar seu e-mail</span>
            </li>
            <li class="list-group-item d-flex align-items-center">
              <span class="badge bg-primary rounded-circle me-3">2</span>
              <span>Adicione nosso e-mail à sua lista de contatos seguros</span>
            </li>
            <li class="list-group-item d-flex align-items-center">
              <span class="badge bg-primary rounded-circle me-3">3</span>
              <span>Aguarde o contato de nossa equipe com mais informações</span>
            </li>
          </ul>
        </div>
        
        <div class="social-share mb-5">
          <p class="mb-3">Compartilhe com seus amigos:</p>
          <div class="d-flex justify-content-center gap-3">
            <a href="#" class="btn btn-outline-primary"><i class="fab fa-facebook-f"></i> Facebook</a>
            <a href="#" class="btn btn-outline-info"><i class="fab fa-twitter"></i> Twitter</a>
            <a href="#" class="btn btn-outline-success"><i class="fab fa-whatsapp"></i> WhatsApp</a>
          </div>
        </div>
        
        <a href="#" class="btn btn-primary btn-lg">Voltar para a página inicial</a>
      </div>
    </div>
  </div>
</div>
HTML;
    }

    private function getThankYouCss(): string
    {
        return <<<CSS
body {
  background-color: #f8f9fa;
  font-family: 'Open Sans', sans-serif;
}

.thank-you-container {
  background-color: white;
  border-radius: 15px;
  padding: 40px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
}

h1 {
  color: var(--primary-color, #3B82F6);
}

.btn-primary {
  background-color: var(--primary-color, #3B82F6);
  border-color: var(--primary-color, #3B82F6);
  font-weight: 600;
}

.btn-primary:hover {
  background-color: var(--secondary-color, #2563EB);
  border-color: var(--secondary-color, #2563EB);
}

.success-checkmark {
  width: 80px;
  height: 80px;
  margin: 0 auto 20px;
  position: relative;
}

.success-checkmark .check-icon {
  width: 80px;
  height: 80px;
  position: relative;
  border-radius: 50%;
  box-sizing: content-box;
  border: 4px solid var(--primary-color, #3B82F6);
}

.success-checkmark .check-icon::before {
  top: 3px;
  left: -2px;
  width: 30px;
  transform-origin: 100% 50%;
  border-radius: 100px 0 0 100px;
}

.success-checkmark .check-icon::after {
  top: 0;
  left: 30px;
  width: 60px;
  transform-origin: 0 50%;
  border-radius: 0 100px 100px 0;
  animation: rotate-circle 4.25s ease-in;
}

.success-checkmark .check-icon::before, .success-checkmark .check-icon::after {
  content: '';
  height: 100px;
  position: absolute;
  background: #f8f9fa;
  transform: rotate(-45deg);
}

.success-checkmark .check-icon .icon-line {
  height: 5px;
  background-color: var(--primary-color, #3B82F6);
  display: block;
  border-radius: 2px;
  position: absolute;
  z-index: 10;
}

.success-checkmark .check-icon .icon-line.line-tip {
  top: 46px;
  left: 14px;
  width: 25px;
  transform: rotate(45deg);
  animation: icon-line-tip 0.75s;
}

.success-checkmark .check-icon .icon-line.line-long {
  top: 38px;
  right: 8px;
  width: 47px;
  transform: rotate(-45deg);
  animation: icon-line-long 0.75s;
}

.success-checkmark .check-icon .icon-circle {
  top: -4px;
  left: -4px;
  z-index: 10;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  position: absolute;
  box-sizing: content-box;
  border: 4px solid var(--secondary-color, #2563EB);
  animation: circle-fill 0.6s;
}

.success-checkmark .check-icon .icon-fix {
  top: 8px;
  width: 5px;
  left: 26px;
  z-index: 1;
  height: 85px;
  position: absolute;
  transform: rotate(-45deg);
  background-color: #f8f9fa;
}

@keyframes circle-fill {
  0% {
    transform: scale(0);
  }
  100% {
    transform: scale(1);
  }
}

@keyframes icon-line-tip {
  0% {
    width: 0;
    left: 1px;
    top: 19px;
  }
  54% {
    width: 0;
    left: 1px;
    top: 19px;
  }
  70% {
    width: 50px;
    left: -8px;
    top: 37px;
  }
  84% {
    width: 17px;
    left: 21px;
    top: 48px;
  }
  100% {
    width: 25px;
    left: 14px;
    top: 46px;
  }
}

@keyframes icon-line-long {
  0% {
    width: 0;
    right: 46px;
    top: 54px;
  }
  65% {
    width: 0;
    right: 46px;
    top: 54px;
  }
  84% {
    width: 55px;
    right: 0px;
    top: 35px;
  }
  100% {
    width: 47px;
    right: 8px;
    top: 38px;
  }
}

.next-steps {
  border: none;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

.next-steps .list-group-item {
  border-left: none;
  border-right: none;
  border-top: none;
}

.badge.rounded-circle {
  width: 25px;
  height: 25px;
  display: flex;
  align-items: center;
  justify-content: center;
}
CSS;
    }
}
