# 📘 Guia Prático ETAPA 1 — Implementação em Produção

## 🎯 1. Setup Inicial Rápido

### Importar Perfis Padrão
```javascript
import { PERFIS_PADRAO } from '@/components/lib/TemplatesPerfisAcesso';

// No onboarding, criar perfis:
for (const perfil of PERFIS_PADRAO) {
  await base44.entities.PerfilAcesso.create(perfil);
}
```

### Atribuir Perfil a Usuário
```javascript
const user = await base44.auth.me();
await base44.auth.updateMe({ perfil_acesso_id: perfilId });
```

---

## 🔒 2. Proteger uma Página

```jsx
// pages/Pedidos.jsx
import ProtectedSection from '@/components/security/ProtectedSection';
import usePermissions from '@/components/lib/usePermissions';

export default function Pedidos() {
  const { canCreate, canEdit, canDelete } = usePermissions();

  return (
    <div>
      <h1>Pedidos</h1>
      
      {/* Seção protegida por permissão */}
      <ProtectedSection module="Comercial" section="Pedidos" action="criar">
        <button>Novo Pedido</button>
      </ProtectedSection>

      {/* Tabela protegida */}
      <ProtectedSection module="Comercial" section="Pedidos" action="visualizar">
        <ListaPedidos />
      </ProtectedSection>
    </div>
  );
}
```

---

## 🛡️ 3. Criar com Segurança Completa

```jsx
import { useSecureOperations } from '@/components/lib/useSecureOperations';
import { useAuditAction } from '@/components/lib/useAuditAction';

export default function NovoPedido() {
  const { secureCreate } = useSecureOperations();
  const { auditAction } = useAuditAction();

  const handleCreate = async (dados) => {
    try {
      const resultado = await secureCreate('Pedido', dados, 'Comercial', 'criar');
      await auditAction('Criação Manual', 'Comercial', 'Pedido', resultado.id);
      toast.success('Pedido criado com sucesso');
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      handleCreate(formData);
    }}>
      {/* campos */}
    </form>
  );
}
```

---

## 📊 4. Auditar Automações

```javascript
// Dentro de uma automação
await base44.functions.invoke('auditAutomation', {
  automationName: 'Fechar Pedidos Vencidos',
  entityName: 'Pedido',
  operation: 'update',
  entityId: pedido.id,
  data: { status: 'Cancelado' }
});
```

---

## 🤖 5. Auditar Ações de IA

```javascript
await base44.functions.invoke('auditIA', {
  iaModel: 'PriceBrain',
  entityName: 'Pedido',
  action: 'ajuste_preco',
  entityId: pedido.id,
  suggestion: 'Aumentar preço em 5%',
  confidence: 85,
  applied: true
});
```

---

## 💬 6. Auditar Chatbot

```javascript
await base44.functions.invoke('auditChatbot', {
  channel: 'WhatsApp',
  intent: 'criar_pedido',
  entityName: 'Pedido',
  action: 'create',
  clientEmail: 'cliente@example.com',
  result: { success: true }
});
```

---

## ✅ 7. Validar Sistema

```jsx
import ValidadorETAPA1 from '@/components/lib/ValidadorETAPA1';

export default function AdminDashboard() {
  return (
    <div>
      <h1>Painel Administrativo</h1>
      <ValidadorETAPA1 /> {/* Valida RBAC, Multiempresa, Auditoria, Backend */}
    </div>
  );
}
```

---

## 🚀 8. Deploy Checklist

- [ ] Todos os usuários têm `perfil_acesso_id` atribuído
- [ ] Perfis foram criados com permissões corretas
- [ ] `entityOperationGuard` está respondendo
- [ ] `rbacValidator` está respondendo
- [ ] `multiempresaValidator` está respondendo
- [ ] AuditLog está registrando
- [ ] Frontend usa `ProtectedSection` em pontos críticos
- [ ] Backend valida `empresa_id` em todas as operações
- [ ] Componentes sensíveis usam `SecureActionButton`

---

## 🔍 Troubleshooting

**Problema:** Permissão bloqueando ação legítima  
**Solução:** Verificar `PerfilAcesso` do usuário e adicionar ação desejada nas permissões

**Problema:** Multiempresa rejeitando criação  
**Solução:** Verificar que `empresa_id` está sendo carimado via `carimbarContexto`

**Problema:** AuditLog não registrando  
**Solução:** Verificar que `base44.entities.AuditLog.create` está sendo chamado com todos os campos obrigatórios

---

## 📚 Documentação Completa

Veja `ETAPA1_COMPLETA_CERTIFICACAO.md` para detalhes técnicos completos.