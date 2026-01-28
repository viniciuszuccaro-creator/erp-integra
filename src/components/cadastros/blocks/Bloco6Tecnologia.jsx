import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useWindow } from "@/components/lib/useWindow";
import usePermissions from "@/components/lib/usePermissions";
import VisualizadorUniversalEntidade from "@/components/cadastros/VisualizadorUniversalEntidade";
import { MessageCircle, Link2, Clock, Bell, FileText, MessageSquare, Wrench, Sparkles, ShoppingCart, MapPin } from "lucide-react";

import ApiExternaForm from "@/components/cadastros/ApiExternaForm";
import WebhookForm from "@/components/cadastros/WebhookForm";
import ChatbotIntentForm from "@/components/cadastros/ChatbotIntentForm";
import ChatbotCanalForm from "@/components/cadastros/ChatbotCanalForm";
import JobAgendadoForm from "@/components/cadastros/JobAgendadoForm";
import EventoNotificacaoForm from "@/components/cadastros/EventoNotificacaoForm";
import ConfiguracaoNFeForm from "@/components/cadastros/ConfiguracaoNFeForm";
import ConfiguracaoBoletosForm from "@/components/cadastros/ConfiguracaoBoletosForm";
import ConfiguracaoWhatsAppForm from "@/components/cadastros/ConfiguracaoWhatsAppForm";
import ParametroPortalClienteForm from "@/components/cadastros/ParametroPortalClienteForm";
import ParametroOrigemPedidoForm from "@/components/cadastros/ParametroOrigemPedidoForm";
import ParametroRecebimentoNFeForm from "@/components/cadastros/ParametroRecebimentoNFeForm";
import ParametroRoteirizacaoForm from "@/components/cadastros/ParametroRoteirizacaoForm";
import ParametroConciliacaoBancariaForm from "@/components/cadastros/ParametroConciliacaoBancariaForm";
import ParametroCaixaDiarioForm from "@/components/cadastros/ParametroCaixaDiarioForm";

import ChatbotDashboard from "@/components/chatbot/ChatbotDashboard";
import TesteNFe from "@/components/integracoes/TesteNFe";
import TesteBoletos from "@/components/integracoes/TesteBoletos";
import ConfigWhatsAppBusiness from "@/components/integracoes/ConfigWhatsAppBusiness";
import TesteTransportadoras from "@/components/integracoes/TesteTransportadoras";
import TesteGoogleMaps from "@/components/integracoes/TesteGoogleMaps";
import SincronizacaoMarketplacesAtiva from "@/components/integracoes/SincronizacaoMarketplacesAtiva";

