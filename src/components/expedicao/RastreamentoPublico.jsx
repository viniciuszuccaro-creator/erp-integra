import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Truck,
  MapPin,
  Package,
  Clock,
  CheckCircle,
  AlertCircle,
  User,
  Phone
} from "lucide-react";

/**
 * Componente de Rastreamento Público
 * Pode ser acessado via link único (sem login)
 * URL: /rastreamento?codigo=QR_CODE_DA_ENTREGA
 */
export default function RastreamentoPublico({ codigoRastreamento }) {
  const { data: entrega, isLoading } = useQuery({
    queryKey: ['rastreamento', codigoRastreamento],
    queryFn: async () => {
      const entregas = await base44.entities.Entrega.filter({ qr_code: codigoRastreamento });
      return entregas[0] || null;
    },
    enabled: !!codigoRastreamento,
    refetchInterval: 30000 // Atualiza a cada 30s
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-6">
        <div className="text-center">
          <Truck className="w-16 h-16 animate-bounce mx-auto mb-4 text-blue-600" />
          <p className="text-slate-600">Buscando informações...</p>
        </div>
      </div>
    );
  }

  if (!entrega) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-6">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-900 mb-2">Código não encontrado</h2>
            <p className="text-slate-600">
              O código de rastreamento não existe ou foi digitado incorretamente.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statusIcons = {
    "Aguardando Separação": { icon: Clock, color: "text-yellow-600", bg: "bg-yellow-50" },
    "Em Separação": { icon: Package, color: "text-blue-600", bg: "bg-blue-50" },
    "Pronto para Expedir": { icon: CheckCircle, color: "text-indigo-600", bg: "bg-indigo-50" },
    "Saiu para Entrega": { icon: Truck, color: "text-orange-600", bg: "bg-orange-50" },
    "Em Trânsito": { icon: Truck, color: "text-cyan-600", bg: "bg-cyan-50" },
    "Entregue": { icon: CheckCircle, color: "text-green-600", bg: "bg-green-50" },
    "Entrega Frustrada": { icon: AlertCircle, color: "text-red-600", bg: "bg-red-50" }
  };

  const currentStatus = statusIcons[entrega.status] || statusIcons["Aguardando Separação"];
  const Icon = currentStatus.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Cabeçalho */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">🚚 Rastreamento de Entrega</h1>
          <p className="text-slate-600">Acompanhe seu pedido em tempo real</p>
        </div>

        {/* Status Atual */}
        <Card className={`border-2 ${entrega.status === "Entregue" ? 'border-green-300' : 'border-blue-300'}`}>
          <CardContent className="p-8 text-center">
            <div className={`w-24 h-24 rounded-full ${currentStatus.bg} flex items-center justify-center mx-auto mb-4`}>
              <Icon className={`w-12 h-12 ${currentStatus.color}`} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">{entrega.status}</h2>
            <p className="text-slate-600">
              {entrega.status === "Entregue" 
                ? `Entregue em ${new Date(entrega.data_entrega).toLocaleString('pt-BR')}`
                : entrega.data_previsao 
                ? `Previsão: ${new Date(entrega.data_previsao).toLocaleDateString('pt-BR')}`
                : 'Aguardando programação'}
            </p>
            <code className="text-xs bg-slate-100 px-3 py-1 rounded mt-4 inline-block">
              Código: {entrega.qr_code}
            </code>
          </CardContent>
        </Card>

        {/* Informações da Entrega */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="bg-blue-50 border-b">
              <CardTitle className="text-base flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-600" />
                Destino
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <p className="font-semibold text-slate-900">{entrega.cliente_nome}</p>
              <p className="text-sm text-slate-600 mt-2">
                {entrega.endereco_entrega_completo?.logradouro}, {entrega.endereco_entrega_completo?.numero}
                {entrega.endereco_entrega_completo?.complemento && ` - ${entrega.endereco_entrega_completo?.complemento}`}
              </p>
              <p className="text-sm text-slate-600">
                {entrega.endereco_entrega_completo?.bairro}
              </p>
              <p className="text-sm text-slate-600">
                {entrega.endereco_entrega_completo?.cidade}/{entrega.endereco_entrega_completo?.estado}
              </p>
              <p className="text-sm text-slate-600">
                CEP: {entrega.endereco_entrega_completo?.cep}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="bg-purple-50 border-b">
              <CardTitle className="text-base flex items-center gap-2">
                <Truck className="w-5 h-5 text-purple-600" />
                Transporte
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {entrega.motorista && (
                <div className="mb-3">
                  <p className="text-xs text-slate-500">Motorista</p>
                  <p className="font-semibold flex items-center gap-2">
                    <User className="w-4 h-4" />
                    {entrega.motorista}
                  </p>
                </div>
              )}
              {entrega.motorista_telefone && (
                <div className="mb-3">
                  <p className="text-xs text-slate-500">Contato</p>
                  <p className="font-semibold flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    {entrega.motorista_telefone}
                  </p>
                </div>
              )}
              {entrega.transportadora && (
                <div>
                  <p className="text-xs text-slate-500">Transportadora</p>
                  <p className="font-semibold">{entrega.transportadora}</p>
                </div>
              )}
              {entrega.codigo_rastreamento && (
                <div className="mt-3">
                  <p className="text-xs text-slate-500">Código Transportadora</p>
                  <code className="text-sm bg-slate-100 px-2 py-1 rounded">
                    {entrega.codigo_rastreamento}
                  </code>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Timeline */}
        <Card>
          <CardHeader className="bg-slate-50 border-b">
            <CardTitle className="text-base">Histórico de Status</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {entrega.historico_status && entrega.historico_status.length > 0 ? (
              <div className="space-y-4">
                {entrega.historico_status
                  .sort((a, b) => new Date(b.data_hora) - new Date(a.data_hora))
                  .map((h, idx) => {
                    const statusConfig = statusIcons[h.status] || statusIcons["Aguardando Separação"];
                    const StatusIcon = statusConfig.icon;
                    
                    return (
                      <div key={idx} className="flex gap-4 items-start">
                        <div className={`w-10 h-10 rounded-full ${statusConfig.bg} flex items-center justify-center flex-shrink-0`}>
                          <StatusIcon className={`w-5 h-5 ${statusConfig.color}`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <p className="font-semibold text-slate-900">{h.status}</p>
                            <span className="text-xs text-slate-500">
                              {new Date(h.data_hora).toLocaleString('pt-BR')}
                            </span>
                          </div>
                          {h.observacao && (
                            <p className="text-sm text-slate-600 mt-1">{h.observacao}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            ) : (
              <p className="text-center text-slate-500 py-6">Nenhuma atualização ainda</p>
            )}
          </CardContent>
        </Card>

        {/* Comprovante de Entrega */}
        {entrega.status === "Entregue" && entrega.comprovante_entrega && (
          <Card className="border-2 border-green-300 bg-green-50">
            <CardHeader className="bg-green-100 border-b">
              <CardTitle className="text-base flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                Comprovante de Entrega
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-green-700">Recebido por</p>
                  <p className="font-semibold text-green-900">
                    {entrega.comprovante_entrega.nome_recebedor}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-green-700">Data/Hora</p>
                  <p className="font-semibold text-green-900">
                    {new Date(entrega.comprovante_entrega.data_hora_recebimento).toLocaleString('pt-BR')}
                  </p>
                </div>
              </div>

              {entrega.comprovante_entrega.foto_comprovante && (
                <div>
                  <p className="text-xs text-green-700 mb-2">Foto da Entrega</p>
                  <img
                    src={entrega.comprovante_entrega.foto_comprovante}
                    alt="Comprovante"
                    className="w-full rounded-lg border-2 border-green-300"
                  />
                </div>
              )}

              {entrega.comprovante_entrega.observacoes_recebimento && (
                <div>
                  <p className="text-xs text-green-700">Observações</p>
                  <p className="text-sm text-green-900 p-3 bg-white rounded">
                    {entrega.comprovante_entrega.observacoes_recebimento}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Rodapé */}
        <div className="text-center text-xs text-slate-500 pt-6">
          <p>Sistema ERP Integra - Gestão Empresarial Integrada</p>
          <p className="mt-1">Atualizado automaticamente a cada 30 segundos</p>
        </div>
      </div>
    </div>
  );
}