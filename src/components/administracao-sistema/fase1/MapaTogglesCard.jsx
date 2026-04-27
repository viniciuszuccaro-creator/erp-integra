import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const itens = [
  { chave: "seg_auditoria_detalhada", tela: "Configurações Gerais > Segurança", funcao: "auditError", modulo: "Sistema", escopo: "grupo/empresa/global" },
  { chave: "seg_login_duplo_fator", tela: "Configurações Gerais > Segurança", funcao: "verifyTotp", modulo: "Sistema/Login/MFA", escopo: "grupo/empresa/global" },
  { chave: "seg_bloquear_ip_suspeito", tela: "Configurações Gerais > Segurança", funcao: "entityGuard", modulo: "Sistema/Segurança", escopo: "grupo/empresa/global" },
  { chave: "cc_ia_seguranca_ativa", tela: "IA & Otimização / Segurança", funcao: "securityAlerts", modulo: "Sistema", escopo: "grupo/empresa/global" },
  { chave: "cc_backup_automatico", tela: "ConfigCenter > Backup & Logs", funcao: "autoBackup", modulo: "Sistema", escopo: "grupo/empresa/global" },
  { chave: "cc_criptografia_dados", tela: "ConfigCenter > Backup & Logs", funcao: "piiEncryptor", modulo: "Sistema/Dados", escopo: "grupo/empresa/global" },
  { chave: "notif_pedido_aprovado", tela: "Configurações Gerais > Notificações", funcao: "onPedidoApprovalRequested", modulo: "Comercial", escopo: "grupo/empresa/global" },
  { chave: "notif_entrega_transporte", tela: "Configurações Gerais > Notificações", funcao: "onEntregaUpdated", modulo: "Expedição", escopo: "grupo/empresa/global" },
  { chave: "notif_boleto_gerado", tela: "Configurações Gerais > Notificações", funcao: "emitirBoleto", modulo: "Financeiro", escopo: "grupo/empresa/global" },
  { chave: "notif_titulo_vencido", tela: "Configurações Gerais > Notificações", funcao: "paymentStatusManager", modulo: "Financeiro", escopo: "grupo/empresa/global" },
  { chave: "fiscal_cfop_interno", tela: "Configurações Gerais > Fiscal", funcao: "nfeActions", modulo: "Fiscal", escopo: "grupo/empresa/global" },
  { chave: "fiscal_cfop_externo", tela: "Configurações Gerais > Fiscal", funcao: "nfeActions", modulo: "Fiscal", escopo: "grupo/empresa/global" },
  { chave: "fiscal_obs_nfe", tela: "Configurações Gerais > Fiscal", funcao: "nfeActions", modulo: "Fiscal", escopo: "grupo/empresa/global" },
  { chave: "admin_seed_leve", tela: "Ferramentas > Executar Seed Leve", funcao: "seedData", modulo: "Sistema/Ferramentas", escopo: "grupo/empresa" },
  { chave: "admin_backfill_dry_run", tela: "Ferramentas > Dry-run", funcao: "backfillGroupEmpresa", modulo: "Sistema/Ferramentas", escopo: "global/admin" },
  { chave: "admin_backfill_apply", tela: "Ferramentas > Aplicar Correções", funcao: "backfillGroupEmpresa", modulo: "Sistema/Ferramentas", escopo: "global/admin" },
  { chave: "integracao_criar_estrutura_base", tela: "Integrações > Criar estrutura base", funcao: "upsertConfig", modulo: "Sistema/Integrações", escopo: "grupo/empresa/global" },
  { chave: "integracao_testar_webhook_asaas", tela: "Integrações > Testar webhook Asaas", funcao: "legacyIntegrationsMirror", modulo: "Sistema/Integrações", escopo: "grupo/empresa/global" },
  { chave: "integracao_simular_nfe", tela: "Integrações > Simular NF-e autorizada", funcao: "legacyIntegrationsMirror", modulo: "Sistema/Integrações", escopo: "grupo/empresa/global" },
];

export default function MapaTogglesCard() {
  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Mapa chave → função real</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {itens.map((item) => (
          <div key={item.chave} className="rounded-xl border p-3 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge>{item.chave}</Badge>
              <Badge variant="outline">{item.funcao}</Badge>
            </div>
            <div className="grid gap-1 text-sm text-slate-700 md:grid-cols-3">
              <div><span className="font-medium">Tela:</span> {item.tela}</div>
              <div><span className="font-medium">Módulo:</span> {item.modulo}</div>
              <div><span className="font-medium">Escopo:</span> {item.escopo}</div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}