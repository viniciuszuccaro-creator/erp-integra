import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Box, AlertTriangle, PackageOpen, TrendingUp } from 'lucide-react';
import ProtectedField from '@/components/security/ProtectedField';

export default function KPIsEstoque({ produtosAtivos, produtosBaixoEstoque, totalReservado, estoqueDisponivel }) {
  return (
    <div className="grid grid-cols-4 gap-2 min-h-[90px] max-h-[90px]">
      <Card className="border-0 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-3">
          <CardTitle className="text-xs font-medium">Produtos</CardTitle>
          <Box className="w-4 h-4 text-indigo-600" />
        </CardHeader>
        <CardContent className="px-3 pb-2">
          <div className="text-2xl font-bold text-indigo-600">{produtosAtivos}</div>
          <p className="text-xs text-slate-500">ativos</p>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-3">
          <CardTitle className="text-xs font-medium">Estoque Baixo</CardTitle>
          <AlertTriangle className="w-4 h-4 text-orange-600" />
        </CardHeader>
        <CardContent className="px-3 pb-2">
          <div className="text-2xl font-bold text-orange-600">{produtosBaixoEstoque}</div>
          <p className="text-xs text-slate-500">abaixo do mínimo</p>
        </CardContent>
      </Card>

      <Card className="bg-blue-50 border-0 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-3">
          <CardTitle className="text-xs font-medium text-blue-700">Reservado</CardTitle>
          <PackageOpen className="w-4 h-4 text-blue-600" />
        </CardHeader>
        <CardContent className="px-3 pb-2">
          <div className="text-2xl font-bold text-blue-900">
            <ProtectedField module="Estoque" submodule="KPIs" field="valores" action="ver" asText>
              R$ {totalReservado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </ProtectedField>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-green-50 border-0 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-3">
          <CardTitle className="text-xs font-medium text-green-700">Disponível</CardTitle>
          <TrendingUp className="w-4 h-4 text-green-600" />
        </CardHeader>
        <CardContent className="px-3 pb-2">
          <div className="text-2xl font-bold text-green-900">
            <ProtectedField module="Estoque" submodule="KPIs" field="valores" action="ver" asText>
              R$ {estoqueDisponivel.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </ProtectedField>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}