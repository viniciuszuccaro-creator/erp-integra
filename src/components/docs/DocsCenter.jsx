import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Search } from "lucide-react";

/**
 * DocsCenter — Centro de documentação inline.
 * NÃO usa import.meta.glob para evitar criação de arquivos .md.jsx inválidos.
 * Documentação mantida como strings JS hardcoded.
 */

const DOCS = [
  {
    group: "arquitetura",
    title: "Visão Geral do Sistema",
    content: `# ERP Zuccaro V22.1 — Visão Geral

## Arquitetura Principal
O sistema é um ERP multi-empresa com suporte a grupos empresariais, RBAC granular, IA integrada e auditoria completa.

## Módulos
- **Comercial**: Pedidos, orçamentos, clientes, comissões, tabelas de preço
- **Estoque**: Produtos, movimentações, inventário, transferências entre filiais
- **Financeiro**: Contas a pagar/receber, caixa, conciliação bancária, gateway de pagamentos
- **Fiscal**: NF-e, SPED, cálculo de impostos, validação fiscal por IA
- **Expedição**: Entregas, romaneios, roteirização, rastreamento GPS
- **Produção**: Ordens de produção, apontamentos, kanban, controle de refugo
- **Compras**: Solicitações, ordens de compra, avaliação de fornecedores
- **RH**: Colaboradores, ponto eletrônico, férias, treinamentos
- **CRM**: Oportunidades, interações, funil de vendas, análise de churn
- **Contratos**: Gestão de contratos, assinatura eletrônica

## Entidades Centrais
- \`GrupoEmpresarial\` → \`Empresa\` → todos os demais registros
- Todos os registros carregam \`group_id\` e/ou \`empresa_id\`
- Contexto multiempresa controlado por \`useContextoVisual\`
`,
  },
  {
    group: "arquitetura",
    title: "Multiempresa e Contexto",
    content: `# Multiempresa e Context-Switching

## Como funciona
- O hook \`useContextoVisual\` expõe \`empresaAtual\`, \`grupoAtual\` e \`contexto\` (empresa|grupo)
- O layout injeta automaticamente \`group_id\` e \`empresa_id\` em todos os creates/updates via wrapper de entidade
- A função backend \`entityListSorted\` aceita filtros \`$or\` para busca por escopo

## Stamps automáticos
Ao criar qualquer registro, o Layout intercepta e adiciona:
\`\`\`js
{ group_id: grupoAtual.id, empresa_id: empresaAtual.id }
\`\`\`

## Contexto Grupo
Quando \`contexto === 'grupo'\`, o filtro inclui todos os registros do grupo via \`$or\` com todos os \`empresa_id\` do grupo.

## Filtro com filterInContext
\`\`\`js
const dados = await filterInContext('Pedido', { status: 'Aprovado' }, '-data_pedido', 50);
\`\`\`
`,
  },
  {
    group: "rbac",
    title: "RBAC e Permissões",
    content: `# RBAC — Controle de Acesso Baseado em Perfis

## Entidades
- \`PerfilAcesso\`: Define permissões por módulo/seção/ação
- \`User\`: Campo \`role\` (admin | user)

## Hook usePermissions
\`\`\`js
const { hasPermission } = usePermissions();
hasPermission('Comercial', 'Pedidos', 'criar'); // true/false
\`\`\`

## Ações disponíveis
\`ver\`, \`criar\`, \`editar\`, \`excluir\`, \`aprovar\`, \`executar\`, \`visualizar\`

## ProtectedSection
\`\`\`jsx
<ProtectedSection module="Financeiro" section="ContasPagar" action="editar">
  <FormularioPagamento />
</ProtectedSection>
\`\`\`

## Admin
Usuários com \`role === 'admin'\` têm acesso irrestrito a todos os módulos.
`,
  },
  {
    group: "rbac",
    title: "Auditoria e Logs",
    content: `# Auditoria Global

## AuditLog
Entidade central que registra todas as ações do sistema.

Campos principais:
- \`usuario\`, \`usuario_id\`
- \`acao\`: Login, Criação, Edição, Exclusão, Bloqueio, etc.
- \`modulo\`, \`tipo_auditoria\` (ui | entidade | seguranca | sistema)
- \`entidade\`, \`registro_id\`
- \`dados_anteriores\`, \`dados_novos\`
- \`empresa_id\`, \`group_id\`

## Onde é registrado
1. Layout: intercepta todos os creates/updates de entidade
2. ProtectedSection: registra acessos negados
3. Navegação: registra mudanças de rota
4. Funções backend: registram execuções sensíveis
`,
  },
  {
    group: "financeiro",
    title: "Fluxo de Caixa e Liquidação",
    content: `# Financeiro — Fluxo de Liquidação V22.0

## Estágios
1. **Recebido no Caixa** (\`data_recebido_caixa\`)
2. **Compensado no Banco** (\`data_compensado_banco\`)
3. **Conciliado** (\`status_compensacao = 'Conciliado'\`)

## Formas de Pagamento
Controladas pela entidade \`FormaPagamento\` com taxa de operadora.

## Gateway de Pagamentos
Configurado em \`ConfiguracaoGatewayPagamento\` por empresa.
Suporta: Boleto, PIX, Cartão, Link de Pagamento.

## Conta a Receber
\`\`\`
ContaReceber.status_cobranca: nao_gerada → gerada → enviada → paga
\`\`\`
`,
  },
  {
    group: "configuracoes",
    title: "ConfiguracaoSistema — Toggles",
    content: `# ConfiguracaoSistema — Chaves de Toggle

## Como funciona
Cada configuração é um registro na entidade \`ConfiguracaoSistema\` com campos:
- \`chave\`: identificador único (ex: \`notif_pedido_aprovado\`)
- \`categoria\`: agrupamento (Notificacoes, Fiscal, Seguranca, IA)
- \`ativa\`: boolean (toggle on/off)
- \`valor\`, \`numero\`, \`dados\`: campos livres para configurações de texto/número/objeto
- \`empresa_id\` e/ou \`group_id\`: escopo do registro

## Persistência
Todos os toggles são salvos via função backend \`upsertConfig\` que faz upsert por (chave + escopo).

## Chaves existentes
| Chave | Categoria |
|-------|-----------|
| notif_pedido_aprovado | Notificacoes |
| notif_entrega_transporte | Notificacoes |
| notif_boleto_gerado | Notificacoes |
| notif_titulo_vencido | Notificacoes |
| notif_op_atrasada | Notificacoes |
| notif_estoque_baixo | Notificacoes |
| seg_login_duplo_fator | Seguranca |
| seg_bloquear_ip_suspeito | Seguranca |
| seg_sessao_unica | Seguranca |
| seg_auditoria_detalhada | Seguranca |
| ia_precificacao | IA |
| ia_churn | IA |
| ia_reposicao_estoque | IA |
`,
  },
];

