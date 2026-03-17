import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useWindow } from "@/components/lib/useWindow";
import usePermissions from "@/components/lib/usePermissions";
import VisualizadorUniversalEntidade from "@/components/cadastros/VisualizadorUniversalEntidade";
import { Zap, Code, Settings, Package, Link2, Cloud, MessageCircle } from "lucide-react";
import GroupCountBadge from "@/components/cadastros/GroupCountBadge.jsx";
import EntityCountBadge from "@/components/cadastros/EntityCountBadge.jsx";

import ApiExternaForm from "@/components/cadastros/ApiExternaForm";
import ChatbotCanalForm from "@/components/cadastros/ChatbotCanalForm";
import ChatbotIntentForm from "@/components/cadastros/ChatbotIntentForm";
import GatewayPagamentoForm from "@/components/cadastros/GatewayPagamentoForm";
import JobAgendadoForm from "@/components/cadastros/JobAgendadoForm";
import WebhookForm from "@/components/cadastros/WebhookForm";
import ConfiguracaoNFeForm from "@/components/cadastros/ConfiguracaoNFeForm";

export default function Bloco6Tecnologia() {
  const { openWindow } = useWindow();
  const { hasPermission } = usePermissions();

  const openList = (entidade, titulo, Icon, campos, FormComp) => () => {
    openWindow(
      VisualizadorUniversalEntidade,
      { nomeEntidade: entidade, tituloDisplay: titulo, icone: Icon, camposPrincipais: campos, componenteEdicao: FormComp, windowMode: true },
      { title: titulo, width: 1400, height: 800 }
    );
  };

  const tiles = [
    { k: 'ApiExterna', t: 'APIs Externas', i: Code, c: ['nome','descricao','url_base','ativo'], f: ApiExternaForm },
    { k: 'ChatbotCanal', t: 'Canais Chatbot', i: MessageCircle, c: ['nome','tipo_canal','ativo','webhook_url'], f: ChatbotCanalForm },
    { k: 'ChatbotIntent', t: 'Intents Chatbot', i: Zap, c: ['nome','descricao','ativo'], f: ChatbotIntentForm },
    { k: 'GatewayPagamento', t: 'Gateways de Pagamento', i: Package, c: ['nome','tipo','ativo','taxa_padrao'], f: GatewayPagamentoForm },
    { k: 'JobAgendado', t: 'Jobs Agendados', i: Cloud, c: ['nome','funcao','frequencia','ativo'], f: JobAgendadoForm },
    { k: 'Webhook', t: 'Webhooks', i: Link2, c: ['nome','url','evento','ativo'], f: WebhookForm },
    { k: 'ConfiguracaoNFe', t: 'Configurações NF-e', i: Settings, c: ['certificado_ativo','certificado_validade','ambiente'], f: ConfiguracaoNFeForm },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      <Card className="rounded-sm shadow-sm border bg-white/80 backdrop-blur">
        <CardHeader className="bg-gradient-to-r from-indigo-50 to-violet-50 border-b rounded-t-sm">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Zap className="w-5 h-5 text-indigo-700"/> Tecnologia, IA & Parâmetros
              <span className="ml-2"><GroupCountBadge entities={["ApiExterna","ChatbotCanal","ChatbotIntent","GatewayPagamento","JobAgendado","Webhook","ConfiguracaoNFe"]} /></span>
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-4 text-sm text-slate-600">Total consolidado do grupo.</CardContent>
      </Card>

      {tiles.map(({ k, t, i: Icon, c, f: FormComp }) => (
        <Card 
          key={k} 
          className="rounded-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-150 cursor-pointer group border"
          onClick={hasPermission('Sistema', null, 'visualizar') ? openList(k, t, Icon, c, FormComp) : undefined}
        >
          <CardHeader className="bg-gradient-to-r from-slate-50 to-white border-b pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2 text-slate-700">
                <div className="p-1.5 rounded-sm bg-indigo-50 group-hover:bg-indigo-100 transition-colors">
                  <Icon className="w-4 h-4 text-indigo-600" />
                </div>
                {t}
                <EntityCountBadge entityName={k} />
              </CardTitle>
              <Button 
                size="sm" 
                className="bg-blue-600 hover:bg-blue-700 rounded-sm text-xs h-7"
                onClick={(e) => { e.stopPropagation(); openList(k, t, Icon, c, FormComp)(); }}
                disabled={!hasPermission('Sistema', null, 'visualizar')}
              >
                Abrir
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-3 text-xs text-slate-500">
            Clique para listar, criar e editar em janela flutuante.
          </CardContent>
        </Card>
      ))}
    </div>
  );
}