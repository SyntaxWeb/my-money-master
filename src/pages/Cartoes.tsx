import { useState } from 'react';
import { useFinanceData } from '@/hooks/useFinanceData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Trash2, CreditCard, Plus } from 'lucide-react';
import { NavLink } from '@/components/NavLink';

const Cartoes = () => {
  const { cartoes, addCartao, deleteCartao, addParcelamento, getParcelamentosByCartao } = useFinanceData();
  const { toast } = useToast();

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

  const handleSubmitCartao = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!nome || !bandeira || !limite || !diaFechamento || !diaVencimento) {
      toast({
        title: 'Erro',
        description: 'Preencha todos os campos',
        variant: 'destructive',
      });
      return;
    }

    addCartao({
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

  const handleSubmitParcelamento = (e: React.FormEvent) => {
    e.preventDefault();

    if (!cartaoSelecionado || !descricao || !valorTotal || !numeroParcelas || !mesInicio) {
      toast({
        title: 'Erro',
        description: 'Preencha todos os campos',
        variant: 'destructive',
      });
      return;
    }

    addParcelamento({
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

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <NavLink to="/">← Voltar ao Dashboard</NavLink>

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
                              deleteCartao(cartao.id);
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
      </div>
    </div>
  );
};

export default Cartoes;
