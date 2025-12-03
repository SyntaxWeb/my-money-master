import React, { useState } from 'react';
import { useFinanceData } from '@/hooks/useFinanceData';
import { useToast } from '@/hooks/use-toast';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export const CofrinhoPanel: React.FC = () => {
  const {
    cofrinhos,
    addCofrinho,
    deleteCofrinho,
    depositToCofrinho,
    withdrawFromCofrinho,
    getMesesDisponiveis,
    getBalancoMensal,
  } = useFinanceData();

  const mesesDisponiveis = getMesesDisponiveis();
  const [mesSelecionado, setMesSelecionado] = useState(mesesDisponiveis[0] || new Date().toISOString().slice(0, 7));

  const { toast } = useToast();
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [valorInicial, setValorInicial] = useState<number | ''>('');

  const [depositValues, setDepositValues] = useState<Record<string, number>>({});
  const [withdrawValues, setWithdrawValues] = useState<Record<string, number>>({});

  const handleCreate = async () => {
    if (!nome) return;
    const initial = Number(valorInicial || 0);
    const created = await addCofrinho({ nome, descricao, saldo: 0 }, initial, mesSelecionado);
    if (initial > 0 && !created) {
      toast({ title: 'Saldo insuficiente', description: 'Depósito inicial não realizado: saldo do mês insuficiente.' });
    } else if (initial > 0 && created) {
      toast({ title: 'Cofrinho criado', description: 'Depósito inicial realizado com sucesso.' });
    } else {
      toast({ title: 'Cofrinho criado', description: 'Cofrinho criado sem depósito inicial.' });
    }
    setNome('');
    setDescricao('');
    setValorInicial('');
  };

  const handleDeposit = async (id: string) => {
    const amount = Number(depositValues[id] || 0);
    if (!amount || amount <= 0) return;
    const ok = await depositToCofrinho(id, amount, mesSelecionado);
    if (!ok) {
      toast({ title: 'Saldo insuficiente', description: 'Saldo do mês insuficiente para este depósito.' });
      return;
    }
    toast({ title: 'Depósito realizado', description: `R$ ${amount.toFixed(2)} transferido para o cofrinho.` });
    setDepositValues({ ...depositValues, [id]: 0 });
  };

  const handleWithdraw = async (id: string) => {
    const amount = Number(withdrawValues[id] || 0);
    if (!amount || amount <= 0) return;
    // Handle withdraw success/failure
    const c = cofrinhos.find(x => x.id === id);
    if (!c) return;
    if (amount > c.saldo) {
      toast({ title: 'Saldo insuficiente', description: 'Saldo do cofrinho insuficiente para esta retirada.' });
      return;
    }
    await withdrawFromCofrinho(id, amount, mesSelecionado);
    toast({ title: 'Retirada realizada', description: `R$ ${amount.toFixed(2)} adicionado ao mês ${mesSelecionado}.` });
    setWithdrawValues({ ...withdrawValues, [id]: 0 });
  };

  return (
    <Card className="min-w-0">
      <CardHeader>
        <CardTitle>Cofrinhos</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 items-center mb-3">
          <label htmlFor="mes-select-cofrinho" className="text-sm font-medium text-foreground">Mês:</label>
          <select id="mes-select-cofrinho" value={mesSelecionado}
            onChange={(e) => setMesSelecionado(e.target.value)}
            className="px-3 py-2 border border-border rounded-md bg-background text-foreground w-full sm:w-auto">
            {mesesDisponiveis.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2 mb-3">
          <div className="flex gap-2">
            <Input placeholder="Nome do cofrinho" value={nome} onChange={(e) => setNome(e.target.value)} />
            <Input placeholder="Descrição (opcional)" value={descricao} onChange={(e) => setDescricao(e.target.value)} />
            <Input placeholder="Valor inicial (opc.)" value={String(valorInicial)} onChange={(e) => setValorInicial(e.target.value ? Number(e.target.value) : '')} />
            <Button onClick={handleCreate}>Criar</Button>
          </div>
          <p className="text-xs text-muted-foreground">Ao criar com valor inicial, o valor é deduzido do saldo do mês selecionado.</p>
        </div>

        <div className="space-y-3">
          {cofrinhos.length === 0 && <p className="text-sm text-muted-foreground">Nenhum cofrinho criado ainda.</p>}
          {cofrinhos.map((c) => (
            <div key={c.id} className="border rounded-md p-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <div className="font-semibold">{c.nome}</div>
                <div className="text-sm text-muted-foreground">{c.descricao}</div>
                <div className="text-sm mt-1">Saldo: <strong>R$ {Number(c.saldo || 0).toFixed(2)}</strong></div>
              </div>

              <div className="flex gap-2 items-center">
                <input type="number" min="0" step="0.01" className="px-2 py-1 border rounded-md bg-background text-foreground" value={depositValues[c.id] ?? ''} onChange={(e) => setDepositValues({ ...depositValues, [c.id]: Number(e.target.value) })} placeholder="Depositar" />
                <Button disabled={Number(depositValues[c.id] || 0) <= 0 || Number(depositValues[c.id] || 0) > getBalancoMensal(mesSelecionado).saldoMes} onClick={() => handleDeposit(c.id)}>Depositar</Button>

                <input type="number" min="0" step="0.01" className="px-2 py-1 border rounded-md bg-background text-foreground" value={withdrawValues[c.id] ?? ''} onChange={(e) => setWithdrawValues({ ...withdrawValues, [c.id]: Number(e.target.value) })} placeholder="Retirar" />
                <Button onClick={() => handleWithdraw(c.id)}>Retirar</Button>

                <Button variant="destructive" onClick={() => deleteCofrinho(c.id)}>Excluir</Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default CofrinhoPanel;
