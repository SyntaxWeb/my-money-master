import { useEffect, useState } from 'react';
import {
  BalancoMensal,
  Cartao,
  Cofrinho,
  ComparativoMensal,
  Divida,
  Insight,
  Parcelamento,
  Renda,
} from '@/types/finance';
import { apiRequest } from '@/lib/api';

type RendaApi = {
  id: number;
  mes: string;
  valor: number | string;
  origem: string;
  data: string;
};

type DividaApi = {
  id: number;
  mes: string;
  valor: number | string;
  motivo: string;
  categoria: Divida['categoria'];
  data: string;
  status: Divida['status'];
  cartao_id?: number | null;
  parcelamento_id?: number | null;
};

type CartaoApi = {
  id: number;
  nome: string;
  bandeira: string;
  limite: number | string;
  dia_fechamento: number;
  dia_vencimento: number;
};

type ParcelamentoApi = {
  id: number;
  cartao_id: number;
  descricao: string;
  valor_total: number | string;
  numero_parcelas: number;
  parcela_atual: number;
  mes_inicio: string;
};

type CofrinhoApi = {
  id: number;
  nome: string;
  descricao?: string | null;
  saldo: number | string;
  created_at?: string;
};

const mapRenda = (r: RendaApi): Renda => ({
  id: String(r.id),
  mes: r.mes,
  valor: Number(r.valor),
  origem: r.origem,
  data: r.data,
});

const mapDivida = (d: DividaApi): Divida => ({
  id: String(d.id),
  mes: d.mes,
  valor: Number(d.valor),
  motivo: d.motivo,
  categoria: d.categoria,
  data: d.data,
  status: d.status,
  cartaoId: d.cartao_id ? String(d.cartao_id) : undefined,
  parcelamentoId: d.parcelamento_id ? String(d.parcelamento_id) : undefined,
});

const mapCartao = (c: CartaoApi): Cartao => ({
  id: String(c.id),
  nome: c.nome,
  bandeira: c.bandeira,
  limite: Number(c.limite),
  diaFechamento: c.dia_fechamento,
  diaVencimento: c.dia_vencimento,
});

const mapParcelamento = (p: ParcelamentoApi): Parcelamento => ({
  id: String(p.id),
  cartaoId: String(p.cartao_id),
  descricao: p.descricao,
  valorTotal: Number(p.valor_total),
  numeroParcelas: p.numero_parcelas,
  parcelaAtual: p.parcela_atual,
  mesInicio: p.mes_inicio,
  categoria: 'cartao',
});

const mapCofrinho = (c: CofrinhoApi): Cofrinho => ({
  id: String(c.id),
  nome: c.nome,
  descricao: c.descricao ?? undefined,
  saldo: Number(c.saldo),
  criadoEm: c.created_at ?? undefined,
});

