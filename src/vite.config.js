import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

function blockDocumentationInSrc() {
  const blockedNamePattern = /(^|\/)(README|CERTIFICADO|MANIFESTO|STATUS|VALIDACAO|CHECKLIST|ETAPA|FASE|PROVA|MIGRACAO|BLOQUEIO|DEBUG|DIAGNOSTICO|INTEGRACAO|RESUMO|CHANGELOG|ROADMAP|GUIA|DOCS?)([^/]*)$/i;
  const blockedExtPattern = /\.(md|json|config)$/i;
  const blockedNoExtensionPattern = /(^|\/)(README|CERTIFICADO|MANIFESTO|STATUS|VALIDACAO|CHECKLIST|ETAPA|FASE|PROVA|MIGRACAO|BLOQUEIO|DEBUG|DIAGNOSTICO|INTEGRACAO|RESUMO|CHANGELOG|ROADMAP|GUIA|DOCS?)([^/.]*)$/i;
  const blockedGeneratedCodePattern = /\.(md|json|config)\.(js|jsx|ts|tsx)$/i;
  const blockedInsideComponentsPattern = /\/src\/components\/.*(\.(md|json|config)|\/[^/.]+$)/i;

  const isBlockedPath = (input = '') => {
    const normalized = input.replace(/\\/g, '/');
    const isInSrcComponents = normalized.includes('/src/components/') || normalized.includes('src/components/');
    const relativeFromComponents = normalized.split('/src/components/')[1] || normalized.split('src/components/')[1] || '';
    const hasNoExtension = relativeFromComponents.length > 0 && !/\.[a-z0-9]+$/i.test(relativeFromComponents);
    const looksBlocked = blockedExtPattern.test(normalized)
      || blockedNamePattern.test(normalized)
      || blockedNoExtensionPattern.test(normalized)
      || blockedGeneratedCodePattern.test(normalized)
      || blockedInsideComponentsPattern.test(normalized)
      || hasNoExtension
      || (/(^|\/)[^/.]+\.jsx$/i.test(normalized) && blockedNamePattern.test(normalized.replace(/\.jsx$/i, '')));

    return isInSrcComponents && looksBlocked;
  };

  return {
    name: 'block-documentation-in-src',
    enforce: 'pre',
    resolveId(source) {
      if (isBlockedPath(source)) {
        return '\0blocked-doc-file';
      }
      return null;
    },
    load(id) {
      if (id === '\0blocked-doc-file') {
        return 'export default undefined;';
      }
      if (isBlockedPath(id)) {
        return 'export default undefined;';
      }
      return null;
    }
  };
}

export default defineConfig({
  plugins: [react(), blockDocumentationInSrc()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  assetsInclude: (file) => {
    const normalized = String(file || '').replace(/\\/g, '/');
    if (normalized.includes('/src/components/')) {
      return false;
    }
    return false;
  },
  optimizeDeps: {
    exclude: ['**/*.md', '**/*.json', '**/*.config'],
  },
  server: {
    watch: {
      ignored: ['**/src/components/**/*.md', '**/src/components/**/*.json', '**/src/components/**/*.config', '**/src/components/**/README*', '**/src/components/**/CERTIFICADO*', '**/src/components/**/MANIFESTO*', '**/src/components/**/STATUS*', '**/src/components/**/VALIDACAO*', '**/src/components/**/CHECKLIST*', '**/src/components/**/ETAPA*', '**/src/components/**/FASE*', '**/src/components/**/[^/.]*'],
    },
  },
});