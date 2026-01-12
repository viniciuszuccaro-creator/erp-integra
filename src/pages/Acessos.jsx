import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useWindow } from "@/components/lib/useWindow";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import usePermissions from "@/components/lib/usePermissions";
import MatrizPermissoesVisual from "@/components/sistema/MatrizPermissoesVisual";
import GlobalAuditLog from "@/components/sistema/GlobalAuditLog";
import RelatorioPermissoes from "@/components/sistema/RelatorioPermissoes";
import { Shield, Settings, Users, Sparkles } from "lucide-react";

export default function Acessos() {
  const { openWindow } = useWindow();
  const { isAdmin } = usePermissions();
  const { estaNoGrupo, grupoAtual } = useContextoVisual();

  const { data: perfis = [], isLoading } = useQuery({
    queryKey: ["perfisAcesso"],
    queryFn: () => base44.entities.PerfilAcesso.list("-updated_date", 200),
    staleTime: 120000,
  });

  const perfisFiltrados = React.useMemo(() => {
    if (!estaNoGrupo || !grupoAtual?.id) return perfis;
    return perfis.filter((p) => p.group_id === grupoAtual.id);
  }, [perfis, estaNoGrupo, grupoAtual]);

  // Estrutura base dos módulos -> seções (somente visual; edição aberta em janela dedicada)
  const estruturaSistema = React.useMemo(
    () => ({
      dashboard: { nome: "Dashboard", secoes: { visao_geral: {}, tempo_real: {}, relatorios: {}, configuracoes: {} } },
      comercial: { nome: "Comercial", secoes: { clientes: {}, pedidos: {}, notas: {}, comissoes: {}, aprovacoes: {} } },
      financeiro: { nome: "Financeiro", secoes: { contas_receber: {}, contas_pagar: {}, caixa: {}, conciliacao: {}, rateios: {}, relatorios: {} } },
      estoque: { nome: "Estoque", secoes: { produtos: {}, movimentacoes: {}, recebimento: {}, requisicoes: {}, lotes: {}, relatorios: {} } },
      compras: { nome: "Compras", secoes: { fornecedores: {}, solicitacoes: {}, cotacoes: {}, ordens_compra: {} } },
      expedicao: { nome: "Expedição", secoes: { entregas: {}, romaneios: {}, rotas: {}, configuracoes: {} } },
      producao: { nome: "Produção", secoes: { ordens: {}, apontamentos: {}, relatorios: {} } },
      rh: { nome: "RH", secoes: { colaboradores: {}, ponto: {}, ferias: {}, dashboard: {} } },
      fiscal: { nome: "Fiscal", secoes: { nfe: {}, sped: {}, dre: {}, configuracoes: {} } },
      crm: { nome: "CRM", secoes: { oportunidades: {}, interacoes: {}, campanhas: {}, funil: {} } },
      agenda: { nome: "Agenda", secoes: { eventos: {}, lembretes: {}, integracoes: {} } },
      contratos: { nome: "Contratos", secoes: { contratos: {}, cobrancas: {}, assinaturas: {}, relatorios: {} } },
      relatorios: { nome: "Relatórios", secoes: { vendas: {}, financeiro: {}, estoque: {}, custom: {} } },
      cadastros: { nome: "Cadastros", secoes: { empresas: {}, clientes: {}, fornecedores: {}, produtos: {}, configuracoes: {} } },
      configuracoes: { nome: "Configurações", secoes: { sistema: {}, notificacoes: {}, integracoes: {}, acessos: {} } },
    }),
    []
  );

  return (
    <div className="p-6 lg:p-8 space-y-6 h-full">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <span className="p-3 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl shadow-md">
              <Shield className="w-7 h-7 text-white" />
            </span>
            Controle de Acesso
          </h1>
          <p className="text-slate-600 mt-1">
            Matriz visual de permissões • Multiempresas • Gestão centralizada
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() =>
              openWindow(RelatorioPermissoes, { windowMode: true }, {
                title: "📋 Relatório de Permissões",
                width: 1100,
                height: 700,
              })
            }
            className="gap-2"
          >
            <Users className="w-4 h-4" /> Relatório de Permissões
          </Button>
          <Button
            onClick={() =>
              openWindow(
                // Central de perfis completa
                require("@/components/sistema/CentralPerfisAcesso").default,
                { windowMode: true },
                { title: "🔐 Central de Perfis de Acesso", width: 1280, height: 800 }
              )
            }
            className="bg-blue-600 hover:bg-blue-700 gap-2"
          >
            <Settings className="w-4 h-4" /> Gerenciar Perfis
          </Button>
          <Button
            variant="outline"
            onClick={() =>
              openWindow(
                require("@/components/ia/IAGovernancaCompliance").default,
                { windowMode: true },
                { title: "✨ IA de Governança e Compliance", width: 1200, height: 800 }
              )
            }
            className="gap-2"
          >
            <Sparkles className="w-4 h-4" /> Sugerir Melhorias (IA)
          </Button>
          {estaNoGrupo && (
            <Badge className="bg-blue-100 text-blue-700">Visão do Grupo</Badge>
          )}
        </div>
      </div>

      <Card className="border-0 shadow-md">
        <CardHeader className="bg-slate-50 border-b">
          <CardTitle className="text-base">Matriz de Permissões</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          {isLoading ? (
            <div className="py-24 text-center text-slate-500">Carregando perfis...</div>
          ) : (
            <div className="w-full h-full">
              <MatrizPermissoesVisual perfis={perfisFiltrados} estruturaSistema={estruturaSistema} />
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-0 shadow-md">
        <CardHeader className="bg-slate-50 border-b">
          <CardTitle className="text-base">Auditoria de Acessos</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {/* Visualização geral de auditoria (somente leitura) */}
          <div className="w-full h-[420px]">
            <GlobalAuditLog />
          </div>
        </CardContent>
      </Card>

      {!isAdmin && (
        <div className="text-xs text-slate-500">
          Algumas ações podem estar restritas pelo seu perfil de acesso.
        </div>
      )}
    </div>
  );
}