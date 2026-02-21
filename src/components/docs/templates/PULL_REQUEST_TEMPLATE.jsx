# PR – ERP Zuccaro (Draft → Checklist → Ready for Review)

Título (Conventional Commit)
- tipo(escopo): resumo curto
  - ex: feat(estoque): filtros multiempresa em Movimentações

## Descrição
Breve contexto do que foi melhorado no já existente (sem criar novo módulo com mesmo propósito).

## Checklist Regra‑Mãe (obrigatório marcar TODOS)
- [ ] 1. Não criei nada novo com propósito já existente; melhorei o que já havia
- [ ] 2. Alteração feita EXCLUSIVAMENTE no módulo/arquivo existente
- [ ] 3. Refatorei quando >400–600 linhas, quebrando em pequenos arquivos sem mudar comportamento
- [ ] 4. Não removi/ocultei funcionalidades; apenas reorganizei/melhorei
- [ ] 5a. Multiempresa absoluta (group_id e empresa_id em TODAS operações)
- [ ] 5b. RBAC granular (frontend: esconder/desabilitar; backend: bloquear)
- [ ] 5c. Segurança: sanitizeOnWrite, validações, anti‑XSS/injeção, dupla validação em ações sensíveis
- [ ] 5d. Auditoria: antes/depois, usuário, timestamps, group_id, empresa_id (AuditLog)
- [ ] 6. Nada quebrei (telas/fluxos/layout responsivo preservados)
- [ ] 7. Layout w-full/h-full e responsivo; redimensionável (exceto abas)
- [ ] 8. Integração perfeita no fluxo atual (ex: pedido → estoque → NF → WhatsApp)

## Evidências
- [ ] Prints/GIFs (mobile/desktop)
- [ ] Links para logs de auditoria/CI

## Tarefas de revisão
- [ ] Resolver todas as conversas
- [ ] CI verde (lint/build/tests) e título compatível com Conventional Commits