export default function Bloco6Tecnologia() {
  const { openWindow } = useWindow();
  const { hasPermission } = usePermissions();
  const openList = (entidade, titulo, Icon, campos, FormComp) => () => openWindow(VisualizadorUniversalEntidade, { nomeEntidade: entidade, tituloDisplay: titulo, icone: Icon, camposPrincipais: campos, componenteEdicao: FormComp, windowMode: true }, { title: titulo, width: 1400, height: 800 });

  const testers = [
    { t: 'Dashboard Chatbot', c: () => openWindow(ChatbotDashboard, {}, { title: 'Chatbot Dashboard', width: 1200, height: 720 }) },
    { t: 'Teste NF-e', c: () => openWindow(TesteNFe, {}, { title: 'Teste NF-e', width: 1000, height: 700 }) },
    { t: 'Teste Boletos/PIX', c: () => openWindow(TesteBoletos, {}, { title: 'Teste Boletos & PIX', width: 1000, height: 700 }) },
    { t: 'Config WhatsApp', c: () => openWindow(ConfigWhatsAppBusiness, {}, { title: 'WhatsApp Business', width: 1100, height: 700 }) },
    { t: 'Teste Transportadoras', c: () => openWindow(TesteTransportadoras, {}, { title: 'Transportadoras', width: 1100, height: 700 }) },
    { t: 'Teste Google Maps', c: () => openWindow(TesteGoogleMaps, {}, { title: 'Google Maps', width: 1100, height: 700 }) },
    { t: 'Marketplaces', c: () => openWindow(SincronizacaoMarketplacesAtiva, {}, { title: 'Sincronização Marketplaces', width: 1200, height: 720 }) },
  ];

  const tiles = [
    { k: 'ApiExterna', t: 'APIs Externas', i: Link2, c: ['nome_integracao','url_base','autenticacao','ativo'], f: ApiExternaForm },
    { k: 'Webhook', t: 'Webhooks', i: Link2, c: ['nome_webhook','url','evento_gatilho','ativo'], f: WebhookForm },
    { k: 'ChatbotIntent', t: 'Chatbot Intents', i: MessageCircle, c: ['nome_intent','exemplos_frases','resposta_padrao','ativo'], f: ChatbotIntentForm },
    { k: 'ChatbotCanal', t: 'Canais de Chatbot', i: MessageSquare, c: ['nome_canal','tipo_canal','configuracao','ativo'], f: ChatbotCanalForm },
    { k: 'JobAgendado', t: 'Jobs Agendados (IA)', i: Clock, c: ['nome_job','tipo_job','periodicidade','ativo','ultima_execucao'], f: JobAgendadoForm },
    { k: 'EventoNotificacao', t: 'Eventos de Notificação', i: Bell, c: ['descricao','canal','ativo'], f: EventoNotificacaoForm },
    { k: 'ConfiguracaoNFe', t: 'Configuração NF-e', i: FileText, c: ['fornecedor','ambiente','certificado_apelido','ativo'], f: ConfiguracaoNFeForm },
    { k: 'ConfiguracaoBoletos', t: 'Configuração Boletos/PIX', i: Wrench, c: ['provedor','chave_api','ativo'], f: ConfiguracaoBoletosForm },
    { k: 'ConfiguracaoWhatsApp', t: 'Configuração WhatsApp', i: Sparkles, c: ['provedor','token','ativo'], f: ConfiguracaoWhatsAppForm },
    { k: 'ParametroPortalCliente', t: 'Parâmetros Portal do Cliente', i: Link2, c: ['empresa_id','habilitar_portal','habilitar_aprovacao_orcamento'], f: ParametroPortalClienteForm },
    { k: 'ParametroOrigemPedido', t: 'Parâmetros Origem de Pedido', i: ShoppingCart, c: ['nome','canal','tipo_criacao','ativo'], f: ParametroOrigemPedidoForm },
    { k: 'ParametroRecebimentoNFe', t: 'Parâmetros Recebimento NFe', i: FileText, c: ['empresa_id','criar_produto_automaticamente','validar_duplicidade'], f: ParametroRecebimentoNFeForm },
    { k: 'ParametroRoteirizacao', t: 'Parâmetros Roteirização', i: MapPin, c: ['empresa_id','otimizar_por','habilitar_ia'], f: ParametroRoteirizacaoForm },
    { k: 'ParametroConciliacaoBancaria', t: 'Parâmetros Conciliação', i: FileText, c: ['empresa_id','tolerancia_valor','habilitar_ia'], f: ParametroConciliacaoBancariaForm },
    { k: 'ParametroCaixaDiario', t: 'Parâmetros Caixa Diário', i: FileText, c: ['empresa_id','horario_abertura','horario_fechamento'], f: ParametroCaixaDiarioForm },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {tiles.map(({ k, t, i: Icon, c, f: FormComp }) => (
          <Card key={k} className="hover:shadow-lg transition-all">
            <CardHeader className="bg-slate-50 border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Icon className="w-5 h-5 text-slate-600"/> {t}
                </CardTitle>
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={openList(k, t, Icon, c, FormComp)} disabled={!hasPermission('cadastros','ver')}>
                  Abrir
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-4 text-sm text-slate-600">Gerencie {t} em janelas redimensionáveis.</CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 border-b">
          <CardTitle className="text-base">Ferramentas de Teste e Monitoramento</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-2">
            {testers.map(({ t, c }) => (
              <Button key={t} variant="outline" size="sm" onClick={c}>{t}</Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}