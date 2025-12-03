import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AdSlot from "@/components/ui/ad-slot";
import { Link } from "react-router-dom";
import {
  Wallet,
  CreditCard,
  TrendingUp,
  PiggyBank,
  BarChart3,
  FileSpreadsheet,
  CheckCircle2,
  ArrowRight,
  CalendarClock,
  ShieldCheck,
  Sparkles,
  PieChart,
} from "lucide-react";

const Landing = () => {
  const features = [
    {
      icon: <Wallet className="w-8 h-8" />,
      title: "Controle de Rendas",
      description:
        "Gerencie todas suas fontes de renda de forma simples e organizada",
    },
    {
      icon: <CreditCard className="w-8 h-8" />,
      title: "Gestão de Cartões",
      description:
        "Acompanhe gastos e parcelamentos de todos seus cartões de crédito",
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Despesas Detalhadas",
      description: "Registre e categorize suas despesas com facilidade",
    },
    {
      icon: <PiggyBank className="w-8 h-8" />,
      title: "Cofrinhos Virtuais",
      description: "Crie metas de economia e acompanhe seu progresso",
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Dashboard Intuitivo",
      description: "Visualize sua situação financeira em gráficos claros",
    },
    {
      icon: <FileSpreadsheet className="w-8 h-8" />,
      title: "Importação Excel",
      description: "Importe faturas e exporte seus dados facilmente",
    },
  ];

  const steps = [
    {
      icon: <CalendarClock className="w-6 h-6 text-primary" />,
      title: "Planeje seu mês",
      description:
        "Cadastre suas rendas, contas fixas e cartões em poucos cliques.",
    },
    {
      icon: <PieChart className="w-6 h-6 text-primary" />,
      title: "Acompanhe em gráficos",
      description: "Veja para onde está indo o seu dinheiro mês a mês.",
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-primary" />,
      title: "Decida com segurança",
      description:
        "Use os insights para organizar dívidas, metas e cofrinhos.",
    },
  ];

  const benefits = [
    "Controle total das suas finanças em um só lugar",
    "Interface responsiva e fácil de usar",
    "Importação automática de faturas",
    "Acompanhamento de parcelamentos",
    "Exportação de dados em Excel",
    "Totalmente gratuito",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="w-6 h-6 text-primary" />
            <span className="font-bold text-xl">SyntaxFinance</span>
          </div>
          <Button asChild>
            <Link to="/app">
              Acessar Sistema <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-10 items-center max-w-6xl mx-auto">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
              <Sparkles className="w-4 h-4" />
              Seu foco no planejamento financeiro
            </div>
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent leading-tight">
              Controle financeiro simples para o seu dia a dia
            </h1>
            <p className="text-lg md:text-2xl text-muted-foreground">
              Centralize rendas, contas, cartões e cofrinhos em um painel
              intuitivo, pensado para quem quer organizar a vida financeira sem
              complicação.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" asChild className="text-lg">
                <Link to="/app">
                  Começar Agora <ArrowRight className="ml-2" />
                </Link>
              </Button>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                <span>Gratuito e focado em finanças pessoais</span>
              </div>
            </div>
          </div>

          {/* “Mini dashboard” preview */}
          <div className="relative">
            <div className="absolute -inset-4 rounded-3xl bg-gradient-to-tr from-primary/30 via-primary/5 to-transparent blur-2xl opacity-70" />
            <Card className="relative border-primary/20 bg-gradient-to-br from-background to-muted/60 shadow-xl">
              <CardHeader className="flex flex-row items-center justify-between pb-4">
                <div>
                  <CardTitle className="text-lg">Visão geral do mês</CardTitle>
                  <p className="text-xs text-muted-foreground">
                    Resumo dos seus saldos e gastos
                  </p>
                </div>
                <div className="flex gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  <span className="h-2 w-2 rounded-full bg-amber-400" />
                  <span className="h-2 w-2 rounded-full bg-rose-400" />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-xl border bg-background/60 p-3">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Saldo geral</span>
                      <Wallet className="w-4 h-4 text-emerald-500" />
                    </div>
                    <p className="mt-2 text-lg font-semibold text-emerald-500">
                      R$ 3.250,00
                    </p>
                    <p className="text-[11px] text-emerald-600 mt-1">
                      + R$ 850,00 neste mês
                    </p>
                  </div>
                  <div className="rounded-xl border bg-background/60 p-3">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Cartões</span>
                      <CreditCard className="w-4 h-4 text-sky-500" />
                    </div>
                    <p className="mt-2 text-lg font-semibold text-rose-500">
                      R$ 1.420,00
                    </p>
                    <p className="text-[11px] text-rose-600 mt-1">
                      Fatura próxima semana
                    </p>
                  </div>
                  <div className="rounded-xl border bg-background/60 p-3">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Cofrinhos</span>
                      <PiggyBank className="w-4 h-4 text-amber-500" />
                    </div>
                    <p className="mt-2 text-lg font-semibold text-amber-500">
                      R$ 980,00
                    </p>
                    <p className="text-[11px] text-amber-600 mt-1">
                      3 metas ativas
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    <span>Gastos variáveis sob controle</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <BarChart3 className="w-4 h-4 text-primary" />
                    <span>Insights automáticos por categoria</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Top Banner Ad */}
      <section className="container mx-auto px-4 py-4">
        <AdSlot
          id="top-banner"
          size="banner"
          className="h-12 md:h-20 lg:h-32"
        />
      </section>

      {/* How it works / passos práticos */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-5xl mx-auto text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">
            Use no seu dia a dia
          </h2>
          <p className="text-muted-foreground text-lg">
            Pensado para ser o seu foco no planejamento financeiro, sem a
            complexidade de um sistema bancário.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {steps.map((step, index) => (
            <Card key={index} className="h-full border-muted/80">
              <CardContent className="pt-6 space-y-3">
                <div className="flex items-center justify-center h-10 mb-1">
                  {step.icon}
                </div>
                <h3 className="text-lg font-semibold text-center">
                  {step.title}
                </h3>
                <p className="text-sm text-muted-foreground text-center">
                  {step.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
          Recursos Poderosos
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="p-6 hover:shadow-lg transition-shadow bg-background/80"
            >
              <div className="text-primary mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Middle Rectangle Ad */}
      <section className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <AdSlot
            id="mid-rectangle"
            size="rectangle"
            className="h-20 md:h-36"
          />
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
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Sobre a SyntaxWeb
            </h2>
            <p className="text-lg text-muted-foreground mb-4">
              A SyntaxWeb é a empresa responsável pelo desenvolvimento desta
              aplicação. Somos especializados em desenvolvimento web, design de
              interfaces e soluções de software que ajudam pessoas e empresas a
              gerenciarem suas finanças com eficiência.
            </p>
            <h3 className="text-lg font-semibold mb-2">Nossa missão</h3>
            <p className="text-muted-foreground mb-4">
              Criar produtos digitais seguros, fáceis de usar e com foco na
              experiência do usuário, para que qualquer pessoa possa ter
              controle sobre sua saúde financeira.
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
                Buscamos sempre entregar soluções com foco em performance,
                segurança e experiência do usuário. Se você deseja implementar
                projetos parecidos ou quer contratar nossos serviços, entre em
                contato.
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
          <p>© 2025 SyntaxFinance. Gerencie suas finanças com inteligência.</p>
          <p className="mt-2">
            Desenvolvido por <strong>SyntaxWeb</strong> — soluções em
            desenvolvimento web e design.
          </p>
          <div className="mt-4">
            <AdSlot id="footer-small" size="small" className="h-8 md:h-12" />
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
