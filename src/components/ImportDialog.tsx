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
  const [faturaMes, setFaturaMes] = useState<string>('');
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
        // Detect months in the file and default fatura month (most frequent)
        const months: Record<string, number> = {};
        jsonData.forEach((r: any) => {
          if (!r.data) return;
          const mon = String(r.data).substring(0, 7);
          if (mon) months[mon] = (months[mon] || 0) + 1;
        });
        const monthsKeys = Object.keys(months);
        if (monthsKeys.length > 0) {
          // choose the latest month available in the file as default invoice month
          monthsKeys.sort();
          setFaturaMes(monthsKeys[monthsKeys.length - 1]);
        } else {
          setFaturaMes(new Date().toISOString().slice(0, 7));
        }
      } catch (err) {
        setError('Erro ao ler o arquivo. Verifique se é um arquivo Excel válido.');
      }
    };
    reader.readAsBinaryString(file);
  };

  // Detectar parcelas no formato "1/12", "2/12" etc — procurar primeiro por campos no row (parcelas/parcela)
  const detectarParcela = (
    rowOrDescricao: any
  ): { isParcela: boolean; parcelaAtual?: number; totalParcelas?: number } => {

    let value = '';
    let fromFields = false;

    if (typeof rowOrDescricao === 'object' && rowOrDescricao !== null) {

      // 1. Se EXISTE row.parcela ou row.parcelas, ignorar regex
      if (rowOrDescricao.parcelas || rowOrDescricao.parcela) {
        fromFields = true;

        const raw = String(rowOrDescricao.parcelas ?? rowOrDescricao.parcela).trim();

        const regexField = /^(\d{1,2})[\/\-](\d{1,2})$/;
        const matchField = raw.match(regexField);

        // só aceita formatos válidos de parcela, não datas
        if (matchField) {
          return {
            isParcela: true,
            parcelaAtual: Number(matchField[1]),
            totalParcelas: Number(matchField[2])
          };
        }

        // Se o campo existe mas não segue formato válido → é tratado como NÃO parcela
        return { isParcela: false };
      }

      // 2. Se não tinha parcelas/parcela: tentar outros campos
      value = String(
        rowOrDescricao.parcelaAtual ??
        rowOrDescricao.parcelamento ??
        rowOrDescricao.descricao ??
        ''
      ).trim();
    } else {
      // Descricao pura
      value = String(rowOrDescricao ?? '').trim();
    }

    // 3. Se veio de campo direto, NUNCA usar regex
    if (fromFields) {
      return { isParcela: false };
    }

    // 4. Regex seguro contra datas
    // aceita 1/12, 2-10, 09/06
    // MAS recusa anos (ex: 12/2025)
    const regex = /^(\d{1,2})[\/\-](\d{1,2})$/;
    const match = value.match(regex);

    if (match) {
      const parcelaAtual = Number(match[1]);
      const totalParcelas = Number(match[2]);

      // evita falsos positivos como 03/2025
      if (totalParcelas > 1 && totalParcelas <= 60) {
        return {
          isParcela: true,
          parcelaAtual,
          totalParcelas
        };
      }
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

        importData.forEach((row: any) => {
          if (!row.descricao || !row.valor || !row.data) {
            throw new Error('Campos obrigatórios da fatura: descricao, valor, data');
          }

          const deteccao = detectarParcela(row);

          const descricaoBase = deteccao.isParcela
            ? row.descricao.replace(/\s*\d+\/\d+\s*/, '').trim()
            : row.descricao.trim();

          // NOVO: usar totalParcelas para separar parcelamentos distintos
          const key = deteccao.isParcela
            ? `${descricaoBase}__${deteccao.totalParcelas}`
            : `${descricaoBase}__single`;

          if (!dividasMap.has(key)) {
            dividasMap.set(key, []);
          }

          dividasMap.get(key)!.push({
            ...row,
            deteccao,
            descricaoBase,
            key
          });
        });

        const dividas: Omit<Divida, 'id'>[] = [];
        const parcelamentos: Omit<Parcelamento, 'id'>[] = [];

        // Função utilitária: formatar para YYYY-MM
        const formatYYYYMM = (d: Date) => {
          const y = d.getFullYear();
          const m = String(d.getMonth() + 1).padStart(2, '0');
          return `${y}-${m}`;
        };
        const addMonthsStr = (base: string, monthsToAdd: number) => {
          const [y, m] = base.split('-').map(Number);
          const d = new Date(y, m - 1 + monthsToAdd, 1);
          return formatYYYYMM(d);
        };
        const subtractMonthsStr = (base: string, monthsToSubtract: number) => addMonthsStr(base, -monthsToSubtract);
        const diffMonths = (start: string, end: string) => {
          const [sy, sm] = start.split('-').map(Number);
          const [ey, em] = end.split('-').map(Number);
          return (ey - sy) * 12 + (em - sm);
        };

        // Detectar mês da fatura a partir das transações (mês mais frequente entre as datas)
        const detectInvoiceMonth = (rows: any[]) => {
          const freq: Record<string, number> = {};
          rows.forEach(r => {
            if (!r.data) return;
            const mon = String(r.data).substring(0, 7);
            if (!mon) return;
            freq[mon] = (freq[mon] || 0) + 1;
          });
          const entries = Object.entries(freq);
          if (entries.length === 0) return formatYYYYMM(new Date());
          entries.sort((a, b) => b[1] - a[1]);
          return entries[0][0];
        };

        const invoiceMonthStr = detectInvoiceMonth(importData);

        // Processar cada grupo
        dividasMap.forEach((items, descricaoBase) => {
          // split items into parcel and single items (groups could contain a mix)
          const parcelItems = items.filter(it => it.deteccao?.isParcela);
          const singleItems = items.filter(it => !it.deteccao?.isParcela);
          if (parcelItems.length > 0) {
            // É um parcelamento (usando apenas os itens parcelados do grupo)
            const primeiraTransacao = parcelItems.reduce((a, b) => (new Date(String(a.data)) <= new Date(String(b.data)) ? a : b), parcelItems[0]);
            const currentMonthStr = faturaMes || invoiceMonthStr;
            const itemInCurrentMonth = parcelItems.find(it => String(it.data).substring(0, 7) === currentMonthStr);
            const parcelaAtualDetectada = Math.max(...parcelItems.map(it => it.deteccao.parcelaAtual || 0)) || 1;
            const totalParcelasCandidates = parcelItems.map(it => it.deteccao.totalParcelas || 0).filter(Boolean);
            const totalParcelas = totalParcelasCandidates.length > 0 ? Math.max(...totalParcelasCandidates) : parcelItems.length;
            const somaParcelasPresentes = parcelItems.reduce((sum, item) => sum + Number(item.valor), 0);
            let valorTotal;
            if (parcelItems.length === totalParcelas) {
              valorTotal = somaParcelasPresentes;
            } else if (parcelItems.length === 1 && parcelItems[0].deteccao.isParcela && totalParcelas > 1) {
              valorTotal = Number(parcelItems[0].valor) * totalParcelas;
            } else if (parcelItems.length > 1 && parcelItems.length < totalParcelas) {
              const average = somaParcelasPresentes / parcelItems.length;
              valorTotal = Number((average * totalParcelas).toFixed(2));
            } else {
              valorTotal = somaParcelasPresentes;
            }

            const itemCorrespondente = parcelItems.find(it => it.deteccao.parcelaAtual === parcelaAtualDetectada) ?? parcelItems.find(it => String(it.data).substring(0, 7) === currentMonthStr) ?? (parcelItems.length === 1 ? parcelItems[0] : undefined);

            if (itemCorrespondente) {
              dividas.push({
                mes: currentMonthStr,
                valor: Number(itemCorrespondente.valor),
                motivo: String(itemCorrespondente.descricao).trim(),
                categoria: 'cartao',
                data: String(itemCorrespondente.data).substring(0, 10),
                status: 'aberta',
                cartaoId: cartaoSelecionado
              });
            }

            const mesInicioFromData = formatYYYYMM(new Date(String(primeiraTransacao.data)));
            const mesInicioFromCurrent = subtractMonthsStr(currentMonthStr, parcelaAtualDetectada - 1);
            const computedCurrentMonthIfData = addMonthsStr(mesInicioFromData, parcelaAtualDetectada - 1);
            let mesInicioCalculado = computedCurrentMonthIfData === currentMonthStr ? mesInicioFromData : mesInicioFromCurrent;

            const expectedParcelaFromStart = diffMonths(mesInicioCalculado, currentMonthStr) + 1; // 1-based
            const parcelaAtualForParcelamento = Math.max(parcelaAtualDetectada, expectedParcelaFromStart);
            const parcelaAtualFinal = Math.min(parcelaAtualForParcelamento, totalParcelas);

            parcelamentos.push({
              cartaoId: cartaoSelecionado,
              descricao: descricaoBase,
              valorTotal,
              numeroParcelas: totalParcelas,
              parcelaAtual: parcelaAtualFinal,
              mesInicio: mesInicioCalculado,
              categoria: 'cartao'
            });
          }

          if (singleItems.length > 0) {
            singleItems.forEach(item => {
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
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
                <div>
                  <Label htmlFor="fatura-mes">Mês da Fatura</Label>
                  <select id="fatura-mes" value={faturaMes} onChange={(e) => setFaturaMes(e.target.value)} className="px-3 py-2 border border-border rounded-md w-full">
                    {(() => {
                      const uniqueMonths = Array.from(new Set(importData.map((r: any) => String(r.data).substring(0, 7)).filter(Boolean)));
                      const months = uniqueMonths.length > 0 ? uniqueMonths : [new Date().toISOString().slice(0, 7)];
                      return months.map((m) => (
                        <option key={m} value={m}>{m}</option>
                      ));
                    })()}
                  </select>
                </div>
              </div>

            </div>
          )}

          {importType === 'fatura' && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-1">
                  <p className="font-semibold">Formato para Fatura:</p>
                  <ul className="list-disc list-inside text-sm">
                    <li><strong>descricao</strong>: descrição da compra</li>
                    <li><strong>valor</strong>: valor da transação</li>
                    <li><strong>data</strong>: data da transação (YYYY-MM-DD)</li>
                    <li><strong>parcelas</strong>: opcional. Ex: <em>1/12</em> ou <em>12</em>. Se presente, o import tratará como parcelamento e irá criar as parcelas futuras a partir do próximo mês da fatura (por exemplo, se a fatura atual é 12/2025, a próxima parcela ficará em 01/2026).</li>
                  </ul>
                </div>
              </AlertDescription>
            </Alert>
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
