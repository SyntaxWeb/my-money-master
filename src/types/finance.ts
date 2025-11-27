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
}

export interface BalancoMensal {
  mes: string;
  totalRenda: number;
  totalDivida: number;
  saldo: number;
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
