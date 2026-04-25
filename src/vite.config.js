import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

function blockDocumentationInSrc() {
  const blockedNamePattern = /(^|\/)(README|CERTIFICADO|CERTIFICACAO|MANIFESTO|STATUS|VALIDACAO|CHECKLIST|ETAPA|FASE|PROVA|MIGRACAO|BLOQUEIO|DEBUG|DIAGNOSTICO|INTEGRACAO|RESUMO|CHANGELOG|ROADMAP|GUIA|DOCS?|UnidadesDeMedida|rhf_zod_report)([^/]*)$/i;
  const blockedExtPattern = /\.(md|json|config)$/i;
  const blockedKnownExtPattern = /\.(js|jsx|ts|tsx|css|scss|sass|less|svg|png|jpg|jpeg|gif|webp|ico|bmp|avif)$/i;
  const blockedNoExtensionPattern = /(^|\/)(README|CERTIFICADO|CERTIFICACAO|MANIFESTO|STATUS|VALIDACAO|CHECKLIST|ETAPA|FASE|PROVA|MIGRACAO|BLOQUEIO|DEBUG|DIAGNOSTICO|INTEGRACAO|RESUMO|CHANGELOG|ROADMAP|GUIA|DOCS?)([^/.]*)$/i;
  const blockedGeneratedCodePattern = /\.(md|json|config)\.(js|jsx|ts|tsx)$/i;
  const blockedInsideComponentsPattern = /\/src\/components\/.*(\.(md|json|config)|\/[^/.]+$)/i;
  const blockedDocLikeInComponentsPattern = /\/src\/components\/.*\/(README|CERTIFICADO|CERTIFICACAO|MANIFESTO|STATUS|VALIDACAO|CHECKLIST|ETAPA|FASE|PROVA|MIGRACAO|BLOQUEIO|DEBUG|DIAGNOSTICO|INTEGRACAO|RESUMO|CHANGELOG|ROADMAP|GUIA|DOCS?)[^/]*\.(js|jsx|ts|tsx|md|json|config)$/i;

  const isBlockedPath = (input = '') => {
    const normalized = input.replace(/\\/g, '/');
    const isInSrcComponents = normalized.includes('/src/components/') || normalized.includes('src/components/');
    const relativeFromComponents = normalized.split('/src/components/')[1] || normalized.split('src/components/')[1] || '';
    const hasNoExtension = relativeFromComponents.length > 0 && !blockedKnownExtPattern.test(relativeFromComponents) && !/\.[a-z0-9]+$/i.test(relativeFromComponents);
    const looksBlocked = blockedExtPattern.test(normalized)
      || blockedNamePattern.test(normalized)
      || blockedNoExtensionPattern.test(normalized)
      || blockedGeneratedCodePattern.test(normalized)
      || blockedInsideComponentsPattern.test(normalized)
      || blockedDocLikeInComponentsPattern.test(normalized)
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
  assetsInclude: () => false,
  optimizeDeps: {
    exclude: [
      '**/*.md',
      '**/*.json',
      '**/*.config',
      '**/*.md.*',
      '**/*.json.*',
      '**/*.config.*',
      '**/src/components/**/README*',
      '**/src/components/**/CERTIFICADO*',
      '**/src/components/**/CERTIFICACAO*',
      '**/src/components/**/MANIFESTO*',
      '**/src/components/**/STATUS*',
      '**/src/components/**/VALIDACAO*',
      '**/src/components/**/CHECKLIST*',
      '**/src/components/**/ETAPA*',
      '**/src/components/**/FASE*',
      '**/src/components/**/PROVA*',
      '**/src/components/**/MIGRACAO*',
      '**/src/components/**/BLOQUEIO*',
      '**/src/components/**/DEBUG*',
      '**/src/components/**/DIAGNOSTICO*',
      '**/src/components/**/INTEGRACAO*',
      '**/src/components/**/RESUMO*',
      '**/src/components/**/CHANGELOG*',
      '**/src/components/**/ROADMAP*',
      '**/src/components/**/GUIA*',
      '**/src/components/**/DOC*',
      '**/src/components/**/UnidadesDeMedida*',
      '**/src/components/**/rhf_zod_report*',
      '**/src/components/**/[^/.]*',
    ],
  },
  server: {
    watch: {
      ignored: [
        '**/src/components/**/*.md',
        '**/src/components/**/*.json',
        '**/src/components/**/*.config',
        '**/src/components/**/*.md.*',
        '**/src/components/**/*.json.*',
        '**/src/components/**/*.config.*',
        '**/src/components/**/README*',
        '**/src/components/**/CERTIFICADO*',
        '**/src/components/**/MANIFESTO*',
        '**/src/components/**/STATUS*',
        '**/src/components/**/VALIDACAO*',
        '**/src/components/**/CHECKLIST*',
        '**/src/components/**/ETAPA*',
        '**/src/components/**/FASE*',
        '**/src/components/**/PROVA*',
        '**/src/components/**/MIGRACAO*',
        '**/src/components/**/BLOQUEIO*',
        '**/src/components/**/DEBUG*',
        '**/src/components/**/DIAGNOSTICO*',
        '**/src/components/**/INTEGRACAO*',
        '**/src/components/**/RESUMO*',
        '**/src/components/**/CHANGELOG*',
        '**/src/components/**/ROADMAP*',
        '**/src/components/**/GUIA*',
        '**/src/components/**/DOC*',
        '**/src/components/**/UnidadesDeMedida*',
        '**/src/components/**/rhf_zod_report*',
        '**/src/components/**/*.md',
        '**/src/components/**/*.json',
        '**/src/components/**/*.config',
        '**/src/components/**/*.md.*',
        '**/src/components/**/*.json.*',
        '**/src/components/**/*.config.*',
        '**/src/components/**/[^/.]*',
      ],
    },
  },
});