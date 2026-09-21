import { useEffect, useState } from "react";
import { Bot, CheckCircle2, KeyRound, RefreshCw, Save, Send, Settings2, ShieldCheck, SlidersHorizontal } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest } from "@/lib/api";

type FinanceSettings = {
  defaultAccount: string;
  emergencyMinimum: string;
  emergencyTarget: string;
  wealthTarget: string;
  carSettlementTarget: string;
  monthlyPrepayment: string;
  reserveProtected: boolean;
};

type TelegramSettings = {
  enabled: boolean;
  botToken: string;
  webhookSecret: string;
  allowedUserIds: string;
  webhookUrl: string;
};

type AiSettings = {
  enabled: boolean;
  provider: string;
  model: string;
  apiKey: string;
  systemInstructions: string;
  requireConfirmation: boolean;
};

const storageKey = "syntaxfinance_settings";

const defaults = {
  finance: {
    defaultAccount: "Conta principal",
    emergencyMinimum: "10000",
    emergencyTarget: "25000",
    wealthTarget: "50000",
    carSettlementTarget: "2027-04-30",
    monthlyPrepayment: "1500",
    reserveProtected: true,
  },
  telegram: {
    enabled: false,
    botToken: "",
    webhookSecret: "",
    allowedUserIds: "",
    webhookUrl: "https://seu-dominio.com/api/webhooks/telegram",
  },
  ai: {
    enabled: false,
    provider: "OpenAI",
    model: "gpt-4.1-mini",
    apiKey: "",
    systemInstructions: "Use somente os dados calculados pelo backend. Nunca invente saldos, parcelas, juros ou projeções.",
    requireConfirmation: true,
  },
};

