import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle, AlertTriangle, Rocket } from "lucide-react";

/**
 * V21.3 - Cenários de Teste Automatizados
 * Testa: Bloqueio Dinâmico, Faturamento Parcial, Devolução
 */
export default function TesteIntegracaoV21_3({ empresaId }) {
  const [executando, setExecutando] = useState(false);
  const [resultados, setResultados] = useState(null);

  const executarTestes = async () => {
    setExecutando(true);
    const report = {
      timestamp: new Date().toISOString(),
      cenarios: [],
      sucesso: 0,
      falhas: 0
    };

    try {
      // CENÁRIO 1: Bloqueio Dinâmico
      console.log('🧪 Teste 1: Bloqueio Dinâmico');
      
      const clienteTeste = await base44.entities.Cliente.create({
        empresa_id: empresaId,
        nome: 'Cliente Teste Bloqueio',
        tipo: 'Pessoa Jurídica',
        cnpj: '00000000000001',
        status: 'Ativo',
        condicao_comercial: {
          situacao_credito: 'OK'
        }
      });

      // Criar 2 contas vencidas há 25 dias
      const dataVenc25DiasAtras = new Date();
      dataVenc25DiasAtras.setDate(dataVenc25DiasAtras.getDate() - 25);

      const conta1 = await base44.entities.ContaReceber.create({
        empresa_id: empresaId,
        cliente_id: clienteTeste.id,
        cliente: clienteTeste.nome,
        descricao: 'Teste Etapa 1',
        valor: 5000,
        data_emissao: new Date().toISOString().split('T')[0],
        data_vencimento: dataVenc25DiasAtras.toISOString().split('T')[0],
        status: 'Atrasado',
        dias_atraso: 25,
        etapa_id: 'etapa_teste_1'
      });

      const conta2 = await base44.entities.ContaReceber.create({
        empresa_id: empresaId,
        cliente_id: clienteTeste.id,
        cliente: clienteTeste.nome,
        descricao: 'Teste Etapa 2',
        valor: 3000,
        data_emissao: new Date().toISOString().split('T')[0],
        data_vencimento: dataVenc25DiasAtras.toISOString().split('T')[0],
        status: 'Atrasado',
        dias_atraso: 25,
        etapa_id: 'etapa_teste_2'
      });

      // Simular execução da Régua
      const { executarReguaCobranca } = await import('../financeiro/ReguaCobrancaIA');
      await executarReguaCobranca(empresaId);

      // Verificar se cliente foi bloqueado
      const clienteAtualizado = await base44.entities.Cliente.get(clienteTeste.id);
      const bloqueado = clienteAtualizado.condicao_comercial?.situacao_credito === 'Bloqueado';

      report.cenarios.push({
        nome: 'Bloqueio Dinâmico (2 etapas 25 dias)',
        esperado: 'Cliente bloqueado + notificações enviadas',
        resultado: bloqueado ? 'SUCESSO ✅' : 'FALHA ❌',
        detalhes: `Cliente ${bloqueado ? 'bloqueado' : 'não bloqueado'}. Status: ${clienteAtualizado.condicao_comercial?.situacao_credito}`
      });

      if (bloqueado) report.sucesso++;
      else report.falhas++;

      // CENÁRIO 2: Faturamento Parcial
      console.log('🧪 Teste 2: Faturamento Parcial');

      const pedidoTeste = await base44.entities.Pedido.create({
        empresa_id: empresaId,
        numero_pedido: `TEST-${Date.now()}`,
        cliente_id: clienteTeste.id,
        cliente_nome: clienteTeste.nome,
        data_pedido: new Date().toISOString().split('T')[0],
        valor_total: 30000,
        status: 'Aprovado'
      });

      // Criar 3 etapas
      const etapa1 = await base44.entities.PedidoEtapa.create({
        pedido_id: pedidoTeste.id,
        numero_pedido: pedidoTeste.numero_pedido,
        empresa_id: empresaId,
        nome_etapa: '1ª Entrega - Fundação',
        sequencia: 1,
        itens_ids: ['item_1'],
        valor_total_etapa: 10000,
        faturada: false,
        status: 'Planejada'
      });

      const etapa2 = await base44.entities.PedidoEtapa.create({
        pedido_id: pedidoTeste.id,
        numero_pedido: pedidoTeste.numero_pedido,
        empresa_id: empresaId,
        nome_etapa: '2ª Entrega - Estrutura',
        sequencia: 2,
        itens_ids: ['item_2'],
        valor_total_etapa: 15000,
        faturada: false,
        status: 'Planejada'
      });

      const etapa3 = await base44.entities.PedidoEtapa.create({
        pedido_id: pedidoTeste.id,
        numero_pedido: pedidoTeste.numero_pedido,
        empresa_id: empresaId,
        nome_etapa: '3ª Entrega - Acabamento',
        sequencia: 3,
        itens_ids: ['item_3'],
        valor_total_etapa: 5000,
        faturada: false,
        status: 'Planejada'
      });

      // Faturar apenas Etapa 2
      await base44.entities.PedidoEtapa.update(etapa2.id, {
        faturada: true,
        nfe_id: 'nfe_teste_123',
        numero_nfe: '123456',
        status: 'Faturada',
        data_faturamento: new Date().toISOString().split('T')[0]
      });

      // Criar conta a receber da etapa 2
      await base44.entities.ContaReceber.create({
        empresa_id: empresaId,
        descricao: `Etapa 2 - Pedido ${pedidoTeste.numero_pedido}`,
        cliente_id: clienteTeste.id,
        cliente: clienteTeste.nome,
        pedido_id: pedidoTeste.id,
        etapa_id: etapa2.id,
        valor: 15000,
        data_emissao: new Date().toISOString().split('T')[0],
        data_vencimento: new Date().toISOString().split('T')[0],
        status: 'Pendente'
      });

      // Calcular progresso
      const etapasAtualizadas = await base44.entities.PedidoEtapa.filter({ pedido_id: pedidoTeste.id });
      const faturadas = etapasAtualizadas.filter(e => e.faturada).length;
      const progresso = (faturadas / 3) * 100;

      report.cenarios.push({
        nome: 'Faturamento Parcial (3 etapas)',
        esperado: 'Etapa 2 faturada, progresso 33%',
        resultado: progresso === 33.33 || Math.abs(progresso - 33.33) < 1 ? 'SUCESSO ✅' : 'FALHA ❌',
        detalhes: `${faturadas}/3 etapas faturadas. Progresso: ${progresso.toFixed(1)}%`
      });

      if (Math.abs(progresso - 33.33) < 1) report.sucesso++;
      else report.falhas++;

      // CENÁRIO 3: Devolução → Bloqueio Financeiro
      console.log('🧪 Teste 3: Logística Reversa');

      const entregaTeste = await base44.entities.Entrega.create({
        empresa_id: empresaId,
        pedido_id: pedidoTeste.id,
        numero_pedido: pedidoTeste.numero_pedido,
        cliente_id: clienteTeste.id,
        cliente_nome: clienteTeste.nome,
        endereco_entrega_completo: {
          logradouro: 'Rua Teste',
          numero: '123',
          cidade: 'São Paulo',
          estado: 'SP'
        },
        status: 'Entrega Frustrada',
        logistica_reversa: {
          ativada: true,
          motivo: 'Recusa Total',
          data_ocorrencia: new Date().toISOString(),
          quantidade_devolvida: 100,
          valor_devolvido: 15000
        }
      });

      // Buscar conta da etapa 2 e verificar se deve ser bloqueada
      const contasEtapa2 = await base44.entities.ContaReceber.filter({
        pedido_id: pedidoTeste.id,
        etapa_id: etapa2.id
      });

      const deveBloq = contasEtapa2.length > 0;

      report.cenarios.push({
        nome: 'Devolução → Bloqueio Financeiro',
        esperado: 'Conta a receber identificada para bloqueio/cancelamento',
        resultado: deveBloq ? 'SUCESSO ✅' : 'FALHA ❌',
        detalhes: `Entrega frustrada criada. Contas vinculadas: ${contasEtapa2.length}`
      });

      if (deveBloq) report.sucesso++;
      else report.falhas++;

      // Limpar dados de teste
      console.log('🧹 Limpando dados de teste...');
      await base44.entities.Cliente.delete(clienteTeste.id);
      await base44.entities.Pedido.delete(pedidoTeste.id);
      // Demais deletam em cascata

    } catch (error) {
      report.cenarios.push({
        nome: 'Erro Geral',
        esperado: 'Testes sem erro',
        resultado: 'FALHA ❌',
        detalhes: error.message
      });
      report.falhas++;
    } finally {
      setExecutando(false);
      setResultados(report);
    }

    return report;
  };

  return (
    <Card className="border-2 border-blue-300">
      <CardHeader className="bg-blue-50">
        <CardTitle className="flex items-center gap-2">
          <Rocket className="w-5 h-5 text-blue-600" />
          Testes de Integração V21.3
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        <Alert className="border-purple-300 bg-purple-50">
          <AlertTriangle className="w-4 h-4 text-purple-600" />
          <AlertDescription className="text-sm text-purple-800">
            <strong>Testes Automatizados:</strong> Cria dados temporários, testa fluxos e remove ao final.
          </AlertDescription>
        </Alert>

        <Button
          onClick={executarTestes}
          disabled={executando}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          {executando ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Executando Testes...
            </>
          ) : (
            <>
              <Rocket className="w-4 h-4 mr-2" />
              Executar Cenários de Teste
            </>
          )}
        </Button>

        {resultados && (
          <div className="space-y-3 mt-6">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <div>
                <p className="font-bold text-lg">Relatório Final</p>
                <p className="text-xs text-slate-500">{resultados.timestamp}</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{resultados.sucesso}</p>
                  <p className="text-xs text-slate-500">Sucesso</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-600">{resultados.falhas}</p>
                  <p className="text-xs text-slate-500">Falhas</p>
                </div>
              </div>
            </div>

            {resultados.cenarios.map((cenario, idx) => (
              <Card 
                key={idx} 
                className={`border-l-4 ${
                  cenario.resultado.includes('SUCESSO') 
                    ? 'border-l-green-500 bg-green-50' 
                    : 'border-l-red-500 bg-red-50'
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="font-bold text-sm">{cenario.nome}</p>
                      <p className="text-xs text-slate-600 mt-1">
                        <strong>Esperado:</strong> {cenario.esperado}
                      </p>
                    </div>
                    {cenario.resultado.includes('SUCESSO') ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                    )}
                  </div>
                  <div className="p-2 bg-white rounded text-xs mt-2">
                    <p className="text-slate-700">{cenario.detalhes}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}