export default function DocsCenter() {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  const filtered = DOCS.filter(d =>
    d.title.toLowerCase().includes(query.toLowerCase()) ||
    d.group.toLowerCase().includes(query.toLowerCase()) ||
    d.content.toLowerCase().includes(query.toLowerCase())
  );

  const current = filtered[selectedIndex] || filtered[0] || DOCS[0];

  const handleSelect = (idx) => setSelectedIndex(idx);

  return (
    <div className="w-full h-full grid lg:grid-cols-3 gap-6">
      {/* Sidebar */}
      <Card className="border shadow-sm lg:col-span-1 flex flex-col">
        <CardHeader className="bg-slate-50 border-b pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <BookOpen className="w-4 h-4" />
            Documentação Técnica
          </CardTitle>
          <div className="relative mt-2">
            <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
            <Input
              className="pl-8 h-8 text-sm"
              placeholder="Buscar..."
              value={query}
              onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); }}
            />
          </div>
        </CardHeader>
        <CardContent className="p-2 overflow-auto flex-1">
          {filtered.length === 0 && (
            <p className="text-xs text-slate-400 p-3">Nenhum documento encontrado.</p>
          )}
          {filtered.map((doc, idx) => (
            <button
              key={`${doc.group}-${doc.title}`}
              onClick={() => handleSelect(idx)}
              className={`w-full text-left px-3 py-2 rounded-lg mb-1 transition-colors text-sm ${
                current?.title === doc.title && current?.group === doc.group
                  ? 'bg-blue-600 text-white'
                  : 'hover:bg-slate-100 text-slate-700'
              }`}
            >
              <div className="font-medium truncate">{doc.title}</div>
              <Badge
                variant="outline"
                className={`text-[10px] mt-0.5 ${current?.title === doc.title ? 'border-blue-300 text-blue-100' : ''}`}
              >
                {doc.group}
              </Badge>
            </button>
          ))}
        </CardContent>
        <div className="p-2 border-t text-xs text-slate-400 text-center">
          {filtered.length} de {DOCS.length} documentos
        </div>
      </Card>

      {/* Content */}
      <Card className="border shadow-sm lg:col-span-2 flex flex-col">
        <CardHeader className="bg-slate-50 border-b pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <span className="truncate">{current?.title || "Selecione um documento"}</span>
            {current?.group && (
              <Badge variant="outline" className="text-xs shrink-0">{current.group}</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 overflow-auto flex-1">
          {current ? (
            <ReactMarkdown className="prose prose-sm max-w-none prose-headings:text-slate-800 prose-code:bg-slate-100 prose-code:px-1 prose-code:rounded">
              {current.content}
            </ReactMarkdown>
          ) : (
            <div className="text-slate-400 text-sm">Nenhum documento selecionado.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}