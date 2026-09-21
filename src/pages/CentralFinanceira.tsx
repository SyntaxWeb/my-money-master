import { useEffect, useMemo, useState } from "react";
import { apiRequest } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Bot, Landmark, PiggyBank, Plus, Receipt, Target, WalletCards } from "lucide-react";
import { toast } from "sonner";

type Summary = {
  month: string;
  planned: { income: number; expenses: number; surplus: number };
  actual: { income: number; expenses: number; paid_expenses?: number; pending_expenses?: number; surplus: number; committed_percent: number };
  expense_by_category: Record<string, number>;
  emergency_fund: { current_amount: number; minimum_goal: number; target_goal: number; missing_to_minimum: number; minimum_percent: number; target_percent: number };
  debts: Array<{ id: number; name: string; remaining_installments: number; nominal_balance: number; total_saved: number }>;
  goals: Array<{ id: number; name: string; current_amount: number; target_amount: number; percent: number; missing_amount: number }>;
  net_worth: { accounts: number; emergency_fund: number; debts: number; total: number };
};

const money = (value = 0) => value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const today = () => new Date().toISOString().slice(0, 10);
const month = () => new Date().toISOString().slice(0, 7);

export default function CentralFinanceira() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(false);
  const [agentMessage, setAgentMessage] = useState("Como estão minhas finanças?");
  const [agentAnswer, setAgentAnswer] = useState("");
  const [transaction, setTransaction] = useState({
    type: "EXPENSE",
    description: "",
    amount: "",
    transaction_date: today(),
    status: "PAID",
  });
  const [goal, setGoal] = useState({ name: "Patrimônio 50 mil", current_amount: "", target_amount: "50000", target_date: "2027-12-31" });
  const [budget, setBudget] = useState({ month: month(), planned_income: "", planned_fixed_expenses: "", planned_variable_expenses: "" });

  const load = async () => {
    setLoading(true);
    try {
      setSummary(await apiRequest<Summary>(`/finance/summary?month=${budget.month || month()}`));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao carregar central financeira");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const debt = summary?.debts[0];
  const categories = useMemo(() => Object.entries(summary?.expense_by_category ?? {}).slice(0, 5), [summary]);

  const createTransaction = async () => {
    await apiRequest("/finance/transactions", "POST", {
      ...transaction,
      amount: Number(transaction.amount),
      source: "MANUAL",
    });
    setTransaction((current) => ({ ...current, description: "", amount: "" }));
    toast.success("Transação registrada");
    await load();
  };

  const saveBudget = async () => {
    await apiRequest("/finance/monthly-budgets", "POST", {
      month: budget.month,
      planned_income: Number(budget.planned_income || 0),
      planned_fixed_expenses: Number(budget.planned_fixed_expenses || 0),
      planned_variable_expenses: Number(budget.planned_variable_expenses || 0),
    });
    toast.success("Orçamento salvo");
    await load();
  };

  const createGoal = async () => {
    await apiRequest("/finance/goals", "POST", {
      ...goal,
      current_amount: Number(goal.current_amount || 0),
      target_amount: Number(goal.target_amount || 0),
      type: "WEALTH",
    });
    toast.success("Meta criada");
    await load();
  };

  const askAgent = async () => {
    const response = await apiRequest<{ answer: string }>("/finance/agent", "POST", { message: agentMessage });
    setAgentAnswer(response.answer);
  };

  return (
    <div className="min-h-screen bg-background px-3 py-4 md:px-8">
      <div className="mx-auto max-w-7xl space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-normal">Central financeira</h1>
            <p className="text-sm text-muted-foreground">Dados oficiais vêm do backend; o agente só interpreta os cálculos.</p>
          </div>
          <Input className="w-full sm:w-40" type="month" value={budget.month} onChange={(event) => setBudget({ ...budget, month: event.target.value })} onBlur={load} />
        </div>

        <div className="grid gap-3 md:grid-cols-4">
          <Metric icon={WalletCards} title="Receitas realizadas" value={money(summary?.actual.income)} />
          <Metric icon={Receipt} title="Despesas registradas" value={money(summary?.actual.expenses)} />
          <Metric icon={PiggyBank} title="Sobra real" value={money(summary?.actual.surplus)} />
          <Metric icon={Landmark} title="Patrimônio líquido" value={money(summary?.net_worth.total)} />
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2 text-base"><PiggyBank className="h-4 w-4" /> Reserva</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="text-2xl font-semibold">{money(summary?.emergency_fund.current_amount)}</div>
              <Progress value={Math.min(summary?.emergency_fund.minimum_percent ?? 0, 100)} />
              <p className="text-sm text-muted-foreground">Faltam {money(summary?.emergency_fund.missing_to_minimum)} para R$ 10 mil. Meta final: {money(summary?.emergency_fund.target_goal)}.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Landmark className="h-4 w-4" /> Financiamento</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <div className="font-semibold">{debt?.name ?? "Sem financiamento"}</div>
              <p className="text-sm text-muted-foreground">{debt ? `${debt.remaining_installments} parcelas restantes, saldo nominal ${money(debt.nominal_balance)}.` : "Cadastre uma dívida para acompanhar amortizações."}</p>
              <p className="text-sm text-muted-foreground">Economia em antecipações: {money(debt?.total_saved)}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Target className="h-4 w-4" /> Metas</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {(summary?.goals ?? []).slice(0, 3).map((item) => (
                <div key={item.id} className="space-y-1">
                  <div className="flex justify-between text-sm"><span>{item.name}</span><span>{item.percent}%</span></div>
                  <Progress value={Math.min(item.percent, 100)} />
                </div>
              ))}
              {!summary?.goals.length && <p className="text-sm text-muted-foreground">Nenhuma meta cadastrada.</p>}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader><CardTitle className="text-base">Registrar transação</CardTitle></CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              <select className="h-10 rounded-md border bg-background px-3 text-sm" value={transaction.type} onChange={(event) => setTransaction({ ...transaction, type: event.target.value })}>
                <option value="EXPENSE">Despesa</option>
                <option value="INCOME">Receita</option>
                <option value="TRANSFER">Transferência</option>
              </select>
              <Input placeholder="Valor" inputMode="decimal" value={transaction.amount} onChange={(event) => setTransaction({ ...transaction, amount: event.target.value })} />
              <Input className="sm:col-span-2" placeholder="Descrição" value={transaction.description} onChange={(event) => setTransaction({ ...transaction, description: event.target.value })} />
              <Input type="date" value={transaction.transaction_date} onChange={(event) => setTransaction({ ...transaction, transaction_date: event.target.value })} />
              <Button onClick={createTransaction} disabled={!transaction.description || !transaction.amount}><Plus className="mr-2 h-4 w-4" /> Salvar</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Orçamento previsto</CardTitle></CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              <Input placeholder="Renda prevista" inputMode="decimal" value={budget.planned_income} onChange={(event) => setBudget({ ...budget, planned_income: event.target.value })} />
              <Input placeholder="Despesas fixas" inputMode="decimal" value={budget.planned_fixed_expenses} onChange={(event) => setBudget({ ...budget, planned_fixed_expenses: event.target.value })} />
              <Input placeholder="Despesas variáveis" inputMode="decimal" value={budget.planned_variable_expenses} onChange={(event) => setBudget({ ...budget, planned_variable_expenses: event.target.value })} />
              <Button onClick={saveBudget}>Salvar previsto</Button>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader><CardTitle className="text-base">Nova meta</CardTitle></CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              <Input placeholder="Nome" value={goal.name} onChange={(event) => setGoal({ ...goal, name: event.target.value })} />
              <Input placeholder="Valor atual" value={goal.current_amount} onChange={(event) => setGoal({ ...goal, current_amount: event.target.value })} />
              <Input placeholder="Meta" value={goal.target_amount} onChange={(event) => setGoal({ ...goal, target_amount: event.target.value })} />
              <Input type="date" value={goal.target_date} onChange={(event) => setGoal({ ...goal, target_date: event.target.value })} />
              <Button className="sm:col-span-2" onClick={createGoal}>Criar meta</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Bot className="h-4 w-4" /> Agente financeiro</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <Textarea value={agentMessage} onChange={(event) => setAgentMessage(event.target.value)} />
              <Button onClick={askAgent} disabled={loading}>Perguntar</Button>
              {agentAnswer && <div className="rounded-md border bg-muted/30 p-3 text-sm">{agentAnswer}</div>}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader><CardTitle className="text-base">Maiores categorias no mês</CardTitle></CardHeader>
          <CardContent className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
            {categories.map(([name, value]) => <div key={name} className="rounded-md border p-3"><div className="text-sm text-muted-foreground">{name}</div><div className="font-semibold">{money(value)}</div></div>)}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Metric({ icon: Icon, title, value }: { icon: typeof WalletCards; title: string; value: string }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <div className="rounded-md bg-primary/10 p-2 text-primary"><Icon className="h-5 w-5" /></div>
        <div>
          <div className="text-xs text-muted-foreground">{title}</div>
          <div className="text-lg font-semibold">{value}</div>
        </div>
      </CardContent>
    </Card>
  );
}
