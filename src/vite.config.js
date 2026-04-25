import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

function blockDocumentationInSrc() {
  const blockedNamePattern = /(^|\/)(README|CERTIFICADO|MANIFESTO|STATUS|VALIDACAO|CHECKLIST|ETAPA|FASE|PROVA)([^/]*)$/i;
  const blockedExtPattern = /\.(md|json)$/i;
  const blockedNoExtensionPattern = /(^|\/)(README|CERTIFICADO|MANIFESTO|STATUS|VALIDACAO|CHECKLIST|ETAPA|FASE|PROVA)([^/.]*)$/i;

  return {
    name: 'block-documentation-in-src',
    enforce: 'pre',
    resolveId(source, importer) {
      const normalized = source.replace(/\\/g, '/');
      const inSrcComponents = normalized.includes('/src/components/') || normalized.startsWith('@/components/') || normalized.startsWith('./components/') || normalized.startsWith('../components/');
      const looksBlocked = blockedExtPattern.test(normalized) || blockedNamePattern.test(normalized) || blockedNoExtensionPattern.test(normalized) || /\.md\.jsx$/i.test(normalized) || /\.json\.jsx$/i.test(normalized) || /(^|\/)[^/.]+\.jsx$/i.test(normalized) && blockedNamePattern.test(normalized.replace(/\.jsx$/i, ''));

      if (inSrcComponents && looksBlocked) {
        throw new Error(`Importação bloqueada pelo projeto: ${source}. Arquivos de documentação não podem ser processados dentro de src/components.`);
      }
      return null;
    },
    load(id) {
      const normalized = id.replace(/\\/g, '/');
      if (!normalized.includes('/src/components/')) return null;
      if (blockedExtPattern.test(normalized) || blockedNamePattern.test(normalized) || blockedNoExtensionPattern.test(normalized) || /\.md\.jsx$/i.test(normalized) || /\.json\.jsx$/i.test(normalized) || /(^|\/)[^/.]+\.jsx$/i.test(normalized) && blockedNamePattern.test(normalized.replace(/\.jsx$/i, ''))) {
        throw new Error(`Arquivo bloqueado pelo projeto: ${id}. Mova documentação para fora de src/.`);
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
});