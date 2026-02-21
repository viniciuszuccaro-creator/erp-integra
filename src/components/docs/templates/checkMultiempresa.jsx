#!/usr/bin/env node
/*
  Verifica rapidamente se arquivos JS/TS alterados fazem referência a multiempresa.
  Regras simples (heurística rápida):
  - Se há uso de base44.entities.* (create|update|filter|list) no arquivo, então o mesmo arquivo
    deve conter 'group_id' ou 'empresa_id'. Caso contrário, falha.
*/
const { execSync } = require('node:child_process');
const { readFileSync } = require('node:fs');

function getStagedFiles() {
  const out = execSync('git diff --cached --name-only --diff-filter=ACMRT', { stdio: ['ignore','pipe','ignore'] }).toString();
  return out.split('\n').filter(f => /\.(js|jsx|ts|tsx)$/.test(f));
}

function fileText(path) {
  try { return readFileSync(path, 'utf8'); } catch { return ''; }
}

const files = getStagedFiles();
let failed = [];
for (const f of files) {
  const txt = fileText(f);
  const touchesEntities = /base44\.entities\.[A-Za-z0-9_]+\.(create|update|filter|list)\s*\(/.test(txt);
  if (touchesEntities) {
    const hasContext = /(group_id|empresa_id)/.test(txt);
    if (!hasContext) failed.push(f);
  }
}

if (failed.length) {
  console.error('\n[Regra‑Mãe] Multiempresa obrigatória: faltando group_id/empresa_id em:');
  failed.forEach(f => console.error(' -', f));
  console.error('\nAdapte para usar useContextoVisual/filterInContext/carimbo de contexto.');
  process.exit(1);
}

console.log('[OK] Multiempresa verificada nas alterações.');