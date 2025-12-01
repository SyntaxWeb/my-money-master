import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Upload, AlertCircle, CheckCircle2, CreditCard } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import * as XLSX from 'xlsx';
import type { Renda, Divida, Cartao, Parcelamento } from '@/types/finance';

interface ImportDialogProps {
  onImportRendas: (rendas: Omit<Renda, 'id'>[]) => void;
  onImportDividas: (dividas: Omit<Divida, 'id'>[]) => void;
  onImportFaturaCartao?: (cartaoId: string, dividas: Omit<Divida, 'id'>[], parcelamentos: Omit<Parcelamento, 'id'>[]) => void;
  cartoes?: Cartao[];
}

type ImportType = 'rendas' | 'dividas' | 'fatura';

export function ImportDialog({ onImportRendas, onImportDividas, onImportFaturaCartao, cartoes = [] }: ImportDialogProps) {
  const [open, setOpen] = useState(false);
  const [importType, setImportType] = useState<ImportType>('rendas');
  const [cartaoSelecionado, setCartaoSelecionado] = useState<string>('');
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [importData, setImportData] = useState<any[]>([]);
  const [error, setError] = useState<string>('');
  const { toast } = useToast();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError('');
    setPreviewData([]);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        if (jsonData.length === 0) {
          setError('O arquivo está vazio');
          return;
        }

        console.log('Dados importados:', jsonData);

        setImportData(jsonData);
        setPreviewData(jsonData.slice(0, 5)); // Preview das primeiras 5 linhas
      } catch (err) {
        setError('Erro ao ler o arquivo. Verifique se é um arquivo Excel válido.');
      }
    };
    reader.readAsBinaryString(file);
  };

  // Detectar parcelas no formato "1/12", "2/12" etc
  const detectarParcela = (descricao: string): { isParcela: boolean; parcelaAtual?: number; totalParcelas?: number } => {
    const regex = /(\d+)\/(\d+)/;
    const match = descricao.match(regex);
    if (match) {
      return {
        isParcela: true,
        parcelaAtual: parseInt(match[1]),
        totalParcelas: parseInt(match[2])
      };
    }
    return { isParcela: false };
  };

  const validateAndImport = () => {
    if (importData.length === 0) {
      setError('Nenhum dado para importar');
      return;
    }

    // Fatura de cartão precisa de cartão selecionado
    if (importType === 'fatura' && !cartaoSelecionado) {
      setError('Selecione um cartão para importar a fatura');
      return;
    }

    try {
      if (importType === 'rendas') {
      const rendas: Omit<Renda, 'id'>[] = importData.map((row: any, index) => {
          if (!row.mes || !row.valor || !row.origem) {
            throw new Error(`Linha ${index + 1}: campos obrigatórios faltando (mes, valor, origem)`);
          }
          
          return {
            mes: String(row.mes).trim(),
            valor: Number(row.valor),
            origem: String(row.origem).trim(),
            data: row.data ? String(row.data).trim() : new Date().toISOString().split('T')[0]
          };
        });

        onImportRendas(rendas);
        toast({
          title: 'Sucesso!',
          description: `${rendas.length} rendas importadas com sucesso.`,
        });
      } else if (importType === 'dividas') {
      const dividas: Omit<Divida, 'id'>[] = importData.map((row: any, index) => {
          if (!row.mes || !row.valor || !row.motivo || !row.categoria) {
            throw new Error(`Linha ${index + 1}: campos obrigatórios faltando (mes, valor, motivo, categoria)`);
          }

          const categoria = String(row.categoria).toLowerCase().trim();
          if (!['cartao', 'fixa', 'variavel', 'outro'].includes(categoria)) {
            throw new Error(`Linha ${index + 1}: categoria inválida (use: cartao, fixa, variavel, outro)`);
          }

          const status = row.status ? String(row.status).toLowerCase().trim() : 'aberta';
          if (!['paga', 'aberta'].includes(status)) {
            throw new Error(`Linha ${index + 1}: status inválido (use: paga, aberta)`);
          }

          return {
            mes: String(row.mes).trim(),
            valor: Number(row.valor),
            motivo: String(row.motivo).trim(),
            categoria: categoria as 'cartao' | 'fixa' | 'variavel' | 'outro',
            data: row.data ? String(row.data).trim() : new Date().toISOString().split('T')[0],
            status: status as 'paga' | 'aberta'
          };
        });

        onImportDividas(dividas);
        toast({
          title: 'Sucesso!',
          description: `${dividas.length} despesas importadas com sucesso.`,
        });
      } else if (importType === 'fatura' && onImportFaturaCartao) {
        // Processar fatura do cartão
        const dividasMap = new Map<string, any[]>();
        
        // Agrupar por descrição base (sem parcela)
        importData.forEach((row: any) => {
          if (!row.descricao || !row.valor || !row.data) {
            throw new Error('Campos obrigatórios da fatura: descricao, valor, data');
          }

          const deteccao = detectarParcela(row.descricao);
          const descricaoBase = deteccao.isParcela 
            ? row.descricao.replace(/\s*\d+\/\d+\s*/, '').trim()
            : row.descricao.trim();

          if (!dividasMap.has(descricaoBase)) {
            dividasMap.set(descricaoBase, []);
          }

          dividasMap.get(descricaoBase)!.push({
            ...row,
            deteccao,
            descricaoBase
          });
        });

        const dividas: Omit<Divida, 'id'>[] = [];
        const parcelamentos: Omit<Parcelamento, 'id'>[] = [];

        // Processar cada grupo
        dividasMap.forEach((items, descricaoBase) => {
          if (items.length > 1 && items[0].deteccao.isParcela) {
            // É um parcelamento
            const primeiraTransacao = items[0];
            const valorTotal = items.reduce((sum, item) => sum + Number(item.valor), 0);
            const totalParcelas = items[0].deteccao.totalParcelas || items.length;
            
            // Criar parcelamento
            parcelamentos.push({
              cartaoId: cartaoSelecionado,
              descricao: descricaoBase,
              valorTotal,
              numeroParcelas: totalParcelas,
              parcelaAtual: 1,
              mesInicio: String(primeiraTransacao.data).substring(0, 7),
              categoria: 'cartao'
            });

            // Não criar dívidas aqui - o parcelamento vai criar automaticamente
          } else {
            // Compra única
            items.forEach(item => {
              const dataStr = String(item.data);
              const mes = dataStr.length >= 7 ? dataStr.substring(0, 7) : new Date().toISOString().substring(0, 7);
              
              dividas.push({
                mes,
                valor: Number(item.valor),
                motivo: item.descricao,
                categoria: 'cartao',
                data: dataStr.length >= 10 ? dataStr.substring(0, 10) : new Date().toISOString().split('T')[0],
                status: 'aberta',
                cartaoId: cartaoSelecionado
              });
            });
          }
        });

        onImportFaturaCartao(cartaoSelecionado, dividas, parcelamentos);
        
        toast({
          title: 'Sucesso!',
          description: `Fatura importada: ${dividas.length} compras únicas e ${parcelamentos.length} parcelamentos detectados.`,
        });
      }

      setOpen(false);
      setImportData([]);
      setPreviewData([]);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao importar dados');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Upload className="h-4 w-4 mr-2" />
          Importar Excel
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Importar dados do Excel</DialogTitle>
          <DialogDescription>
            Faça upload de um arquivo XLSX com seus dados financeiros
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex gap-2">
            <Button
              variant={importType === 'rendas' ? 'default' : 'outline'}
              onClick={() => setImportType('rendas')}
              className="flex-1"
            >
              Rendas
            </Button>
            <Button
              variant={importType === 'dividas' ? 'default' : 'outline'}
              onClick={() => setImportType('dividas')}
              className="flex-1"
            >
              Despesas
            </Button>
            {cartoes.length > 0 && onImportFaturaCartao && (
              <Button
                variant={importType === 'fatura' ? 'default' : 'outline'}
                onClick={() => setImportType('fatura')}
                className="flex-1"
              >
                <CreditCard className="h-4 w-4 mr-1" />
                Fatura
              </Button>
            )}
          </div>

          {importType === 'fatura' && (
            <div className="space-y-2">
              <Label htmlFor="cartao-select">Selecione o Cartão</Label>
              <Select value={cartaoSelecionado} onValueChange={setCartaoSelecionado}>
                <SelectTrigger id="cartao-select">
                  <SelectValue placeholder="Escolha o cartão da fatura" />
                </SelectTrigger>
                <SelectContent>
                  {cartoes.map((cartao) => (
                    <SelectItem key={cartao.id} value={cartao.id}>
                      {cartao.nome} - {cartao.bandeira}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {importType === 'rendas' ? (
                <div className="space-y-1">
                  <p className="font-semibold">Colunas obrigatórias para Rendas:</p>
                  <ul className="list-disc list-inside text-sm">
                    <li><strong>mes</strong>: formato YYYY-MM (ex: 2024-01)</li>
                    <li><strong>valor</strong>: valor numérico</li>
                    <li><strong>origem</strong>: descrição da origem</li>
                    <li><strong>data</strong>: formato YYYY-MM-DD (opcional)</li>
                  </ul>
                </div>
              ) : importType === 'dividas' ? (
                <div className="space-y-1">
                  <p className="font-semibold">Colunas obrigatórias para Despesas:</p>
                  <ul className="list-disc list-inside text-sm">
                    <li><strong>mes</strong>: formato YYYY-MM (ex: 2024-01)</li>
                    <li><strong>valor</strong>: valor numérico</li>
                    <li><strong>motivo</strong>: descrição da despesa</li>
                    <li><strong>categoria</strong>: cartao, fixa, variavel ou outro</li>
                    <li><strong>status</strong>: paga ou aberta (opcional, padrão: aberta)</li>
                    <li><strong>data</strong>: formato YYYY-MM-DD (opcional)</li>
                  </ul>
                </div>
              ) : (
                <div className="space-y-1">
                  <p className="font-semibold">Colunas obrigatórias para Fatura:</p>
                  <ul className="list-disc list-inside text-sm">
                    <li><strong>descricao</strong>: descrição da compra</li>
                    <li><strong>valor</strong>: valor da transação</li>
                    <li><strong>data</strong>: formato YYYY-MM-DD</li>
                  </ul>
                  <p className="text-xs mt-2 text-muted-foreground">
                    💡 Parcelamentos são detectados automaticamente se a descrição contiver "1/12", "2/12", etc.
                  </p>
                </div>
              )}
            </AlertDescription>
          </Alert>

          <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary transition-colors">
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileUpload}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm font-medium">Clique para selecionar um arquivo</p>
              <p className="text-xs text-muted-foreground mt-1">Formatos: XLSX, XLS</p>
            </label>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {previewData.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle2 className="h-4 w-4" />
                <p className="text-sm font-medium">Preview dos dados (primeiras 5 linhas):</p>
              </div>
              <div className="border rounded-lg overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted">
                    <tr>
                      {Object.keys(previewData[0]).map((key) => (
                        <th key={key} className="px-4 py-2 text-left font-medium">
                          {key}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.map((row, i) => (
                      <tr key={i} className="border-t">
                        {Object.values(row).map((value: any, j) => (
                          <td key={j} className="px-4 py-2">
                            {String(value)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Button onClick={validateAndImport} className="w-full">
                Importar {importData.length || previewData.length}{' '}
                {importType === 'rendas' ? 'Rendas' : importType === 'dividas' ? 'Despesas' : 'Transações da Fatura'}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
