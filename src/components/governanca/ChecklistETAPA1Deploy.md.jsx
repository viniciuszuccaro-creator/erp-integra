# ✅ CHECKLIST ETAPA 1 — Deploy para Produção

## 🎯 Fase 1: Validação Técnica

- [ ] **rbacValidator Funcional**
  ```bash
  POST /functions/rbacValidator
  { "module": "Comercial", "action": "criar", "userId": "user123" }
  Response: { "valid": true }
  ```

- [ ] **multiempresaValidator Funcional**
  ```bash
  POST /functions/multiempresaValidator
  { "operation": "create", "entityName": "Pedido", "data": { "empresa_id": "emp123" } }
  Response: { "valid": true }
  ```

- [ ] **entityOperationGuard Funcional**
  ```bash
  POST /functions/entityOperationGuard
  { "operation": "create", "entityName": "Pedido", "data": { "empresa_id": "emp123" } }
  Response: { "valid": true }
  ```

- [ ] **AuditLog Registrando**
  ```javascript
  const logs = await base44.entities.AuditLog.list('-data_hora', 10);
  // Deve retornar logs recentes
  ```

---

## 🔐 Fase 2: Configuração RBAC

- [ ] **Criar Perfil Admin**
  ```javascript
  import { PERFIL_ADMIN } from '@/components/lib/TemplatesPerfisAcesso';
  await base44.entities.PerfilAcesso.create(PERFIL_ADMIN);
  ```

- [ ] **Criar Perfis Padrão**
  ```javascript
  import { PERFIS_PADRAO } from '@/components/lib/TemplatesPerfisAcesso';
  for (const perfil of PERFIS_PADRAO) {
    await base44.entities.PerfilAcesso.create(perfil);
  }
  ```

- [ ] **Atribuir Perfil a Admin**
  ```javascript
  const admin = await base44.auth.me();
  const adminPerfil = await base44.entities.PerfilAcesso.filter({ nome_perfil: 'Administrador' });
  await base44.auth.updateMe({ perfil_acesso_id: adminPerfil[0].id });
  ```

- [ ] **Atribuir Perfis a Usuários**
  - Gerentes: `PERFIL_GERENTE_VENDAS`, `PERFIL_GERENTE_FINANCEIRO`
  - Vendedores: `PERFIL_VENDEDOR`
  - Operacional: `PERFIL_OPERACIONAL_ESTOQUE`

---

## 🛡️ Fase 3: Configuração Multiempresa

- [ ] **Validar Contexto Grupo/Empresa**
  ```javascript
  const { empresaAtual, grupoAtual } = useContextoVisual();
  // Deve estar definido
  ```

- [ ] **Testar Stamping Automático**
  ```javascript
  const { carimbarContexto } = useContextoVisual();
  const dados = carimbarContexto({ descricao: 'Teste' });
  // Deve ter empresa_id ou group_id
  ```

- [ ] **Testar Isolamento**
  ```javascript
  // Usuário empresa A não vê dados da empresa B
  const dados = await filterInContext('Pedido', {}, '-updated_date', 100);
  // Todos devem ter empresa_id === empresaAtual.id
  ```

---

## 📋 Fase 4: Testes de Segurança

- [ ] **Testar ProtectedSection**
  ```jsx
  <ProtectedSection module="Comercial" section="Pedidos" action="criar">
    Deve estar oculto para usuários sem permissão
  </ProtectedSection>
  ```

- [ ] **Testar SecureActionButton**
  ```jsx
  <SecureActionButton module="Comercial" section="Pedidos" action="excluir">
    Botão deve estar desabilitado para usuários sem permissão
  </SecureActionButton>
  ```

- [ ] **Testar secureCreate**
  ```javascript
  const { secureCreate } = useSecureOperations();
  try {
    await secureCreate('Pedido', { descricao: '...' }, 'Comercial', 'criar');
    // Deve funcionar ou lançar erro com permissão bloqueada
  } catch (err) {
    console.log('Bloqueado:', err.message);
  }
  ```

- [ ] **Testar Validador**
  ```jsx
  <ValidadorETAPA1 />
  // Todos os 4 itens devem estar verde ✅
  ```

---

## 📊 Fase 5: Auditoria

- [ ] **Testar auditAutomation**
  ```javascript
  await base44.functions.invoke('auditAutomation', {
    automationName: 'Teste',
    entityName: 'Pedido',
    operation: 'create',
    entityId: 'test123'
  });
  // Deve registrar em AuditLog
  ```

- [ ] **Testar auditIA**
  ```javascript
  await base44.functions.invoke('auditIA', {
    iaModel: 'TestModel',
    entityName: 'Pedido',
    action: 'test',
    confidence: 85,
    applied: true
  });
  // Deve registrar em AuditLog
  ```

- [ ] **Testar auditChatbot**
  ```javascript
  await base44.functions.invoke('auditChatbot', {
    channel: 'WhatsApp',
    intent: 'test',
    entityName: 'Pedido',
    clientEmail: 'test@test.com'
  });
  // Deve registrar em AuditLog
  ```

- [ ] **Verificar AuditLog**
  ```javascript
  const logs = await base44.entities.AuditLog.filter({}, '-data_hora', 50);
  // Deve conter ao menos:
  // - Ações manuais (Criação, Edição, Exclusão)
  // - Ações de automação
  // - Ações de IA
  // - Ações de chatbot
  ```

---

## 🚀 Fase 6: Deploy

- [ ] **Verificar Todas as Funções Backend**
  ```bash
  ✅ rbacValidator
  ✅ multiempresaValidator
  ✅ entityOperationGuard
  ✅ auditAutomation
  ✅ auditIA
  ✅ auditChatbot
  ```

- [ ] **Verificar Todos os Componentes**
  ```bash
  ✅ ProtectedSection
  ✅ ProtectedField
  ✅ SecureActionButton
  ✅ AdminOnlyZone
  ```

- [ ] **Verificar Todos os Hooks**
  ```bash
  ✅ usePermissions
  ✅ useContextoVisual
  ✅ useSecureOperations
  ✅ useAuditAction
  ```

- [ ] **Executar ValidadorETAPA1**
  - RBAC: ✅ Verde
  - Multiempresa: ✅ Verde
  - AuditLog: ✅ Verde
  - Backend Guard: ✅ Verde

- [ ] **Documentação Completa**
  - ETAPA1_COMPLETA_CERTIFICACAO.md ✅
  - GuiaETAPA1Pratico.md ✅
  - MANIFESTOETAPA1_100_FINAL.md ✅
  - ChecklistETAPA1Deploy.md (este) ✅

---

## 🎯 Fase 7: Aprovação Final

- [ ] CTO aprova segurança RBAC
- [ ] DevOps aprova funcionalidade multiempresa
- [ ] Compliance aprova auditoria
- [ ] Gerente de Projeto aprova release

---

## 📝 Sign-off

| Papel | Nome | Data | Assinatura |
|-------|------|------|-----------|
| Desenvolvedor | `____________` | `__/__/____` | `____________` |
| CTO | `____________` | `__/__/____` | `____________` |
| DevOps | `____________` | `__/__/____` | `____________` |
| Compliance | `____________` | `__/__/____` | `____________` |

---

## ⚠️ Rollback Plan

Se algo der errado em produção:

1. Desabilitar `entityOperationGuard` (comentar validação)
2. Desabilitar componentes protegidos (usar fallback)
3. Rollback de funções backend
4. Restaurar backup de dados

**Tempo estimado:** 30 minutos

---

**ETAPA 1 — Pronto para Produção após completar todos os ✅**