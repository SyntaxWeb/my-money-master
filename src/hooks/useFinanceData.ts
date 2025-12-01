import { useState, useEffect } from 'react';
import { Renda, Divida, BalancoMensal, ComparativoMensal, Insight, Cartao, Parcelamento } from '@/types/finance';

const STORAGE_KEYS = {
  RENDAS: 'finance_rendas',
  DIVIDAS: 'finance_dividas',
  CARTOES: 'finance_cartoes',
  PARCELAMENTOS: 'finance_parcelamentos',
};

export const useFinanceData = () => {
  const [rendas, setRendas] = useState<Renda[]>([]);
  const [dividas, setDividas] = useState<Divida[]>([]);
  const [cartoes, setCartoes] = useState<Cartao[]>([]);
  const [parcelamentos, setParcelamentos] = useState<Parcelamento[]>([]);

  useEffect(() => {
    const storedRendas = localStorage.getItem(STORAGE_KEYS.RENDAS);
    const storedDividas = localStorage.getItem(STORAGE_KEYS.DIVIDAS);
    const storedCartoes = localStorage.getItem(STORAGE_KEYS.CARTOES);
    const storedParcelamentos = localStorage.getItem(STORAGE_KEYS.PARCELAMENTOS);

    if (storedRendas) setRendas(JSON.parse(storedRendas));
    if (storedDividas) setDividas(JSON.parse(storedDividas));
    if (storedCartoes) setCartoes(JSON.parse(storedCartoes));
    if (storedParcelamentos) setParcelamentos(JSON.parse(storedParcelamentos));
  }, []);

  const saveRendas = (newRendas: Renda[]) => {
    setRendas(newRendas);
    localStorage.setItem(STORAGE_KEYS.RENDAS, JSON.stringify(newRendas));
  };

  const saveDividas = (newDividas: Divida[]) => {
    setDividas(newDividas);
    localStorage.setItem(STORAGE_KEYS.DIVIDAS, JSON.stringify(newDividas));
  };

  const addRenda = (renda: Omit<Renda, 'id'>) => {
    const newRenda = { ...renda, id: Date.now().toString() + '-' + Math.random().toString(36).slice(2, 9) };
    setRendas((prev) => {
      const next = [...prev, newRenda];
      localStorage.setItem(STORAGE_KEYS.RENDAS, JSON.stringify(next));
      return next;
    });
  };

  const addDivida = (divida: Omit<Divida, 'id'>) => {
    const newDivida = { ...divida, id: Date.now().toString() + '-' + Math.random().toString(36).slice(2, 9) };
    setDividas((prev) => {
      const next = [...prev, newDivida];
      localStorage.setItem(STORAGE_KEYS.DIVIDAS, JSON.stringify(next));
      return next;
    });
  };

  // Bulk add methods
  const addRendas = (rendasToAdd: Omit<Renda, 'id'>[]) => {
    setRendas((prev) => {
      const newItems = rendasToAdd.map((r) => ({
        ...r,
        id: Date.now().toString() + '-' + Math.random().toString(36).slice(2, 9),
      }));
      const next = [...prev, ...newItems];
      localStorage.setItem(STORAGE_KEYS.RENDAS, JSON.stringify(next));
      return next;
    });
  };

  const addDividas = (dividasToAdd: Omit<Divida, 'id'>[]) => {
    setDividas((prev) => {
      const newItems = dividasToAdd.map((d) => ({
        ...d,
        id: Date.now().toString() + '-' + Math.random().toString(36).slice(2, 9),
      }));
      const next = [...prev, ...newItems];
      localStorage.setItem(STORAGE_KEYS.DIVIDAS, JSON.stringify(next));
      return next;
    });
  };

  const updateDivida = (id: string, updates: Partial<Divida>) => {
    const updated = dividas.map(d => d.id === id ? { ...d, ...updates } : d);
    saveDividas(updated);
  };

  const deleteDivida = (id: string) => {
    saveDividas(dividas.filter(d => d.id !== id));
  };

  const deleteRenda = (id: string) => {
    saveRendas(rendas.filter(r => r.id !== id));
  };

  // Cartões
  const addCartao = (cartao: Omit<Cartao, 'id'>) => {
    const newCartao = { ...cartao, id: Date.now().toString() + '-' + Math.random().toString(36).slice(2, 9) };
    const updated = [...cartoes, newCartao];
    setCartoes(updated);
    localStorage.setItem(STORAGE_KEYS.CARTOES, JSON.stringify(updated));
  };

  const updateCartao = (id: string, updates: Partial<Cartao>) => {
    const updated = cartoes.map(c => c.id === id ? { ...c, ...updates } : c);
    setCartoes(updated);
    localStorage.setItem(STORAGE_KEYS.CARTOES, JSON.stringify(updated));
  };

  const deleteCartao = (id: string) => {
    setCartoes(cartoes.filter(c => c.id !== id));
    localStorage.setItem(STORAGE_KEYS.CARTOES, JSON.stringify(cartoes.filter(c => c.id !== id)));
  };

  // Parcelamentos
  const addParcelamento = (parcelamento: Omit<Parcelamento, 'id'>) => {
    const newParcelamento = { ...parcelamento, id: Date.now().toString() + '-' + Math.random().toString(36).slice(2, 9) };
    const updated = [...parcelamentos, newParcelamento];
    setParcelamentos(updated);
    localStorage.setItem(STORAGE_KEYS.PARCELAMENTOS, JSON.stringify(updated));

    // Criar dividas para cada parcela
    const valorParcela = parcelamento.valorTotal / parcelamento.numeroParcelas;
    const novasDividas: Omit<Divida, 'id'>[] = [];
    
    for (let i = 0; i < parcelamento.numeroParcelas; i++) {
      const [ano, mes] = parcelamento.mesInicio.split('-').map(Number);
      const dataObj = new Date(ano, mes - 1 + i, 1);
      const mesParcela = `${dataObj.getFullYear()}-${String(dataObj.getMonth() + 1).padStart(2, '0')}`;
      
      const novaDivida: Omit<Divida, 'id'> = {
        mes: mesParcela,
        valor: valorParcela,
        motivo: `${parcelamento.descricao} (${i + 1}/${parcelamento.numeroParcelas})`,
        categoria: 'cartao',
        data: new Date(dataObj.getFullYear(), dataObj.getMonth(), 1).toISOString().split('T')[0],
        status: 'aberta',
        cartaoId: parcelamento.cartaoId,
        parcelamentoId: newParcelamento.id,
      };
      
      novasDividas.push(novaDivida);
    }

    addDividas(novasDividas);
  };

  const deleteParcelamento = (id: string) => {
    setParcelamentos(parcelamentos.filter(p => p.id !== id));
    localStorage.setItem(STORAGE_KEYS.PARCELAMENTOS, JSON.stringify(parcelamentos.filter(p => p.id !== id)));
  };

  const getParcelamentosByCartao = (cartaoId: string) => {
    return parcelamentos.filter(p => p.cartaoId === cartaoId);
  };

  const getSaldoAcumuladoAteOMes = (mesAlvo: string): number => {
    const mesesOrdenados = getMesesDisponiveis().sort();
    const indiceMesAlvo = mesesOrdenados.indexOf(mesAlvo);
    
    if (indiceMesAlvo === -1) return 0;
    
    let saldoAcumulado = 0;
    for (let i = 0; i <= indiceMesAlvo; i++) {
      const mes = mesesOrdenados[i];
      const rendasMes = rendas.filter(r => r.mes === mes);
      const dividasMes = dividas.filter(d => d.mes === mes);
      const totalRenda = rendasMes.reduce((sum, r) => sum + r.valor, 0);
      const totalDivida = dividasMes.reduce((sum, d) => sum + d.valor, 0);
      saldoAcumulado += (totalRenda - totalDivida);
    }
    
    return saldoAcumulado;
  };

  const getBalancoMensal = (mes: string): BalancoMensal => {
    console.log('getBalancoMensal - mes:', mes);
    const rendasMes = rendas.filter(r => r.mes === mes);
    const dividasMes = dividas.filter(d => d.mes === mes);
    console.log('Rendas encontradas:', rendasMes.length, 'Dividas encontradas:', dividasMes.length);
    rendasMes.forEach(r => console.log('Renda:', r.mes, r.origem, r.valor));
    dividasMes.forEach(d => console.log('Divida:', d.mes, d.motivo, d.valor));

    const totalRenda = rendasMes.reduce((sum, r) => sum + r.valor, 0);
    const totalDivida = dividasMes.reduce((sum, d) => sum + d.valor, 0);
    const saldoMes = totalRenda - totalDivida;
    const saldoAcumulado = getSaldoAcumuladoAteOMes(mes);

    const gastosPorCategoria = {
      cartao: dividasMes.filter(d => d.categoria === 'cartao').reduce((sum, d) => sum + d.valor, 0),
      fixa: dividasMes.filter(d => d.categoria === 'fixa').reduce((sum, d) => sum + d.valor, 0),
      variavel: dividasMes.filter(d => d.categoria === 'variavel').reduce((sum, d) => sum + d.valor, 0),
      outro: dividasMes.filter(d => d.categoria === 'outro').reduce((sum, d) => sum + d.valor, 0),
    };

    return {
      mes,
      totalRenda,
      totalDivida,
      saldoMes,
      saldoAcumulado,
      porcentagemComprometida: totalRenda > 0 ? (totalDivida / totalRenda) * 100 : 0,
      gastosPorCategoria,
    };
  };

  const getComparativo = (mesAtual: string, mesAnterior: string): ComparativoMensal => {
    const balancoAtual = getBalancoMensal(mesAtual);
    const balancoAnterior = getBalancoMensal(mesAnterior);

    const diferencaRenda = balancoAtual.totalRenda - balancoAnterior.totalRenda;
    const diferencaGastos = balancoAtual.totalDivida - balancoAnterior.totalDivida;
    const diferencaSaldo = balancoAtual.saldoMes - balancoAnterior.saldoMes;
    const diferencaCartao = balancoAtual.gastosPorCategoria.cartao - balancoAnterior.gastosPorCategoria.cartao;

    let situacao: 'melhorando' | 'estavel' | 'piorando' = 'estavel';
    if (diferencaSaldo > 0 && diferencaGastos < 0) situacao = 'melhorando';
    else if (diferencaSaldo < 0 || diferencaGastos > balancoAnterior.totalDivida * 0.1) situacao = 'piorando';

    const padroes: string[] = [];
    if (Math.abs(diferencaGastos) > balancoAnterior.totalDivida * 0.15) {
      padroes.push(`Gastos ${diferencaGastos > 0 ? 'subiram' : 'caíram'} ${Math.abs(((diferencaGastos / balancoAnterior.totalDivida) * 100)).toFixed(1)}%`);
    }
    if (Math.abs(diferencaCartao) > balancoAnterior.gastosPorCategoria.cartao * 0.2) {
      padroes.push(`Cartão ${diferencaCartao > 0 ? 'aumentou' : 'diminuiu'} significativamente`);
    }

    return {
      mesAtual,
      mesAnterior,
      situacao,
      diferencaRenda,
      diferencaGastos,
      diferencaSaldo,
      diferencaCartao,
      padroes,
    };
  };

  const getInsights = (mes: string): Insight[] => {
    const balanco = getBalancoMensal(mes);
    const insights: Insight[] = [];

    if (balanco.porcentagemComprometida > 80) {
      insights.push({
        tipo: 'alerta',
        mensagem: `Você está comprometendo ${balanco.porcentagemComprometida.toFixed(1)}% da sua renda. Considere reduzir gastos variáveis.`,
      });
    }

    if (balanco.gastosPorCategoria.cartao > balanco.totalRenda * 0.3) {
      insights.push({
        tipo: 'alerta',
        mensagem: 'Gastos no cartão representam mais de 30% da renda. Estabeleça um limite mensal.',
      });
    }

    if (balanco.saldoMes > balanco.totalRenda * 0.2) {
      insights.push({
        tipo: 'parabens',
        mensagem: `Parabéns! Você economizou R$ ${balanco.saldoMes.toFixed(2)} este mês. Continue assim!`,
      });
    }

    if (balanco.saldoMes > 0 && balanco.saldoMes < balanco.totalRenda * 0.1) {
      insights.push({
        tipo: 'dica',
        mensagem: 'Tente aumentar sua reserva mensal para pelo menos 20% da renda.',
      });
    }

    if (balanco.saldoAcumulado < 0) {
      insights.push({
        tipo: 'alerta',
        mensagem: `Atenção! Seu saldo acumulado está negativo em R$ ${Math.abs(balanco.saldoAcumulado).toFixed(2)}. Revise seus gastos urgentemente.`,
      });
    }

    if (balanco.saldoAcumulado > balanco.totalRenda * 3) {
      insights.push({
        tipo: 'parabens',
        mensagem: `Excelente! Você já acumulou R$ ${balanco.saldoAcumulado.toFixed(2)}. Considere investir parte desse valor.`,
      });
    }

    return insights;
  };

  const getMesesDisponiveis = (): string[] => {
    const meses = new Set<string>();
    rendas.forEach(r => meses.add(r.mes));
    dividas.forEach(d => meses.add(d.mes));
    const resultado = Array.from(meses).sort().reverse();
    console.log('Meses disponíveis:', resultado);
    return resultado;
  };

  return {
    rendas,
    dividas,
    cartoes,
    parcelamentos,
    addRenda,
    addDivida,
    addRendas,
    addDividas,
    updateDivida,
    deleteDivida,
    deleteRenda,
    addCartao,
    updateCartao,
    deleteCartao,
    addParcelamento,
    deleteParcelamento,
    getParcelamentosByCartao,
    getBalancoMensal,
    getComparativo,
    getInsights,
    getMesesDisponiveis,
  };
};
