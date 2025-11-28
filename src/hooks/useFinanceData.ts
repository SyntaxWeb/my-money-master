import { useState, useEffect } from 'react';
import { Renda, Divida, BalancoMensal, ComparativoMensal, Insight } from '@/types/finance';

const STORAGE_KEYS = {
  RENDAS: 'finance_rendas',
  DIVIDAS: 'finance_dividas',
};

export const useFinanceData = () => {
  const [rendas, setRendas] = useState<Renda[]>([]);
  const [dividas, setDividas] = useState<Divida[]>([]);

  useEffect(() => {
    const storedRendas = localStorage.getItem(STORAGE_KEYS.RENDAS);
    const storedDividas = localStorage.getItem(STORAGE_KEYS.DIVIDAS);

    if (storedRendas) setRendas(JSON.parse(storedRendas));
    if (storedDividas) setDividas(JSON.parse(storedDividas));
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
    addRenda,
    addDivida,
    addRendas,
    addDividas,
    updateDivida,
    deleteDivida,
    deleteRenda,
    getBalancoMensal,
    getComparativo,
    getInsights,
    getMesesDisponiveis,
  };
};
