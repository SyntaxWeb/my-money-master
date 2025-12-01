import { useState, useEffect } from 'react';
import { useFinanceData } from '@/hooks/useFinanceData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowUpCircle, ArrowDownCircle, Wallet, TrendingUp, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import logo from '@/assets/syntaxweb-logo.jpg';
import { ImportDialog } from '@/components/ImportDialog';

const COLORS = {
  renda: 'hsl(142, 76%, 36%)',
  divida: 'hsl(0, 84%, 60%)',
  cartao: 'hsl(217, 91%, 60%)',
  fixa: 'hsl(24, 95%, 53%)',
  variavel: 'hsl(142, 76%, 36%)',
  outro: 'hsl(280, 80%, 50%)',
};

export default function Dashboard() {
  const { 
    addRenda, 
    addDivida, 
    addRendas,
    addDividas,
    getBalancoMensal, 
    getComparativo, 
    getInsights, 
    getMesesDisponiveis 
  } = useFinanceData();
  const mesesDisponiveis = getMesesDisponiveis();
  
  const handleImportRendas = (newRendas: any[]) => {
    addRendas(newRendas);
  };

  const handleImportDividas = (newDividas: any[]) => {
    addDividas(newDividas);
  };
  const [mesSelecionado, setMesSelecionado] = useState(
    mesesDisponiveis[0] || new Date().toISOString().slice(0, 7)
  );
  const balanco = getBalancoMensal(mesSelecionado);
  const insights = getInsights(mesSelecionado);
  // Responsive chart height for smaller screens
  const [chartHeight, setChartHeight] = useState<number>(250);
  useEffect(() => {
    const update = () => setChartHeight(window.innerWidth < 640 ? 180 : 250);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);


  const mesAnterior = mesesDisponiveis[mesesDisponiveis.indexOf(mesSelecionado) + 1];
  const comparativo = mesAnterior ? getComparativo(mesSelecionado, mesAnterior) : null;

  const chartDataMensal = [
    { name: 'Renda', valor: balanco.totalRenda },
    { name: 'Despesas', valor: balanco.totalDivida },
  ];

  const pieData = [
    { name: 'Cartão', value: balanco.gastosPorCategoria.cartao },
    { name: 'Fixas', value: balanco.gastosPorCategoria.fixa },
    { name: 'Variáveis', value: balanco.gastosPorCategoria.variavel },
    { name: 'Outras', value: balanco.gastosPorCategoria.outro },
  ].filter(item => item.value > 0);

  const lineDataMeses = mesesDisponiveis.slice(0, 6).reverse().map(mes => {
    const b = getBalancoMensal(mes);

    const [ano, mesNum] = mes.split('-').map(Number);
    const data = new Date(ano, mesNum - 1, 1); // mês começa em 0

    return {
      mes: data.toLocaleDateString('pt-BR', { month: 'short' }),
      saldoMes: b.saldoMes,
      saldoAcumulado: b.saldoAcumulado,
      cartao: b.gastosPorCategoria.cartao,
    };

  });

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <img src={logo} alt="SyntaxWeb" className="h-10 w-10 sm:h-12 sm:w-12 object-contain flex-shrink-0" />
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Dashboard Financeiro</h1>
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <ImportDialog 
              onImportRendas={handleImportRendas}
              onImportDividas={handleImportDividas}
            />
            <Link to="/rendas">
              <Button className="w-full sm:w-auto" variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Renda
              </Button>
            </Link>
            <Link to="/despesas">
              <Button className="w-full sm:w-auto" variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Despesa
              </Button>
            </Link>
            <Link to="/cartoes">
              <Button className="w-full sm:w-auto" variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Cartões
              </Button>
            </Link>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
          <label htmlFor="mes-select" className="text-sm font-medium text-foreground">Mês:</label>
          <select
            value={mesSelecionado}
            onChange={(e) => setMesSelecionado(e.target.value)}
            id="mes-select"
            className="px-3 py-2 border border-border rounded-md bg-background text-foreground w-full sm:w-auto"
          >
            {mesesDisponiveis.map(mes => (
              <option key={mes} value={mes}>
                {(() => {
                  const [ano, mesNum] = mes.split('-').map(Number);
                  const data = new Date(ano, mesNum - 1, 1); // mês começa em 0
                  const label = data.toLocaleDateString('pt-BR', { year: 'numeric', month: 'long' });
                  // Capitalize the first letter for pt-BR months which are lowercase by default
                  return label.charAt(0).toUpperCase() + label.slice(1);
                })()}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="min-w-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Rendas</CardTitle>
              <ArrowUpCircle className="h-4 w-4" style={{ color: COLORS.renda }} />
            </CardHeader>
            <CardContent className="min-w-0">
              <div className="text-xl sm:text-2xl font-bold" style={{ color: COLORS.renda }}>
                R$ {balanco.totalRenda.toFixed(2)}
              </div>
            </CardContent>
          </Card>

          <Card className="min-w-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Despesas</CardTitle>
              <ArrowDownCircle className="h-4 w-4" style={{ color: COLORS.divida }} />
            </CardHeader>
            <CardContent className="min-w-0">
              <div className="text-xl sm:text-2xl font-bold" style={{ color: COLORS.divida }}>
                R$ {balanco.totalDivida.toFixed(2)}
              </div>
            </CardContent>
          </Card>

          <Card className="min-w-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Saldo do Mês</CardTitle>
              <Wallet className="h-4 w-4" style={{ color: balanco.saldoMes >= 0 ? COLORS.renda : COLORS.divida }} />
            </CardHeader>
            <CardContent className="min-w-0">
              <div className="text-xl sm:text-2xl font-bold" style={{ color: balanco.saldoMes >= 0 ? COLORS.renda : COLORS.divida }}>
                R$ {balanco.saldoMes.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Acumulado: R$ {balanco.saldoAcumulado.toFixed(2)}
              </p>
            </CardContent>
          </Card>

          <Card className="min-w-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">% Comprometida</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="min-w-0">
              <div className="text-xl sm:text-2xl font-bold text-foreground">
                {balanco.porcentagemComprometida.toFixed(1)}%
              </div>
            </CardContent>
          </Card>
        </div>

        {comparativo && (
          <Card className="min-w-0">
            <CardHeader>
              <CardTitle>Comparativo com Mês Anterior</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className={`text-lg font-semibold ${comparativo.situacao === 'melhorando' ? 'text-green-600' :
                comparativo.situacao === 'piorando' ? 'text-red-600' : 'text-yellow-600'
                }`}>
                Situação: {comparativo.situacao.toUpperCase()}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-4 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Diferença Renda</p>
                  <p className={comparativo.diferencaRenda >= 0 ? 'text-green-600' : 'text-red-600'}>
                    {comparativo.diferencaRenda >= 0 ? '+' : ''}R$ {comparativo.diferencaRenda.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Diferença Gastos</p>
                  <p className={comparativo.diferencaGastos <= 0 ? 'text-green-600' : 'text-red-600'}>
                    {comparativo.diferencaGastos >= 0 ? '+' : ''}R$ {comparativo.diferencaGastos.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Diferença Saldo</p>
                  <p className={comparativo.diferencaSaldo >= 0 ? 'text-green-600' : 'text-red-600'}>
                    {comparativo.diferencaSaldo >= 0 ? '+' : ''}R$ {comparativo.diferencaSaldo.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Diferença Cartão</p>
                  <p className={comparativo.diferencaCartao <= 0 ? 'text-green-600' : 'text-red-600'}>
                    {comparativo.diferencaCartao >= 0 ? '+' : ''}R$ {comparativo.diferencaCartao.toFixed(2)}
                  </p>
                </div>
              </div>
              {comparativo.padroes.length > 0 && (
                <div>
                  <p className="font-medium text-foreground mb-1">Padrões Identificados:</p>
                  <ul className="list-disc list-inside text-sm text-muted-foreground">
                    {comparativo.padroes.map((padrao, idx) => (
                      <li key={idx}>{padrao}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {insights.length > 0 && (
          <Card className="min-w-0">
            <CardHeader>
              <CardTitle>Insights e Recomendações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {insights.map((insight, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-md ${insight.tipo === 'alerta' ? 'bg-red-100 dark:bg-red-950 text-red-900 dark:text-red-100' :
                    insight.tipo === 'dica' ? 'bg-blue-100 dark:bg-blue-950 text-blue-900 dark:text-blue-100' :
                      'bg-green-100 dark:bg-green-950 text-green-900 dark:text-green-100'
                    } whitespace-normal break-words`}>
                  {insight.mensagem}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-4">
          <Card className="min-w-0">
            <CardHeader>
              <CardTitle>Renda x Despesas</CardTitle>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={chartHeight}>
                <BarChart data={chartDataMensal}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="valor" fill={COLORS.cartao} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="min-w-0">
            <CardHeader>
              <CardTitle>Distribuição por Categoria</CardTitle>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={chartHeight}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name}: R$ ${entry.value.toFixed(0)}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={Object.values(COLORS)[index + 2]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="min-w-0">
            <CardHeader>
              <CardTitle>Evolução do Saldo</CardTitle>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={chartHeight}>
                <LineChart data={lineDataMeses}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="saldoMes" name="Saldo Mês" stroke={COLORS.renda} strokeWidth={2} />
                  <Line type="monotone" dataKey="saldoAcumulado" name="Saldo Acumulado" stroke={COLORS.cartao} strokeWidth={2} strokeDasharray="5 5" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="min-w-0">
            <CardHeader>
              <CardTitle>Evolução Gastos Cartão</CardTitle>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={chartHeight}>
                <LineChart data={lineDataMeses}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="cartao" stroke={COLORS.cartao} strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
