import { useState } from 'react';
import { useFinanceData } from '@/hooks/useFinanceData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Pencil, Repeat2, Save, Trash2, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import type { Renda } from '@/types/finance';

export default function Rendas() {
  const { rendas, addRenda, updateRenda, deleteRenda } = useFinanceData();
  const [formData, setFormData] = useState({
    mes: new Date().toISOString().slice(0, 7),
    valor: '',
    origem: '',
    data: new Date().toISOString().slice(0, 10),
    isRecurring: false,
    recurrenceMonths: 12,
  });
  const [editing, setEditing] = useState<Renda | null>(null);
  const [editForm, setEditForm] = useState({ origem: '', valor: '', futureOnly: true });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.valor || !formData.origem) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }
    await addRenda({
      mes: formData.mes,
      valor: parseFloat(formData.valor),
      origem: formData.origem,
      data: formData.data,
      isRecurring: formData.isRecurring,
      recurrenceMonths: formData.isRecurring ? formData.recurrenceMonths : undefined,
    });
    toast.success(formData.isRecurring ? 'Rendas recorrentes cadastradas com sucesso!' : 'Renda cadastrada com sucesso!');
    setFormData({
      mes: formData.mes,
      valor: '',
      origem: '',
      data: new Date().toISOString().slice(0, 10),
      isRecurring: formData.isRecurring,
      recurrenceMonths: formData.recurrenceMonths,
    });
  };

  const startEdit = (renda: Renda) => {
    setEditing(renda);
    setEditForm({ origem: renda.origem, valor: String(renda.valor), futureOnly: Boolean(renda.isRecurring) });
  };

  const handleEdit = async () => {
    if (!editing) return;
    await updateRenda(editing.id, {
      origem: editForm.origem,
      valor: Number(editForm.valor),
      futureOnly: editForm.futureOnly,
    });
    toast.success(editForm.futureOnly && editing.isRecurring ? 'Rendas futuras atualizadas' : 'Renda atualizada');
    setEditing(null);
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

        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Repeat2 className="h-5 w-5 text-primary" />
              Cadastrar renda
            </CardTitle>
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
              <div className="flex flex-col gap-3 rounded-md border bg-muted/30 p-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <Label>Renda recorrente</Label>
                  <p className="text-sm text-muted-foreground">Cria lançamentos futuros, ideal para salário.</p>
                </div>
                <div className="flex items-center gap-3">
                  {formData.isRecurring && (
                    <Input
                      className="w-24"
                      type="number"
                      min={1}
                      max={120}
                      value={formData.recurrenceMonths}
                      onChange={(e) => setFormData({ ...formData, recurrenceMonths: Number(e.target.value) })}
                    />
                  )}
                  <Switch
                    checked={formData.isRecurring}
                    onCheckedChange={(checked) => setFormData({ ...formData, isRecurring: checked })}
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
                        className="flex flex-col gap-3 rounded-md border border-border p-3 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-medium text-foreground">{renda.origem}</p>
                            {renda.isRecurring && <Badge variant="secondary">recorrente</Badge>}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {new Date(renda.data).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <p className="text-lg font-semibold text-green-600">
                            R$ {renda.valor.toFixed(2)}
                          </p>
                          <Button variant="ghost" size="sm" onClick={() => startEdit(renda)}>
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={async () => {
                              await deleteRenda(renda.id);
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

      {editing && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-lg">Editar renda</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Origem</Label>
                <Input value={editForm.origem} onChange={(e) => setEditForm({ ...editForm, origem: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Valor</Label>
                <Input type="number" step="0.01" value={editForm.valor} onChange={(e) => setEditForm({ ...editForm, valor: e.target.value })} />
              </div>
              {editing.isRecurring && (
                <div className="flex items-center justify-between rounded-md border p-3">
                  <div>
                    <Label>Editar apenas futuras</Label>
                    <p className="text-sm text-muted-foreground">Mantém os meses anteriores como histórico.</p>
                  </div>
                  <Switch checked={editForm.futureOnly} onCheckedChange={(checked) => setEditForm({ ...editForm, futureOnly: checked })} />
                </div>
              )}
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditing(null)}>
                  <X className="mr-2 h-4 w-4" />
                  Cancelar
                </Button>
                <Button onClick={handleEdit}>
                  <Save className="mr-2 h-4 w-4" />
                  Salvar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