export default function Settings() {
  const [finance, setFinance] = useState<FinanceSettings>(defaults.finance);
  const [telegram, setTelegram] = useState<TelegramSettings>(defaults.telegram);
  const [ai, setAi] = useState<AiSettings>(defaults.ai);
  const [serverStatus, setServerStatus] = useState<any>(null);
  const [statusLoading, setStatusLoading] = useState(false);

  const loadServerStatus = async () => {
    setStatusLoading(true);
    try {
      const status = await apiRequest<any>("/settings/integrations");
      setServerStatus(status);
      setFinance((current) => ({
        ...current,
        emergencyMinimum: String(status.finance?.emergency_minimum ?? current.emergencyMinimum),
        emergencyTarget: String(status.finance?.emergency_target ?? current.emergencyTarget),
        wealthTarget: String(status.finance?.wealth_target ?? current.wealthTarget),
        carSettlementTarget: status.finance?.car_settlement_target ?? current.carSettlementTarget,
        monthlyPrepayment: String(status.finance?.monthly_prepayment ?? current.monthlyPrepayment),
        reserveProtected: Boolean(status.finance?.reserve_protected ?? current.reserveProtected),
      }));
      setTelegram((current) => ({
        ...current,
        enabled: Boolean(status.telegram?.enabled),
        allowedUserIds: status.telegram?.allowed_user_ids ?? current.allowedUserIds,
        webhookUrl: status.telegram?.webhook_url ?? current.webhookUrl,
      }));
      setAi((current) => ({
        ...current,
        enabled: Boolean(status.ai?.enabled),
        provider: status.ai?.provider ?? current.provider,
        model: status.ai?.model ?? current.model,
      }));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível carregar status do servidor");
    } finally {
      setStatusLoading(false);
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (!saved) return;
    try {
      const parsed = JSON.parse(saved);
      setFinance({ ...defaults.finance, ...parsed.finance });
      setTelegram({ ...defaults.telegram, ...parsed.telegram });
      setAi({ ...defaults.ai, ...parsed.ai });
    } catch {
      toast.error("Não foi possível carregar as configurações salvas");
    }

    void loadServerStatus();
  }, []);

  const save = () => {
    localStorage.setItem(storageKey, JSON.stringify({ finance, telegram, ai }));
    toast.success("Configurações salvas neste dispositivo");
  };

  const telegramReady = Boolean(serverStatus?.telegram?.bot_configured && serverStatus?.telegram?.authorized_user);
  const aiReady = Boolean(serverStatus?.ai?.api_key_configured || (ai.enabled && ai.provider && ai.model && ai.apiKey));

  return (
    <div className="mx-auto max-w-6xl space-y-5 px-3 py-4 md:px-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Configurações</h1>
          <p className="text-sm text-muted-foreground">Parâmetros padrão, integrações e comportamento do agente financeiro.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadServerStatus} className="gap-2" disabled={statusLoading}>
            <RefreshCw className="h-4 w-4" />
            Status
          </Button>
          <Button onClick={save} className="gap-2">
            <Save className="h-4 w-4" />
            Salvar
          </Button>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <StatusCard title="Financeiro" active={finance.reserveProtected} detail="Reserva protegida e metas padrão definidas." />
        <StatusCard title="Telegram" active={Boolean(telegramReady)} detail={telegramReady ? "Conectado por polling interno." : "Configure token e usuário autorizado no servidor."} />
        <StatusCard title="IA" active={Boolean(aiReady)} detail={aiReady ? `${ai.provider} / ${ai.model}` : "Configure provedor, modelo e chave."} />
      </div>

      <Tabs defaultValue="finance" className="space-y-4">
        <TabsList className="grid h-auto w-full grid-cols-3">
          <TabsTrigger value="finance" className="gap-2"><SlidersHorizontal className="h-4 w-4" /> Finanças</TabsTrigger>
          <TabsTrigger value="telegram" className="gap-2"><Send className="h-4 w-4" /> Telegram</TabsTrigger>
          <TabsTrigger value="ai" className="gap-2"><Bot className="h-4 w-4" /> IA</TabsTrigger>
        </TabsList>

        <TabsContent value="finance">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Settings2 className="h-4 w-4" /> Parâmetros financeiros</CardTitle></CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <Field label="Conta padrão"><Input value={finance.defaultAccount} onChange={(event) => setFinance({ ...finance, defaultAccount: event.target.value })} /></Field>
              <Field label="Meta patrimônio"><Input inputMode="decimal" value={finance.wealthTarget} onChange={(event) => setFinance({ ...finance, wealthTarget: event.target.value })} /></Field>
              <Field label="Reserva mínima"><Input inputMode="decimal" value={finance.emergencyMinimum} onChange={(event) => setFinance({ ...finance, emergencyMinimum: event.target.value })} /></Field>
              <Field label="Reserva definitiva"><Input inputMode="decimal" value={finance.emergencyTarget} onChange={(event) => setFinance({ ...finance, emergencyTarget: event.target.value })} /></Field>
              <Field label="Quitação do carro até"><Input type="date" value={finance.carSettlementTarget} onChange={(event) => setFinance({ ...finance, carSettlementTarget: event.target.value })} /></Field>
              <Field label="Amortização mensal padrão"><Input inputMode="decimal" value={finance.monthlyPrepayment} onChange={(event) => setFinance({ ...finance, monthlyPrepayment: event.target.value })} /></Field>
              <div className="flex items-center justify-between rounded-md border p-3 md:col-span-2">
                <div>
                  <Label>Proteger reserva de emergência</Label>
                  <p className="text-sm text-muted-foreground">A reserva não entra automaticamente em compras, investimentos ou amortizações.</p>
                </div>
                <Switch checked={finance.reserveProtected} onCheckedChange={(checked) => setFinance({ ...finance, reserveProtected: checked })} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="telegram">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Send className="h-4 w-4" /> Conexão com Telegram</CardTitle></CardHeader>
            <CardContent className="grid gap-4">
              <div className="flex items-center justify-between rounded-md border p-3">
                <div>
                  <Label>Ativar bot</Label>
                  <p className="text-sm text-muted-foreground">Modo atual: polling interno pelo scheduler, sem webhook público.</p>
                </div>
                <Switch checked={telegram.enabled} onCheckedChange={(checked) => setTelegram({ ...telegram, enabled: checked })} />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Bot token"><Input type="password" placeholder={serverStatus?.telegram?.bot_configured ? "Configurado no servidor" : "Não configurado"} value={telegram.botToken} onChange={(event) => setTelegram({ ...telegram, botToken: event.target.value })} /></Field>
                <Field label="Webhook secret"><Input placeholder={serverStatus?.telegram?.webhook_secret_configured ? "Configurado no servidor" : "Não configurado"} value={telegram.webhookSecret} onChange={(event) => setTelegram({ ...telegram, webhookSecret: event.target.value })} /></Field>
                <Field label="Telegram IDs autorizados"><Input placeholder="123456789,987654321" value={telegram.allowedUserIds} onChange={(event) => setTelegram({ ...telegram, allowedUserIds: event.target.value })} /></Field>
                <Field label="Endpoint local"><Input value={telegram.webhookUrl} onChange={(event) => setTelegram({ ...telegram, webhookUrl: event.target.value })} /></Field>
              </div>
              <div className="rounded-md border bg-muted/40 p-3 text-sm">
                {serverStatus?.telegram?.authorized_user ? (
                  <div className="space-y-1">
                    <div>Telegram autorizado: <strong>{serverStatus.telegram.authorized_user.first_name}</strong> ({serverStatus.telegram.authorized_user.telegram_user_id}).</div>
                    <div>Bot configurado no servidor e processando mensagens via scheduler interno.</div>
                  </div>
                ) : (
                  <div>Configure no servidor: `TELEGRAM_BOT_TOKEN`, `TELEGRAM_ALLOWED_USER_IDS` e `TELEGRAM_DEFAULT_USER_ID`.</div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2 text-base"><KeyRound className="h-4 w-4" /> Conexão com IA</CardTitle></CardHeader>
            <CardContent className="grid gap-4">
              <div className="flex items-center justify-between rounded-md border p-3">
                <div>
                  <Label>Ativar agente de IA</Label>
                  <p className="text-sm text-muted-foreground">A IA interpreta contexto, mas os cálculos continuam no backend.</p>
                </div>
                <Switch checked={ai.enabled} onCheckedChange={(checked) => setAi({ ...ai, enabled: checked })} />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Provedor"><Input value={ai.provider} onChange={(event) => setAi({ ...ai, provider: event.target.value })} /></Field>
                <Field label="Modelo"><Input value={ai.model} onChange={(event) => setAi({ ...ai, model: event.target.value })} /></Field>
                <Field label="API key"><Input type="password" placeholder={serverStatus?.ai?.api_key_configured ? "Configurada no servidor" : "Não configurada"} value={ai.apiKey} onChange={(event) => setAi({ ...ai, apiKey: event.target.value })} /></Field>
                <div className="flex items-center justify-between rounded-md border p-3">
                  <div>
                    <Label>Confirmar ações de escrita</Label>
                    <p className="text-sm text-muted-foreground">Registros sugeridos por linguagem natural exigem confirmação.</p>
                  </div>
                  <Switch checked={ai.requireConfirmation} onCheckedChange={(checked) => setAi({ ...ai, requireConfirmation: checked })} />
                </div>
              </div>
              <Field label="Instruções do agente">
                <Textarea rows={5} value={ai.systemInstructions} onChange={(event) => setAi({ ...ai, systemInstructions: event.target.value })} />
              </Field>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function StatusCard({ title, active, detail }: { title: string; active: boolean; detail: string }) {
  return (
    <Card>
      <CardContent className="flex items-start gap-3 p-4">
        <div className="rounded-md bg-primary/10 p-2 text-primary">
          {active ? <CheckCircle2 className="h-5 w-5" /> : <ShieldCheck className="h-5 w-5" />}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <div className="font-semibold">{title}</div>
            <Badge variant={active ? "default" : "secondary"}>{active ? "pronto" : "pendente"}</Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{detail}</p>
        </div>
      </CardContent>
    </Card>
  );
}
