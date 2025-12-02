import { useState } from 'react';
import { useFinanceData } from '@/hooks/useFinanceData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

export default function Rendas() {
  const { rendas, addRenda, deleteRenda } = useFinanceData();
  const [formData, setFormData] = useState({
    mes: new Date().toISOString().slice(0, 7),
    valor: '',
    origem: '',
    data: new Date().toISOString().slice(0, 10),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.valor || !formData.origem) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }
    addRenda({
      mes: formData.mes,
      valor: parseFloat(formData.valor),
      origem: formData.origem,
      data: formData.data,
    });
    toast.success('Renda cadastrada com sucesso!');
    setFormData({
      mes: formData.mes,
      valor: '',
      origem: '',
      data: new Date().toISOString().slice(0, 10),
    });
  };

  const rendasPorMes = rendas.reduce((acc, renda) => {
    if (!acc[renda.mes]) acc[renda.mes] = [];
    acc[renda.mes].push(renda);
    return acc;
  }, {} as Record<string, typeof rendas>);

  const mesesOrdenados = Object.keys(rendasPorMes).sort().reverse();

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Link to="/app">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-foreground">Gerenciar Rendas</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Cadastrar Nova Renda</CardTitle>
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
                  <Label htmlFor="data">Data de Recebimento</Label>
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
                  <Label htmlFor="origem">Origem</Label>
                  <Input
                    id="origem"
                    type="text"
                    placeholder="Ex: Salário, Freelance, Extra"
                    value={formData.origem}
                    onChange={(e) => setFormData({ ...formData, origem: e.target.value })}
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="w-full">Cadastrar Renda</Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {mesesOrdenados.map(mes => {
            const rendasDoMes = rendasPorMes[mes];
            const totalMes = rendasDoMes.reduce((sum, r) => sum + r.valor, 0);

            return (
              <Card key={mes}>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>
                      {(() => {
                        const [ano, mesNum] = mes.split('-').map(Number);
                        const data = new Date(ano, mesNum - 1, 1);
                        return data.toLocaleDateString('pt-BR', { year: 'numeric', month: 'long' });
                      })()}
                    </CardTitle>
                    <div className="text-lg font-bold text-green-600">
                      Total: R$ {totalMes.toFixed(2)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {rendasDoMes.map(renda => (
                      <div
                        key={renda.id}
                        className="flex justify-between items-center p-3 border border-border rounded-md"
                      >
                        <div>
                          <p className="font-medium text-foreground">{renda.origem}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(renda.data).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <p className="text-lg font-semibold text-green-600">
                            R$ {renda.valor.toFixed(2)}
                          </p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              deleteRenda(renda.id);
                              toast.success('Renda removida');
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
