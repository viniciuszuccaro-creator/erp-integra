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
import { useContextoVisual } from '@/components/lib/useContextoVisual';
import usePermissions from '@/components/lib/usePermissions';

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
  const { contexto, empresaAtual, grupoAtual, empresasDoGrupo = [] } = useContextoVisual();
  const { user, isAdmin, hasPermission } = usePermissions();
  const grupoAtivoId = grupoAtual?.id || empresaAtual?.group_id || empresaAtual?.grupo_id || (() => {
    try { return localStorage.getItem('group_atual_id'); } catch { return null; }
  })();
  const empresaAtivaId = contexto === 'grupo' ? null : empresaAtual?.id;
  const contextoValido = !!(grupoAtivoId || empresaAtivaId);
  const usuarioAdmin = typeof isAdmin === 'function' ? isAdmin() : !!isAdmin;
  const podeExecutarLimpeza = contextoValido && (
    usuarioAdmin ||
    hasPermission?.('Sistema', null, 'excluir') ||
    hasPermission?.('Sistema', 'manutencao', 'excluir')
  );

  const pertenceAoEscopo = (registro) => {
    if (!registro) return false;
    const empresasIds = empresasDoGrupo.map((e) => e.id);
    const registroGrupoId = registro.group_id || registro.grupo_id || registro.grupo_atual_id;
    const registroEmpresaId = registro.empresa_id || registro.empresa_atual_id;
    const temEscopo = !!(registroGrupoId || registroEmpresaId);
    if (!temEscopo) return false;
    if (contexto === 'grupo') {
      return registroGrupoId === grupoAtivoId || empresasIds.includes(registroEmpresaId);
    }
    return registroEmpresaId === empresaAtivaId || registroGrupoId === grupoAtivoId;
  };

  const listarNoEscopo = async (entityName) => {
    const registros = await base44.entities[entityName].list();
    return registros.filter(pertenceAoEscopo);
  };

  const executarLimpeza = async () => {
    if (!contextoValido) {
      toast({
        title: "Contexto obrigatorio",
        description: "Selecione um grupo ou empresa antes de limpar dados.",
        variant: "destructive"
      });
      return;
    }

    if (!podeExecutarLimpeza) {
      toast({
        title: "Acesso negado",
        description: "Somente administrador ou perfil com permissao de exclusao no Sistema pode executar esta acao.",
        variant: "destructive"
      });
      return;
    }

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
      setProgresso(5);
      const pedidosDel = await listarNoEscopo('Pedido');
      for (const p of pedidosDel) {
        await base44.entities.Pedido.delete(p.id);
      }
      log.push({ entidade: 'Pedido', quantidade: pedidosDel.length, status: 'ok' });

      // 2. PedidoEtapa
      setProgresso(10);
      const etapasDel = await listarNoEscopo('PedidoEtapa');
      for (const e of etapasDel) {
        await base44.entities.PedidoEtapa.delete(e.id);
      }
      log.push({ entidade: 'PedidoEtapa', quantidade: etapasDel.length, status: 'ok' });

      // 3. Produtos
      setProgresso(15);
      const produtosDel = await listarNoEscopo('Produto');
      for (const p of produtosDel) {
        await base44.entities.Produto.delete(p.id);
      }
      log.push({ entidade: 'Produto', quantidade: produtosDel.length, status: 'ok' });

      // 4. Clientes
      setProgresso(20);
      const clientesDel = await listarNoEscopo('Cliente');
      for (const c of clientesDel) {
        await base44.entities.Cliente.delete(c.id);
      }
      log.push({ entidade: 'Cliente', quantidade: clientesDel.length, status: 'ok' });

      // 5. Fornecedores
      setProgresso(25);
      const fornecedoresDel = await listarNoEscopo('Fornecedor');
      for (const f of fornecedoresDel) {
        await base44.entities.Fornecedor.delete(f.id);
      }
      log.push({ entidade: 'Fornecedor', quantidade: fornecedoresDel.length, status: 'ok' });

      // 6. Colaboradores
      setProgresso(30);
      const colaboradoresDel = await listarNoEscopo('Colaborador');
      for (const c of colaboradoresDel) {
        await base44.entities.Colaborador.delete(c.id);
      }
      log.push({ entidade: 'Colaborador', quantidade: colaboradoresDel.length, status: 'ok' });

      // 7. Transportadoras
      setProgresso(35);
      const transportadorasDel = await listarNoEscopo('Transportadora');
      for (const t of transportadorasDel) {
        await base44.entities.Transportadora.delete(t.id);
      }
      log.push({ entidade: 'Transportadora', quantidade: transportadorasDel.length, status: 'ok' });

      // 8. Entregas
      setProgresso(40);
      const entregasDel = await listarNoEscopo('Entrega');
      for (const e of entregasDel) {
        await base44.entities.Entrega.delete(e.id);
      }
      log.push({ entidade: 'Entrega', quantidade: entregasDel.length, status: 'ok' });

      // 9. Romaneios
      setProgresso(45);
      const romaneiosDel = await listarNoEscopo('Romaneio');
      for (const r of romaneiosDel) {
        await base44.entities.Romaneio.delete(r.id);
      }
      log.push({ entidade: 'Romaneio', quantidade: romaneiosDel.length, status: 'ok' });

      // 10. Movimentações Estoque
      setProgresso(50);
      const movDel = await listarNoEscopo('MovimentacaoEstoque');
      for (const m of movDel) {
        await base44.entities.MovimentacaoEstoque.delete(m.id);
      }
      log.push({ entidade: 'MovimentacaoEstoque', quantidade: movDel.length, status: 'ok' });

      // 11. Contas a Receber
      setProgresso(55);
      const crDel = await listarNoEscopo('ContaReceber');
      for (const cr of crDel) {
        await base44.entities.ContaReceber.delete(cr.id);
      }
      log.push({ entidade: 'ContaReceber', quantidade: crDel.length, status: 'ok' });

      // 12. Contas a Pagar
      setProgresso(60);
      const cpDel = await listarNoEscopo('ContaPagar');
      for (const cp of cpDel) {
        await base44.entities.ContaPagar.delete(cp.id);
      }
      log.push({ entidade: 'ContaPagar', quantidade: cpDel.length, status: 'ok' });

      // 13. Oportunidades CRM
      setProgresso(65);
      const opDel = await listarNoEscopo('Oportunidade');
      for (const o of opDel) {
        await base44.entities.Oportunidade.delete(o.id);
      }
      log.push({ entidade: 'Oportunidade', quantidade: opDel.length, status: 'ok' });

      // 14. Interações
      setProgresso(70);
      const intDel = await listarNoEscopo('Interacao');
      for (const i of intDel) {
        await base44.entities.Interacao.delete(i.id);
      }
      log.push({ entidade: 'Interacao', quantidade: intDel.length, status: 'ok' });

      // 15. Ordens de Compra
      setProgresso(75);
      const ocDel = await listarNoEscopo('OrdemCompra');
      for (const oc of ocDel) {
        await base44.entities.OrdemCompra.delete(oc.id);
      }
      log.push({ entidade: 'OrdemCompra', quantidade: ocDel.length, status: 'ok' });

      // 16. Solicitações de Compra
      setProgresso(80);
      const scDel = await listarNoEscopo('SolicitacaoCompra');
      for (const sc of scDel) {
        await base44.entities.SolicitacaoCompra.delete(sc.id);
      }
      log.push({ entidade: 'SolicitacaoCompra', quantidade: scDel.length, status: 'ok' });

      // 17. Ordens de Produção
      setProgresso(85);
      const oprodDel = await listarNoEscopo('OrdemProducao');
      for (const op of oprodDel) {
        await base44.entities.OrdemProducao.delete(op.id);
      }
      log.push({ entidade: 'OrdemProducao', quantidade: oprodDel.length, status: 'ok' });

      // 18. Notas Fiscais
      setProgresso(90);
      const nfDel = await listarNoEscopo('NotaFiscal');
      for (const nf of nfDel) {
        await base44.entities.NotaFiscal.delete(nf.id);
      }
      log.push({ entidade: 'NotaFiscal', quantidade: nfDel.length, status: 'ok' });

      // 19. Veículos
      setProgresso(93);
      const veicDel = await listarNoEscopo('Veiculo');
      for (const v of veicDel) {
        await base44.entities.Veiculo.delete(v.id);
      }
      log.push({ entidade: 'Veiculo', quantidade: veicDel.length, status: 'ok' });

      // 20. Comissões
      setProgresso(96);
      const comDel = await listarNoEscopo('Comissao');
      for (const c of comDel) {
        await base44.entities.Comissao.delete(c.id);
      }
      log.push({ entidade: 'Comissao', quantidade: comDel.length, status: 'ok' });

      setProgresso(100);
      setResultado({ sucesso: true, log });

      await base44.entities.AuditLog.create({
        usuario: user?.full_name || user?.email || "Sistema",
        usuario_id: user?.id || null,
        empresa_id: empresaAtivaId || null,
        group_id: grupoAtivoId || null,
        acao: "Limpeza",
        modulo: "Sistema",
        entidade: "DadosTeste",
        descricao: "Limpeza local de dados de teste no escopo selecionado",
        dados_novos: {
          total_removido: log.reduce((sum, l) => sum + l.quantidade, 0),
          entidades: log,
        },
        sucesso: true,
        data_hora: new Date().toISOString(),
      });

      // Invalidar cache
      queryClient.invalidateQueries();

      toast({
        title: "✅ Limpeza concluída com sucesso!",
        description: `${log.reduce((sum, l) => sum + l.quantidade, 0)} registros removidos`
      });

    } catch (error) {
      try {
        await base44.entities.AuditLog.create({
          usuario: user?.full_name || user?.email || "Sistema",
          usuario_id: user?.id || null,
          empresa_id: empresaAtivaId || null,
          group_id: grupoAtivoId || null,
          acao: "Erro",
          modulo: "Sistema",
          entidade: "DadosTeste",
          descricao: "Falha na limpeza local de dados de teste",
          dados_novos: { erro: error.message, entidades_processadas: log },
          sucesso: false,
          data_hora: new Date().toISOString(),
        });
      } catch (auditError) {
        console.warn("[Sistema] Falha ao auditar erro de limpeza:", auditError);
      }

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
                'Colaboradores',
                'Transportadoras',
                'Entregas',
                'Romaneios',
                'Movimentações Estoque',
                'Contas a Receber',
                'Contas a Pagar',
                'Oportunidades CRM',
                'Interações',
                'Ordens de Compra',
                'Solicitações Compra',
                'Ordens Produção',
                'Notas Fiscais',
                'Veículos',
                'Comissões'
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
            {!contextoValido && (
              <Alert className="border-orange-300 bg-orange-50">
                <AlertTriangle className="w-4 h-4 text-orange-600" />
                <AlertDescription className="text-sm text-orange-900">
                  Selecione um grupo ou empresa antes de liberar esta rotina.
                </AlertDescription>
              </Alert>
            )}

            {contextoValido && !podeExecutarLimpeza && (
              <Alert className="border-red-300 bg-red-50">
                <Shield className="w-4 h-4 text-red-600" />
                <AlertDescription className="text-sm text-red-900">
                  Seu perfil nao possui permissao para executar limpeza de dados.
                </AlertDescription>
              </Alert>
            )}

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
                disabled={executando || !podeExecutarLimpeza}
              />
            </div>

            <Button
              onClick={executarLimpeza}
              disabled={executando || confirmacao !== 'LIMPAR TUDO' || !podeExecutarLimpeza}
              className="w-full bg-red-600 hover:bg-red-700"
              size="lg"
              data-action="Sistema.LimpezaDadosTeste.executar"
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
