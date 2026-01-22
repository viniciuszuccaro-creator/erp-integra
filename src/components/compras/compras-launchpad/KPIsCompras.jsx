import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, ShoppingCart, Package } from 'lucide-react';

export default function KPIsCompras({ totalFornecedores, fornecedoresAtivos, totalOrdens, totalCompras }) {
  return (
    <div className="grid grid-cols-3 gap-2 min-h-[90px] max-h-[90px]">
      <Card className="border-0 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-3">
          <CardTitle className="text-xs font-medium">Fornecedores</CardTitle>
          <Users className="w-4 h-4 text-cyan-600" />
        </CardHeader>
        <CardContent className="px-3 pb-2">
          <div className="text-2xl font-bold text-cyan-600">{totalFornecedores}</div>
          <p className="text-xs text-slate-500">{fornecedoresAtivos} ativos</p>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-3">
          <CardTitle className="text-xs font-medium">Ordens</CardTitle>
          <ShoppingCart className="w-4 h-4 text-blue-600" />
        </CardHeader>
        <CardContent className="px-3 pb-2">
          <div className="text-2xl font-bold text-blue-600">{totalOrdens}</div>
          <p className="text-xs text-slate-500">no sistema</p>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-3">
          <CardTitle className="text-xs font-medium">Total em Compras</CardTitle>
          <Package className="w-4 h-4 text-purple-600" />
        </CardHeader>
        <CardContent className="px-3 pb-2">
          <div className="text-2xl font-bold text-purple-600">
            R$ {totalCompras.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}