name: pr/regra-mae-check
on:
  pull_request:
    types: [opened, edited, synchronize]
    branches: [main]

jobs:
  regra-mae:
    runs-on: ubuntu-latest
    permissions:
      pull-requests: read
      contents: read
    steps:
      - name: Verificar checklist Regra‑Mãe no corpo do PR
        uses: actions/github-script@v7
        with:
          script: |
            const body = context.payload.pull_request?.body || '';
            const unchecked = /- \[ \]/.test(body);
            if (unchecked) {
              core.setFailed('Checklist Regra‑Mãe incompleta: marque todos os itens antes do review.');
            }
            const title = context.payload.pull_request?.title || '';
            const isConv = /^(feat|fix|refactor|docs|chore|perf|test|ci|build)(\([^\)]+\))?: .+/.test(title);
            if (!isConv) {
              core.setFailed('Título do PR deve seguir Conventional Commits.');
            }