import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { 
  Wallet, 
  CreditCard, 
  TrendingUp, 
  PiggyBank, 
  BarChart3, 
  FileSpreadsheet,
  CheckCircle2,
  ArrowRight
} from "lucide-react";

const Landing = () => {
  const features = [
    {
      icon: <Wallet className="w-8 h-8" />,
      title: "Controle de Rendas",
      description: "Gerencie todas suas fontes de renda de forma simples e organizada"
    },
    {
      icon: <CreditCard className="w-8 h-8" />,
      title: "Gestão de Cartões",
      description: "Acompanhe gastos e parcelamentos de todos seus cartões de crédito"
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Despesas Detalhadas",
      description: "Registre e categorize suas despesas com facilidade"
    },
    {
      icon: <PiggyBank className="w-8 h-8" />,
      title: "Cofrinhos Virtuais",
      description: "Crie metas de economia e acompanhe seu progresso"
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Dashboard Intuitivo",
      description: "Visualize sua situação financeira em gráficos claros"
    },
    {
      icon: <FileSpreadsheet className="w-8 h-8" />,
      title: "Importação Excel",
      description: "Importe faturas e exporte seus dados facilmente"
    }
  ];

  const benefits = [
    "Controle total das suas finanças em um só lugar",
    "Interface responsiva e fácil de usar",
    "Importação automática de faturas",
    "Acompanhamento de parcelamentos",
    "Exportação de dados em Excel",
    "Totalmente gratuito"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="w-6 h-6 text-primary" />
            <span className="font-bold text-xl">FinanceApp</span>
          </div>
          <Button asChild>
            <Link to="/app">
              Acessar Sistema <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Controle Financeiro Inteligente
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8">
            Gerencie suas finanças pessoais de forma simples, organizada e eficiente. 
            Tudo que você precisa em um só lugar.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild className="text-lg">
              <Link to="/app">
                Começar Agora <ArrowRight className="ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
          Recursos Poderosos
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
              <div className="text-primary mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Por que escolher nosso sistema?
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
                <p className="text-lg">{benefit}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <Card className="p-12 text-center bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Pronto para transformar suas finanças?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Comece agora mesmo, é gratuito e fácil de usar!
          </p>
          <Button size="lg" asChild className="text-lg">
            <Link to="/app">
              Entrar no Sistema <ArrowRight className="ml-2" />
            </Link>
          </Button>
        </Card>
      </section>

      {/* Sobre a SyntaxWeb */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-6 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Sobre a SyntaxWeb</h2>
            <p className="text-lg text-muted-foreground mb-4">
              A SyntaxWeb é a empresa responsável pelo desenvolvimento desta aplicação. Somos especializados em
              desenvolvimento web, design de interfaces e soluções de software que ajudam pessoas e empresas a
              gerenciarem suas finanças com eficiência.
            </p>
            <h3 className="text-lg font-semibold mb-2">Nossa missão</h3>
            <p className="text-muted-foreground mb-4">
              Criar produtos digitais seguros, fáceis de usar e com foco na experiência do usuário, para que
              qualquer pessoa possa ter controle sobre sua saúde financeira.
            </p>
            <h3 className="text-lg font-semibold mb-2">O que fazemos</h3>
            <ul className="list-inside list-disc text-muted-foreground">
              <li>Desenvolvimento de aplicações web e mobile</li>
              <li>Design de interfaces (UI/UX) e prototipação</li>
              <li>Integração com APIs e automação</li>
              <li>Consultoria técnica e manutenção</li>
            </ul>
          </div>
          <Card className="p-6 bg-muted/5">
            <div className="flex flex-col gap-4">
              <h3 className="text-xl font-semibold">Trabalhando com a SyntaxWeb</h3>
              <p className="text-muted-foreground">
                Buscamos sempre entregar soluções com foco em performance, segurança e experiência do usuário.
                Se você deseja implementar projetos parecidos ou quer contratar nossos serviços, entre em contato.
              </p>
              <div className="mt-4">
                <Button size="sm" className="w-full" asChild>
                  <a href="https://syntaxweb.com.br/">Saiba mais</a>
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 mt-20">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>© 2024 FinanceApp. Gerencie suas finanças com inteligência.</p>
          <p className="mt-2">Desenvolvido por <strong>SyntaxWeb</strong> — soluções em desenvolvimento web e design.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
