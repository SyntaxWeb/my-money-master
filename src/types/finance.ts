export interface Renda {
  id: string;
  mes: string; // formato: YYYY-MM
  valor: number;
  origem: string;
  data: string;
}

export interface Divida {
  id: string;
  mes: string; // formato: YYYY-MM
  valor: number;
  motivo: string;
  categoria: 'cartao' | 'fixa' | 'variavel' | 'outro';
  data: string;
  status: 'paga' | 'aberta';
  cartaoId?: string; // Opcional: ID do cartão quando for despesa de cartão
  parcelamentoId?: string; // Opcional: ID do parcelamento original
}

export interface BalancoMensal {
  mes: string;
  totalRenda: number;
  totalDivida: number;
  saldoMes: number;
  saldoAcumulado: number;
  porcentagemComprometida: number;
  gastosPorCategoria: {
    cartao: number;
    fixa: number;
    variavel: number;
    outro: number;
  };
}

export interface ComparativoMensal {
  mesAtual: string;
  mesAnterior: string;
  situacao: 'melhorando' | 'estavel' | 'piorando';
  diferencaRenda: number;
  diferencaGastos: number;
  diferencaSaldo: number;
  diferencaCartao: number;
  padroes: string[];
}

export interface Insight {
  tipo: 'alerta' | 'dica' | 'parabens';
  mensagem: string;
}

export interface Cartao {
  id: string;
  nome: string;
  bandeira: string;
  limite: number;
  diaFechamento: number;
  diaVencimento: number;
}

export interface Parcelamento {
  id: string;
  cartaoId: string;
  descricao: string;
  valorTotal: number;
  numeroParcelas: number;
  parcelaAtual: number;
  mesInicio: string; // formato: YYYY-MM
  categoria: 'cartao';
}

export interface Cofrinho {
  id: string;
  nome: string;
  descricao?: string;
  saldo: number;
  criadoEm?: string; // ISO date
}
