#!/usr/bin/env bash
set -euo pipefail

# Build/tests rápidos
if [ -f package.json ]; then
  npm run -s build --if-present
  npm test --if-present
fi

# Verificação de multiempresa (group_id/empresa_id) em mudanças
node components/docs/templates/checkMultiempresa.js