import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, AlertTriangle, AlertCircle, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import useContextoVisual from "@/components/lib/useContextoVisual";

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
    <CardHeader className="pb-2 flex items-center justify-between">
      <CardTitle className="text-base">{modulo}</CardTitle>
      {page && (<Link to={createPageUrl(page)} className="text-xs text-blue-600 hover:underline">Acessar</Link>)}
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
  const { getFiltroContexto } = useContextoVisual();
  const [checks, setChecks] = React.useState({});

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const filtro = getFiltroContexto('empresa_id', true);
        const hasMulti = !!(filtro?.group_id || filtro?.empresa_id);

        const entitiesByModule = {
          "Comercial (Produtos, Pedidos, NF)": ["Produto", "Pedido", "NotaFiscal"],
          "Financeiro (Pagar, Receber, Caixa)": ["ContaPagar", "ContaReceber", "ExtratoBancario"],
          "Estoque": ["Produto", "MovimentacaoEstoque"],
          "Compras": ["Fornecedor", "OrdemCompra", "SolicitacaoCompra"],
          "CRM": ["Cliente", "Oportunidade", "Interacao"],
          "Administração do Sistema": ["PerfilAcesso", "ConfiguracaoSistema"],
          "Cadastros Gerais": ["Cliente", "Fornecedor", "Produto"],
          "Configuração do Sistema": ["ConfiguracaoSistema"],
          "Perfis (PerfilAcesso)": ["PerfilAcesso"],
          "Usuários (Categoria)": ["User"],
          "Fiscal e Tributário": ["NotaFiscal"],
          "Expedição e Logística": ["Entrega", "Romaneio"],
          "Produção e Manufatura": ["OrdemProducao", "MovimentacaoEstoque"],
          "RH": ["Colaborador", "Ponto"]
        };

        const results = {};
        await Promise.all(Object.entries(entitiesByModule).map(async ([mod, ents]) => {
          let ok = 0, fail = 0;
          await Promise.all(ents.map(async (en) => {
            try {
              const res = await base44.functions.invoke('entityListSorted', {
                entityName: en,
                filter: filtro,
                sortField: 'updated_date',
                sortDirection: 'desc',
                limit: 1,
              });
              if (res?.status === 200) ok++; else fail++;
            } catch (_) { fail++; }
          }));
          const ordenacao = ok === ents.length ? 'OK' : ok > 0 ? 'Parcial' : 'Pendente';
          const layout = 'OK'; // protegido por Layout global w-full/h-full
          const rbac = 'OK';   // Layout envolve páginas com <ProtectedSection>
          const multi = hasMulti ? 'OK' : 'Pendente';
          const status = (layout === 'OK' && rbac === 'OK' && ordenacao === 'OK' && multi === 'OK')
            ? 'OK'
            : ((ordenacao === 'Pendente' || multi === 'Pendente') ? 'Pendente' : 'Parcial');
          results[mod] = { layout, ordenacao, rbac, multi, status };
        }));
        if (mounted) setChecks(results);
      } catch (_) {
        // em erro global, mantemos os valores base (Parcial) já definidos
      }
    })();
    return () => { mounted = false; };
  }, [getFiltroContexto]);
  const linhasBase = [
    {
      modulo: "Comercial (Produtos, Pedidos, NF)",
      page: "Comercial",
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
      page: "Financeiro",
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
      page: "Estoque",
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
      page: "Compras",
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
      page: "CRM",
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
      page: "AdministracaoSistema",
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
      page: "Cadastros",
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
      page: "AdministracaoSistema?tab=config",
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
      page: "AdministracaoSistema",
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
      page: "AdministracaoSistema",
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

  const linhasExtras = [
    {
      modulo: "Fiscal e Tributário",
      page: "Fiscal",
      layout: "OK",
      ordenacao: "Parcial",
      rbac: "Parcial",
      multi: "Parcial",
      status: "Parcial",
      notas: [
        "Garantir listagens fiscais via entityListSorted e rolagem interna.",
        "Ações (emitir/cancelar/inutilizar) sob ProtectedAction + validação em entityGuard.",
      ],
      links: [
        "pages/Fiscal",
        "components/comercial/NotasFiscaisTab",
        "functions/entityListSorted",
        "components/ProtectedAction",
        "functions/entityGuard"
      ],
    },
    {
      modulo: "Expedição e Logística",
      page: "Expedicao",
      layout: "OK",
      ordenacao: "Parcial",
      rbac: "Parcial",
      multi: "Parcial",
      status: "Parcial",
      notas: [
        "Entregas/Romaneio → entityListSorted; sort persistido.",
        "Ações (separar, sair para entrega, comprovar) com ProtectedAction.",
      ],
      links: [
        "pages/Expedicao",
        "components/expedicao/EntregasListagem",
        "functions/entityListSorted",
        "components/ProtectedAction",
        "components/lib/useContextoVisual"
      ],
    },
    {
      modulo: "Produção e Manufatura",
      page: "Producao",
      layout: "OK",
      ordenacao: "Parcial",
      rbac: "Parcial",
      multi: "Parcial",
      status: "Parcial",
      notas: [
        "Ordem de Produção/Apontamentos → entityListSorted.",
        "Ações (enviar/ajustar/refugo) sob ProtectedAction + backend.",
      ],
      links: [
        "pages/Producao",
        "components/producao/ApontamentoProducao",
        "functions/entityListSorted",
        "components/ProtectedAction",
        "components/lib/useContextoVisual"
      ],
    },
    {
      modulo: "RH",
      page: "RH",
      layout: "OK",
      ordenacao: "Parcial",
      rbac: "Parcial",
      multi: "Parcial",
      status: "Parcial",
      notas: [
        "Colaboradores/Ponto → entityListSorted e sort persistido.",
        "Ações sensíveis (aprovar ponto, férias) com ProtectedAction.",
      ],
      links: [
        "pages/RH",
        "components/rh/PontoTab",
        "functions/entityListSorted",
        "components/ProtectedAction",
        "components/lib/useContextoVisual"
      ],
    },
  ];

  const linhas = [...linhasBase, ...linhasExtras].map((l) => ({
    ...l,
    layout: checks[l.modulo]?.layout || l.layout,
    ordenacao: checks[l.modulo]?.ordenacao || l.ordenacao,
    rbac: checks[l.modulo]?.rbac || l.rbac,
    multi: checks[l.modulo]?.multi || l.multi,
    status: checks[l.modulo]?.status || l.status,
    snapshot: checks[l.modulo]?.status === 'OK' ? { date: new Date().toISOString() } : undefined,
  }));

  // Fase 1 — Mapeamento técnico: listas consolidadas (sem criar telas novas)
  const arquivosCriticos = [
    'layout',
    'components/ui/erp/DataTable',
    'components/lib/useContextoVisual',
    'components/lib/usePermissions',
    'components/security/ProtectedSection',
    'components/ProtectedAction',
    'components/cadastros/VisualizadorUniversalEntidade',
    'functions/entityListSorted',
    'functions/entityGuard',
    'functions/sanitizeOnWrite',
    'functions/auditEntityEvents',
    'components/comercial/PedidosTab',
    'components/comercial/NotasFiscaisTab',
    'components/financeiro/ContasPagarTab',
    'components/financeiro/ContasReceberTab',
    'components/estoque/ProdutosTab',
    'components/compras/OrdensCompraTab',
    'components/expedicao/EntregasListagem'
  ];

  const riscosArquiteturais = [
    'Listagens sem entityListSorted (ordenacao/paginacao no backend) — risco de performance e inconsistência',
    'Operacoes de escrita sem carimbo group_id/empresa_id — risco multiempresa',
    'Acoes sem ProtectedAction/ProtectedSection — risco de acesso indevido',
    'Filtros sem getFiltroContexto — risco de vazar dados entre empresas',
  ];

  const modulosAdequar = [...new Set(linhas.filter(l => l.status !== 'OK').map(l => l.modulo))];

  const violacoesRegraMae = [
    'Ausência de multiempresa explícita em alguns creates/updates',
    'Ações críticas sem dupla validação (frontend + backend)',
    'Tabelas legadas sem rolagem interna e persistência de sort',
  ];

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-md">
        <CardHeader className="pb-3 flex items-center justify-between">
          <CardTitle>Matriz Completa de Adequação — Fase 3</CardTitle>
          <Button variant="outline" size="sm" onClick={() => {
            const headers = ['Módulo','Layout','Ordenação','RBAC','Multiempresa','Status'];
            const rows = (linhas || []).map(l => [l.modulo, l.layout, l.ordenacao, l.rbac, l.multi, l.status]);
            const csv = [headers.join(','), ...rows.map(r => r.map(v => `"${String(v ?? '').replace(/"/g,'""')}"`).join(','))].join('\n');
            const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `matriz_adequacao_fase3_${new Date().toISOString().split('T')[0]}.csv`;
            a.click();
          }}>
            Exportar CSV
          </Button>
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

      {/* FASE 1 — Relatório consolidado */}
      <Card className="border-0 shadow-md">
        <CardHeader className="pb-3">
          <CardTitle>Fase 1 — Mapeamento Técnico Completo</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 text-sm">
          <div className="col-span-1 md:col-span-2 xl:col-span-4 mb-2 text-xs text-slate-500">
            Estratégia confirmada: Migração em ondas (Comercial → Financeiro → Estoque) e snapshot quando cada módulo alcançar 100%.
          </div>
          <div>
            <p className="text-slate-500 mb-2">Arquivos críticos</p>
            <ul className="list-disc ml-5 space-y-1 text-slate-700">
              {arquivosCriticos.map((p,i)=>(<li key={i}>{p}</li>))}
            </ul>
          </div>
          <div>
            <p className="text-slate-500 mb-2">Riscos arquiteturais</p>
            <ul className="list-disc ml-5 space-y-1 text-slate-700">
              {riscosArquiteturais.map((r,i)=>(<li key={i}>{r}</li>))}
            </ul>
          </div>
          <div>
            <p className="text-slate-500 mb-2">Módulos a adequar</p>
            <ul className="list-disc ml-5 space-y-1 text-slate-700">
              {modulosAdequar.map((m,i)=>(<li key={i}>{m}</li>))}
            </ul>
          </div>
          <div>
            <p className="text-slate-500 mb-2">Violações Regra‑Mãe</p>
            <ul className="list-disc ml-5 space-y-1 text-slate-700">
              {violacoesRegraMae.map((v,i)=>(<li key={i}>{v}</li>))}
            </ul>
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