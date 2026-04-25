import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

function blockDocumentation() {
  const blockedNamePattern = /(^|\/)(README|CERTIFICADO|CERTIFICACAO|MANIFESTO|STATUS|VALIDACAO|CHECKLIST|ETAPA|FASE|PROVA|SISTEMA|MIGRACAO|BLOQUEIO|DEBUG|DIAGNOSTICO|INTEGRACAO|RESUMO|CHANGELOG|ROADMAP|GUIA|DOCS?|UnidadesDeMedida|rhf_zod_report)([^/]*)$/i;
  const blockedExtPattern = /\.(md|json|config)$/i;
  const blockedRootSrcPattern = /(^|\/)src\/.*(README|CERTIFICADO|CERTIFICACAO|MANIFESTO|STATUS|VALIDACAO|CHECKLIST|ETAPA|FASE|PROVA|SISTEMA|MIGRACAO|BLOQUEIO|DEBUG|DIAGNOSTICO|INTEGRACAO|RESUMO|CHANGELOG|ROADMAP|GUIA|DOCS?|UnidadesDeMedida|rhf_zod_report|\.md|\.json|\.config)([^/]*)$/i;
  const blockedKnownExtPattern = /\.(js|jsx|ts|tsx|css|scss|sass|less|svg|png|jpg|jpeg|gif|webp|ico|bmp|avif)$/i;
  const blockedNoExtensionPattern = /(^|\/)(README|CERTIFICADO|CERTIFICACAO|MANIFESTO|STATUS|VALIDACAO|CHECKLIST|ETAPA|FASE|PROVA|SISTEMA|MIGRACAO|BLOQUEIO|DEBUG|DIAGNOSTICO|INTEGRACAO|RESUMO|CHANGELOG|ROADMAP|GUIA|DOCS?)([^/.]*)$/i;
  const blockedGeneratedCodePattern = /\.(md|json|config)\.(js|jsx|ts|tsx)$/i;
  const blockedInsideComponentsPattern = /\/src\/(components|docs|reports)\/.*(\.(md|json|config)|\/[^/.]+$)/i;
  const blockedDocLikeInSrcPattern = /\/src\/.*\/(README|CERTIFICADO|CERTIFICACAO|MANIFESTO|STATUS|VALIDACAO|CHECKLIST|ETAPA|FASE|PROVA|SISTEMA|MIGRACAO|BLOQUEIO|DEBUG|DIAGNOSTICO|INTEGRACAO|RESUMO|CHANGELOG|ROADMAP|GUIA|DOCS?|UnidadesDeMedida|rhf_zod_report)[^/]*\.(js|jsx|ts|tsx|md|json|config)$/i;

  const isBlockedPath = (input = '') => {
    const normalized = input.replace(/\\/g, '/');
    const isInSrc = normalized.includes('/src/') || normalized.includes('src/');
    const relativeFromSrc = normalized.split('/src/')[1] || normalized.split('src/')[1] || '';
    const hasNoExtension = relativeFromSrc.length > 0 && !blockedKnownExtPattern.test(relativeFromSrc) && !/\.[a-z0-9]+$/i.test(relativeFromSrc);
    const looksBlocked = blockedExtPattern.test(normalized)
      || blockedRootSrcPattern.test(normalized)
      || blockedNamePattern.test(normalized)
      || blockedNoExtensionPattern.test(normalized)
      || blockedGeneratedCodePattern.test(normalized)
      || blockedInsideComponentsPattern.test(normalized)
      || blockedDocLikeInSrcPattern.test(normalized)
      || hasNoExtension
      || (/(^|\/)[^/.]+\.jsx$/i.test(normalized) && blockedNamePattern.test(normalized.replace(/\.jsx$/i, '')));

    return isInSrc && looksBlocked;
  };

  return {
    name: 'block-documentation',
    enforce: 'pre',
    configureServer(server) {
      server.watcher.on('add', (filePath) => {
        if (isBlockedPath(filePath)) {
          console.log('🚫 BLOQUEADO criação de arquivo de documentação em src/');
          try { server.watcher.unwatch(filePath); } catch {}
        }
      });
    },
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
  plugins: [react(), blockDocumentation()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
  },
  assetsInclude: () => false,
  optimizeDeps: {
    exclude: [
      '**/*.md',
      '**/*.json',
      '**/*.config',
      '**/src/**/*.md',
      '**/src/**/*.json',
      '**/src/**/*.config',
      '**/src/**/README*',
      '**/src/**/CERTIFICADO*',
      '**/src/**/CERTIFICACAO*',
      '**/src/**/MANIFESTO*',
      '**/src/**/STATUS*',
      '**/src/**/VALIDACAO*',
      '**/src/**/CHECKLIST*',
      '**/src/**/ETAPA*',
      '**/src/**/FASE*',
      '**/src/**/PROVA*',
      '**/src/**/SISTEMA*',
      '**/src/**/MIGRACAO*',
      '**/src/**/BLOQUEIO*',
      '**/src/**/DEBUG*',
      '**/src/**/DIAGNOSTICO*',
      '**/src/**/INTEGRACAO*',
      '**/src/**/RESUMO*',
      '**/src/**/CHANGELOG*',
      '**/src/**/ROADMAP*',
      '**/src/**/GUIA*',
      '**/src/**/DOC*',
      '**/src/**/UnidadesDeMedida*',
      '**/src/**/rhf_zod_report*',
      '**/src/**/*.jsx',
      '**/src/**/*.md.*',
      '**/src/**/*.json.*',
      '**/src/**/*.config.*',
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
      '**/src/components/**/SISTEMA*',
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
      '**/src/docs/**/*.md',
      '**/src/docs/**/*.json',
      '**/src/docs/**/*.config',
      '**/src/docs/**/README*',
      '**/src/docs/**/CERTIFICADO*',
      '**/src/docs/**/CERTIFICACAO*',
      '**/src/docs/**/MANIFESTO*',
      '**/src/docs/**/STATUS*',
      '**/src/docs/**/VALIDACAO*',
      '**/src/docs/**/CHECKLIST*',
      '**/src/docs/**/ETAPA*',
      '**/src/docs/**/FASE*',
      '**/src/docs/**/PROVA*',
      '**/src/docs/**/SISTEMA*',
      '**/src/docs/**/UnidadesDeMedida*',
      '**/src/docs/**/rhf_zod_report*',
      '**/src/reports/**/*.md',
      '**/src/reports/**/*.json',
      '**/src/reports/**/*.config',
      '**/src/reports/**/README*',
      '**/src/reports/**/CERTIFICADO*',
      '**/src/reports/**/CERTIFICACAO*',
      '**/src/reports/**/MANIFESTO*',
      '**/src/reports/**/STATUS*',
      '**/src/reports/**/VALIDACAO*',
      '**/src/reports/**/CHECKLIST*',
      '**/src/reports/**/ETAPA*',
      '**/src/reports/**/FASE*',
      '**/src/reports/**/PROVA*',
      '**/src/reports/**/SISTEMA*',
      '**/src/reports/**/UnidadesDeMedida*',
      '**/src/reports/**/rhf_zod_report*',
      '**/src/components/**/[^/.]*',
    ],
  },
  server: {
    watch: {
      ignored: [
        '**/src/**/*.md',
        '**/src/**/*.json',
        '**/src/**/*.config',
        '**/src/**/README*',
        '**/src/**/CERTIFICADO*',
        '**/src/**/CERTIFICACAO*',
        '**/src/**/MANIFESTO*',
        '**/src/**/STATUS*',
        '**/src/**/VALIDACAO*',
        '**/src/**/CHECKLIST*',
        '**/src/**/ETAPA*',
        '**/src/**/FASE*',
        '**/src/**/PROVA*',
        '**/src/**/SISTEMA*',
        '**/src/**/MIGRACAO*',
        '**/src/**/BLOQUEIO*',
        '**/src/**/DEBUG*',
        '**/src/**/DIAGNOSTICO*',
        '**/src/**/INTEGRACAO*',
        '**/src/**/RESUMO*',
        '**/src/**/CHANGELOG*',
        '**/src/**/ROADMAP*',
        '**/src/**/GUIA*',
        '**/src/**/DOC*',
        '**/src/**/UnidadesDeMedida*',
        '**/src/**/rhf_zod_report*',
        '**/src/**/*.jsx',
        '**/src/**/*.md.*',
        '**/src/**/*.json.*',
        '**/src/**/*.config.*',
        '**/src/components/**/*.md',
        '**/src/components/**/*.json',
        '**/src/components/**/*.config',
        '**/src/components/**/*.md.*',
        '**/src/components/**/*.json.*',
        '**/src/components/**/*.config.*',
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
        '**/src/components/**/SISTEMA*',
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
        '**/src/docs/**/*.md',
        '**/src/docs/**/*.json',
        '**/src/docs/**/*.config',
        '**/src/docs/**/README*',
        '**/src/docs/**/CERTIFICADO*',
        '**/src/docs/**/CERTIFICACAO*',
        '**/src/docs/**/MANIFESTO*',
        '**/src/docs/**/STATUS*',
        '**/src/docs/**/VALIDACAO*',
        '**/src/docs/**/CHECKLIST*',
        '**/src/docs/**/ETAPA*',
        '**/src/docs/**/FASE*',
        '**/src/docs/**/PROVA*',
        '**/src/docs/**/SISTEMA*',
        '**/src/docs/**/UnidadesDeMedida*',
        '**/src/docs/**/rhf_zod_report*',
        '**/src/reports/**/*.md',
        '**/src/reports/**/*.json',
        '**/src/reports/**/*.config',
        '**/src/reports/**/README*',
        '**/src/reports/**/CERTIFICADO*',
        '**/src/reports/**/CERTIFICACAO*',
        '**/src/reports/**/MANIFESTO*',
        '**/src/reports/**/STATUS*',
        '**/src/reports/**/VALIDACAO*',
        '**/src/reports/**/CHECKLIST*',
        '**/src/reports/**/ETAPA*',
        '**/src/reports/**/FASE*',
        '**/src/reports/**/PROVA*',
        '**/src/reports/**/SISTEMA*',
        '**/src/reports/**/UnidadesDeMedida*',
        '**/src/reports/**/rhf_zod_report*',
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