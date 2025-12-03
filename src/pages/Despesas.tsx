import { useState } from 'react';
import { useFinanceData } from '@/hooks/useFinanceData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Trash2, CheckCircle, Circle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

export default function Despesas() {
  const { dividas, addDivida, updateDivida, deleteDivida, cartoes, addParcelamento } = useFinanceData();
  const [formData, setFormData] = useState({
    mes: new Date().toISOString().slice(0, 7),
    valor: '',
    motivo: '',
    categoria: 'variavel' as 'cartao' | 'fixa' | 'variavel' | 'outro',
    // new fields for cartão
    cartaoId: '',
    tipoPagamento: 'avista' as 'avista' | 'parcelado',
    numeroParcelas: 1,
    parcelaAtual: 1,
    data: new Date().toISOString().slice(0, 10),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.valor || !formData.motivo) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }
    // If category is cartao and payment is parcelado, create parcelamento and schedule installments
    if (formData.categoria === 'cartao' && formData.tipoPagamento === 'parcelado') {
      if (!formData.cartaoId) {
        toast.error('Selecione um cartão para despesas parceladas');
        return;
      }
      if (!formData.numeroParcelas || Number(formData.numeroParcelas) < 2) {
        toast.error('Insira um número de parcelas válido (>= 2)');
        return;
      }

      const parcelaAtual = Number(formData.parcelaAtual) || 1;
      const numeroParcelas = Number(formData.numeroParcelas);
      const valorParcela = parseFloat(formData.valor);
      const motivoComParcela = `${formData.motivo} (${parcelaAtual}/${numeroParcelas})`;

      await addDivida({
        mes: formData.mes,
        valor: valorParcela,
        motivo: motivoComParcela,
        categoria: 'cartao',
        data: formData.data,
        status: 'aberta',
        cartaoId: formData.cartaoId,
      });

      // compute start month for parcelamento
      const subtractMonthsStr = (base: string, monthsToSubtract: number) => {
        const [y, m] = base.split('-').map(Number);
        const d = new Date(y, m - 1 - monthsToSubtract, 1);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      };

      const mesInicio = subtractMonthsStr(formData.mes, parcelaAtual - 1);
      const valorTotal = Number((valorParcela * numeroParcelas).toFixed(2));

      await addParcelamento({
        cartaoId: formData.cartaoId,
        descricao: String(formData.motivo).trim(),
        valorTotal,
        numeroParcelas,
        parcelaAtual,
        mesInicio,
        categoria: 'cartao',
      });

      toast.success('Despesa parcelada cadastrada e parcelas agendadas.');
      setFormData({
        mes: formData.mes,
        valor: '',
        motivo: '',
        categoria: 'variavel',
        cartaoId: '',
        tipoPagamento: 'avista',
        numeroParcelas: 1,
        parcelaAtual: 1,
        data: new Date().toISOString().slice(0, 10),
      });
      return;
    }

    // Default add single divida
    await addDivida({
      mes: formData.mes,
      valor: parseFloat(formData.valor),
      motivo: formData.motivo,
      categoria: formData.categoria,
      data: formData.data,
      status: 'aberta',
      ...(formData.categoria === 'cartao' && formData.cartaoId ? { cartaoId: formData.cartaoId } : {}),
    });
    toast.success('Despesa cadastrada com sucesso!');
    setFormData({
      mes: formData.mes,
      valor: '',
      motivo: '',
      categoria: 'variavel',
      cartaoId: '',
      tipoPagamento: 'avista',
      numeroParcelas: 1,
      parcelaAtual: 1,
      data: new Date().toISOString().slice(0, 10),
    });
  };

  const dividasPorMes = dividas.reduce((acc, divida) => {
    if (!acc[divida.mes]) acc[divida.mes] = [];
    acc[divida.mes].push(divida);
    return acc;
  }, {} as Record<string, typeof dividas>);

  const mesesOrdenados = Object.keys(dividasPorMes).sort().reverse();

  const categoriasLabels: Record<string, string> = {
    cartao: 'Cartão',
    fixa: 'Conta Fixa',
    variavel: 'Variável',
    outro: 'Outro',
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Link to="/app">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-foreground">Gerenciar Despesas</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Cadastrar Nova Despesa</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="mes">Mês</Label>
                  <Input
                    id="mes"
                    type="month"
                    value={formData.mes}
                    onChange={(e) => setFormData({ ...formData, mes: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="data">Data da Despesa</Label>
                  <Input
                    id="data"
                    type="date"
                    value={formData.data}
                    onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="valor">Valor (R$)</Label>
                  <Input
                    id="valor"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.valor}
                    onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                    required
                  />
                  {formData.categoria === "cartao" && formData.tipoPagamento === "parcelado" && (
                    <p className="text-xs text-muted-foreground mt-1">Atenção: o valor informado será considerado a parcela atual. Se estiver informando o valor total, divida-o pelo número de parcelas antes de cadastrar.</p>
                  )}

                </div>
                <div>
                  <Label htmlFor="categoria">Categoria</Label>
                  <Select
                    value={formData.categoria}
                    onValueChange={(value: any) => setFormData({ ...formData, categoria: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cartao">Cartão</SelectItem>
                      <SelectItem value="fixa">Conta Fixa</SelectItem>
                      <SelectItem value="variavel">Variável</SelectItem>
                      <SelectItem value="outro">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {formData.categoria === 'cartao' && (
                  <div>
                    <Label htmlFor="cartao">Cartão</Label>
                    <Select
                      value={formData.cartaoId}
                      onValueChange={(value: any) => setFormData({ ...formData, cartaoId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o cartão" />
                      </SelectTrigger>
                      <SelectContent>
                        {cartoes.map((c) => (
                          <SelectItem key={c.id} value={c.id}>{c.nome} - {c.bandeira}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground mt-1">Selecione o cartão que receberá a cobrança. Se não houver cartões cadastrados, crie um em <strong>Cartões</strong>.</p>
                  </div>
                )}
                {formData.categoria === 'cartao' && (
                  <div>
                    <Label htmlFor="tipoPagamento">Tipo Pagamento</Label>
                    <Select
                      value={formData.tipoPagamento}
                      onValueChange={(v: any) => setFormData({ ...formData, tipoPagamento: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="avista">À vista</SelectItem>
                        <SelectItem value="parcelado">Parcelado</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground mt-1">Escolha "Parcelado" para dividir o valor em várias parcelas. O sistema criará automaticamente as próximas parcelas na fatura do cartão.</p>
                  </div>
                )}
                {formData.categoria === 'cartao' && formData.tipoPagamento === 'parcelado' && (
                  <>
                    <div>
                      <Label htmlFor="numeroParcelas">Número de Parcelas</Label>
                      <Input
                        id="numeroParcelas"
                        type="number"
                        min={2}
                        value={String(formData.numeroParcelas)}
                        onChange={(e) => setFormData({ ...formData, numeroParcelas: Number(e.target.value) })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="parcelaAtual">Parcela Atual</Label>
                      <Input
                        id="parcelaAtual"
                        type="number"
                        min={1}
                        max={Number(formData.numeroParcelas) || 1}
                        value={String(formData.parcelaAtual)}
                        onChange={(e) => setFormData({ ...formData, parcelaAtual: Number(e.target.value) })}
                      />
                    </div>
                  </>
                )}
                {formData.categoria === 'cartao' && formData.tipoPagamento === 'parcelado' && (
                  <p className="text-sm text-muted-foreground md:col-span-2">Os lançamentos das próximas parcelas serão criados automaticamente no cartão selecionado.</p>
                )}
                <div className="md:col-span-2">
                  <Label htmlFor="motivo">Motivo / Descrição</Label>
                  <Input
                    id="motivo"
                    type="text"
                    placeholder="Ex: Supermercado, Aluguel, Netflix"
                    value={formData.motivo}
                    onChange={(e) => setFormData({ ...formData, motivo: e.target.value })}
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="w-full">Cadastrar Despesa</Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {mesesOrdenados.map(mes => {
            const dividasDoMes = dividasPorMes[mes];
            const totalMes = dividasDoMes.reduce((sum, d) => sum + d.valor, 0);
            const pagas = dividasDoMes.filter(d => d.status === 'paga').length;
            const abertas = dividasDoMes.filter(d => d.status === 'aberta').length;

            return (
              <Card key={mes}>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>
                      {(() => {
                        const [ano, mesNum] = mes.split('-').map(Number);
                        const data = new Date(ano, mesNum - 1, 1); // mês começa em 0
                        return data.toLocaleDateString('pt-BR', { year: 'numeric', month: 'long' });
                      })()}
                    </CardTitle>
                    <div className="text-right">
                      <div className="text-lg font-bold text-red-600">
                        Total: R$ {totalMes.toFixed(2)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {pagas} pagas | {abertas} abertas
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {dividasDoMes.map(divida => (
                      <div
                        key={divida.id}
                        className={`flex justify-between items-center p-3 border rounded-md ${divida.status === 'paga' ? 'border-green-600 bg-green-50 dark:bg-green-950/20' : 'border-border'
                          }`}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-foreground">{divida.motivo}</p>
                            <div className="flex items-center gap-2">
                              <span className="text-xs px-2 py-1 rounded-full bg-secondary text-secondary-foreground">
                                {categoriasLabels[divida.categoria]}
                              </span>
                              {divida.parcelamentoId && (
                                <span className="text-xs px-2 py-1 rounded-full bg-accent text-accent-foreground">Parcelado</span>
                              )}
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {new Date(divida.data).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <p className="text-lg font-semibold text-red-600">
                            R$ {divida.valor.toFixed(2)}
                          </p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={async () => {
                              await updateDivida(divida.id, {
                                status: divida.status === 'paga' ? 'aberta' : 'paga'
                              });
                              toast.success(divida.status === 'paga' ? 'Marcada como aberta' : 'Marcada como paga');
                            }}
                          >
                            {divida.status === 'paga' ? (
                              <CheckCircle className="w-5 h-5 text-green-600" />
                            ) : (
                              <Circle className="w-5 h-5 text-muted-foreground" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={async () => {
                              await deleteDivida(divida.id);
                              toast.success('Despesa removida');
                            }}
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
