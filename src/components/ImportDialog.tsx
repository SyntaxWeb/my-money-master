import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Upload, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';
import type { Renda, Divida } from '@/types/finance';

interface ImportDialogProps {
  onImportRendas: (rendas: Omit<Renda, 'id'>[]) => void;
  onImportDividas: (dividas: Omit<Divida, 'id'>[]) => void;
}

type ImportType = 'rendas' | 'dividas';

export function ImportDialog({ onImportRendas, onImportDividas }: ImportDialogProps) {
  const [open, setOpen] = useState(false);
  const [importType, setImportType] = useState<ImportType>('rendas');
  const [previewData, setPreviewData] = useState<any[]>([]);
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

        setPreviewData(jsonData.slice(0, 5)); // Preview das primeiras 5 linhas
      } catch (err) {
        setError('Erro ao ler o arquivo. Verifique se é um arquivo Excel válido.');
      }
    };
    reader.readAsBinaryString(file);
  };

  const validateAndImport = () => {
    if (previewData.length === 0) {
      setError('Nenhum dado para importar');
      return;
    }

    try {
      if (importType === 'rendas') {
        const rendas: Omit<Renda, 'id'>[] = previewData.map((row: any, index) => {
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
      } else {
        const dividas: Omit<Divida, 'id'>[] = previewData.map((row: any, index) => {
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
      }

      setOpen(false);
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
          </div>

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
              ) : (
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
                Importar {previewData.length} {importType === 'rendas' ? 'Rendas' : 'Despesas'}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
