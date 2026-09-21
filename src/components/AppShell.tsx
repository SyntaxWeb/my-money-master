import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "next-themes";
import {
  BarChart3,
  CreditCard,
  Download,
  Landmark,
  LayoutDashboard,
  LogOut,
  Moon,
  PiggyBank,
  Plus,
  ReceiptText,
  Settings,
  Sun,
  Wallet,
} from "lucide-react";
import logo from "@/assets/syntaxweb-logo.jpg";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { ImportDialog } from "@/components/ImportDialog";
import { useFinanceData } from "@/hooks/useFinanceData";
import { exportToExcel } from "@/utils/exportToExcel";
import { apiRequest } from "@/lib/api";
import { toast } from "sonner";

const mainItems = [
  { label: "Central", href: "/central", icon: LayoutDashboard },
  { label: "Dashboard", href: "/app", icon: BarChart3 },
  { label: "Rendas", href: "/rendas", icon: Wallet },
  { label: "Despesas", href: "/despesas", icon: ReceiptText },
  { label: "Cartões", href: "/cartoes", icon: CreditCard },
  { label: "Cofrinhos", href: "/cofrinhos", icon: PiggyBank },
  { label: "Financiamentos", href: "/financiamentos", icon: Landmark },
  { label: "Configurações", href: "/settings", icon: Settings },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { resolvedTheme, setTheme } = useTheme();
  const { cartoes, addRendas, addDividas, addParcelamento, cofrinhos, rendas, dividas, parcelamentos } = useFinanceData();

  const totalCofrinhos = cofrinhos.reduce((sum, item) => sum + (item.saldo || 0), 0);

  const handleLogout = async () => {
    try {
      await apiRequest("/logout", "POST");
    } catch (error) {
      console.error("Erro ao fazer logout", error);
    } finally {
      localStorage.removeItem("auth_token");
      navigate("/login");
    }
  };

  const handleExport = () => {
    try {
      exportToExcel({ rendas, dividas, cartoes, parcelamentos, cofrinhos });
      toast.success("Dados exportados com sucesso");
    } catch (error) {
      toast.error("Erro ao exportar dados");
      console.error("Export error:", error);
    }
  };

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon" className="border-r">
        <SidebarHeader className="border-b p-3">
          <Link to="/central" className="flex min-h-10 items-center gap-3 rounded-md px-2">
            <img src={logo} alt="SyntaxFinance" className="h-8 w-8 rounded-md object-cover" />
            <div className="min-w-0 group-data-[collapsible=icon]:hidden">
              <div className="truncate text-sm font-semibold">SyntaxFinance</div>
              <div className="truncate text-xs text-sidebar-foreground/70">Gestão pessoal</div>
            </div>
          </Link>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Navegação</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {mainItems.map((item) => {
                  const Icon = item.icon;
                  const active = location.pathname === item.href;
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton asChild isActive={active} tooltip={item.label}>
                        <Link to={item.href}>
                          <Icon />
                          <span>{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel>Ações</SidebarGroupLabel>
            <SidebarGroupContent className="space-y-2 px-2">
              <ImportDialog
                onImportRendas={addRendas}
                onImportDividas={addDividas}
                onImportFaturaCartao={async (_cartaoId, importedDividas, importedParcelamentos) => {
                  if (importedDividas?.length) await addDividas(importedDividas);
                  if (importedParcelamentos?.length) {
                    for (const item of importedParcelamentos) {
                      await addParcelamento(item);
                    }
                  }
                }}
                cartoes={cartoes}
              />
              <Button className="w-full justify-start gap-2" variant="outline" size="sm" onClick={handleExport}>
                <Download className="h-4 w-4" />
                <span className="group-data-[collapsible=icon]:hidden">Exportar</span>
              </Button>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="border-t p-3">
          <div className="mb-2 rounded-md border bg-sidebar-accent/40 p-3 group-data-[collapsible=icon]:hidden">
            <div className="text-xs text-sidebar-foreground/70">Cofrinhos</div>
            <div className="text-sm font-semibold">
              {totalCofrinhos.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
            </div>
          </div>
          <div className="grid gap-2">
            <Button
              variant="outline"
              size="sm"
              className="justify-start gap-2"
              onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            >
              {resolvedTheme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              <span className="group-data-[collapsible=icon]:hidden">Tema</span>
            </Button>
            <Button variant="destructive" size="sm" className="justify-start gap-2" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
              <span className="group-data-[collapsible=icon]:hidden">Sair</span>
            </Button>
          </div>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-background/95 px-3 backdrop-blur md:px-6">
          <SidebarTrigger />
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-medium">{currentTitle(location.pathname)}</div>
            <div className="hidden truncate text-xs text-muted-foreground sm:block">Controle determinístico com agente financeiro como apoio.</div>
          </div>
          <Button asChild size="sm" className="gap-2">
            <Link to="/central">
              <Plus className="h-4 w-4" />
              Lançar
            </Link>
          </Button>
        </header>
        <main className="min-h-[calc(100vh-3.5rem)] bg-muted/20">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}

function currentTitle(pathname: string) {
  return mainItems.find((item) => item.href === pathname)?.label ?? "SyntaxFinance";
}
