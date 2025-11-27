import { useState } from 'react';
import { useFinanceData } from '@/hooks/useFinanceData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowUpCircle, ArrowDownCircle, Wallet, TrendingUp, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

const COLORS = {
  renda: 'hsl(142, 76%, 36%)',
  divida: 'hsl(0, 84%, 60%)',
  cartao: 'hsl(217, 91%, 60%)',
  fixa: 'hsl(24, 95%, 53%)',
  variavel: 'hsl(142, 76%, 36%)',
  outro: 'hsl(280, 80%, 50%)',
};

export default function Dashboard() {
  const { getBalancoMensal, getComparativo, getInsights, getMesesDisponiveis } = useFinanceData();
  const mesesDisponiveis = getMesesDisponiveis();
  const [mesSelecionado, setMesSelecionado] = useState(
    mesesDisponiveis[0] || new Date().toISOString().slice(0, 7)
  );

  const balanco = getBalancoMensal(mesSelecionado);
  const insights = getInsights(mesSelecionado);

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
    return {
      mes: new Date(mes + '-01').toLocaleDateString('pt-BR', { month: 'short' }),
      saldoMes: b.saldoMes,
      saldoAcumulado: b.saldoAcumulado,
      cartao: b.gastosPorCategoria.cartao,
    };
  });

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-foreground">Dashboard Financeiro</h1>
          <div className="flex gap-2">
            <Link to="/rendas">
              <Button variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Renda
              </Button>
            </Link>
            <Link to="/despesas">
              <Button variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Despesa
              </Button>
            </Link>
          </div>
        </div>

        <div className="flex gap-2 items-center">
          <label className="text-sm font-medium text-foreground">Mês:</label>
          <select
            value={mesSelecionado}
            onChange={(e) => setMesSelecionado(e.target.value)}
            className="px-3 py-2 border border-border rounded-md bg-background text-foreground"
          >
            {mesesDisponiveis.map(mes => (
              <option key={mes} value={mes}>
                {new Date(mes + '-01').toLocaleDateString('pt-BR', { year: 'numeric', month: 'long' })}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Rendas</CardTitle>
              <ArrowUpCircle className="h-4 w-4" style={{ color: COLORS.renda }} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" style={{ color: COLORS.renda }}>
                R$ {balanco.totalRenda.toFixed(2)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Despesas</CardTitle>
              <ArrowDownCircle className="h-4 w-4" style={{ color: COLORS.divida }} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" style={{ color: COLORS.divida }}>
                R$ {balanco.totalDivida.toFixed(2)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Saldo do Mês</CardTitle>
              <Wallet className="h-4 w-4" style={{ color: balanco.saldoMes >= 0 ? COLORS.renda : COLORS.divida }} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" style={{ color: balanco.saldoMes >= 0 ? COLORS.renda : COLORS.divida }}>
                R$ {balanco.saldoMes.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Acumulado: R$ {balanco.saldoAcumulado.toFixed(2)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">% Comprometida</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {balanco.porcentagemComprometida.toFixed(1)}%
              </div>
            </CardContent>
          </Card>
        </div>

        {comparativo && (
          <Card>
            <CardHeader>
              <CardTitle>Comparativo com Mês Anterior</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className={`text-lg font-semibold ${
                comparativo.situacao === 'melhorando' ? 'text-green-600' :
                comparativo.situacao === 'piorando' ? 'text-red-600' : 'text-yellow-600'
              }`}>
                Situação: {comparativo.situacao.toUpperCase()}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
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
          <Card>
            <CardHeader>
              <CardTitle>Insights e Recomendações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {insights.map((insight, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-md ${
                    insight.tipo === 'alerta' ? 'bg-red-100 dark:bg-red-950 text-red-900 dark:text-red-100' :
                    insight.tipo === 'dica' ? 'bg-blue-100 dark:bg-blue-950 text-blue-900 dark:text-blue-100' :
                    'bg-green-100 dark:bg-green-950 text-green-900 dark:text-green-100'
                  }`}
                >
                  {insight.mensagem}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Renda x Despesas</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
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

          <Card>
            <CardHeader>
              <CardTitle>Distribuição por Categoria</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
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

          <Card>
            <CardHeader>
              <CardTitle>Evolução do Saldo</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
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

          <Card>
            <CardHeader>
              <CardTitle>Evolução Gastos Cartão</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
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
