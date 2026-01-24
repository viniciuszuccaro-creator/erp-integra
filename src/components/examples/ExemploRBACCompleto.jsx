import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import ProtectedButton from '@/components/lib/ProtectedButton';
import ProtectedFieldInput from '@/components/lib/ProtectedFieldInput';
import RBACGuard from '@/components/security/RBACGuard';
import PermissionBadge from '@/components/security/PermissionBadge';
import { useContextoVisual } from '@/components/lib/useContextoVisual';
import { useRBACBackend } from '@/components/lib/useRBACBackend';
import { useToast } from '@/components/ui/use-toast';
import { Save, Trash2, CheckCircle, XCircle } from 'lucide-react';

/**
 * EXEMPLO RBAC COMPLETO - DEMONSTRAÇÃO DE USO
 * Template para aplicar RBAC em qualquer formulário/módulo
 */

export default function ExemploRBACCompleto() {
  const [nome, setNome] = useState('');
  const [valor, setValor] = useState('');
  const { createInContext } = useContextoVisual();
  const { guardEntityOperation, auditAction } = useRBACBackend();
  const { toast } = useToast();

  const handleSalvar = async () => {
    try {
      // 1. Validar permissão + multiempresa no backend
      const guard = await guardEntityOperation(
        'create',
        'Produto',
        { descricao: nome, preco_venda: parseFloat(valor) },
        null,
        'Estoque',
        'criar'
      );

      if (!guard.allowed) {
        toast({
          title: '🔒 Operação Bloqueada',
          description: guard.reason,
          variant: 'destructive'
        });
        return;
      }

      // 2. Criar com carimbagem automática
      await createInContext('Produto', {
        descricao: nome,
        preco_venda: parseFloat(valor),
        unidade_medida: 'UN'
      });

      toast({ title: '✅ Produto criado com sucesso!' });
      setNome('');
      setValor('');

    } catch (error) {
      toast({
        title: '❌ Erro',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Exemplo: RBAC + Multiempresa em Ação</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Seção protegida */}
          <RBACGuard 
            module="Estoque" 
            section="Produtos" 
            action="visualizar"
            showDeniedMessage={true}
          >
            <div className="space-y-4">
              
              {/* Campo normal */}
              <div>
                <Label>Nome do Produto (Campo Livre)</Label>
                <Input 
                  value={nome} 
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Digite o nome..."
                />
              </div>

              {/* Campo protegido - só edita com permissão */}
              <div>
                <Label className="flex items-center gap-2">
                  Preço de Venda (Campo Protegido)
                  <PermissionBadge 
                    module="Estoque" 
                    section="Produtos.Precificacao" 
                    action="editar"
                    compact={true}
                  />
                </Label>
                <ProtectedFieldInput
                  module="Estoque"
                  section="Produtos.Precificacao"
                  field="preco_venda"
                  action="editar"
                  type="input"
                  value={valor}
                  onChange={(e) => setValor(e.target.value)}
                  placeholder="R$ 0,00"
                  readOnlyWhenDenied={true}
                />
              </div>

              {/* Botões protegidos */}
              <div className="flex items-center gap-3 pt-4">
                <ProtectedButton
                  module="Estoque"
                  section="Produtos"
                  action="criar"
                  onClick={handleSalvar}
                  disabled={!nome || !valor}
                  showLockIcon={true}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Salvar Produto
                </ProtectedButton>

                <ProtectedButton
                  module="Estoque"
                  section="Produtos"
                  action="excluir"
                  variant="destructive"
                  onClick={() => toast({ title: 'Exclusão simulada' })}
                  hideWhenDenied={true}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Excluir
                </ProtectedButton>
              </div>

            </div>
          </RBACGuard>

          {/* Status de Permissões */}
          <div className="mt-6 p-4 bg-slate-50 rounded-lg border">
            <h4 className="font-semibold text-sm text-slate-700 mb-3">
              Status de Permissões (Estoque → Produtos)
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div className="flex items-center justify-between p-2 bg-white rounded border">
                <span className="text-xs text-slate-600">Visualizar</span>
                <PermissionBadge module="Estoque" section="Produtos" action="visualizar" compact={true} />
              </div>
              <div className="flex items-center justify-between p-2 bg-white rounded border">
                <span className="text-xs text-slate-600">Criar</span>
                <PermissionBadge module="Estoque" section="Produtos" action="criar" compact={true} />
              </div>
              <div className="flex items-center justify-between p-2 bg-white rounded border">
                <span className="text-xs text-slate-600">Editar</span>
                <PermissionBadge module="Estoque" section="Produtos" action="editar" compact={true} />
              </div>
              <div className="flex items-center justify-between p-2 bg-white rounded border">
                <span className="text-xs text-slate-600">Excluir</span>
                <PermissionBadge module="Estoque" section="Produtos" action="excluir" compact={true} />
              </div>
              <div className="flex items-center justify-between p-2 bg-white rounded border">
                <span className="text-xs text-slate-600">Editar Preço</span>
                <PermissionBadge module="Estoque" section="Produtos.Precificacao" action="editar" compact={true} />
              </div>
              <div className="flex items-center justify-between p-2 bg-white rounded border">
                <span className="text-xs text-slate-600">Exportar</span>
                <PermissionBadge module="Estoque" section="Produtos" action="exportar" compact={true} />
              </div>
            </div>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}