export const useFinanceData = () => {
  const [rendas, setRendas] = useState<Renda[]>([]);
  const [dividas, setDividas] = useState<Divida[]>([]);
  const [cartoes, setCartoes] = useState<Cartao[]>([]);
  const [parcelamentos, setParcelamentos] = useState<Parcelamento[]>([]);
  const [cofrinhos, setCofrinhos] = useState<Cofrinho[]>([]);

  useEffect(() => {
    const loadAll = async () => {
      try {
        const [rendasData, dividasData, cartoesData, parcelamentosData, cofrinhosData] = await Promise.all([
          apiRequest<RendaApi[]>('/rendas'),
          apiRequest<DividaApi[]>('/dividas'),
          apiRequest<CartaoApi[]>('/cartoes'),
          apiRequest<ParcelamentoApi[]>('/parcelamentos'),
          apiRequest<CofrinhoApi[]>('/cofrinhos'),
        ]);

        setRendas(rendasData.map(mapRenda));
        setDividas(dividasData.map(mapDivida));
        setCartoes(cartoesData.map(mapCartao));
        setParcelamentos(parcelamentosData.map(mapParcelamento));
        setCofrinhos(cofrinhosData.map(mapCofrinho));
      } catch (error) {
        console.error('Erro ao carregar dados financeiros da API', error);
      }
    };

    void loadAll();
  }, []);

  // RENDAS
  const addRenda = async (renda: Omit<Renda, 'id'>) => {
    const created = await apiRequest<RendaApi>('/rendas', 'POST', {
      mes: renda.mes,
      valor: renda.valor,
      origem: renda.origem,
      data: renda.data,
    });
    setRendas((prev) => [...prev, mapRenda(created)]);
  };

  const addRendas = async (rendasToAdd: Omit<Renda, 'id'>[]) => {
    for (const r of rendasToAdd) {
      // eslint-disable-next-line no-await-in-loop
      await addRenda(r);
    }
  };

  const deleteRenda = async (id: string) => {
    await apiRequest(`/rendas/${id}`, 'DELETE');
    setRendas((prev) => prev.filter((r) => r.id !== id));
  };

  // DIVIDAS
  const addDivida = async (divida: Omit<Divida, 'id'>) => {
    const created = await apiRequest<DividaApi>('/dividas', 'POST', {
      mes: divida.mes,
      valor: divida.valor,
      motivo: divida.motivo,
      categoria: divida.categoria,
      data: divida.data,
      status: divida.status,
      cartao_id: divida.cartaoId ? Number(divida.cartaoId) : undefined,
      parcelamento_id: divida.parcelamentoId ? Number(divida.parcelamentoId) : undefined,
    });
    setDividas((prev) => [...prev, mapDivida(created)]);
  };

  const addDividas = async (dividasToAdd: Omit<Divida, 'id'>[]) => {
    for (const d of dividasToAdd) {
      // eslint-disable-next-line no-await-in-loop
      await addDivida(d);
    }
  };

  const updateDivida = async (id: string, updates: Partial<Divida>) => {
    const existing = dividas.find((d) => d.id === id);

    const updated = await apiRequest<DividaApi>(`/dividas/${id}`, 'PATCH', {
      mes: updates.mes ?? existing?.mes,
      valor: updates.valor ?? existing?.valor,
      motivo: updates.motivo ?? existing?.motivo,
      categoria: updates.categoria ?? existing?.categoria,
      data: updates.data ?? existing?.data,
      status: updates.status ?? existing?.status,
      cartao_id: (updates.cartaoId ?? existing?.cartaoId) ? Number(updates.cartaoId ?? existing?.cartaoId) : undefined,
      parcelamento_id: (updates.parcelamentoId ?? existing?.parcelamentoId)
        ? Number(updates.parcelamentoId ?? existing?.parcelamentoId)
        : undefined,
    });

    const mapped = mapDivida(updated);
    setDividas((prev) => prev.map((d) => (d.id === id ? mapped : d)));

    // Programação de contas fixas: ao marcar uma conta fixa como paga, cria a do próximo mês
    if (
      existing &&
      existing.categoria === 'fixa' &&
      existing.status !== 'paga' &&
      mapped.status === 'paga'
    ) {
      const [y, m] = existing.mes.split('-').map(Number);
      if (y && m) {
        const base = new Date(y, m); // next month
        const nextMes = `${base.getFullYear()}-${String(base.getMonth() + 1).padStart(2, '0')}`;

        const alreadyExists = dividas.some(
          (d) =>
            d.categoria === 'fixa' &&
            d.mes === nextMes &&
            d.motivo === existing.motivo &&
            d.valor === existing.valor,
        );

        if (!alreadyExists) {
          const nextDate = new Date(
            Number(existing.data.slice(0, 4)),
            Number(existing.data.slice(5, 7)),
            1,
          );
          const dataProximoMes = nextDate.toISOString().split('T')[0];

          await addDivida({
            mes: nextMes,
            valor: existing.valor,
            motivo: existing.motivo,
            categoria: 'fixa',
            data: dataProximoMes,
            status: 'aberta',
          });
        }
      }
    }
  };

  const deleteDivida = async (id: string) => {
    await apiRequest(`/dividas/${id}`, 'DELETE');
    setDividas((prev) => prev.filter((d) => d.id !== id));
  };

  // CARTOES
  const addCartao = async (cartao: Omit<Cartao, 'id'>) => {
    const created = await apiRequest<CartaoApi>('/cartoes', 'POST', {
      nome: cartao.nome,
      bandeira: cartao.bandeira,
      limite: cartao.limite,
      dia_fechamento: cartao.diaFechamento,
      dia_vencimento: cartao.diaVencimento,
    });
    setCartoes((prev) => [...prev, mapCartao(created)]);
  };

  const updateCartao = async (id: string, updates: Partial<Cartao>) => {
    const updated = await apiRequest<CartaoApi>(`/cartoes/${id}`, 'PATCH', {
      nome: updates.nome,
      bandeira: updates.bandeira,
      limite: updates.limite,
      dia_fechamento: updates.diaFechamento,
      dia_vencimento: updates.diaVencimento,
    });
    setCartoes((prev) => prev.map((c) => (c.id === id ? mapCartao(updated) : c)));
  };

  const deleteCartao = async (id: string) => {
    await apiRequest(`/cartoes/${id}`, 'DELETE');
    setCartoes((prev) => prev.filter((c) => c.id !== id));
  };

  // PARCELAMENTOS
  const addParcelamento = async (parcelamento: Omit<Parcelamento, 'id'>) => {
    // Verifica se já existe parcelamento igual
    const exists = parcelamentos.some(
      (p) =>
        p.cartaoId === parcelamento.cartaoId &&
        p.descricao === parcelamento.descricao &&
        p.mesInicio === parcelamento.mesInicio &&
        p.valorTotal === parcelamento.valorTotal &&
        p.numeroParcelas === parcelamento.numeroParcelas,
    );

    if (exists) return;

    const created = await apiRequest<ParcelamentoApi>('/parcelamentos', 'POST', {
      cartao_id: Number(parcelamento.cartaoId),
      descricao: parcelamento.descricao,
      valor_total: parcelamento.valorTotal,
      numero_parcelas: parcelamento.numeroParcelas,
      parcela_atual: parcelamento.parcelaAtual,
      mes_inicio: parcelamento.mesInicio,
    });

    const newParcelamento = mapParcelamento(created);
    setParcelamentos((prev) => [...prev, newParcelamento]);

    // Vincular parcela atual à dívida do mês atual
    try {
      const currentIndex = parcelamento.parcelaAtual - 1; // 0-based
      const [startAno, startMes] = parcelamento.mesInicio.split('-').map(Number);

      const currDateObj = new Date(startAno, startMes - 1 + currentIndex, 1);
      const currMesStr = `${currDateObj.getFullYear()}-${String(currDateObj.getMonth() + 1).padStart(2, '0')}`;

      setDividas((prev) =>
        prev.map((d) => {
          if (d.cartaoId === parcelamento.cartaoId && d.mes === currMesStr && d.motivo?.includes(parcelamento.descricao)) {
            return { ...d, parcelamentoId: newParcelamento.id };
          }
          return d;
        }),
      );
    } catch {
      // ignore
    }

    // Criar dívidas futuras das parcelas
    const valorParcelaBase = parcelamento.valorTotal / parcelamento.numeroParcelas;
    const novasDividas: Omit<Divida, 'id'>[] = [];

    const [anoCompra, mesCompra] = parcelamento.mesInicio.split('-').map(Number);

    // Parcela atual
    const pAtual = parcelamento.parcelaAtual;
    const diffAtual = pAtual -1;
    const dataAtual = new Date(anoCompra, mesCompra - 1 + diffAtual, 1);
    const mesParcelaAtual = `${dataAtual.getFullYear()}-${String(dataAtual.getMonth() + 1).padStart(2, '0')}`;

    const existsInCurrentMonth = dividas.some(
      (d) => d.cartaoId === parcelamento.cartaoId && d.mes === mesParcelaAtual && d.motivo?.includes(parcelamento.descricao),
    );

    if (!existsInCurrentMonth) {
      novasDividas.push({
        mes: mesParcelaAtual,
        valor: Number(valorParcelaBase.toFixed(2)),
        motivo: `${parcelamento.descricao} (${pAtual}/${parcelamento.numeroParcelas})`,
        categoria: 'cartao',
        data: dataAtual.toISOString().split('T')[0],
        status: 'aberta',
        cartaoId: parcelamento.cartaoId,
        parcelamentoId: newParcelamento.id,
      });
    }

    for (let p = parcelamento.parcelaAtual + 1; p <= parcelamento.numeroParcelas; p++) {
      const diff = p - 1;
      const dataObj = new Date(anoCompra, mesCompra - 1 + diff, 1);
      const mesParcela = `${dataObj.getFullYear()}-${String(dataObj.getMonth() + 1).padStart(2, '0')}`;

      const isLast = p === parcelamento.numeroParcelas;
      const valor = isLast
        ? Number((parcelamento.valorTotal - valorParcelaBase * (parcelamento.numeroParcelas - 1)).toFixed(2))
        : Number(valorParcelaBase.toFixed(2));

      novasDividas.push({
        mes: mesParcela,
        valor,
        motivo: `${parcelamento.descricao} (${p}/${parcelamento.numeroParcelas})`,
        categoria: 'cartao',
        data: dataObj.toISOString().split('T')[0],
        status: 'aberta',
        cartaoId: parcelamento.cartaoId,
        parcelamentoId: newParcelamento.id,
      });
    }

    await addDividas(novasDividas);
  };

  const deleteParcelamento = async (id: string) => {
    await apiRequest(`/parcelamentos/${id}`, 'DELETE');
    setParcelamentos((prev) => prev.filter((p) => p.id !== id));
  };

  // COFRINHOS
  const addCofrinho = async (
    cofrinho: Omit<Cofrinho, 'id' | 'criadoEm'>,
    initialDeposit = 0,
    mes?: string,
  ): Promise<boolean> => {
    const targetMes = mes || new Date().toISOString().slice(0, 7);
    const bal = getBalancoMensal(targetMes);

    if (initialDeposit && initialDeposit > 0 && initialDeposit > bal.saldoMes) {
      const created = await apiRequest<CofrinhoApi>('/cofrinhos', 'POST', {
        nome: cofrinho.nome,
        descricao: cofrinho.descricao,
        saldo: 0,
      });
      setCofrinhos((prev) => [...prev, mapCofrinho(created)]);
      return false;
    }

    const created = await apiRequest<CofrinhoApi>('/cofrinhos', 'POST', {
      nome: cofrinho.nome,
      descricao: cofrinho.descricao,
      saldo: Number(((cofrinho.saldo || 0) + initialDeposit).toFixed(2)),
    });

    setCofrinhos((prev) => [...prev, mapCofrinho(created)]);

    if (initialDeposit && initialDeposit > 0) {
      await addDivida({
        mes: targetMes,
        valor: Number(initialDeposit.toFixed(2)),
        motivo: `Transfer to cofrinho: ${cofrinho.nome}`,
        categoria: 'outro',
        data: new Date().toISOString().split('T')[0],
        status: 'aberta',
      });
    }

    return true;
  };

  const updateCofrinho = async (id: string, updates: Partial<Cofrinho>) => {
    const existing = cofrinhos.find((c) => c.id === id);
    if (!existing) return;

    const updated = await apiRequest<CofrinhoApi>(`/cofrinhos/${id}`, 'PATCH', {
      nome: updates.nome ?? existing.nome,
      descricao: updates.descricao ?? existing.descricao,
      saldo: updates.saldo ?? existing.saldo,
    });

    setCofrinhos((prev) => prev.map((c) => (c.id === id ? mapCofrinho(updated) : c)));
  };

  const deleteCofrinho = async (id: string) => {
    await apiRequest(`/cofrinhos/${id}`, 'DELETE');
    setCofrinhos((prev) => prev.filter((c) => c.id !== id));
  };

  const depositToCofrinho = async (id: string, amount: number, mes?: string): Promise<boolean> => {
    if (amount <= 0) return false;
    const targetMes = mes || new Date().toISOString().slice(0, 7);
    const bal = getBalancoMensal(targetMes);

    if (amount > bal.saldoMes) {
      return false;
    }

    const c = cofrinhos.find((x) => x.id === id);
    if (!c) return false;

    await addDivida({
      mes: targetMes,
      valor: Number(amount.toFixed(2)),
      motivo: `Transfer to cofrinho: ${c.nome}`,
      categoria: 'outro',
      data: new Date().toISOString().split('T')[0],
      status: 'aberta',
    });

    await updateCofrinho(id, { saldo: Number((c.saldo + amount).toFixed(2)) });
    return true;
  };

  const withdrawFromCofrinho = async (id: string, amount: number, mes?: string) => {
    if (amount <= 0) return;
    const c = cofrinhos.find((x) => x.id === id);
    if (!c) return;
    if (amount > c.saldo) return;
    const targetMes = mes || new Date().toISOString().slice(0, 7);

    await addRenda({
      mes: targetMes,
      valor: Number(amount.toFixed(2)),
      origem: `Cofrinho: ${c.nome}`,
      data: new Date().toISOString().split('T')[0],
    });

    await updateCofrinho(id, { saldo: Number((c.saldo - amount).toFixed(2)) });
  };

  const getParcelamentosByCartao = (cartaoId: string) => {
    return parcelamentos.filter((p) => p.cartaoId === cartaoId);
  };

  const getMesesDisponiveis = (): string[] => {
    const meses = new Set<string>();
    rendas.forEach((r) => meses.add(r.mes));
    dividas.forEach((d) => meses.add(d.mes));
    const resultado = Array.from(meses).sort().reverse();
    console.log('Meses disponíveis:', resultado);
    return resultado;
  };

  const getSaldoAcumuladoAteOMes = (mesAlvo: string): number => {
    const mesesOrdenados = getMesesDisponiveis().sort();
    const indiceMesAlvo = mesesOrdenados.indexOf(mesAlvo);

    if (indiceMesAlvo === -1) return 0;

    let saldoAcumulado = 0;
    for (let i = 0; i <= indiceMesAlvo; i++) {
      const mes = mesesOrdenados[i];
      const rendasMes = rendas.filter((r) => r.mes === mes);
      // Para saldo acumulado, considerar apenas despesas em aberto (não pagas)
      const dividasMes = dividas.filter((d) => d.mes === mes && d.status !== 'paga');
      const totalRenda = rendasMes.reduce((sum, r) => sum + r.valor, 0);
      const totalDivida = dividasMes.reduce((sum, d) => sum + d.valor, 0);
      saldoAcumulado += totalRenda - totalDivida;
    }

    return saldoAcumulado;
  };

  const getBalancoMensal = (mes: string): BalancoMensal => {
    console.log('getBalancoMensal - mes:', mes);
    const rendasMes = rendas.filter((r) => r.mes === mes);
    const dividasMes = dividas.filter((d) => d.mes === mes);
    console.log('Rendas encontradas:', rendasMes.length, 'Dividas encontradas:', dividasMes.length);
    rendasMes.forEach((r) => console.log('Renda:', r.mes, r.origem, r.valor));
    dividasMes.forEach((d) => console.log('Divida:', d.mes, d.motivo, d.valor));

    const totalRenda = rendasMes.reduce((sum, r) => sum + r.valor, 0);
    const totalDivida = dividasMes.reduce((sum, d) => sum + d.valor, 0);
    const saldoMes = totalRenda - totalDivida;
    const saldoAcumulado = getSaldoAcumuladoAteOMes(mes);

    const gastosPorCategoria = {
      cartao: dividasMes.filter((d) => d.categoria === 'cartao').reduce((sum, d) => sum + d.valor, 0),
      fixa: dividasMes.filter((d) => d.categoria === 'fixa').reduce((sum, d) => sum + d.valor, 0),
      variavel: dividasMes.filter((d) => d.categoria === 'variavel').reduce((sum, d) => sum + d.valor, 0),
      outro: dividasMes.filter((d) => d.categoria === 'outro').reduce((sum, d) => sum + d.valor, 0),
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
      padroes.push(
        `Gastos ${diferencaGastos > 0 ? 'subiram' : 'caíram'} ${Math.abs(
          ((diferencaGastos / balancoAnterior.totalDivida) * 100),
        ).toFixed(1)}%`,
      );
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
        mensagem: `Você está comprometendo ${balanco.porcentagemComprometida.toFixed(
          1,
        )}% da sua renda. Considere reduzir gastos variáveis.`,
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
        mensagem: `Atenção! Seu saldo acumulado está negativo em R$ ${Math.abs(
          balanco.saldoAcumulado,
        ).toFixed(2)}. Revise seus gastos urgentemente.`,
      });
    }

    if (balanco.saldoAcumulado > balanco.totalRenda * 3) {
      insights.push({
        tipo: 'parabens',
        mensagem: `Excelente! Você já acumulou R$ ${balanco.saldoAcumulado.toFixed(
          2,
        )}. Considere investir parte desse valor.`,
      });
    }

    return insights;
  };

  return {
    rendas,
    dividas,
    cartoes,
    parcelamentos,
    cofrinhos,
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
    addCofrinho,
    updateCofrinho,
    deleteCofrinho,
    depositToCofrinho,
    withdrawFromCofrinho,
    getParcelamentosByCartao,
    getBalancoMensal,
    getComparativo,
    getInsights,
    getMesesDisponiveis,
  };
};
