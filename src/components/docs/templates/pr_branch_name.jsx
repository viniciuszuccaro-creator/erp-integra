name: pr/branch-name
on:
  pull_request:
    types: [opened, reopened, edited, synchronize, ready_for_review]
    branches: [main]

jobs:
  branch-name:
    runs-on: ubuntu-latest
    steps:
      - name: Validar nome da branch
        uses: actions/github-script@v7
        with:
          script: |
            const ref = context.payload.pull_request?.head?.ref || '';
            const ok = /^(feature|feat|fix|bugfix|hotfix|chore|refactor|docs|perf)\/[a-z0-9._-]+$/.test(ref);
            if (!ok) {
              core.setFailed(`Nome de branch inválido: ${ref}. Padrão permitido: feature|feat|fix|bugfix|hotfix|chore|refactor|docs|perf/<slug>`);
            }