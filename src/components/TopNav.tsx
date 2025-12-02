import { Link } from 'react-router-dom';
import logo from '@/assets/syntaxweb-logo.jpg';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { ImportDialog } from '@/components/ImportDialog';
import { useFinanceData } from '@/hooks/useFinanceData';

export default function TopNav() {
  const { cartoes, addRendas, addDividas, addParcelamento } = useFinanceData();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border">
      <div className="max-w-7xl mx-auto p-4 md:p-8 flex flex-col sm:flex-row gap-4 sm:justify-between sm:items-center">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <img src={logo} alt="SyntaxWeb" className="h-10 w-10 sm:h-12 sm:w-12 object-contain flex-shrink-0" />
          <h1 className="text-lg sm:text-xl font-bold text-foreground">My Money</h1>
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
            <Button className="w-full sm:w-auto" variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Renda
            </Button>
          </Link>
          <Link to="/despesas">
            <Button className="w-full sm:w-auto" variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Despesa
            </Button>
          </Link>
          <Link to="/cartoes">
            <Button className="w-full sm:w-auto" variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Cartões
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
