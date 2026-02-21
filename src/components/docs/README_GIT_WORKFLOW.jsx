# Workflow GitHub – ERP Zuccaro (Regra‑Mãe)

Este guia contém TUDO pronto para copiar no repositório GitHub: proteções de branch, nomenclatura, PR Template com checklist Regra‑Mãe, CODEOWNERS, Actions (CI), Husky + Commitlint e hooks.

IMPORTANTE: Não cria nada novo com mesmo propósito; sempre melhore o existente. Use branches temporárias; PRs SEMPRE passam pela checklist Regra‑Mãe.


## 1) Proteções de Branch (GitHub UI)
Repository → Settings → Branches → Branch protection rules → Add rule:
- Branch name pattern: main
- Require a pull request before merging (Ativar)
- Require approvals: 1 (ou 2)
- Dismiss stale approvals on new commits (Ativar)
- Require status checks to pass before merging (Ativar)
  - Selecione “ci/lint-build”, “commitlint/pr-title”
- Require conversation resolution before merging (Ativar)
- Restrict who can push to matching branches (Opcional: só bots/admins)


## 2) Convenção de Branches
- feat/<escopo-kebab> (ex: feat/estoque-filtros-multiempresa)
- fix/<issue-kebab>
- chore/<tarefa>
- refactor/<alvo>
- docs/<assunto>


## 3) .github/PULL_REQUEST_TEMPLATE.md
Copie este conteúdo no arquivo: .github/PULL_REQUEST_TEMPLATE.md

---
Título (Conventional Commit):
- tipo(escopo): resumo curto (ex: feat(estoque): filtros multiempresa em Movimentações)

Checklist Regra‑Mãe (marque TODOS):
- [ ] 1. Não criei nada novo com propósito já existente; melhorei o que já havia
- [ ] 2. Melhoria/ajuste feito EXCLUSIVAMENTE no módulo/arquivo existente
- [ ] 3. Refatorei em pequenos arquivos quando >400–600 linhas, SEM mudar comportamento
- [ ] 4. Não removi/ocultei funcionalidades; apenas reorganizei/melhorei
- [ ] 5a. Multiempresa absoluta (group_id e empresa_id em TODAS operações)
- [ ] 5b. RBAC granular (frontend: esconder/desabilitar; backend: bloquear)
- [ ] 5c. Segurança: sanitizeOnWrite, validações, anti‑XSS/injeção, dupla validação em ações sensíveis
- [ ] 5d. Auditoria completa: antes/depois, usuário, timestamps, group_id, empresa_id (AuditLog)
- [ ] 6. Nada quebrei: telas/fluxos/layout responsivo preservados
- [ ] 7. Layout w-full/h-full, responsivo e redimensionável (exceto abas)
- [ ] 8. Integração perfeita no fluxo atual (pedido → estoque → NF → WhatsApp …)

Evidências rápidas:
- Prints/GIF curtos (mobile/desktop)
- Links para logs de auditoria/CI

---


## 4) CODEOWNERS
Crie .github/CODEOWNERS (ajuste times/usuários):

```
# Donos por área (exemplos – adapte)
/components/estoque/ @org/tech-estoque
/pages/Estoque @org/tech-estoque
/components/financeiro/ @org/tech-financeiro
/pages/Financeiro @org/tech-financeiro
/components/security/ @org/arquitetura @org/appsec
/functions/ @org/backend-core
/Layout.js @org/arquitetura
```


## 5) GitHub Actions – CI
Crie .github/workflows/ci.yml

```
name: CI
on:
  pull_request:
    branches: [main]

jobs:
  commitlint-pr-title:
    name: commitlint/pr-title
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: amannn/action-semantic-pull-request@v5
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          types: |
            feat
            fix
            chore
            refactor
            docs
            perf
            test
            ci
            build
          requireScope: false

  lint-build:
    name: ci/lint-build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 18
          cache: 'npm'
      - run: npm ci
      - run: npm run lint --if-present
      - run: npm run build
```

Obs: Caso use testes, adicione `npm test` após build.


## 6) Commitlint + Husky (Local)
Instale dev deps:
```
npm i -D @commitlint/cli @commitlint/config-conventional husky lint-staged prettier eslint
```

package.json (trechos):
```
{
  "scripts": {
    "prepare": "husky install",
    "lint": "eslint .",
    "format": "prettier -w ."
  },
  "lint-staged": {
    "*.{js,jsx,ts,tsx,css,md}": [
      "prettier -w",
      "eslint --fix"
    ]
  }
}
```

commitlint.config.cjs:
```
module.exports = { extends: ['@commitlint/config-conventional'] };
```

Habilite Husky:
```
npx husky init
```

.husky/commit-msg
```
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx --no commitlint --edit "$1"
```

.husky/pre-commit
```
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx lint-staged
```

.husky/pre-push (opcional)
```
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npm run build
npm test --if-present
```


## 7) Padrões de Commits (Conventional Commits)
- feat(escopo): nova funcionalidade
- fix(escopo): correção de bug
- refactor(escopo): refatoração sem mudança funcional
- chore/docs/test/ci/build/perf: conforme necessidade


## 8) Checklist Regra‑Mãe nos Reviews
- Revisores usam a mesma checklist (item 3) como critério objetivo
- Bloqueie PR se qualquer item estiver “não atendido”


## 9) Dicas de Integração com o Projeto
- Respeite useContextoVisual (group_id/empresa_id) e RBAC (ProtectedSection/usePermissions)
- Use sanitizeOnWrite e AuditLog em toda CUD/refactor
- Nunca remova UI/fluxos; apenas melhore/organize
- Páginas/containers: w-full e h-full; responsivo e redimensionável


## 10) Fluxo PR recomendado
1) Abra Draft PR imediatamente ao iniciar (visibilidade/feedback cedo)
2) Preencha o template + checklist Regra‑Mãe
3) Mantenha commits pequenos e semânticos
4) Converta para “Ready for Review” após CI verde
5) Revisor verifica checklist; merge via squash ou merge commit (padrão do repositório)


— Fim —