import { Link } from 'react-router-dom';
import logo from '@/assets/syntaxweb-logo.jpg';
import { Button } from '@/components/ui/button';
import { Plus, Menu, Download } from 'lucide-react';
import { ImportDialog } from '@/components/ImportDialog';
import { useFinanceData } from '@/hooks/useFinanceData';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useIsMobile } from '@/hooks/use-mobile';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useState } from 'react';
import { exportToExcel } from '@/utils/exportToExcel';
import { toast } from 'sonner';

export default function TopNav() {
  const { cartoes, addRendas, addDividas, addParcelamento, cofrinhos, rendas, dividas, parcelamentos } = useFinanceData();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const isMobile = useIsMobile();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleExport = () => {
    try {
      exportToExcel({
        rendas,
        dividas,
        cartoes,
        parcelamentos,
        cofrinhos,
      });
      toast.success('Dados exportados com sucesso!');
      setIsMenuOpen(false);
    } catch (error) {
      toast.error('Erro ao exportar dados');
      console.error('Export error:', error);
    }
  };

  const totalCofrinhos = cofrinhos.reduce((s, c) => s + (c.saldo || 0), 0).toFixed(2);

  if (isMobile) {
    return (
      <header className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border">
        <div className="flex items-center justify-between p-3">
          <div className="flex items-center gap-3">
            <img src={logo} alt="SyntaxWeb" className="h-8 w-8 object-contain" />
            <h1 className="text-base font-bold text-foreground">SyntaxFinance</h1>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="text-xs text-muted-foreground">
              R$ <strong className="text-foreground">{totalCofrinhos}</strong>
            </div>
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="p-2">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] sm:w-[350px]">
                <SheetHeader>
                  <SheetTitle>Menu</SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-3 mt-6">
                  <ImportDialog
                    onImportRendas={(rendas) => {
                      addRendas(rendas);
                      setIsMenuOpen(false);
                    }}
                    onImportDividas={(dividas) => {
                      addDividas(dividas);
                      setIsMenuOpen(false);
                    }}
                    onImportFaturaCartao={(cartaoId, dividas, parcelamentos) => {
                      if (dividas && dividas.length) addDividas(dividas);
                      if (parcelamentos && parcelamentos.length) parcelamentos.forEach(p => addParcelamento(p));
                      setIsMenuOpen(false);
                    }}
                    cartoes={cartoes}
                  />
                  <Link to="/rendas" onClick={() => setIsMenuOpen(false)}>
                    <Button className="w-full justify-start" variant="outline" size="default">
                      <Plus className="w-4 h-4 mr-2" />
                      Nova Renda
                    </Button>
                  </Link>
                  <Link to="/despesas" onClick={() => setIsMenuOpen(false)}>
                    <Button className="w-full justify-start" variant="outline" size="default">
                      <Plus className="w-4 h-4 mr-2" />
                      Nova Despesa
                    </Button>
                  </Link>
                  <Link to="/cartoes" onClick={() => setIsMenuOpen(false)}>
                    <Button className="w-full justify-start" variant="outline" size="default">
                      <Plus className="w-4 h-4 mr-2" />
                      Gerenciar Cartões
                    </Button>
                  </Link>
                  <Link to="/cofrinhos" onClick={() => setIsMenuOpen(false)}>
                    <Button className="w-full justify-start" variant="outline" size="default">
                      Cofrinhos
                    </Button>
                  </Link>
                  <div className="border-t border-border pt-3 mt-2">
                    <Button
                      variant="outline"
                      size="default"
                      className="w-full justify-start"
                      onClick={handleExport}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Exportar Excel
                    </Button>
                    <Button
                      variant="outline"
                      size="default"
                      className="w-full justify-start mt-2"
                      onClick={() => {
                        setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
                      }}
                    >
                      {resolvedTheme === 'dark' ? (
                        <>
                          <Sun className="w-4 h-4 mr-2" />
                          Tema Claro
                        </>
                      ) : (
                        <>
                          <Moon className="w-4 h-4 mr-2" />
                          Tema Escuro
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border">
      <div className="max-w-7xl mx-auto p-4 md:p-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <img src={logo} alt="SyntaxWeb" className="h-10 w-10 object-contain" />
          <h1 className="text-lg font-bold text-foreground">SyntaxFinance</h1>
        </div>
        
        <div className="flex flex-wrap gap-2 items-center">
          <ImportDialog
            onImportRendas={(rendas) => addRendas(rendas)}
            onImportDividas={(dividas) => addDividas(dividas)}
            onImportFaturaCartao={(cartaoId, dividas, parcelamentos) => {
              if (dividas && dividas.length) addDividas(dividas);
              if (parcelamentos && parcelamentos.length) parcelamentos.forEach(p => addParcelamento(p));
            }}
            cartoes={cartoes}
          />
          <Link to="/rendas">
            <Button variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Renda
            </Button>
          </Link>
          <Link to="/despesas">
            <Button variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Despesa
            </Button>
          </Link>
          <Link to="/cartoes">
            <Button variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Cartões
            </Button>
          </Link>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            title="Exportar dados para Excel"
          >
            <Download className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            aria-label="Toggle theme"
            onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
            aria-pressed={resolvedTheme === 'dark'}
          >
            {resolvedTheme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>
          <div className="flex items-center text-sm text-muted-foreground px-2">
            Cofrinhos: <strong className="ml-2">R$ {totalCofrinhos}</strong>
          </div>
          <Link to="/cofrinhos">
            <Button variant="outline" size="sm">
              Cofrinhos
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
