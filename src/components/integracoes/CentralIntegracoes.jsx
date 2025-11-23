import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  const { data: configs = [] } = useQuery({
    queryKey: ["configuracao-integracao-marketplace"],
    queryFn: () => base44.entities.ConfiguracaoIntegracaoMarketplace.list(),
  });

  const integracoesDisponiveis = [
    {
      nome: "NF-e / SEFAZ",
      tipo: "Fiscal",
      status: "Configurado",
      icon: FileText,
      cor: "text-blue-600",
      descricao: "Emissão e validação de NF-e"
    },
    {
      nome: "Boletos & Pagamentos",
      tipo: "Financeiro",
      status: "Configurado",
      icon: CreditCard,
      cor: "text-green-600",
      descricao: "Geração de boletos e links de pagamento"
    },
    {
      nome: "WhatsApp Business",
      tipo: "Comunicação",
      status: "Ativo",
      icon: MessageCircle,
      cor: "text-green-600",
      descricao: "Chatbot e notificações automáticas"
    },
    {
      nome: "Marketplaces",
      tipo: "E-commerce",
      status: configs.length > 0 ? "Ativo" : "Inativo",
      icon: ShoppingCart,
      cor: "text-purple-600",
      descricao: "Mercado Livre, Shopee, Amazon"
    },
    {
      nome: "Bancos (Open Banking)",
      tipo: "Financeiro",
      status: "Em Desenvolvimento",
      icon: TrendingUp,
      cor: "text-indigo-600",
      descricao: "Conciliação automática de extratos"
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
                      integracao.status === "Ativo" || integracao.status === "Configurado" 
                        ? "bg-green-100 text-green-800" 
                        : integracao.status === "Inativo"
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                    }
                  >
                    {integracao.status}
                  </Badge>

                  <Button size="sm" variant="outline" className="ml-auto">
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