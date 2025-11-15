import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Trash2, AlertTriangle, CheckCircle, Database, Shield } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useQueryClient } from '@tanstack/react-query';

/**
 * 🗑️ LIMPEZA DE DADOS DE TESTE
 * V21.2 - Ferramenta administrativa para resetar dados
 * 
 * IMPORTANTE: Limpa DADOS, não funcionalidades (Regra-Mãe preservada)
 */
export default function LimparDadosTeste() {
  const [executando, setExecutando] = useState(false);
  const [progresso, setProgresso] = useState(0);
  const [resultado, setResultado] = useState(null);
  const [confirmacao, setConfirmacao] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const executarLimpeza = async () => {
    if (confirmacao !== 'LIMPAR TUDO') {
      toast({
        title: "⚠️ Confirmação necessária",
        description: 'Digite "LIMPAR TUDO" para confirmar',
        variant: 'destructive'
      });
      return;
    }

    setExecutando(true);
    setProgresso(0);
    const log = [];

    try {
      // 1. Pedidos e Orçamentos
      setProgresso(10);
      const pedidosDel = await base44.entities.Pedido.list();
      for (const p of pedidosDel) {
        await base44.entities.Pedido.delete(p.id);
      }
      log.push({ entidade: 'Pedido', quantidade: pedidosDel.length, status: 'ok' });

      // 2. PedidoEtapa
      setProgresso(20);
      const etapasDel = await base44.entities.PedidoEtapa.list();
      for (const e of etapasDel) {
        await base44.entities.PedidoEtapa.delete(e.id);
      }
      log.push({ entidade: 'PedidoEtapa', quantidade: etapasDel.length, status: 'ok' });

      // 3. Produtos
      setProgresso(30);
      const produtosDel = await base44.entities.Produto.list();
      for (const p of produtosDel) {
        await base44.entities.Produto.delete(p.id);
      }
      log.push({ entidade: 'Produto', quantidade: produtosDel.length, status: 'ok' });

      // 4. Clientes
      setProgresso(40);
      const clientesDel = await base44.entities.Cliente.list();
      for (const c of clientesDel) {
        await base44.entities.Cliente.delete(c.id);
      }
      log.push({ entidade: 'Cliente', quantidade: clientesDel.length, status: 'ok' });

      // 5. Fornecedores
      setProgresso(50);
      const fornecedoresDel = await base44.entities.Fornecedor.list();
      for (const f of fornecedoresDel) {
        await base44.entities.Fornecedor.delete(f.id);
      }
      log.push({ entidade: 'Fornecedor', quantidade: fornecedoresDel.length, status: 'ok' });

      // 6. Entregas
      setProgresso(60);
      const entregasDel = await base44.entities.Entrega.list();
      for (const e of entregasDel) {
        await base44.entities.Entrega.delete(e.id);
      }
      log.push({ entidade: 'Entrega', quantidade: entregasDel.length, status: 'ok' });

      // 7. Movimentações Estoque
      setProgresso(70);
      const movDel = await base44.entities.MovimentacaoEstoque.list();
      for (const m of movDel) {
        await base44.entities.MovimentacaoEstoque.delete(m.id);
      }
      log.push({ entidade: 'MovimentacaoEstoque', quantidade: movDel.length, status: 'ok' });

      // 8. Contas a Receber
      setProgresso(80);
      const crDel = await base44.entities.ContaReceber.list();
      for (const cr of crDel) {
        await base44.entities.ContaReceber.delete(cr.id);
      }
      log.push({ entidade: 'ContaReceber', quantidade: crDel.length, status: 'ok' });

      // 9. Contas a Pagar
      setProgresso(85);
      const cpDel = await base44.entities.ContaPagar.list();
      for (const cp of cpDel) {
        await base44.entities.ContaPagar.delete(cp.id);
      }
      log.push({ entidade: 'ContaPagar', quantidade: cpDel.length, status: 'ok' });

      // 10. Oportunidades CRM
      setProgresso(90);
      const opDel = await base44.entities.Oportunidade.list();
      for (const o of opDel) {
        await base44.entities.Oportunidade.delete(o.id);
      }
      log.push({ entidade: 'Oportunidade', quantidade: opDel.length, status: 'ok' });

      // 11. Interações
      setProgresso(95);
      const intDel = await base44.entities.Interacao.list();
      for (const i of intDel) {
        await base44.entities.Interacao.delete(i.id);
      }
      log.push({ entidade: 'Interacao', quantidade: intDel.length, status: 'ok' });

      // 12. Ordens de Compra
      setProgresso(98);
      const ocDel = await base44.entities.OrdemCompra.list();
      for (const oc of ocDel) {
        await base44.entities.OrdemCompra.delete(oc.id);
      }
      log.push({ entidade: 'OrdemCompra', quantidade: ocDel.length, status: 'ok' });

      setProgresso(100);
      setResultado({ sucesso: true, log });

      // Invalidar cache
      queryClient.invalidateQueries();

      toast({
        title: "✅ Limpeza concluída com sucesso!",
        description: `${log.reduce((sum, l) => sum + l.quantidade, 0)} registros removidos`
      });

    } catch (error) {
      setResultado({ 
        sucesso: false, 
        erro: error.message,
        log 
      });
      toast({
        title: "❌ Erro na limpeza",
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setExecutando(false);
      setConfirmacao('');
    }
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            🗑️ Limpar Dados de Teste
          </h1>
          <p className="text-slate-600">
            Ferramenta administrativa para resetar o banco de dados
          </p>
        </div>

        <Alert className="border-red-300 bg-red-50">
          <AlertTriangle className="w-5 h-5 text-red-600" />
          <AlertDescription>
            <p className="font-semibold text-red-900">⚠️ ATENÇÃO: Ação Irreversível!</p>
            <p className="text-sm text-red-700 mt-1">
              Esta ação irá deletar PERMANENTEMENTE todos os dados de teste. O código e funcionalidades serão preservados (Regra-Mãe).
            </p>
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader className="bg-slate-50 border-b">
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5 text-blue-600" />
              Dados que serão removidos
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="grid grid-cols-3 gap-4">
              {[
                'Pedidos/Orçamentos',
                'Etapas de Entrega',
                'Produtos',
                'Clientes',
                'Fornecedores',
                'Entregas',
                'Movimentações Estoque',
                'Contas a Receber',
                'Contas a Pagar',
                'Oportunidades CRM',
                'Interações',
                'Ordens de Compra'
              ].map(item => (
                <Badge key={item} variant="outline" className="justify-center py-2">
                  {item}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-300 bg-purple-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-900">
              <Shield className="w-5 h-5" />
              O que NÃO será removido (Regra-Mãe)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 gap-3 text-sm text-purple-800">
              <p>✅ Todas as páginas e componentes</p>
              <p>✅ Estrutura das entities (schemas)</p>
              <p>✅ Perfis de acesso</p>
              <p>✅ Usuários do sistema</p>
              <p>✅ Configurações de integrações</p>
              <p>✅ Tabelas de preço</p>
              <p>✅ Formas de pagamento</p>
              <p>✅ Configurações fiscais</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-red-300">
          <CardHeader className="bg-red-50 border-b">
            <CardTitle className="text-red-900">Confirmação Obrigatória</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Digite "LIMPAR TUDO" para confirmar:
              </label>
              <input
                type="text"
                value={confirmacao}
                onChange={(e) => setConfirmacao(e.target.value)}
                placeholder="LIMPAR TUDO"
                className="w-full px-4 py-2 border-2 border-red-300 rounded-lg focus:border-red-500 focus:outline-none"
                disabled={executando}
              />
            </div>

            <Button
              onClick={executarLimpeza}
              disabled={executando || confirmacao !== 'LIMPAR TUDO'}
              className="w-full bg-red-600 hover:bg-red-700"
              size="lg"
            >
              <Trash2 className="w-5 h-5 mr-2" />
              {executando ? 'Executando Limpeza...' : 'Executar Limpeza Completa'}
            </Button>

            {executando && (
              <div>
                <Progress value={progresso} className="h-2" />
                <p className="text-xs text-slate-500 mt-1 text-center">
                  {progresso}% concluído
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {resultado && (
          <Card className={`border-2 ${resultado.sucesso ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50'}`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {resultado.sucesso ? (
                  <CheckCircle className="w-6 h-6 text-green-600" />
                ) : (
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                )}
                {resultado.sucesso ? 'Limpeza Concluída!' : 'Erro na Limpeza'}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {resultado.log && resultado.log.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-white rounded border">
                  <span className="font-medium">{item.entidade}</span>
                  <Badge variant={item.status === 'ok' ? 'default' : 'destructive'}>
                    {item.quantidade} removidos
                  </Badge>
                </div>
              ))}

              {resultado.sucesso && (
                <Alert className="border-green-300 bg-green-100">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <AlertDescription className="text-sm text-green-900">
                    <p className="font-semibold">✅ Sistema limpo e pronto para dados reais!</p>
                    <p className="text-xs mt-1">
                      Todas as funcionalidades e código foram preservados (Regra-Mãe cumprida).
                    </p>
                  </AlertDescription>
                </Alert>
              )}

              {resultado.erro && (
                <Alert className="border-red-300 bg-red-100">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <AlertDescription className="text-sm text-red-900">
                    {resultado.erro}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}