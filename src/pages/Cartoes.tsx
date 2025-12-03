import { useState } from 'react';
import { useFinanceData } from '@/hooks/useFinanceData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Trash2, CreditCard, Plus, Receipt, TrendingUp, AlertCircle } from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Cartoes = () => {
  const { cartoes, dividas, addCartao, deleteCartao, addParcelamento, getParcelamentosByCartao, getMesesDisponiveis } = useFinanceData();
  const { toast } = useToast();
  const mesesDisponiveis = getMesesDisponiveis();
  const [mesSelecionado, setMesSelecionado] = useState(
    mesesDisponiveis[0] || new Date().toISOString().slice(0, 7)
  );

  // Form cartão
  const [nome, setNome] = useState('');
  const [bandeira, setBandeira] = useState('');
  const [limite, setLimite] = useState('');
  const [diaFechamento, setDiaFechamento] = useState('');
  const [diaVencimento, setDiaVencimento] = useState('');

  // Form parcelamento
  const [cartaoSelecionado, setCartaoSelecionado] = useState('');
  const [descricao, setDescricao] = useState('');
  const [valorTotal, setValorTotal] = useState('');
  const [numeroParcelas, setNumeroParcelas] = useState('');
  const [mesInicio, setMesInicio] = useState('');

  const handleSubmitCartao = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!nome || !bandeira || !limite || !diaFechamento || !diaVencimento) {
      toast({
        title: 'Erro',
        description: 'Preencha todos os campos',
        variant: 'destructive',
      });
      return;
    }

    await addCartao({
      nome,
      bandeira,
      limite: parseFloat(limite),
      diaFechamento: parseInt(diaFechamento),
      diaVencimento: parseInt(diaVencimento),
    });

    setNome('');
    setBandeira('');
    setLimite('');
    setDiaFechamento('');
    setDiaVencimento('');

    toast({
      title: 'Sucesso',
      description: 'Cartão cadastrado!',
    });
  };

  const handleSubmitParcelamento = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!cartaoSelecionado || !descricao || !valorTotal || !numeroParcelas || !mesInicio) {
      toast({
        title: 'Erro',
        description: 'Preencha todos os campos',
        variant: 'destructive',
      });
      return;
    }
    console.log('Adicionando parcelamento:', {
     cartaoId: cartaoSelecionado,
      descricao,
      valorTotal: parseFloat(valorTotal),
      numeroParcelas: parseInt(numeroParcelas),
      parcelaAtual: 1,
      mesInicio,
      categoria: 'cartao',
    });

    await addParcelamento({
      cartaoId: cartaoSelecionado,
      descricao,
      valorTotal: parseFloat(valorTotal),
      numeroParcelas: parseInt(numeroParcelas),
      parcelaAtual: 1,
      mesInicio,
      categoria: 'cartao',
    });

    setCartaoSelecionado('');
    setDescricao('');
    setValorTotal('');
    setNumeroParcelas('');
    setMesInicio('');

    toast({
      title: 'Sucesso',
      description: 'Parcelamento criado! As parcelas foram adicionadas às despesas.',
    });
  };

  // Função para calcular gastos do cartão no mês
  const getGastosCartaoNoMes = (cartaoId: string, mes: string) => {
    return dividas
      .filter(d => d.mes === mes && d.categoria === 'cartao' && d.cartaoId === cartaoId)
      .reduce((sum, d) => sum + d.valor, 0);
  };

  // Função para pegar parcelas do cartão no mês
  const getParcelasDoMes = (cartaoId: string, mes: string) => {
    return dividas.filter(
      d => d.mes === mes && 
      d.categoria === 'cartao' && 
      d.cartaoId === cartaoId
    );
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <NavLink to="/app">← Voltar ao Dashboard</NavLink>

        <Tabs defaultValue="cadastro" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="cadastro">Cadastro</TabsTrigger>
            <TabsTrigger value="faturas">Faturas Mensais</TabsTrigger>
          </TabsList>

          <TabsContent value="cadastro" className="space-y-8 mt-6">

        {/* Cadastrar Cartão */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Cadastrar Cartão
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitCartao} className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="nome">Nome do Cartão</Label>
                <Input
                  id="nome"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex: Nubank Platinium"
                />
              </div>
              <div>
                <Label htmlFor="bandeira">Bandeira</Label>
                <Select value={bandeira} onValueChange={setBandeira}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Visa">Visa</SelectItem>
                    <SelectItem value="Mastercard">Mastercard</SelectItem>
                    <SelectItem value="Elo">Elo</SelectItem>
                    <SelectItem value="American Express">American Express</SelectItem>
                    <SelectItem value="Outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="limite">Limite (R$)</Label>
                <Input
                  id="limite"
                  type="number"
                  step="0.01"
                  value={limite}
                  onChange={(e) => setLimite(e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label htmlFor="fechamento">Dia de Fechamento</Label>
                <Input
                  id="fechamento"
                  type="number"
                  min="1"
                  max="31"
                  value={diaFechamento}
                  onChange={(e) => setDiaFechamento(e.target.value)}
                  placeholder="Ex: 15"
                />
              </div>
              <div>
                <Label htmlFor="vencimento">Dia de Vencimento</Label>
                <Input
                  id="vencimento"
                  type="number"
                  min="1"
                  max="31"
                  value={diaVencimento}
                  onChange={(e) => setDiaVencimento(e.target.value)}
                  placeholder="Ex: 20"
                />
              </div>
              <div className="md:col-span-2">
                <Button type="submit" className="w-full">
                  Cadastrar Cartão
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Adicionar Parcelamento */}
        {cartoes.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Adicionar Compra Parcelada
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitParcelamento} className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="cartao">Cartão</Label>
                  <Select value={cartaoSelecionado} onValueChange={setCartaoSelecionado}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o cartão" />
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
                  <Label htmlFor="descricao">Descrição</Label>
                  <Input
                    id="descricao"
                    value={descricao}
                    onChange={(e) => setDescricao(e.target.value)}
                    placeholder="Ex: Notebook Dell"
                  />
                </div>
                <div>
                  <Label htmlFor="valorTotal">Valor Total (R$)</Label>
                  <Input
                    id="valorTotal"
                    type="number"
                    step="0.01"
                    value={valorTotal}
                    onChange={(e) => setValorTotal(e.target.value)}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="parcelas">Número de Parcelas</Label>
                  <Input
                    id="parcelas"
                    type="number"
                    min="1"
                    value={numeroParcelas}
                    onChange={(e) => setNumeroParcelas(e.target.value)}
                    placeholder="Ex: 12"
                  />
                </div>
                <div>
                  <Label htmlFor="mesInicio">Mês de Início</Label>
                  <Input
                    id="mesInicio"
                    type="month"
                    value={mesInicio}
                    onChange={(e) => setMesInicio(e.target.value)}
                  />
                </div>
                <div className="md:col-span-2">
                  <Button type="submit" className="w-full">
                    Adicionar Parcelamento
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

            {/* Lista de Cartões */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Meus Cartões</h2>
              {cartoes.length === 0 ? (
                <p className="text-muted-foreground">Nenhum cartão cadastrado ainda.</p>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {cartoes.map((cartao) => {
                    const parcelamentosDoCartao = getParcelamentosByCartao(cartao.id);
                    return (
                      <Card key={cartao.id}>
                        <CardHeader>
                          <CardTitle className="flex items-center justify-between">
                            <span>{cartao.nome}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                if (confirm('Deseja excluir este cartão?')) {
                                  void deleteCartao(cartao.id);
                                  toast({
                                    title: 'Cartão excluído',
                                    description: 'O cartão foi removido com sucesso.',
                                  });
                                }
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                          <p>
                            <strong>Bandeira:</strong> {cartao.bandeira}
                          </p>
                          <p>
                            <strong>Limite:</strong> R$ {cartao.limite.toFixed(2)}
                          </p>
                          <p>
                            <strong>Fechamento:</strong> Dia {cartao.diaFechamento}
                          </p>
                          <p>
                            <strong>Vencimento:</strong> Dia {cartao.diaVencimento}
                          </p>
                          {parcelamentosDoCartao.length > 0 && (
                            <div className="mt-4 border-t pt-4">
                              <p className="font-semibold mb-2">Parcelamentos ativos:</p>
                              {parcelamentosDoCartao.map((parc) => (
                                <div key={parc.id} className="text-xs text-muted-foreground">
                                  • {parc.descricao} - {parc.numeroParcelas}x R${' '}
                                  {(parc.valorTotal / parc.numeroParcelas).toFixed(2)}
                                </div>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="faturas" className="space-y-6 mt-6">
            {/* Seletor de Mês */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
                  <Label htmlFor="mes-fatura" className="text-sm font-medium">
                    Selecione o mês:
                  </Label>
                  <select
                    value={mesSelecionado}
                    onChange={(e) => setMesSelecionado(e.target.value)}
                    id="mes-fatura"
                    className="px-3 py-2 border border-border rounded-md bg-background text-foreground w-full sm:w-auto"
                  >
                    {mesesDisponiveis.map((mes) => (
                      <option key={mes} value={mes}>
                        {(() => {
                          const [ano, mesNum] = mes.split('-').map(Number);
                          const data = new Date(ano, mesNum - 1, 1);
                          const label = data.toLocaleDateString('pt-BR', {
                            year: 'numeric',
                            month: 'long',
                          });
                          return label.charAt(0).toUpperCase() + label.slice(1);
                        })()}
                      </option>
                    ))}
                  </select>
                </div>
              </CardContent>
            </Card>

            {/* Faturas por Cartão */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Faturas do Mês</h2>
              {cartoes.length === 0 ? (
                <p className="text-muted-foreground">Nenhum cartão cadastrado ainda.</p>
              ) : (
                <div className="grid gap-4">
                  {cartoes.map((cartao) => {
                    const gastosDoMes = getGastosCartaoNoMes(cartao.id, mesSelecionado);
                    const parcelasDoMes = getParcelasDoMes(cartao.id, mesSelecionado);
                    const percentualUsado = (gastosDoMes / cartao.limite) * 100;
                    const proximoAoLimite = percentualUsado > 80;

                    return (
                      <Card key={cartao.id}>
                        <CardHeader>
                          <CardTitle className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Receipt className="h-5 w-5" />
                              <span>{cartao.nome}</span>
                            </div>
                            {proximoAoLimite && (
                              <AlertCircle className="h-5 w-5 text-destructive" />
                            )}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {/* Resumo da Fatura */}
                          <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                            <div>
                              <p className="text-sm text-muted-foreground">Total da Fatura</p>
                              <p className="text-2xl font-bold">
                                R$ {gastosDoMes.toFixed(2)}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Limite Disponível</p>
                              <p className="text-2xl font-bold">
                                R$ {(cartao.limite - gastosDoMes).toFixed(2)}
                              </p>
                            </div>
                          </div>

                          {/* Barra de Progresso */}
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Uso do Limite</span>
                              <span className={proximoAoLimite ? 'text-destructive font-semibold' : ''}>
                                {percentualUsado.toFixed(1)}%
                              </span>
                            </div>
                            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className={`h-full transition-all ${
                                  proximoAoLimite ? 'bg-destructive' : 'bg-primary'
                                }`}
                                style={{ width: `${Math.min(percentualUsado, 100)}%` }}
                              />
                            </div>
                            {proximoAoLimite && (
                              <p className="text-xs text-destructive flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" />
                                Atenção! Você está próximo do limite do cartão.
                              </p>
                            )}
                          </div>

                          {/* Informações do Cartão */}
                          <div className="grid grid-cols-2 gap-2 text-sm border-t pt-4">
                            <div>
                              <span className="text-muted-foreground">Bandeira: </span>
                              <span className="font-medium">{cartao.bandeira}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Limite: </span>
                              <span className="font-medium">R$ {cartao.limite.toFixed(2)}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Fechamento: </span>
                              <span className="font-medium">Dia {cartao.diaFechamento}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Vencimento: </span>
                              <span className="font-medium">Dia {cartao.diaVencimento}</span>
                            </div>
                          </div>

                          {/* Lista de Parcelas do Mês */}
                          {parcelasDoMes.length > 0 && (
                            <div className="border-t pt-4">
                              <p className="font-semibold mb-3 flex items-center gap-2">
                                <TrendingUp className="h-4 w-4" />
                                Parcelas deste mês ({parcelasDoMes.length})
                              </p>
                              <div className="space-y-2">
                                {parcelasDoMes.map((divida) => (
                                  <div
                                    key={divida.id}
                                    className="flex justify-between items-center p-2 bg-muted rounded text-sm"
                                  >
                                    <div className="flex-1">
                                      <p className="font-medium">{divida.motivo}</p>
                                      <p className="text-xs text-muted-foreground">
                                        {new Date(divida.data).toLocaleDateString('pt-BR')}
                                      </p>
                                    </div>
                                    <div className="text-right">
                                      <p className="font-semibold">R$ {divida.valor.toFixed(2)}</p>
                                      <p className={`text-xs ${divida.status === 'paga' ? 'text-green-600' : 'text-yellow-600'}`}>
                                        {divida.status === 'paga' ? 'Paga' : 'Em aberto'}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {parcelasDoMes.length === 0 && (
                            <p className="text-sm text-muted-foreground text-center py-4 border-t">
                              Nenhuma parcela neste mês
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Cartoes;
