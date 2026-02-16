import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, AlertTriangle, AlertCircle, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

const StatusBadge = ({ status }) => {
  const map = {
    OK: { color: "bg-green-100 text-green-700", Icon: CheckCircle2 },
    Parcial: { color: "bg-amber-100 text-amber-700", Icon: AlertTriangle },
    Pendente: { color: "bg-red-100 text-red-700", Icon: AlertCircle },
  };
  const { color, Icon } = map[status] || map.Parcial;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${color}`}>
      <Icon className="w-3.5 h-3.5" />
      {status}
    </span>
  );
};

const Linha = ({ modulo, layout, ordenacao, rbac, multi, status, notas, links, page }) => (
  <Card className="border-0 shadow-sm">
    <CardHeader className="pb-2">
      <CardTitle className="text-base">{modulo}</CardTitle>
    </CardHeader>
    <CardContent className="space-y-3 text-sm">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
        <div>
          <p className="text-slate-500">Layout</p>
          <StatusBadge status={layout} />
        </div>
        <div>
          <p className="text-slate-500">Ordenação Backend</p>
          <StatusBadge status={ordenacao} />
        </div>
        <div>
          <p className="text-slate-500">RBAC Visual</p>
          <StatusBadge status={rbac} />
        </div>
        <div>
          <p className="text-slate-500">Multiempresa</p>
          <StatusBadge status={multi} />
        </div>
        <div>
          <p className="text-slate-500">Status Geral</p>
          <StatusBadge status={status || 'Parcial'} />
        </div>
      </div>
      {notas && (
        <div>
          <p className="text-slate-500 mb-1">Notas</p>
          <ul className="list-disc ml-5 space-y-1 text-slate-700">
            {Array.isArray(notas) ? notas.map((n, i) => <li key={i}>{n}</li>) : <li>{notas}</li>}
          </ul>
        </div>
      )}
      {links?.length ? (
        <div>
          <p className="text-slate-500 mb-1 flex items-center gap-2"><FileText className="w-4 h-4" /> Referências</p>
          <div className="flex flex-wrap gap-2">
            {links.map((l, i) => (
              <Badge key={i} variant="outline" className="text-xs font-normal">{l}</Badge>
            ))}
          </div>
        </div>
      ) : null}
    </CardContent>
  </Card>
);

export default function MatrizAdequacaoFase3() {
  const linhas = [
    {
      modulo: "Comercial (Produtos, Pedidos, NF)",
      layout: "OK",
      ordenacao: "Parcial",
      rbac: "Parcial",
      multi: "Parcial",
      status: "Parcial",
      notas: [
        "Migrar 100% dos grids para functions/entityListSorted com persistência de sort e rolagem interna (ERPDataTable).",
        "Proteger ações críticas (aprovar desconto, emitir NF-e, enviar produção, cancelar) com ProtectedAction + entityGuard.",
        "Trocar listagens diretas por filterInContext e garantir carimbo group_id/empresa_id em create/update."
      ],
      links: [
        "pages/Comercial",
        "components/comercial/PedidosTab",
        "components/comercial/NotasFiscaisTab",
        "components/ui/erp/DataTable",
        "functions/entityListSorted",
        "components/ProtectedAction",
        "functions/entityGuard",
        "components/lib/useContextoVisual"
      ],
    },
    {
      modulo: "Financeiro (Pagar, Receber, Caixa)",
      layout: "OK",
      ordenacao: "Parcial",
      rbac: "Parcial",
      multi: "Parcial",
      status: "Parcial",
      notas: [
        "Padronizar Contas Pagar/Receber/Extratos para entityListSorted; sort persistido por entidade.",
        "Ações sensíveis (aprovar, liquidar, estornar, cancelar) sob ProtectedAction + validação em entityGuard.",
        "Reforçar sanitizeOnWrite + auditEntityEvents nas operações financeiras."
      ],
      links: [
        "pages/Financeiro",
        "components/financeiro/ContasPagarTab",
        "components/financeiro/ContasReceberTab",
        "components/ui/erp/DataTable",
        "functions/entityListSorted",
        "components/ProtectedAction",
        "functions/sanitizeOnWrite",
        "functions/auditEntityEvents"
      ],
    },
    {
      modulo: "Estoque",
      layout: "OK",
      ordenacao: "Parcial",
      rbac: "Parcial",
      multi: "OK/Parcial",
      status: "Parcial",
      notas: [
        "Migrar Movimentações/Produtos faltantes para entityListSorted; manter rolagem interna + persistência de sort.",
        "Ações (ajuste, reserva/liberação, transferência) com ProtectedAction; checagem backend."
      ],
      links: [
        "pages/Estoque",
        "components/estoque/MovimentacoesTab",
        "components/estoque/ProdutosTab",
        "functions/entityListSorted",
        "components/ProtectedAction",
        "components/lib/useContextoVisual"
      ],
    },
    {
      modulo: "Compras",
      layout: "OK",
      ordenacao: "Parcial",
      rbac: "Parcial",
      multi: "Parcial",
      status: "Parcial",
      notas: [
        "Fornecedores/OCs/Solicitações → entityListSorted + sort persistido; ERPDataTable uniforme.",
        "Ações (aprovar, enviar fornecedor, receber) com ProtectedAction.",
        "Garantir filterInContext e carimbo multiempresa."
      ],
      links: [
        "pages/Compras",
        "components/compras/FornecedoresTab",
        "components/compras/OrdensCompraTab",
        "components/compras/SolicitacoesCompraTab",
        "functions/entityListSorted",
        "components/ProtectedAction",
        "components/lib/useContextoVisual"
      ],
    },
    {
      modulo: "CRM",
      layout: "OK",
      ordenacao: "Parcial",
      rbac: "Parcial",
      multi: "OK/Parcial",
      status: "Parcial",
      notas: [
        "Onde não usa VisualizadorUniversal, migrar listas para entityListSorted com sort persistido.",
        "Ações de pipeline/etapas sob ProtectedAction; entityGuard no backend.",
        "Garantir carimbo multiempresa em create/update."
      ],
      links: [
        "pages/CRM",
        "components/cadastros/VisualizadorUniversalEntidade",
        "components/crm/*",
        "functions/entityListSorted",
        "components/ProtectedAction",
        "functions/entityGuard"
      ],
    },
    {
      modulo: "Administração do Sistema",
      layout: "OK",
      ordenacao: "Parcial",
      rbac: "OK/Parcial",
      multi: "Parcial",
      status: "Parcial",
      notas: [
        "Listagens administrativas remanescentes → entityListSorted.",
        "Ações administrativas com ProtectedAction e dupla validação.",
        "Configurações: respeitar escopo grupo/empresa (getFiltroContexto + carimbo)."
      ],
      links: [
        "pages/AdministracaoSistema",
        "components/sistema/*",
        "functions/entityListSorted",
        "components/security/ProtectedSection",
        "components/ProtectedAction",
        "components/lib/useContextoVisual"
      ],
    },
    {
      modulo: "Cadastros Gerais",
      layout: "OK",
      ordenacao: "OK/Parcial",
      rbac: "OK/Parcial",
      multi: "OK",
      status: "Parcial",
      notas: [
        "Revisar cadastros fora do VisualizadorUniversal e padronizar DataTable + sort persistido.",
        "Ações Novo/Editar/Excluir sob ProtectedAction em 100%."
      ],
      links: [
        "components/cadastros/VisualizadorUniversalEntidade",
        "components/ui/erp/DataTable",
        "components/ProtectedAction"
      ],
    },
    {
      modulo: "Configuração do Sistema",
      layout: "OK",
      ordenacao: "N/A/Parcial",
      rbac: "OK",
      multi: "Parcial",
      status: "Parcial",
      notas: [
        "Onde houver listagens, usar entityListSorted.",
        "Operações de escrita com sanitizeOnWrite + auditoria.",
        "Validar escopo (grupo/empresa) antes de persistir."
      ],
      links: [
        "components/sistema/ConfigCenter",
        "functions/sanitizeOnWrite",
        "functions/auditEntityEvents",
        "components/lib/useContextoVisual"
      ],
    },
    {
      modulo: "Perfis (PerfilAcesso)",
      layout: "OK",
      ordenacao: "N/A/Parcial",
      rbac: "OK",
      multi: "N/A/Parcial",
      status: "Parcial",
      notas: [
        "Se houver grid/lista, migrar para entityListSorted.",
        "Confirmar logs de alterações de permissões (auditEntityEvents)."
      ],
      links: [
        "components/sistema/CentralPerfisAcesso",
        "entities/PerfilAcesso (via SDK)",
        "functions/auditEntityEvents"
      ],
    },
    {
      modulo: "Usuários (Categoria)",
      layout: "OK",
      ordenacao: "Parcial",
      rbac: "OK",
      multi: "N/A",
      status: "Parcial",
      notas: [
        "Listagens de usuários com entityListSorted quando aplicável.",
        "Convites via base44.users.inviteUser (sem insert direto)."
      ],
      links: [
        "pages/AdministracaoSistema",
        "components/sistema/GestaoUsuariosAvancada"
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-md">
        <CardHeader className="pb-3">
          <CardTitle>Matriz Completa de Adequação — Fase 3</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-slate-700 space-y-3">
          <p>
            Status: <StatusBadge status="OK" /> aplicado integralmente • <StatusBadge status="Parcial" /> aplicado em partes • <StatusBadge status="Pendente" /> precisa implementação
          </p>
          <Separator />
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">layout</Badge>
            <Badge variant="outline">components/layout/ModuleTabs</Badge>
            <Badge variant="outline">components/ui/erp/DataTable</Badge>
            <Badge variant="outline">components/cadastros/VisualizadorUniversalEntidade</Badge>
            <Badge variant="outline">functions/entityListSorted</Badge>
            <Badge variant="outline">components/security/ProtectedSection</Badge>
            <Badge variant="outline">components/ProtectedAction</Badge>
            <Badge variant="outline">functions/entityGuard</Badge>
            <Badge variant="outline">components/lib/useContextoVisual</Badge>
            <Badge variant="outline">functions/sanitizeOnWrite</Badge>
            <Badge variant="outline">functions/auditEntityEvents</Badge>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {linhas.map((l, idx) => (
          <Linha key={idx} {...l} />
        ))}
      </div>
    </div>
  );
}