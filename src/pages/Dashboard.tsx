import { useState, useEffect } from 'react';
import { useFinanceData } from '@/hooks/useFinanceData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Switch } from '@/components/ui/switch';
import { exportToExcel } from '@/utils/exportToExcel';
import { ArrowUpCircle, ArrowDownCircle, Wallet, TrendingUp, Plus, PiggyBank } from 'lucide-react';
import { Link } from 'react-router-dom';
import AdSlot from '@/components/ui/ad-slot';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { ImportDialog } from '@/components/ImportDialog';
import CofrinhoPanel from '@/components/CofrinhoPanel';

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
    addParcelamento,
    cartoes,
    cofrinhos,
    rendas,
    dividas,
    parcelamentos,
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

  const handleImportFaturaCartao = (cartaoId: string, dividas: any[], parcelamentos: any[]) => {
    // Adicionar as dívidas
    addDividas(dividas);

    // Adicionar os parcelamentos (que vão criar as parcelas automaticamente)
    parcelamentos.forEach(parc => {
      addParcelamento(parc);
    });
  };

  const [mesSelecionado, setMesSelecionado] = useState(
    mesesDisponiveis[0] || new Date().toISOString().slice(0, 7)
  );
  // chart UI states
  const [chartType, setChartType] = useState<'bar' | 'line'>('bar');
  const [rangeMonths, setRangeMonths] = useState<number>(6);
  const [piePercent, setPiePercent] = useState<boolean>(false);
  const [showLineSaldoMes, setShowLineSaldoMes] = useState<boolean>(true);
  const [showLineSaldoAcumulado, setShowLineSaldoAcumulado] = useState<boolean>(true);
  const [showLineCartao, setShowLineCartao] = useState<boolean>(true);
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

  const getRecentMonths = (n: number) => mesesDisponiveis.slice(0, n).reverse();

  const chartDataMensal = getRecentMonths(rangeMonths).map(mes => {
    const b = getBalancoMensal(mes);
    return { name: new Date(mes + '-01').toLocaleDateString('pt-BR', { month: 'short' }), valor: b.totalRenda, despesa: b.totalDivida };
  });

  const pieData = [
    { name: 'Cartão', value: balanco.gastosPorCategoria.cartao },
    { name: 'Fixas', value: balanco.gastosPorCategoria.fixa },
    { name: 'Variáveis', value: balanco.gastosPorCategoria.variavel },
    { name: 'Outras', value: balanco.gastosPorCategoria.outro },
  ].filter(item => item.value > 0);

  const lineDataMeses = getRecentMonths(rangeMonths).map(mes => {
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

  // helper: compute previous balanco if available
  const getPrevBalanco = () => {
    if (!mesAnterior) return null;
    return getBalancoMensal(mesAnterior);
  };

  const prevBalanco = getPrevBalanco();

  const formatCurrency = (v: number) => `R$ ${v.toFixed(2)}`;

  const percentChange = (current: number, previous: number) => {
    if (previous === 0) return null;
    return ((current - previous) / Math.abs(previous)) * 100;
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="pt-2 pb-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Dashboard Financeiro</h1>
        </div>

        {/* Top Banner Ad */}
        <div className="py-3">
          <AdSlot id="dashboard-top-banner" size="banner" />
        </div>

        {/* Chart Controls */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between mt-4">
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
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Período:</span>
            <select value={rangeMonths} onChange={(e) => setRangeMonths(Number(e.target.value))} className="px-2 py-1 border rounded-md bg-background text-foreground">
              <option value={3}>Últimos 3 meses</option>
              <option value={6}>Últimos 6 meses</option>
              <option value={12}>Últimos 12 meses</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={() => exportToExcel({ rendas, dividas, cartoes, parcelamentos, cofrinhos })}>Exportar dados</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">

          <Card className="min-w-0 ">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Rendas</CardTitle>
              <ArrowUpCircle className="h-4 w-4" style={{ color: COLORS.renda }} />
            </CardHeader>
            <CardContent className="min-w-0">
              <div className="flex items-center gap-2">
                <div className="text-xl sm:text-2xl font-bold" style={{ color: COLORS.renda }}>
                  R$ {balanco.totalRenda.toFixed(2)}
                </div>
                {prevBalanco && (
                  (() => {
                    const p = percentChange(balanco.totalRenda, prevBalanco.totalRenda);
                    if (p === null) return null;
                    return (
                      <div className={`text-sm font-medium ${p >= 0 ? 'text-green-600' : 'text-red-600'} flex items-center gap-1`}>
                        {p >= 0 ? <ArrowUpCircle className="w-4 h-4" /> : <ArrowDownCircle className="w-4 h-4" />}
                        {Math.abs(p).toFixed(1)}%
                      </div>
                    );
                  })()
                )}
              </div>
            </CardContent>
          </Card>

          <Link to="/cofrinhos" className="w-full">
            <Card className="min-w-0 hover:shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total em Cofrinhos</CardTitle>
                <PiggyBank className="h-4 w-4" />
              </CardHeader>
              <CardContent className="min-w-0">
                <div className="text-xl sm:text-2xl font-bold">
                  R$ {cofrinhos.reduce((sum, c) => sum + (c.saldo || 0), 0).toFixed(2)}
                </div>
              </CardContent>
            </Card>
          </Link>
          <Card className="min-w-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Despesas</CardTitle>
              <ArrowDownCircle className="h-4 w-4" style={{ color: COLORS.divida }} />
            </CardHeader>
            <CardContent className="min-w-0">
              <div className="flex items-center gap-2">
                <div className="text-xl sm:text-2xl font-bold" style={{ color: COLORS.divida }}>
                  R$ {balanco.totalDivida.toFixed(2)}
                </div>
                {prevBalanco && (
                  (() => {
                    const p = percentChange(balanco.totalDivida, prevBalanco.totalDivida);
                    if (p === null) return null;
                    return (
                      <div className={`text-sm font-medium ${p <= 0 ? 'text-green-600' : 'text-red-600'} flex items-center gap-1`}>
                        {p <= 0 ? <ArrowUpCircle className="w-4 h-4" /> : <ArrowDownCircle className="w-4 h-4" />}
                        {Math.abs(p).toFixed(1)}%
                      </div>
                    );
                  })()
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="min-w-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Saldo do Mês</CardTitle>
              <Wallet className="h-4 w-4" style={{ color: balanco.saldoMes >= 0 ? COLORS.renda : COLORS.divida }} />
            </CardHeader>
            <CardContent className="min-w-0">
              <div className="flex items-center gap-2">
                <div className="text-xl sm:text-2xl font-bold" style={{ color: balanco.saldoMes >= 0 ? COLORS.renda : COLORS.divida }}>
                  R$ {balanco.saldoMes.toFixed(2)}
                </div>
                {prevBalanco && (
                  (() => {
                    const p = percentChange(balanco.saldoMes, prevBalanco.saldoMes);
                    if (p === null) return null;
                    return (
                      <div className={`text-sm font-medium ${p >= 0 ? 'text-green-600' : 'text-red-600'} flex items-center gap-1`}>
                        {p >= 0 ? <ArrowUpCircle className="w-4 h-4" /> : <ArrowDownCircle className="w-4 h-4" />}
                        {Math.abs(p).toFixed(1)}%
                      </div>
                    );
                  })()
                )}
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
              <div className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
                <div>{balanco.porcentagemComprometida.toFixed(1)}%</div>
                {prevBalanco && (() => {
                  const p = percentChange(balanco.porcentagemComprometida, prevBalanco.porcentagemComprometida);
                  if (p === null) return null;
                  return (
                    <div className={`text-sm font-medium ${p >= 0 ? 'text-red-600' : 'text-green-600'} flex items-center gap-1`}>
                      {p >= 0 ? <ArrowDownCircle className="w-4 h-4" /> : <ArrowUpCircle className="w-4 h-4" />}
                      {Math.abs(p).toFixed(1)}%
                    </div>
                  );
                })()}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Inline/Rectangle Ad */}
        <div className="max-w-7xl mx-auto px-4 py-6">
          <AdSlot id="dashboard-inline-rect" size="rectangle" />
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
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Tipo de gráfico:</span>
                <ToggleGroup
                  type="single"
                  value={chartType}
                  onValueChange={(val) => setChartType(val as 'bar' | 'line')}
                  className="ml-2"
                >
                  <ToggleGroupItem value="bar">Bar</ToggleGroupItem>
                  <ToggleGroupItem value="line">Linha</ToggleGroupItem>
                </ToggleGroup>
              </div>
              <ResponsiveContainer width="100%" height={chartHeight}>

                {chartType === 'bar' ? (
                  <BarChart data={chartDataMensal}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    <Legend />
                    <Bar dataKey="valor" name="Renda" fill={COLORS.renda} />
                    <Bar dataKey="despesa" name="Despesa" fill={COLORS.divida} />
                  </BarChart>
                ) : (
                  <LineChart data={chartDataMensal}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    <Legend />
                    <Line type="monotone" dataKey="valor" name="Renda" stroke={COLORS.renda} strokeWidth={2} />
                    <Line type="monotone" dataKey="despesa" name="Despesa" stroke={COLORS.divida} strokeWidth={2} />
                  </LineChart>
                )}
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="min-w-0">
            <CardHeader>
              <CardTitle>Distribuição por Categoria</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Gráfico de pizza:</span>
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-2 text-sm">Percentuais</label>
                  <Switch checked={piePercent} onCheckedChange={(v) => setPiePercent(Boolean(v))} />
                </div>
              </div>
              <ResponsiveContainer width="100%" height={chartHeight}>
                <PieChart>
                  <Legend />
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => {
                      const total = pieData.reduce((s, e) => s + e.value, 0);
                      if (piePercent && total > 0) {
                        const pct = (entry.value / total) * 100;
                        return `${entry.name}: ${pct.toFixed(1)}%`;
                      }
                      return `${entry.name}: R$ ${entry.value.toFixed(0)}`;
                    }}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={Object.values(COLORS)[index + 2]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="min-w-0">
            <CardHeader className="flex items-center justify-between">
              <CardTitle>Evolução do Saldo</CardTitle>
              <div className="flex items-center gap-2">
                <div className="text-sm text-muted-foreground">Saldo Mês</div>
                <Switch checked={showLineSaldoMes} onCheckedChange={(v) => setShowLineSaldoMes(Boolean(v))} />
                <div className="text-sm text-muted-foreground">Saldo Acumulado</div>
                <Switch checked={showLineSaldoAcumulado} onCheckedChange={(v) => setShowLineSaldoAcumulado(Boolean(v))} />
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={chartHeight}>
                <LineChart data={lineDataMeses}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Legend />
                  {showLineSaldoMes && <Line type="monotone" dataKey="saldoMes" name="Saldo Mês" stroke={COLORS.renda} strokeWidth={2} />}
                  {showLineSaldoAcumulado && <Line type="monotone" dataKey="saldoAcumulado" name="Saldo Acumulado" stroke={COLORS.cartao} strokeWidth={2} strokeDasharray="5 5" />}
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="min-w-0">
            <CardHeader className="flex items-center justify-between">
              <CardTitle>Evolução Gastos Cartão</CardTitle>
              <div className="flex items-center gap-2">
                <div className="text-sm text-muted-foreground">Mostrar</div>
                <Switch checked={showLineCartao} onCheckedChange={(v) => setShowLineCartao(Boolean(v))} />
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={chartHeight}>
                <LineChart data={lineDataMeses}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  {showLineCartao && <Line type="monotone" dataKey="cartao" stroke={COLORS.cartao} strokeWidth={2} />}
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
        <div className="mt-4 space-y-4">
          <CofrinhoPanel />
          <div>
            <AdSlot id="dashboard-footer-small" size="small" />
          </div>
        </div>
      </div>
    </div >
  );
}
