import * as XLSX from 'xlsx';
import { Renda, Divida, Cartao, Parcelamento, Cofrinho } from '@/types/finance';

interface ExportData {
  rendas: Renda[];
  dividas: Divida[];
  cartoes: Cartao[];
  parcelamentos: Parcelamento[];
  cofrinhos: Cofrinho[];
}

export const exportToExcel = (data: ExportData) => {
  // Criar workbook
  const wb = XLSX.utils.book_new();

  // Sheet 1: Rendas
  const rendasData = data.rendas.map(r => ({
    'Mês': r.mes,
    'Data': r.data,
    'Origem': r.origem,
    'Valor': r.valor,
  }));
  const wsRendas = XLSX.utils.json_to_sheet(rendasData);
  XLSX.utils.book_append_sheet(wb, wsRendas, 'Rendas');

  // Sheet 2: Despesas
  const despesasData = data.dividas.map(d => ({
    'Mês': d.mes,
    'Data': d.data,
    'Motivo': d.motivo,
    'Categoria': d.categoria,
    'Valor': d.valor,
    'Status': d.status,
    'Cartão': d.cartaoId ? data.cartoes.find(c => c.id === d.cartaoId)?.nome || 'N/A' : 'N/A',
  }));
  const wsDespesas = XLSX.utils.json_to_sheet(despesasData);
  XLSX.utils.book_append_sheet(wb, wsDespesas, 'Despesas');

  // Sheet 3: Cartões
  const cartoesData = data.cartoes.map(c => ({
    'Nome': c.nome,
    'Bandeira': c.bandeira,
    'Limite': c.limite,
    'Dia Fechamento': c.diaFechamento,
    'Dia Vencimento': c.diaVencimento,
  }));
  const wsCartoes = XLSX.utils.json_to_sheet(cartoesData);
  XLSX.utils.book_append_sheet(wb, wsCartoes, 'Cartões');

  // Sheet 4: Parcelamentos
  const parcelamentosData = data.parcelamentos.map(p => ({
    'Cartão': data.cartoes.find(c => c.id === p.cartaoId)?.nome || 'N/A',
    'Descrição': p.descricao,
    'Valor Total': p.valorTotal,
    'Número Parcelas': p.numeroParcelas,
    'Parcela Atual': p.parcelaAtual,
    'Mês Início': p.mesInicio,
    'Valor Parcela': (p.valorTotal / p.numeroParcelas).toFixed(2),
  }));
  const wsParcelamentos = XLSX.utils.json_to_sheet(parcelamentosData);
  XLSX.utils.book_append_sheet(wb, wsParcelamentos, 'Parcelamentos');

  // Sheet 5: Cofrinhos
  const cofrinhosData = data.cofrinhos.map(c => ({
    'Nome': c.nome,
    'Descrição': c.descricao || 'N/A',
    'Saldo Atual': c.saldo,
    'Criado Em': c.criadoEm ? new Date(c.criadoEm).toLocaleDateString('pt-BR') : 'N/A',
  }));
  const wsCofrinhos = XLSX.utils.json_to_sheet(cofrinhosData);
  XLSX.utils.book_append_sheet(wb, wsCofrinhos, 'Cofrinhos');

  // Sheet 6: Resumo Mensal
  const meses = Array.from(new Set([...data.rendas.map(r => r.mes), ...data.dividas.map(d => d.mes)])).sort();
  const resumoData = meses.map(mes => {
    const rendasMes = data.rendas.filter(r => r.mes === mes);
    const dividasMes = data.dividas.filter(d => d.mes === mes);
    const totalRenda = rendasMes.reduce((sum, r) => sum + r.valor, 0);
    const totalDespesa = dividasMes.reduce((sum, d) => sum + d.valor, 0);
    const saldo = totalRenda - totalDespesa;

    return {
      'Mês': mes,
      'Total Rendas': totalRenda.toFixed(2),
      'Total Despesas': totalDespesa.toFixed(2),
      'Saldo': saldo.toFixed(2),
      'Gastos Cartão': dividasMes.filter(d => d.categoria === 'cartao').reduce((sum, d) => sum + d.valor, 0).toFixed(2),
      'Gastos Fixos': dividasMes.filter(d => d.categoria === 'fixa').reduce((sum, d) => sum + d.valor, 0).toFixed(2),
      'Gastos Variáveis': dividasMes.filter(d => d.categoria === 'variavel').reduce((sum, d) => sum + d.valor, 0).toFixed(2),
    };
  });
  const wsResumo = XLSX.utils.json_to_sheet(resumoData);
  XLSX.utils.book_append_sheet(wb, wsResumo, 'Resumo Mensal');

  // Gerar arquivo
  const timestamp = new Date().toISOString().split('T')[0];
  XLSX.writeFile(wb, `SyntaxFinance_${timestamp}.xlsx`);
};
