import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";
import { 
  Shield, 
  Send, 
  CheckCircle, 
  AlertTriangle, 
  Loader2,
  FileText,
  Clock,
  RefreshCw,
  Link2,
  Info
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

/**
 * Componente de Integração com eSocial
 * V22.0 - Preparado para envio de eventos S-1000, S-2200, S-2300, etc.
 */
export default function IntegracaoESocial({ empresaId }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [enviando, setEnviando] = useState(false);

  const { data: colaboradores = [] } = useQuery({
    queryKey: ['colaboradores-esocial', empresaId],
    queryFn: () => base44.entities.Colaborador.filter({
      empresa_alocada_id: empresaId,
      status: 'Ativo'
    }),
    enabled: !!empresaId
  });

  const { data: configEmpresa } = useQuery({
    queryKey: ['empresa-esocial', empresaId],
    queryFn: () => base44.entities.Empresa.filter({ id: empresaId }).then(e => e[0]),
    enabled: !!empresaId
  });

  // Eventos eSocial a enviar
  const eventosParaEnviar = [
    { 
      codigo: 'S-1000', 
      nome: 'Informações do Empregador', 
      status: 'pendente',
      descricao: 'Dados cadastrais da empresa'
    },
    { 
      codigo: 'S-2200', 
      nome: 'Admissão de Trabalhador', 
      status: 'pendente',
      quantidade: colaboradores.length,
      descricao: `${colaboradores.length} colaboradores ativos`
    },
    { 
      codigo: 'S-2300', 
      nome: 'Trabalhadores Sem Vínculo', 
      status: 'nao_aplicavel',
      descricao: 'Não aplicável'
    },
    { 
      codigo: 'S-1200', 
      nome: 'Remuneração', 
      status: 'pendente',
      descricao: 'Folha de pagamento mensal'
    }
  ];

  const enviarEventoESocialMutation = useMutation({
    mutationFn: async (evento) => {
      setEnviando(true);
      
      // Simulação de envio ao eSocial
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Em produção, geraria XML conforme layout eSocial e enviaria via API gov.br
      const xmlGerado = `<?xml version="1.0" encoding="UTF-8"?>
<eSocial xmlns="http://www.esocial.gov.br/schema/evt/${evento.codigo}/v_S_01_02_00">
  <evtInfoEmpregador Id="ID1${configEmpresa?.cnpj}">
    <ideEvento>
      <tpAmb>2</tpAmb>
      <procEmi>1</procEmi>
      <verProc>1.0</verProc>
    </ideEvento>
    <!-- XML completo seria gerado aqui -->
  </evtInfoEmpregador>
</eSocial>`;

      const resultado = {
        evento: evento.codigo,
        status: 'sucesso',
        protocolo: `PROTO-${Date.now()}`,
        data_envio: new Date().toISOString(),
        xml_enviado: xmlGerado,
        recibo_esocial: `RECIBO-${Math.random().toString(36).substring(7).toUpperCase()}`
      };

      // Registrar log
      await base44.entities.LogESocial?.create({
        empresa_id: empresaId,
        evento_tipo: evento.codigo,
        evento_nome: evento.nome,
        data_hora: new Date().toISOString(),
        status: 'enviado',
        protocolo: resultado.protocolo,
        recibo: resultado.recibo_esocial,
        xml_enviado: xmlGerado,
        retorno: 'Evento processado com sucesso'
      });

      setEnviando(false);
      return resultado;
    },
    onSuccess: (resultado) => {
      toast({
        title: "✅ Evento Enviado!",
        description: `${resultado.evento} processado. Recibo: ${resultado.recibo_esocial}`
      });
    },
    onError: (error) => {
      setEnviando(false);
      toast({
        title: "❌ Erro no Envio",
        description: error.message || "Não foi possível enviar ao eSocial",
        variant: "destructive"
      });
    }
  });

  const statusConfig = {
    'pendente': { cor: 'bg-orange-100 text-orange-700', icon: Clock },
    'enviado': { cor: 'bg-green-100 text-green-700', icon: CheckCircle },
    'erro': { cor: 'bg-red-100 text-red-700', icon: AlertTriangle },
    'nao_aplicavel': { cor: 'bg-slate-100 text-slate-600', icon: Info }
  };

  return (
    <div className="space-y-6">
      {/* Status Conexão */}
      <Card className="border-2 border-blue-300 bg-gradient-to-r from-blue-50 to-cyan-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-blue-600" />
            Integração eSocial
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="border-blue-300 bg-blue-50">
            <Info className="w-5 h-5 text-blue-600" />
            <AlertDescription className="text-sm text-blue-900">
              <strong>Modo Demonstração:</strong> Esta é uma simulação da integração com eSocial.
              Em produção, os eventos seriam enviados via Web Service oficial do governo.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-white rounded-lg border">
              <p className="text-sm text-slate-600 mb-1">Ambiente</p>
              <Badge className="bg-yellow-600">Homologação</Badge>
            </div>
            <div className="text-center p-4 bg-white rounded-lg border">
              <p className="text-sm text-slate-600 mb-1">Versão Layout</p>
              <p className="font-bold">S-1.2</p>
            </div>
            <div className="text-center p-4 bg-white rounded-lg border">
              <p className="text-sm text-slate-600 mb-1">Certificado Digital</p>
              <Badge className={configEmpresa?.certificado_digital ? 'bg-green-600' : 'bg-red-600'}>
                {configEmpresa?.certificado_digital ? 'Válido' : 'Não Configurado'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Eventos Pendentes */}
      <Card className="border-0 shadow-md">
        <CardHeader className="bg-slate-50 border-b">
          <CardTitle className="text-base">Eventos eSocial</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {eventosParaEnviar.map((evento, idx) => {
              const config = statusConfig[evento.status];
              const StatusIcon = config.icon;

              return (
                <div key={idx} className="p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className={`p-3 rounded-lg ${config.cor}`}>
                        <StatusIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-bold">{evento.codigo}</p>
                          <Badge variant="outline" className="text-xs">
                            {evento.nome}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-600">{evento.descricao}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Badge className={config.cor}>
                        {evento.status === 'pendente' ? 'Pendente' :
                         evento.status === 'enviado' ? 'Enviado' :
                         evento.status === 'erro' ? 'Erro' :
                         'N/A'}
                      </Badge>

                      {evento.status === 'pendente' && (
                        <Button
                          size="sm"
                          onClick={() => enviarEventoESocialMutation.mutate(evento)}
                          disabled={enviando || !configEmpresa?.certificado_digital}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Send className="w-4 h-4 mr-1" />
                          Enviar
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Guia de Configuração */}
      <Card className="border-2 border-purple-300 bg-purple-50">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Info className="w-5 h-5 text-purple-600" />
            Checklist de Configuração
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              {configEmpresa?.certificado_digital ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600" />
              )}
              <span className={configEmpresa?.certificado_digital ? 'text-green-800' : 'text-red-800'}>
                Certificado Digital A1 ou A3 configurado
              </span>
            </div>

            <div className="flex items-center gap-3">
              {configEmpresa?.cnpj ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600" />
              )}
              <span className={configEmpresa?.cnpj ? 'text-green-800' : 'text-red-800'}>
                CNPJ da empresa cadastrado
              </span>
            </div>

            <div className="flex items-center gap-3">
              {colaboradores.length > 0 ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600" />
              )}
              <span className={colaboradores.length > 0 ? 'text-green-800' : 'text-red-800'}>
                Colaboradores cadastrados com CPF
              </span>
            </div>

            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
              <span className="text-yellow-800">
                Ambiente de Homologação ativo (trocar para Produção em Configurações)
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}