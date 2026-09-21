import React, { useState } from 'react';
import { useFinanceData } from '@/hooks/useFinanceData';
import { useToast } from '@/hooks/use-toast';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { ArrowDownCircle, ArrowUpCircle } from 'lucide-react';

export const CofrinhoPanel: React.FC = () => {
  const {
    cofrinhos,
    addCofrinho,
    deleteCofrinho,
    depositToCofrinho,
    withdrawFromCofrinho,
    getMesesDisponiveis,
  } = useFinanceData();

  const mesesDisponiveis = getMesesDisponiveis();
  const [mesSelecionado, setMesSelecionado] = useState(mesesDisponiveis[0] || new Date().toISOString().slice(0, 7));

  const { toast } = useToast();
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [tipo, setTipo] = useState<'GENERAL' | 'EMERGENCY_FUND' | 'PREPAYMENT_FUND'>('GENERAL');
  const [valorInicial, setValorInicial] = useState('');

  const [depositValues, setDepositValues] = useState<Record<string, string>>({});
  const [withdrawValues, setWithdrawValues] = useState<Record<string, string>>({});

  const parseMoney = (value: string | number | undefined) => {
    if (value === undefined || value === '') return 0;
    if (typeof value === 'number') return value;
    const normalized = value
      .trim()
      .replace(/\s/g, '')
      .replace(/\./g, '')
      .replace(',', '.');
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : 0;
  };

  const formatMoney = (value: number) =>
    value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const formatDate = (value: string) =>
    new Date(value).toLocaleDateString('pt-BR', { timeZone: 'UTC' });

  const handleCreate = async () => {
    if (!nome) return;
    const initial = parseMoney(valorInicial);
    const created = await addCofrinho({ nome, descricao, type: tipo, saldo: 0 }, initial, mesSelecionado);
    if (initial > 0 && !created) {
      toast({ title: 'Saldo insuficiente', description: 'Depósito inicial não realizado: saldo do mês insuficiente.' });
    } else if (initial > 0 && created) {
      toast({ title: 'Cofrinho criado', description: 'Depósito inicial realizado com sucesso.' });
    } else {
      toast({ title: 'Cofrinho criado', description: 'Cofrinho criado sem depósito inicial.' });
    }
    setNome('');
    setDescricao('');
    setTipo('GENERAL');
    setValorInicial('');
  };

  const handleDeposit = async (id: string) => {
    const amount = parseMoney(depositValues[id]);
    if (!amount || amount <= 0) return;
    const ok = await depositToCofrinho(id, amount, mesSelecionado);
    if (!ok) {
      toast({ title: 'Depósito não realizado', description: 'Confira o valor informado e tente novamente.' });
      return;
    }
    toast({ title: 'Depósito realizado', description: `R$ ${amount.toFixed(2)} transferido para o cofrinho.` });
    setDepositValues({ ...depositValues, [id]: '' });
  };

  const handleWithdraw = async (id: string) => {
    const amount = parseMoney(withdrawValues[id]);
    if (!amount || amount <= 0) return;
    // Handle withdraw success/failure
    const c = cofrinhos.find(x => x.id === id);
    if (!c) return;
    if (amount > c.saldo) {
      toast({ title: 'Saldo insuficiente', description: 'Saldo do cofrinho insuficiente para esta retirada.' });
      return;
    }
    await withdrawFromCofrinho(id, amount, mesSelecionado, c.type === 'PREPAYMENT_FUND');
    toast({
      title: c.type === 'PREPAYMENT_FUND' ? 'Amortização registrada' : 'Retirada realizada',
      description: c.type === 'PREPAYMENT_FUND'
        ? `R$ ${amount.toFixed(2)} saiu do fundo e foi registrado como despesa paga.`
        : `R$ ${amount.toFixed(2)} saiu do cofrinho.`,
    });
    setWithdrawValues({ ...withdrawValues, [id]: '' });
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

        <div className="space-y-3 mb-3 rounded-md border bg-muted/20 p-3">
          <div className="grid gap-3 md:grid-cols-4">
            <div className="space-y-1">
              <Label>Nome</Label>
              <Input placeholder="Ex: Fundo de amortização" value={nome} onChange={(e) => setNome(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Tipo</Label>
              <select
                value={tipo}
                onChange={(e) => setTipo(e.target.value as typeof tipo)}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="GENERAL">Cofrinho comum</option>
                <option value="EMERGENCY_FUND">Reserva de emergência</option>
                <option value="PREPAYMENT_FUND">Fundo de amortização</option>
              </select>
            </div>
            <div className="space-y-1">
              <Label>Valor inicial</Label>
              <Input inputMode="decimal" placeholder="0,00" value={valorInicial} onChange={(e) => setValorInicial(e.target.value)} />
            </div>
            <div className="flex items-end">
              <Button className="w-full" onClick={handleCreate}>Criar</Button>
            </div>
            <div className="space-y-1 md:col-span-4">
              <Label>Descrição</Label>
              <Input placeholder="Descrição opcional" value={descricao} onChange={(e) => setDescricao(e.target.value)} />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Aporte em cofrinho é lançado como despesa do mês. Retirada do fundo de amortização também registra despesa paga.</p>
        </div>

        <div className="space-y-3">
          {cofrinhos.length === 0 && <p className="text-sm text-muted-foreground">Nenhum cofrinho criado ainda.</p>}
          {cofrinhos.map((c) => (
            <div key={c.id} className="space-y-3 rounded-md border p-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="font-semibold">{c.nome}</div>
                    {c.type === 'PREPAYMENT_FUND' && <Badge>amortização</Badge>}
                    {c.type === 'EMERGENCY_FUND' && <Badge variant="secondary">reserva</Badge>}
                  </div>
                  <div className="text-sm text-muted-foreground">{c.descricao}</div>
                  <div className="text-sm mt-1">Saldo: <strong>R$ {Number(c.saldo || 0).toFixed(2)}</strong></div>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <input inputMode="decimal" className="px-2 py-1 border rounded-md bg-background text-foreground" value={depositValues[c.id] ?? ''} onChange={(e) => setDepositValues({ ...depositValues, [c.id]: e.target.value })} placeholder="Depositar" />
                  <Button disabled={parseMoney(depositValues[c.id]) <= 0} onClick={() => handleDeposit(c.id)}>Depositar</Button>

                  <input inputMode="decimal" className="px-2 py-1 border rounded-md bg-background text-foreground" value={withdrawValues[c.id] ?? ''} onChange={(e) => setWithdrawValues({ ...withdrawValues, [c.id]: e.target.value })} placeholder="Retirar" />
                  <Button onClick={() => handleWithdraw(c.id)}>
                    {c.type === 'PREPAYMENT_FUND' ? 'Amortizar' : 'Retirar'}
                  </Button>

                  <Button variant="destructive" onClick={() => deleteCofrinho(c.id)}>Excluir</Button>
                </div>
              </div>

              <div className="rounded-md border bg-muted/20">
                <div className="border-b px-3 py-2 text-sm font-medium">Histórico</div>
                <div className="divide-y">
                  {(c.movements ?? []).slice(0, 8).map((movement) => {
                    const isDeposit = movement.type === 'DEPOSIT';
                    const Icon = isDeposit ? ArrowUpCircle : ArrowDownCircle;
                    return (
                      <div key={movement.id} className="grid gap-2 px-3 py-2 text-sm sm:grid-cols-[24px_110px_1fr_auto] sm:items-center">
                        <Icon className={`h-4 w-4 ${isDeposit ? 'text-emerald-500' : 'text-red-500'}`} />
                        <span className="text-muted-foreground">{formatDate(movement.movementDate)}</span>
                        <span className="min-w-0 truncate">{movement.description || (isDeposit ? 'Depósito no cofrinho' : 'Retirada do cofrinho')}</span>
                        <strong className={isDeposit ? 'text-emerald-500' : 'text-red-500'}>
                          {isDeposit ? '+' : '-'} {formatMoney(movement.amount)}
                        </strong>
                      </div>
                    );
                  })}
                  {(c.movements ?? []).length === 0 && (
                    <div className="px-3 py-3 text-sm text-muted-foreground">Nenhuma movimentação registrada ainda.</div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default CofrinhoPanel;
