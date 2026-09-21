import { useEffect, useMemo, useState } from "react";
import { apiRequest } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Banknote, CalendarClock, CheckCircle2, Landmark, Pencil, Percent, Plus, Receipt, Trash2, TrendingDown, X } from "lucide-react";
import { toast } from "sonner";

type Installment = {
  id: number;
  installment_number: number;
  due_date: string;
  nominal_amount: string | number;
  settlement_amount?: string | number | null;
  status: "PENDING" | "PAID" | "PREPAID";
  paid_at?: string | null;
  payment_amount?: string | number | null;
};

type Prepayment = {
  id: number;
  nominal_amount: string | number;
  paid_amount: string | number;
  discount_amount: string | number;
  payment_date: string;
};

type Debt = {
  id: number;
  name: string;
  type: string;
  institution?: string | null;
  original_amount: string | number;
  installment_amount: string | number;
  total_installments: number;
  current_installment: number;
  interest_rate?: string | number | null;
  interest_rate_type?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  status?: string | null;
  installments: Installment[];
  prepayments: Prepayment[];
};

const money = (value: string | number | null | undefined) =>
  Number(value || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const today = () => new Date().toISOString().slice(0, 10);
const month = () => new Date().toISOString().slice(0, 7);

const parseMoney = (value: string) => {
  const normalized = value.trim().replace(/\s/g, "").replace(/\./g, "").replace(",", ".");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
};

const formatMoneyInput = (value: number) =>
  value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const monthsBetween = (fromDate: string, toDate: string) => {
  const [fromYear, fromMonth] = fromDate.slice(0, 7).split("-").map(Number);
  const [toYear, toMonth] = toDate.slice(0, 7).split("-").map(Number);
  return Math.max((toYear - fromYear) * 12 + (toMonth - fromMonth), 0);
};

const estimateSettlement = (debt: Debt, installment: Installment, paymentDate: string) => {
  const nominal = Number(installment.nominal_amount || 0);
  const monthlyRate = Math.max(Number(debt.interest_rate || 0), 0) / 100;
  const monthsAhead = monthsBetween(paymentDate, installment.due_date);

  if (monthlyRate <= 0 || monthsAhead <= 0) {
    return { amount: Number(nominal.toFixed(2)), discount: 0, monthsAhead };
  }

  const amount = Number((nominal / (1 + monthlyRate) ** monthsAhead).toFixed(2));
  return { amount, discount: Number(Math.max(nominal - amount, 0).toFixed(2)), monthsAhead };
};

export default function Financiamentos() {
  const [debts, setDebts] = useState<Debt[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDebtId, setSelectedDebtId] = useState<number | null>(null);
  const [form, setForm] = useState({
    name: "",
    type: "REAL_ESTATE",
    institution: "",
    original_amount: "",
    installment_amount: "",
    total_installments: "360",
    current_installment: "1",
    interest_rate: "",
    interest_rate_type: "CONTRACTUAL",
    start_date: today(),
    status: "ACTIVE",
  });
  const [prepay, setPrepay] = useState({
    installment_number: "",
    paid_amount: "",
    payment_date: today(),
    month: month(),
  });
  const [editingDebtId, setEditingDebtId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    type: "REAL_ESTATE",
    institution: "",
    original_amount: "",
    installment_amount: "",
    total_installments: "1",
    current_installment: "1",
    interest_rate: "",
    interest_rate_type: "CONTRACTUAL",
    start_date: today(),
    status: "ACTIVE",
  });

  const loadDebts = async () => {
    setLoading(true);
    try {
      const data = await apiRequest<Debt[]>("/finance/debts");
      setDebts(data);
      setSelectedDebtId((current) => current ?? data[0]?.id ?? null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao carregar financiamentos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadDebts();
  }, []);

  const selectedDebt = useMemo(
    () => debts.find((debt) => debt.id === selectedDebtId) ?? debts[0],
    [debts, selectedDebtId],
  );
  const selectedInstallment = useMemo(
    () => selectedDebt?.installments.find((item) => item.installment_number === Number(prepay.installment_number)),
    [selectedDebt, prepay.installment_number],
  );
  const settlementEstimate = useMemo(
    () => selectedDebt && selectedInstallment ? estimateSettlement(selectedDebt, selectedInstallment, prepay.payment_date) : null,
    [selectedDebt, selectedInstallment, prepay.payment_date],
  );

  const totals = useMemo(() => {
    const pendingBalance = debts.reduce((sum, debt) => {
      return sum + debt.installments.filter((item) => item.status === "PENDING").reduce((inner, item) => inner + Number(item.nominal_amount || 0), 0);
    }, 0);
    const monthlyCommitment = debts
      .filter((debt) => (debt.status ?? "ACTIVE") === "ACTIVE")
      .reduce((sum, debt) => sum + Number(debt.installment_amount || 0), 0);
    const saved = debts.reduce((sum, debt) => sum + debt.prepayments.reduce((inner, item) => inner + Number(item.discount_amount || 0), 0), 0);
    const remaining = debts.reduce((sum, debt) => sum + debt.installments.filter((item) => item.status === "PENDING").length, 0);
    return { pendingBalance, monthlyCommitment, saved, remaining };
  }, [debts]);

  const createDebt = async () => {
    if (!form.name || !form.original_amount || !form.installment_amount) {
      toast.error("Preencha nome, valor financiado e parcela");
      return;
    }

    await apiRequest("/finance/debts", "POST", {
      ...form,
      original_amount: parseMoney(form.original_amount),
      installment_amount: parseMoney(form.installment_amount),
      total_installments: Number(form.total_installments || 1),
      current_installment: Number(form.current_installment || 1),
      interest_rate: form.interest_rate ? Number(form.interest_rate.replace(",", ".")) : null,
    });

    toast.success("Financiamento cadastrado");
    setForm((current) => ({ ...current, name: "", institution: "", original_amount: "", installment_amount: "", interest_rate: "" }));
    await loadDebts();
  };

  const startEdit = (debt: Debt) => {
    setEditingDebtId(debt.id);
    setEditForm({
      name: debt.name,
      type: debt.type || "REAL_ESTATE",
      institution: debt.institution || "",
      original_amount: formatMoneyInput(Number(debt.original_amount || 0)),
      installment_amount: formatMoneyInput(Number(debt.installment_amount || 0)),
      total_installments: String(debt.total_installments || 1),
      current_installment: String(debt.current_installment || 1),
      interest_rate: debt.interest_rate !== null && debt.interest_rate !== undefined ? String(debt.interest_rate).replace(".", ",") : "",
      interest_rate_type: debt.interest_rate_type || "CONTRACTUAL",
      start_date: debt.start_date?.slice(0, 10) || today(),
      status: debt.status || "ACTIVE",
    });
  };

  const cancelEdit = () => {
    setEditingDebtId(null);
    setEditForm({
      name: "",
      type: "REAL_ESTATE",
      institution: "",
      original_amount: "",
      installment_amount: "",
      total_installments: "1",
      current_installment: "1",
      interest_rate: "",
      interest_rate_type: "CONTRACTUAL",
      start_date: today(),
      status: "ACTIVE",
    });
  };

  const saveEdit = async () => {
    if (!editingDebtId || !editForm.name || !editForm.original_amount || !editForm.installment_amount) {
      toast.error("Preencha nome, valor financiado e parcela");
      return;
    }

    const updated = await apiRequest<Debt>(`/finance/debts/${editingDebtId}`, "PATCH", {
      ...editForm,
      original_amount: parseMoney(editForm.original_amount),
      installment_amount: parseMoney(editForm.installment_amount),
      total_installments: Number(editForm.total_installments || 1),
      current_installment: Number(editForm.current_installment || 1),
      interest_rate: editForm.interest_rate ? Number(editForm.interest_rate.replace(",", ".")) : null,
    });

    setDebts((current) => current.map((debt) => (debt.id === editingDebtId ? updated : debt)));
    toast.success("Financiamento atualizado");
    cancelEdit();
  };

  const deleteDebt = async (debt: Debt) => {
    const confirmed = window.confirm(`Excluir o financiamento "${debt.name}" e todas as parcelas/amortizações vinculadas?`);
    if (!confirmed) return;

    await apiRequest(`/finance/debts/${debt.id}`, "DELETE");
    setDebts((current) => current.filter((item) => item.id !== debt.id));
    setSelectedDebtId((current) => (current === debt.id ? null : current));
    cancelEdit();
    toast.success("Financiamento excluído");
  };

  const registerPrepayment = async () => {
    const paidAmount = prepay.paid_amount ? parseMoney(prepay.paid_amount) : settlementEstimate?.amount ?? 0;
    if (!selectedDebt || !prepay.installment_number || paidAmount <= 0) {
      toast.error("Selecione a parcela para calcular a amortização");
      return;
    }

    const result = await apiRequest<{ debt: Debt }>(`/finance/debts/${selectedDebt.id}/prepayments`, "POST", {
      installment_number: Number(prepay.installment_number),
      paid_amount: Number(paidAmount.toFixed(2)),
      payment_date: prepay.payment_date,
      month: prepay.month,
      register_expense: true,
    });

    toast.success("Amortização registrada como despesa paga");
    setDebts((current) => current.map((debt) => (debt.id === selectedDebt.id ? result.debt : debt)));
    setPrepay({ installment_number: "", paid_amount: "", payment_date: today(), month: month() });
  };

  const selectedProgress = selectedDebt
    ? Math.min(((selectedDebt.installments.length - selectedDebt.installments.filter((item) => item.status === "PENDING").length) / selectedDebt.total_installments) * 100, 100)
    : 0;

  return (
    <div className="min-h-screen bg-background px-3 py-4 md:px-8">
      <div className="mx-auto max-w-7xl space-y-5">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold tracking-normal">Financiamentos</h1>
          <p className="text-sm text-muted-foreground">Acompanhe saldo nominal, parcelas futuras, amortizações e economia por antecipação.</p>
        </div>

        <div className="grid gap-3 md:grid-cols-4">
          <Metric icon={Landmark} title="Saldo em aberto" value={money(totals.pendingBalance)} />
          <Metric icon={Receipt} title="Compromisso mensal" value={money(totals.monthlyCommitment)} />
          <Metric icon={TrendingDown} title="Economia gerada" value={money(totals.saved)} />
          <Metric icon={CalendarClock} title="Parcelas restantes" value={String(totals.remaining)} />
        </div>

        <div className="grid gap-4 xl:grid-cols-[420px_1fr]">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base"><Plus className="h-4 w-4" /> Novo financiamento</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1 sm:col-span-2">
                <Label>Nome</Label>
                <Input placeholder="Ex: Apartamento, veículo, terreno" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
              </div>
              <div className="space-y-1">
                <Label>Tipo</Label>
                <Select value={form.type} onValueChange={(value) => setForm({ ...form, type: value })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="REAL_ESTATE">Imobiliário</SelectItem>
                    <SelectItem value="VEHICLE">Veículo</SelectItem>
                    <SelectItem value="PERSONAL">Pessoal</SelectItem>
                    <SelectItem value="OTHER">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Instituição</Label>
                <Input placeholder="Banco" value={form.institution} onChange={(event) => setForm({ ...form, institution: event.target.value })} />
              </div>
              <div className="space-y-1">
                <Label>Valor financiado</Label>
                <Input inputMode="decimal" placeholder="250.000,00" value={form.original_amount} onChange={(event) => setForm({ ...form, original_amount: event.target.value })} />
              </div>
              <div className="space-y-1">
                <Label>Valor da parcela</Label>
                <Input inputMode="decimal" placeholder="1.850,00" value={form.installment_amount} onChange={(event) => setForm({ ...form, installment_amount: event.target.value })} />
              </div>
              <div className="space-y-1">
                <Label>Total de parcelas</Label>
                <Input type="number" min={1} value={form.total_installments} onChange={(event) => setForm({ ...form, total_installments: event.target.value })} />
              </div>
              <div className="space-y-1">
                <Label>Parcela atual</Label>
                <Input type="number" min={1} value={form.current_installment} onChange={(event) => setForm({ ...form, current_installment: event.target.value })} />
              </div>
              <div className="space-y-1">
                <Label>Taxa mensal (%)</Label>
                <Input inputMode="decimal" placeholder="0,85" value={form.interest_rate} onChange={(event) => setForm({ ...form, interest_rate: event.target.value })} />
              </div>
              <div className="space-y-1">
                <Label>Início</Label>
                <Input type="date" value={form.start_date} onChange={(event) => setForm({ ...form, start_date: event.target.value })} />
              </div>
              <Button className="sm:col-span-2" onClick={createDebt} disabled={loading}>Cadastrar financiamento</Button>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base"><Banknote className="h-4 w-4" /> Carteira de financiamentos</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3 lg:grid-cols-2">
                {debts.map((debt) => {
                  const remaining = debt.installments.filter((item) => item.status === "PENDING").length;
                  const balance = debt.installments.filter((item) => item.status === "PENDING").reduce((sum, item) => sum + Number(item.nominal_amount || 0), 0);
                  return (
                    <button
                      key={debt.id}
                      type="button"
                      onClick={() => setSelectedDebtId(debt.id)}
                      className={`rounded-md border p-4 text-left transition hover:border-primary ${selectedDebt?.id === debt.id ? "border-primary bg-primary/5" : "bg-card"}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="font-semibold">{debt.name}</div>
                          <div className="text-sm text-muted-foreground">{debt.institution || "Sem instituição"}</div>
                        </div>
                        <Badge variant={remaining > 0 ? "secondary" : "default"}>{remaining > 0 ? "ativo" : "quitado"}</Badge>
                      </div>
                      <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                        <span>Saldo: <strong>{money(balance)}</strong></span>
                        <span>Parcela: <strong>{money(debt.installment_amount)}</strong></span>
                      </div>
                    </button>
                  );
                })}
                {!debts.length && <p className="text-sm text-muted-foreground">Nenhum financiamento cadastrado ainda.</p>}
              </CardContent>
            </Card>

            {selectedDebt && (
              <Card>
                <CardHeader>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <CardTitle className="flex items-center gap-2 text-base"><Percent className="h-4 w-4" /> Detalhes e amortização</CardTitle>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="gap-2" onClick={() => startEdit(selectedDebt)}>
                        <Pencil className="h-4 w-4" /> Editar
                      </Button>
                      <Button variant="destructive" size="sm" className="gap-2" onClick={() => deleteDebt(selectedDebt)}>
                        <Trash2 className="h-4 w-4" /> Excluir
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {editingDebtId === selectedDebt.id && (
                    <div className="grid gap-3 rounded-md border bg-muted/20 p-3 sm:grid-cols-2 lg:grid-cols-4">
                      <div className="space-y-1 sm:col-span-2">
                        <Label>Nome</Label>
                        <Input value={editForm.name} onChange={(event) => setEditForm({ ...editForm, name: event.target.value })} />
                      </div>
                      <div className="space-y-1">
                        <Label>Tipo</Label>
                        <Select value={editForm.type} onValueChange={(value) => setEditForm({ ...editForm, type: value })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="REAL_ESTATE">Imobiliário</SelectItem>
                            <SelectItem value="VEHICLE">Veículo</SelectItem>
                            <SelectItem value="PERSONAL">Pessoal</SelectItem>
                            <SelectItem value="OTHER">Outro</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label>Status</Label>
                        <Select value={editForm.status} onValueChange={(value) => setEditForm({ ...editForm, status: value })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ACTIVE">Ativo</SelectItem>
                            <SelectItem value="PAUSED">Pausado</SelectItem>
                            <SelectItem value="SETTLED">Quitado</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label>Instituição</Label>
                        <Input value={editForm.institution} onChange={(event) => setEditForm({ ...editForm, institution: event.target.value })} />
                      </div>
                      <div className="space-y-1">
                        <Label>Valor financiado</Label>
                        <Input inputMode="decimal" value={editForm.original_amount} onChange={(event) => setEditForm({ ...editForm, original_amount: event.target.value })} />
                      </div>
                      <div className="space-y-1">
                        <Label>Valor da parcela</Label>
                        <Input inputMode="decimal" value={editForm.installment_amount} onChange={(event) => setEditForm({ ...editForm, installment_amount: event.target.value })} />
                      </div>
                      <div className="space-y-1">
                        <Label>Total de parcelas</Label>
                        <Input type="number" min={1} value={editForm.total_installments} onChange={(event) => setEditForm({ ...editForm, total_installments: event.target.value })} />
                      </div>
                      <div className="space-y-1">
                        <Label>Parcela atual</Label>
                        <Input type="number" min={1} value={editForm.current_installment} onChange={(event) => setEditForm({ ...editForm, current_installment: event.target.value })} />
                      </div>
                      <div className="space-y-1">
                        <Label>Taxa mensal (%)</Label>
                        <Input inputMode="decimal" value={editForm.interest_rate} onChange={(event) => setEditForm({ ...editForm, interest_rate: event.target.value })} />
                      </div>
                      <div className="space-y-1">
                        <Label>Início</Label>
                        <Input type="date" value={editForm.start_date} onChange={(event) => setEditForm({ ...editForm, start_date: event.target.value })} />
                      </div>
                      <div className="flex gap-2 lg:col-span-4">
                        <Button className="gap-2" onClick={saveEdit}><CheckCircle2 className="h-4 w-4" /> Salvar alterações</Button>
                        <Button variant="outline" className="gap-2" onClick={cancelEdit}><X className="h-4 w-4" /> Cancelar</Button>
                      </div>
                      {selectedDebt.prepayments.length > 0 && (
                        <p className="text-xs text-muted-foreground lg:col-span-4">
                          Este financiamento já tem amortizações registradas. Alterações em parcelas não regeneram a grade para preservar o histórico.
                        </p>
                      )}
                    </div>
                  )}
                  <div className="grid gap-3 md:grid-cols-3">
                    <div>
                      <div className="text-xs text-muted-foreground">Financiamento</div>
                      <div className="font-semibold">{selectedDebt.name}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Taxa informada</div>
                      <div className="font-semibold">{Number(selectedDebt.interest_rate || 0).toLocaleString("pt-BR")}% ao mês</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Progresso</div>
                      <div className="font-semibold">{selectedProgress.toFixed(1)}%</div>
                    </div>
                  </div>
                  <Progress value={selectedProgress} />

                  <div className="grid gap-3 rounded-md border bg-muted/20 p-3 md:grid-cols-4">
                    <div className="space-y-1">
                      <Label>Parcela</Label>
                      <Select
                        value={prepay.installment_number}
                        onValueChange={(value) => {
                          const installment = selectedDebt.installments.find((item) => item.installment_number === Number(value));
                          const estimate = installment ? estimateSettlement(selectedDebt, installment, prepay.payment_date) : null;
                          setPrepay({ ...prepay, installment_number: value, paid_amount: estimate ? formatMoneyInput(estimate.amount) : "" });
                        }}
                      >
                        <SelectTrigger><SelectValue placeholder="Selecionar" /></SelectTrigger>
                        <SelectContent>
                          {selectedDebt.installments
                            .filter((item) => item.status === "PENDING")
                            .sort((a, b) => a.installment_number - b.installment_number)
                            .map((item) => (
                            <SelectItem key={item.id} value={String(item.installment_number)}>
                              {item.installment_number} - {money(item.nominal_amount)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label>Valor para amortizar</Label>
                      <Input inputMode="decimal" placeholder={settlementEstimate ? formatMoneyInput(settlementEstimate.amount) : "0,00"} value={prepay.paid_amount} onChange={(event) => setPrepay({ ...prepay, paid_amount: event.target.value })} />
                    </div>
                    <div className="space-y-1">
                      <Label>Data</Label>
                      <Input
                        type="date"
                        value={prepay.payment_date}
                        onChange={(event) => {
                          const paymentDate = event.target.value;
                          const estimate = selectedDebt && selectedInstallment ? estimateSettlement(selectedDebt, selectedInstallment, paymentDate) : null;
                          setPrepay({
                            ...prepay,
                            payment_date: paymentDate,
                            month: paymentDate.slice(0, 7),
                            paid_amount: estimate ? formatMoneyInput(estimate.amount) : prepay.paid_amount,
                          });
                        }}
                      />
                    </div>
                    <div className="flex items-end">
                      <Button className="w-full" onClick={registerPrepayment}>Registrar amortização</Button>
                    </div>
                    <div className="grid gap-2 text-xs text-muted-foreground md:col-span-4 md:grid-cols-3">
                      <span>Meses antecipados: <strong className="text-foreground">{settlementEstimate?.monthsAhead ?? 0}</strong></span>
                      <span>Valor nominal: <strong className="text-foreground">{money(selectedInstallment?.nominal_amount)}</strong></span>
                      <span>Desconto estimado: <strong className="text-foreground">{money(settlementEstimate?.discount)}</strong></span>
                    </div>
                    <p className="text-xs text-muted-foreground md:col-span-4">O cálculo usa valor presente: parcela nominal dividida pela taxa mensal composta até o vencimento. A amortização é registrada como despesa paga no mês do pagamento.</p>
                  </div>

                  <div className="max-h-96 overflow-auto rounded-md border">
                    <table className="w-full text-sm">
                      <thead className="sticky top-0 bg-background">
                        <tr className="border-b text-left">
                          <th className="p-3">Parcela</th>
                          <th className="p-3">Vencimento</th>
                          <th className="p-3">Valor nominal</th>
                          <th className="p-3">Pago</th>
                          <th className="p-3">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedDebt.installments.map((item) => (
                          <tr key={item.id} className="border-b last:border-0">
                            <td className="p-3">{item.installment_number}</td>
                            <td className="p-3">{new Date(item.due_date).toLocaleDateString("pt-BR", { timeZone: "UTC" })}</td>
                            <td className="p-3">{money(item.nominal_amount)}</td>
                            <td className="p-3">{item.payment_amount ? money(item.payment_amount) : "-"}</td>
                            <td className="p-3">
                              <Badge variant={item.status === "PENDING" ? "secondary" : "default"} className="gap-1">
                                {item.status !== "PENDING" && <CheckCircle2 className="h-3 w-3" />}
                                {item.status === "PREPAID" ? "amortizada" : item.status === "PAID" ? "paga" : "aberta"}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Metric({ icon: Icon, title, value }: { icon: typeof Landmark; title: string; value: string }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <div className="rounded-md bg-primary/10 p-2 text-primary"><Icon className="h-5 w-5" /></div>
        <div className="min-w-0">
          <div className="text-xs text-muted-foreground">{title}</div>
          <div className="truncate text-lg font-semibold">{value}</div>
        </div>
      </CardContent>
    </Card>
  );
}
