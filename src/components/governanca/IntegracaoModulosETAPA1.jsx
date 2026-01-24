import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Circle } from 'lucide-react';

/**
 * INTEGRAÇÃO MÓDULOS ETAPA 1
 * Mostra quais módulos estão integrados com governança
 */

export default function IntegracaoModulosETAPA1() {
  const modulos = [
    { nome: 'Comercial', integrado: true, componentes: ['PedidoForm', 'ClienteForm'] },
    { nome: 'Financeiro', integrado: true, componentes: ['ContaPagarForm', 'ContaReceberForm'] },
    { nome: 'Estoque', integrado: true, componentes: ['ProdutoForm', 'MovimentacaoForm'] },
    { nome: 'Compras', integrado: true, componentes: ['OrdemCompraForm', 'FornecedorForm'] },
    { nome: 'Expedição', integrado: true, componentes: ['EntregaForm', 'RomaneioForm'] },
    { nome: 'Produção', integrado: true, componentes: ['OrdemProducaoForm'] },
    { nome: 'RH', integrado: true, componentes: ['ColaboradorForm', 'PontoForm'] },
    { nome: 'Fiscal', integrado: true, componentes: ['NotaFiscalForm'] },
    { nome: 'CRM', integrado: true, componentes: ['OportunidadeForm', 'InteracaoForm'] },
    { nome: 'Cadastros', integrado: true, componentes: ['CadastrosGerais'] }
  ];

  const totalIntegrados = modulos.filter(m => m.integrado).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Integração com Módulos</span>
          <Badge className="bg-green-600">{totalIntegrados}/{modulos.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {modulos.map((modulo) => (
            <div 
              key={modulo.nome}
              className={`p-3 rounded-lg border ${
                modulo.integrado 
                  ? 'bg-green-50 border-green-300' 
                  : 'bg-slate-50 border-slate-300'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                {modulo.integrado ? (
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                ) : (
                  <Circle className="w-4 h-4 text-slate-400" />
                )}
                <span className="font-semibold text-sm text-slate-900">{modulo.nome}</span>
              </div>
              <p className="text-xs text-slate-600">
                {modulo.componentes.length} componente(s)
              </p>
            </div>
          ))}
        </div>

        {totalIntegrados === modulos.length && (
          <div className="mt-4 p-3 bg-green-100 rounded-lg border border-green-300 text-center">
            <p className="text-sm font-semibold text-green-800">
              ✅ Todos os módulos integrados com RBAC + Multiempresa
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}