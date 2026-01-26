import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, Package, Truck, Navigation, MapPin } from "lucide-react";

/**
 * 📅 TIMELINE VISUAL DE ENTREGA V21.5
 * Mostra o progresso da entrega em formato de linha do tempo
 */
export default function TimelineEntregaVisual({ pedido, entrega, windowMode = false }) {
  const etapas = [
    {
      status: 'Aprovado',
      titulo: 'Pedido Aprovado',
      descricao: 'Estoque reservado automaticamente',
      icon: CheckCircle2,
      cor: 'green',
      ativo: ['Aprovado', 'Pronto para Faturar', 'Faturado', 'Em Expedição', 'Em Trânsito', 'Entregue'].includes(pedido.status)
    },
    {
      status: 'Pronto para Faturar',
      titulo: 'Fechado para Entrega',
      descricao: 'Enviado para logística',
      icon: Package,
      cor: 'indigo',
      ativo: ['Pronto para Faturar', 'Faturado', 'Em Expedição', 'Em Trânsito', 'Entregue'].includes(pedido.status)
    },
    {
      status: 'Faturado',
      titulo: 'NF-e Emitida',
      descricao: 'Nota fiscal gerada',
      icon: CheckCircle2,
      cor: 'blue',
      ativo: ['Faturado', 'Em Expedição', 'Em Trânsito', 'Entregue'].includes(pedido.status)
    },
    {
      status: 'Em Expedição',
      titulo: 'Em Separação',
      descricao: 'Produtos sendo preparados',
      icon: Package,
      cor: 'orange',
      ativo: ['Em Expedição', 'Em Trânsito', 'Entregue'].includes(pedido.status)
    },
    {
      status: 'Em Trânsito',
      titulo: 'Saiu para Entrega',
      descricao: 'Veículo em rota',
      icon: Truck,
      cor: 'purple',
      ativo: ['Em Trânsito', 'Entregue'].includes(pedido.status)
    },
    {
      status: 'Entregue',
      titulo: 'Entrega Concluída',
      descricao: 'Pedido finalizado com sucesso',
      icon: CheckCircle2,
      cor: 'green',
      ativo: pedido.status === 'Entregue'
    }
  ];

  const corPorNome = {
    'green': 'bg-green-600',
    'indigo': 'bg-indigo-600',
    'blue': 'bg-blue-600',
    'orange': 'bg-orange-600',
    'purple': 'bg-purple-600'
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
        <CardTitle className="flex items-center gap-2">
          <Navigation className="w-5 h-5" />
          📍 Timeline da Entrega
        </CardTitle>
        <p className="text-sm opacity-90">Pedido #{pedido.numero_pedido}</p>
      </CardHeader>
      <CardContent className="p-6">
        <div className="relative">
          {/* Linha Vertical */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-slate-200" />

          {/* Etapas */}
          <div className="space-y-6">
            {etapas.map((etapa, index) => {
              const Icon = etapa.icon;
              const ativoClass = etapa.ativo 
                ? corPorNome[etapa.cor] 
                : 'bg-slate-300';

              return (
                <div key={index} className="relative flex gap-4 items-start">
                  {/* Ícone */}
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${ativoClass} text-white shadow-lg z-10`}>
                    <Icon className="w-6 h-6" />
                  </div>

                  {/* Conteúdo */}
                  <div className="flex-1 pt-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className={`font-bold ${etapa.ativo ? 'text-slate-900' : 'text-slate-400'}`}>
                        {etapa.titulo}
                      </p>
                      {etapa.status === pedido.status && (
                        <Badge className="bg-blue-600 text-white animate-pulse">
                          Atual
                        </Badge>
                      )}
                    </div>
                    <p className={`text-sm ${etapa.ativo ? 'text-slate-600' : 'text-slate-400'}`}>
                      {etapa.descricao}
                    </p>
                    
                    {/* Data/Hora (se disponível) */}
                    {etapa.ativo && entrega?.historico_status && (
                      <div className="mt-2">
                        {entrega.historico_status
                          .filter(h => h.status === etapa.status)
                          .map((hist, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-xs text-slate-500">
                              <Clock className="w-3 h-3" />
                              {new Date(hist.data_hora).toLocaleString('pt-BR')}
                              {hist.usuario && ` • ${hist.usuario}`}
                            </div>
                          ))
                        }
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Informações Adicionais */}
        {pedido.endereco_entrega_principal && (
          <Card className="mt-6 bg-slate-50">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-slate-900 mb-1">Endereço de Entrega</p>
                  <p className="text-sm text-slate-700">
                    {pedido.endereco_entrega_principal.logradouro}, {pedido.endereco_entrega_principal.numero}
                    {pedido.endereco_entrega_principal.complemento && ` - ${pedido.endereco_entrega_principal.complemento}`}
                  </p>
                  <p className="text-sm text-slate-600">
                    {pedido.endereco_entrega_principal.bairro} - {pedido.endereco_entrega_principal.cidade}/{pedido.endereco_entrega_principal.estado}
                  </p>
                  <p className="text-sm text-slate-500">CEP: {pedido.endereco_entrega_principal.cep}</p>
                  
                  {pedido.endereco_entrega_principal.mapa_url && (
                    <a
                      href={pedido.endereco_entrega_principal.mapa_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline mt-2"
                    >
                      <Navigation className="w-4 h-4" />
                      Abrir no Google Maps
                    </a>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}