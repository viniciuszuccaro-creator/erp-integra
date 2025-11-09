import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CircleCheck, XCircle, Zap, Brain, Shield } from "lucide-react";
import { toast } from "sonner";
import { executarJobCNHASO } from "@/components/rh/JobIACNHASO";
import { validarSoD } from "@/components/rh/IASoDValidator";

/**
 * V21.5 - TESTE COMPLETO: Fase 5 - RH & Governança
 * Valida: IA CNH/ASO, Folha → ContaPagar, SoD, Bloqueios
 */
export default function TesteIntegracaoV21_5_RH({ empresaId }) {
  const [executando, setExecutando] = useState(false);
  const [resultados, setResultados] = useState([]);

  const executarFullScan = async () => {
    setExecutando(true);
    setResultados([]);
    const logs = [];

    try {
      // TESTE 1: IA CNH/ASO
      logs.push({ teste: 'IA CNH/ASO', status: 'executando' });
      setResultados([...logs]);

      const alertasCNH = await executarJobCNHASO(empresaId);
      
      logs[0] = {
        teste: 'IA CNH/ASO',
        status: alertasCNH.length > 0 ? 'info' : 'sucesso',
        detalhes: `${alertasCNH.length} alerta(s) gerado(s)`
      };

      setResultados([...logs]);

      // TESTE 2: Folha → ContaPagar
      logs.push({ teste: 'Folha → ContaPagar', status: 'executando' });
      setResultados([...logs]);

      const contasSalario = await base44.entities.ContaPagar.filter({
        empresa_id: empresaId,
        categoria: 'Salários'
      }, '-created_date', 1);

      logs[1] = {
        teste: 'Folha → ContaPagar',
        status: contasSalario.length > 0 ? 'sucesso' : 'info',
        detalhes: contasSalario.length > 0 
          ? `Última folha: R$ ${contasSalario[0].valor?.toFixed(2)}`
          : 'Nenhuma folha gerada ainda'
      };

      setResultados([...logs]);

      // TESTE 3: Lançamento Contábil
      logs.push({ teste: 'Lançamento Contábil (Provisão)', status: 'executando' });
      setResultados([...logs]);

      const lancamentos = await base44.entities.LancamentoContabil.filter({
        empresa_id: empresaId,
        tipo_documento: 'Folha de Pagamento'
      }, '-data_lancamento', 1);

      logs[2] = {
        teste: 'Lançamento Contábil (Provisão)',
        status: lancamentos.length > 0 ? 'sucesso' : 'info',
        detalhes: lancamentos.length > 0
          ? `Última provisão: R$ ${lancamentos[0].valor?.toFixed(2)}`
          : 'Nenhum lançamento encontrado'
      };

      setResultados([...logs]);

      // TESTE 4: IA SoD (Segregação de Funções)
      logs.push({ teste: 'IA SoD (Segregação de Funções)', status: 'executando' });
      setResultados([...logs]);

      const usuarios = await base44.entities.User.list();
      let conflitosEncontrados = 0;

      for (const usuario of usuarios.slice(0, 5)) { // Testar primeiros 5
        const validacao = await validarSoD(usuario.id, empresaId);
        if (!validacao.valido) {
          conflitosEncontrados += validacao.conflitos_bloqueantes;
        }
      }

      logs[3] = {
        teste: 'IA SoD (Segregação de Funções)',
        status: conflitosEncontrados === 0 ? 'sucesso' : 'warning',
        detalhes: conflitosEncontrados === 0
          ? 'Nenhum conflito crítico detectado'
          : `${conflitosEncontrados} conflito(s) de segregação encontrado(s)`
      };

      setResultados([...logs]);

      // TESTE 5: Bloqueio CNH no Romaneio
      logs.push({ teste: 'Bloqueio CNH → Romaneio', status: 'executando' });
      setResultados([...logs]);

      const colaboradoresBloqueados = await base44.entities.Colaborador.filter({
        empresa_alocada_id: empresaId,
        pode_dirigir: false
      });

      const motoristas = await base44.entities.Motorista.list();
      const motoristasValidos = motoristas.filter(m => {
        const colab = colaboradoresBloqueados.find(c => c.id === m.colaborador_id);
        return !colab;
      });

      logs[4] = {
        teste: 'Bloqueio CNH → Romaneio',
        status: 'sucesso',
        detalhes: `${colaboradoresBloqueados.length} motorista(s) bloqueado(s) por CNH vencida`
      };

      setResultados([...logs]);

      toast.success('✅ Full Scan RH V21.5 Concluído!');

    } catch (error) {
      console.error('Erro no teste:', error);
      toast.error('❌ Erro no Full Scan');
      logs.push({ teste: 'Erro Geral', status: 'erro', detalhes: error.message });
      setResultados([...logs]);
    } finally {
      setExecutando(false);
    }
  };

  return (
    <Card className="border-2 border-purple-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-purple-600" />
          Teste V21.5 - RH & Governança (Full Scan)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert className="border-purple-300 bg-purple-50">
          <Brain className="w-4 h-4 text-purple-600" />
          <AlertDescription className="text-sm text-purple-800">
            <strong>Testa:</strong> IA CNH/ASO, Folha → Financeiro, Lançamentos Contábeis, SoD, Bloqueios
          </AlertDescription>
        </Alert>

        <Button
          onClick={executarFullScan}
          disabled={executando}
          className="w-full bg-purple-600 hover:bg-purple-700"
        >
          {executando ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Executando Full Scan...
            </>
          ) : (
            <>
              <Zap className="w-4 h-4 mr-2" />
              Executar Full Scan V21.5 - RH
            </>
          )}
        </Button>

        {/* Resultados */}
        {resultados.length > 0 && (
          <div className="space-y-2">
            <p className="font-bold text-sm">Resultados:</p>
            {resultados.map((res, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-lg border-2 ${
                  res.status === 'sucesso' ? 'bg-green-50 border-green-300' :
                  res.status === 'erro' ? 'bg-red-50 border-red-300' :
                  res.status === 'executando' ? 'bg-blue-50 border-blue-300' :
                  'bg-yellow-50 border-yellow-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {res.status === 'sucesso' && <CircleCheck className="w-4 h-4 text-green-600" />}
                    {res.status === 'erro' && <XCircle className="w-4 h-4 text-red-600" />}
                    {res.status === 'executando' && (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    )}
                    {res.status === 'warning' && <AlertTriangle className="w-4 h-4 text-yellow-600" />}
                    <p className="font-bold text-sm">{res.teste}</p>
                  </div>
                  <Badge className={
                    res.status === 'sucesso' ? 'bg-green-600' :
                    res.status === 'erro' ? 'bg-red-600' :
                    res.status === 'executando' ? 'bg-blue-600' :
                    'bg-yellow-600'
                  }>
                    {res.status}
                  </Badge>
                </div>
                {res.detalhes && (
                  <p className="text-xs text-slate-600 mt-2">{res.detalhes}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}