import React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import { useToast } from "@/components/ui/use-toast";
import { useWindow } from "@/components/lib/useWindow";
import ConfiguracaoNFeForm from "@/components/cadastros/ConfiguracaoNFeForm";
import ConfiguracaoBoletosForm from "@/components/cadastros/ConfiguracaoBoletosForm";
import ConfiguracaoWhatsAppForm from "@/components/cadastros/ConfiguracaoWhatsAppForm";
import SincronizacaoMarketplaces from "@/components/integracoes/SincronizacaoMarketplaces";
import BancosOpenBankingWIP from "@/components/integracoes/BancosOpenBankingWIP";
import { 
  CheckCircle, 
  XCircle, 
  Loader2, 
  Link2, 
  CreditCard, 
  FileText,
  MessageCircle,
  ShoppingCart,
  TrendingUp
} from "lucide-react";

export default function CentralIntegracoes() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { empresaAtual } = useContextoVisual();
  const { openWindow } = useWindow();

  const { data: configs = [] } = useQuery({
    queryKey: ["configuracao-integracao-marketplace"],
    queryFn: () => base44.entities.ConfiguracaoIntegracaoMarketplace.list(),
  });

  const chaveIntegracoes = empresaAtual?.id ? `integracoes_${empresaAtual.id}` : null;
  const { data: cfgIntegracoes } = useQuery({
    queryKey: ["cfg-integracoes", chaveIntegracoes],
    enabled: !!chaveIntegracoes,
    queryFn: async () => {
      const existentes = await base44.entities.ConfiguracaoSistema.filter({ chave: chaveIntegracoes }, undefined, 1);
      return existentes?.[0] || null;
    }
  });

  const setAtivo = async (key, ativo) => {
    if (!chaveIntegracoes) return;
    const existentes = await base44.entities.ConfiguracaoSistema.filter({ chave: chaveIntegracoes }, undefined, 1);
    const payload = { chave: chaveIntegracoes, categoria: 'Integracoes', [key]: { ...(existentes?.[0]?.[key] || {}), ativo } };
    if (existentes && existentes.length > 0) {
      await base44.entities.ConfiguracaoSistema.update(existentes[0].id, { ...existentes[0], ...payload });
    } else {
      await base44.entities.ConfiguracaoSistema.create(payload);
    }
    toast({ title: ativo ? 'Integração ativada' : 'Integração desativada' });
    queryClient.invalidateQueries({ queryKey: ["cfg-integracoes", chaveIntegracoes] });
  };

  const isAtivo = (key) => Boolean(cfgIntegracoes?.[key]?.ativo);

  const integracoesDisponiveis = [
    {
      nome: "NF-e / SEFAZ",
      tipo: "Fiscal",
      status: "Configurado",
      icon: FileText,
      cor: "text-blue-600",
      descricao: "Emissão e validação de NF-e",
      key: 'integracao_nfe',
      cmp: ConfiguracaoNFeForm,
      win: { title: '⚙️ Configuração NF-e', width: 1100, height: 700 }
    },
    {
      nome: "Boletos & Pagamentos",
      tipo: "Financeiro",
      status: "Configurado",
      icon: CreditCard,
      cor: "text-green-600",
      descricao: "Geração de boletos e links de pagamento",
      key: 'integracao_boletos',
      cmp: ConfiguracaoBoletosForm,
      win: { title: '💳 Configuração de Boletos', width: 1000, height: 700 }
    },
    {
      nome: "WhatsApp Business",
      tipo: "Comunicação",
      status: "Ativo",
      icon: MessageCircle,
      cor: "text-green-600",
      descricao: "Chatbot e notificações automáticas",
      key: 'integracao_whatsapp',
      cmp: ConfiguracaoWhatsAppForm,
      win: { title: '💬 Configuração WhatsApp Business', width: 900, height: 680 }
    },
    {
      nome: "Marketplaces",
      tipo: "E-commerce",
      status: configs.length > 0 ? "Ativo" : "Inativo",
      icon: ShoppingCart,
      cor: "text-purple-600",
      descricao: "Mercado Livre, Shopee, Amazon",
      key: 'integracao_marketplaces',
      cmp: SincronizacaoMarketplaces,
      win: { title: '🛒 Sincronização de Marketplaces', width: 1200, height: 720 }
    },
    {
      nome: "Bancos (Open Banking)",
      tipo: "Financeiro",
      status: "Em Desenvolvimento",
      icon: TrendingUp,
      cor: "text-indigo-600",
      descricao: "Conciliação automática de extratos",
      key: 'integracao_bancos',
      cmp: BancosOpenBankingWIP,
      win: { title: '🏦 Bancos (Open Banking)', width: 900, height: 600 }
    },
  ];

  const getStatusIcon = (status) => {
    switch(status) {
      case "Ativo":
      case "Configurado":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "Inativo":
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Loader2 className="w-5 h-5 text-yellow-600 animate-spin" />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Central de Integrações</h2>
        <p className="text-sm text-slate-600 mt-1">Gerencie todas as integrações do sistema</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {integracoesDisponiveis.map((integracao, idx) => {
          const Icon = integracao.icon;
          
          return (
            <Card key={idx} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-slate-100 ${integracao.cor}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{integracao.nome}</CardTitle>
                      <p className="text-xs text-slate-500 mt-1">{integracao.tipo}</p>
                    </div>
                  </div>
                  
                  {getStatusIcon(integracao.status)}
                </div>
              </CardHeader>

              <CardContent>
                <p className="text-sm text-slate-600 mb-3">{integracao.descricao}</p>
                
                <div className="flex items-center gap-2">
                  <Badge 
                    className={
                      (integracao.key && isAtivo(integracao.key)) || integracao.status === "Ativo" || integracao.status === "Configurado" 
                        ? "bg-green-100 text-green-800" 
                        : integracao.status === "Inativo"
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                    }
                  >
                    {(integracao.key && isAtivo(integracao.key)) ? 'Ativo' : integracao.status}
                  </Badge>

                  {integracao.key && (
                    <Button size="sm" variant="outline" onClick={() => setAtivo(integracao.key, !isAtivo(integracao.key))}>
                      {isAtivo(integracao.key) ? 'Desativar' : 'Ativar'}
                    </Button>
                  )}

                  <Button
                    size="sm"
                    variant="outline"
                    className="ml-auto"
                    onClick={() => {
                      if (integracao.cmp) {
                        openWindow(integracao.cmp, { windowMode: true }, integracao.win || { title: 'Configuração', width: 1000, height: 700 });
                      } else {
                        toast({ title: 'Configuração indisponível', description: 'Esta integração ainda não possui tela de configuração.' });
                      }
                    }}
                  >
                    <Link2 className="w-3 h-3 mr-1" />
                    Configurar
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <TrendingUp className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <p className="font-semibold text-blue-900">Hub de Integrações Futuro</p>
              <p className="text-sm text-blue-700 mt-1">
                Em breve: Open Banking, ERPs externos, CRMs, automações avançadas e muito mais!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}