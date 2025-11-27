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
  const { dividas, addDivida, updateDivida, deleteDivida } = useFinanceData();
  const [formData, setFormData] = useState({
    mes: new Date().toISOString().slice(0, 7),
    valor: '',
    motivo: '',
    categoria: 'variavel' as 'cartao' | 'fixa' | 'variavel' | 'outro',
    data: new Date().toISOString().slice(0, 10),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.valor || !formData.motivo) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }
    addDivida({
      mes: formData.mes,
      valor: parseFloat(formData.valor),
      motivo: formData.motivo,
      categoria: formData.categoria,
      data: formData.data,
      status: 'aberta',
    });
    toast.success('Despesa cadastrada com sucesso!');
    setFormData({
      mes: formData.mes,
      valor: '',
      motivo: '',
      categoria: 'variavel',
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
          <Link to="/">
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
                            <span className="text-xs px-2 py-1 rounded-full bg-secondary text-secondary-foreground">
                              {categoriasLabels[divida.categoria]}
                            </span>
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
                            onClick={() => {
                              updateDivida(divida.id, {
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
                            onClick={() => {
                              deleteDivida(divida.id);
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
