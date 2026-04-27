export default `# Inventário — Administração do Sistema

## Abas principais
- `gerais` → `ConfiguracoesGeraisIndex` → `ConfigGlobal`
- `integracoes` → `IntegracoesIndex`
- `acessos` → `GestaoAcessosIndex`
- `seguranca` → `SegurancaGovernancaIndex`
- `ia` → `IAOtimizacaoIndex`
- `auditoria` → `AuditoriaLogsIndex`
- `ferramentas` → `AdminFerramentas`

## Mapa chave → função real

### Segurança
- `seg_login_duplo_fator`
  - Tela: `ConfigGlobal > Segurança`
  - Alias visual: `cc_exigir_mfa` em `ConfigCenter`
  - Função real: `functions/verifyTotp`
  - Efeito esperado: exigir MFA no fluxo de validação/login
  - Escopo: grupo/empresa/global

- `seg_bloquear_ip_suspeito`
  - Tela: `ConfigGlobal > Segurança`
  - Alias visual: `cc_bloquear_ips_suspeitos` em `ConfigCenter`
  - Função real: `functions/entityGuard`
  - Efeito esperado: bloquear tráfego/IP suspeito
  - Escopo: grupo/empresa/global

- `seg_auditoria_detalhada`
  - Tela: `ConfigGlobal > Segurança`
  - Alias visual: `cc_auditoria_automatica` em `ConfigCenter`
  - Função real: `functions/auditError`
  - Efeito esperado: registrar logs detalhados
  - Escopo: grupo/empresa/global

- `seg_sessao_unica`
  - Tela: `ConfigGlobal > Segurança`
  - Função real: ainda sem consumo backend confirmado
  - Efeito esperado: impedir múltiplas sessões simultâneas
  - Escopo: grupo/empresa/global

- `seg_notif_novo_dispositivo`
  - Tela: `ConfigGlobal > Segurança`
  - Função real: ainda sem consumo backend confirmado
  - Efeito esperado: alertar novo dispositivo
  - Escopo: grupo/empresa/global

- `seg_lgpd_anonimizacao`
  - Tela: `ConfigGlobal > Segurança`
  - Função real: ainda sem consumo backend confirmado
  - Efeito esperado: anonimização automática
  - Escopo: grupo/empresa/global

### IA e Segurança IA
- `cc_ia_seguranca_ativa`
  - Tela: `ConfigCenter > Segurança`
  - Alias backend: `seg_ia_seguranca`
  - Função real: `functions/securityAlerts`
  - Efeito esperado: habilitar análise/alertas de segurança
  - Escopo: grupo/empresa/global

- `ia_leitura_projetos`
- `ia_preditiva_vendas`
- `ia_conciliacao`
- `ia_producao`
- `ia_recomendacao_produtos`
- `ia_anomalia_financeira`
  - Tela: `IAOtimizacaoIndex`
  - Função real: consumo real ainda parcial/não padronizado
  - Efeito esperado: cada módulo consultar antes de executar IA
  - Escopo: grupo/empresa

### Backup e dados
- `cc_backup_automatico`
  - Tela: `ConfigCenter > Backup & Logs`
  - Função real: ainda sem vínculo direto confirmado com `functions/autoBackup`
  - Efeito esperado: habilitar rotina de backup
  - Escopo: grupo/empresa/global

- `cc_criptografia_dados`
  - Tela: `ConfigCenter > Backup & Logs`
  - Função real: ainda sem vínculo direto confirmado com `functions/piiEncryptor`
  - Efeito esperado: criptografia de dados sensíveis
  - Escopo: grupo/empresa/global

### Notificações
- `notif_pedido_aprovado`
- `notif_entrega_transporte`
- `notif_boleto_gerado`
- `notif_titulo_vencido`
- `notif_op_atrasada`
- `notif_estoque_baixo`
  - Tela: `ConfigGlobal > Notificações`
  - Função real: ainda precisa auditoria de consumo por função/automação
  - Escopo: grupo/empresa/global

### Fiscal
- `fiscal_cfop_interno`
- `fiscal_cfop_externo`
- `fiscal_aliq_icms`
- `fiscal_aliq_pis`
- `fiscal_aliq_cofins`
- `fiscal_obs_nfe`
  - Tela: `ConfigGlobal > Fiscal`
  - Função real: consumo parcial por fluxos fiscais; precisa validação final
  - Escopo: grupo/empresa/global

## Ações e botões críticos já encontrados
- `AdminFerramentas > Executar Seed Leve` → `functions/seedData`
- `AdminFerramentas > Dry-run` → `functions/backfillGroupEmpresa`
- `AdminFerramentas > Aplicar Correções` → `functions/backfillGroupEmpresa`
- `IntegracoesIndex > Criar estrutura base` → `functions/upsertConfig`
- `IntegracoesIndex > Testar webhook Asaas` → `functions/legacyIntegrationsMirror`
- `IntegracoesIndex > Simular NF-e autorizada` → `functions/legacyIntegrationsMirror`

## Próximos passos recomendados
1. Padronizar leitura por helper único para frontend e backend.
2. Auditar consumo real das chaves sem vínculo confirmado.
3. Mapear botões por RBAC, escopo, estado desabilitado e auditoria.
4. Validar por fluxo: Segurança, IA, Integrações, Cadastros, Financeiro, Comercial, Estoque, Produção e Expedição.`;