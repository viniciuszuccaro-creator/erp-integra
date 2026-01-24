import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Code, Book, Zap } from 'lucide-react';

/**
 * GUIA DE USO ETAPA 1
 * Exemplos práticos de implementação
 */

export default function GuiaUsoETAPA1() {
  const [activeTab, setActiveTab] = useState('hooks');

  const exemplosHooks = [
    {
      titulo: 'Criação Segura',
      codigo: `import { useSecureCreate } from '@/components/lib/useSecureCreate';

const { secureCreate } = useSecureCreate();

const handleCriar = async () => {
  const produto = await secureCreate('Produto', {
    descricao: 'Produto Teste',
    preco_venda: 100
  });
};`
    },
    {
      titulo: 'Operações All-in-One',
      codigo: `import { useSecureOperations } from '@/components/lib/useSecureOperations';

const { secureCreate, secureUpdate, secureDelete } = useSecureOperations();

await secureCreate('Cliente', dados);
await secureUpdate('Cliente', id, novosDados);
await secureDelete('Cliente', id);`
    },
    {
      titulo: 'Ação Validada',
      codigo: `import { useValidatedAction } from '@/components/lib/useValidatedAction';

const { executeValidated } = useValidatedAction();

const result = await executeValidated(
  'Financeiro',
  'Aprovacao',
  'aprovar',
  async () => aprovarPedido(id),
  { entity: 'Pedido', recordId: id }
);`
    }
  ];

  const exemplosComponentes = [
    {
      titulo: 'Botão Protegido',
      codigo: `import SecureActionButton from '@/components/security/SecureActionButton';

<SecureActionButton
  module="Comercial"
  section="Pedidos"
  action="cancelar"
  entity="Pedido"
  onClick={handleCancelar}
>
  Cancelar Pedido
</SecureActionButton>`
    },
    {
      titulo: 'Seção Protegida',
      codigo: `import ProtectedSection from '@/components/security/ProtectedSection';

<ProtectedSection module="Financeiro" action="aprovar">
  <BotaoAprovar />
  <FormularioAprovacao />
</ProtectedSection>`
    },
    {
      titulo: 'Campo Granular',
      codigo: `import ProtectedField from '@/components/security/ProtectedField';

<ProtectedField 
  module="Financeiro" 
  section="ContasPagar" 
  field="valor"
  action="editar"
  value={conta.valor}
>
  <Input value={conta.valor} onChange={handleChange} />
</ProtectedField>`
    }
  ];

  const exemplosBackend = [
    {
      titulo: 'Guard Completo',
      codigo: `import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  
  const validation = await base44.functions.invoke('entityOperationGuard', {
    operation: 'update',
    entityName: 'Pedido',
    data: pedidoData,
    entityId: pedidoId,
    module: 'Comercial',
    action: 'editar'
  });

  if (!validation.data.valid) {
    return Response.json({ 
      error: validation.data.reason 
    }, { status: 403 });
  }

  // Continuar com ação...
});`
    },
    {
      titulo: 'Auditoria Backend',
      codigo: `await base44.functions.invoke('auditHelper', {
  usuario: user.full_name,
  usuario_id: user.id,
  empresa_id: empresaId,
  acao: 'Aprovação',
  modulo: 'Financeiro',
  entidade: 'Pedido',
  descricao: 'Pedido #123 aprovado',
  dados_novos: { pedido_id: pedidoId }
});`
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Book className="w-5 h-5" />
          Guia de Uso e Exemplos
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="hooks">
              <Zap className="w-4 h-4 mr-2" />
              Hooks
            </TabsTrigger>
            <TabsTrigger value="componentes">
              <Code className="w-4 h-4 mr-2" />
              Componentes
            </TabsTrigger>
            <TabsTrigger value="backend">
              <Code className="w-4 h-4 mr-2" />
              Backend
            </TabsTrigger>
          </TabsList>

          <TabsContent value="hooks" className="space-y-4 mt-4">
            {exemplosHooks.map((ex, idx) => (
              <div key={idx}>
                <h4 className="font-semibold text-sm text-slate-900 mb-2">{ex.titulo}</h4>
                <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg text-xs overflow-x-auto">
                  {ex.codigo}
                </pre>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="componentes" className="space-y-4 mt-4">
            {exemplosComponentes.map((ex, idx) => (
              <div key={idx}>
                <h4 className="font-semibold text-sm text-slate-900 mb-2">{ex.titulo}</h4>
                <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg text-xs overflow-x-auto">
                  {ex.codigo}
                </pre>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="backend" className="space-y-4 mt-4">
            {exemplosBackend.map((ex, idx) => (
              <div key={idx}>
                <h4 className="font-semibold text-sm text-slate-900 mb-2">{ex.titulo}</h4>
                <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg text-xs overflow-x-auto">
                  {ex.codigo}
                </pre>
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}