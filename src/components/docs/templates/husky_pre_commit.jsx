bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# Lint/format (se existirem)
npm run -s lint --if-present
npm run -s format --if-present

# Auditoria Multiempresa (Regra-Mãe)
node components/docs/templates/checkMultiempresa.js

# Lint staged
npx lint-staged
