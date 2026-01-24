import React from 'react';
import ExemploRBACCompleto from '@/components/examples/ExemploRBACCompleto';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Code, BookOpen } from 'lucide-react';
import AdminOnlyZone from '@/components/security/AdminOnlyZone';

/**
 * PÁGINA DE EXEMPLOS RBAC
 * Documentação interativa e exemplos de uso
 */

export default function ExemplosRBAC() {
  return (
    <AdminOnlyZone>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
        <div className="max-w-5xl mx-auto space-y-6">
          
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <BookOpen className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Exemplos de RBAC</h1>
              <p className="text-slate-600">Documentação Interativa e Templates</p>
            </div>
          </div>

          {/* Exemplo Interativo */}
          <ExemploRBACCompleto />

          {/* Documentação de Código */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="w-5 h-5" />
                Snippets de Código
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Exemplo 1 */}
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">1. Proteger Botão de Criar</h4>
                <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto text-sm">
{`import ProtectedButton from '@/components/lib/ProtectedButton';

<ProtectedButton
  module="Comercial"
  section="Pedidos"
  action="criar"
  onClick={handleNovoPedido}
  hideWhenDenied={true}
>
  Novo Pedido
</ProtectedButton>`}
                </pre>
              </div>

              {/* Exemplo 2 */}
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">2. Proteger Campo de Valor</h4>
                <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto text-sm">
{`import ProtectedFieldInput from '@/components/lib/ProtectedFieldInput';

<ProtectedFieldInput
  module="Financeiro"
  section="ContasReceber.Valores"
  field="valor"
  action="editar"
  value={valor}
  onChange={setValor}
  readOnlyWhenDenied={true}
/>`}
                </pre>
              </div>

              {/* Exemplo 3 */}
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">3. Proteger Seção Completa</h4>
                <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto text-sm">
{`import RBACGuard from '@/components/security/RBACGuard';

<RBACGuard
  module="Estoque"
  section="Movimentacao"
  action="visualizar"
  showDeniedMessage={true}
>
  <MovimentacoesTab />
</RBACGuard>`}
                </pre>
              </div>

              {/* Exemplo 4 */}
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">4. Criar com Validação Multiempresa</h4>
                <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto text-sm">
{`import { useContextoVisual } from '@/components/lib/useContextoVisual';

const { createInContext } = useContextoVisual();

// Carimba empresa_id automaticamente E valida no backend
await createInContext('Cliente', {
  nome: 'Cliente Teste',
  tipo: 'Pessoa Física'
});`}
                </pre>
              </div>

              {/* Exemplo 5 */}
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">5. Validar Operação no Backend</h4>
                <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto text-sm">
{`import { useRBACBackend } from '@/components/lib/useRBACBackend';

const { guardEntityOperation } = useRBACBackend();

const resultado = await guardEntityOperation(
  'update',
  'Pedido',
  dadosAtualizados,
  pedidoId,
  'Comercial',
  'editar'
);

if (!resultado.allowed) {
  alert(resultado.reason);
  return;
}

// Prosseguir com a atualização...`}
                </pre>
              </div>

              {/* Exemplo 6 */}
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">6. Auditar Ação Customizada</h4>
                <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto text-sm">
{`import { useRBACBackend } from '@/components/lib/useRBACBackend';

const { auditAction } = useRBACBackend();

await auditAction({
  empresa_id: empresaAtual?.id,
  acao: 'Importação',
  modulo: 'Estoque',
  entidade: 'Produto',
  descricao: 'Importação em lote via planilha',
  dados_novos: { quantidade: 150, arquivo: 'produtos.xlsx' },
  origem: 'ImportacaoLote'
});`}
                </pre>
              </div>

            </CardContent>
          </Card>

        </div>
      </div>
    </AdminOnlyZone>
  );
}