import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Users, Building2 } from "lucide-react";
import { TableHead, TableCell } from "@/components/ui/table";

/**
 * Componentes reutilizáveis para colunas de contexto multi-empresa
 * Usados em todas as tabelas do sistema
 */

// HEADER DE COLUNAS (TableHead)
export function ColunaOrigemHeader() {
  return (
    <TableHead className="w-[100px]">
      <div className="flex items-center gap-1">
        <Users className="w-4 h-4" />
        Origem
      </div>
    </TableHead>
  );
}

export function ColunaEmpresaHeader() {
  return (
    <TableHead className="w-[150px]">
      <div className="flex items-center gap-1">
        <Building2 className="w-4 h-4" />
        Empresa
      </div>
    </TableHead>
  );
}

export function ColunaDistribuicaoHeader() {
  return (
    <TableHead className="w-[120px]">Distribuição</TableHead>
  );
}

export function ColunaAcoesDistribuicaoHeader() {
  return (
    <TableHead className="w-[100px]">Ações</TableHead>
  );
}

// CÉLULAS DE DADOS (TableCell)
export function ColunaOrigemCell({ item }) {
  return (
    <TableCell>
      <Badge className={item._origem_cor || 'bg-slate-100 text-slate-700'}>
        {item._origem_label || '-'}
      </Badge>
    </TableCell>
  );
}

export function ColunaEmpresaCell({ item }) {
  const label = item._empresa_label || '-';
  const isDistribuido = label.includes('distribuído');
  
  return (
    <TableCell>
      <div className="flex items-center gap-2">
        {isDistribuido && <Users className="w-3 h-3 text-blue-600" />}
        <span className={`text-sm ${isDistribuido ? 'font-semibold text-blue-700' : 'text-slate-700'}`}>
          {label}
        </span>
      </div>
    </TableCell>
  );
}

export function ColunaDistribuicaoCell({ item }) {
  if (!item._tem_distribuicao) {
    return <TableCell>-</TableCell>;
  }

  const status = item._status_distribuicao;
  const percentual = item._percentual_pago || 0;

  return (
    <TableCell>
      <div className="space-y-1">
        <Badge className={
          status === 'Total' ? 'bg-green-100 text-green-700' :
          status === 'Parcial' ? 'bg-orange-100 text-orange-700' :
          'bg-slate-100 text-slate-700'
        }>
          {status}
        </Badge>
        {status === 'Parcial' && (
          <div className="flex items-center gap-1">
            <div className="w-16 bg-slate-200 rounded-full h-1.5 overflow-hidden">
              <div 
                className="bg-orange-500 h-full"
                style={{ width: `${percentual}%` }}
              />
            </div>
            <span className="text-xs text-slate-600">{percentual.toFixed(0)}%</span>
          </div>
        )}
      </div>
    </TableCell>
  );
}

export function ColunaAcoesDistribuicaoCell({ item, onVerEspelhos }) {
  if (!item._tem_distribuicao) {
    return <TableCell>-</TableCell>;
  }

  return (
    <TableCell>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onVerEspelhos && onVerEspelhos(item)}
        className="text-blue-600 hover:text-blue-700"
      >
        <Eye className="w-4 h-4 mr-1" />
        Ver espelhos
      </Button>
    </TableCell>
  );
}

// EXPORTAÇÃO DE TODOS OS COMPONENTES
export const ColunasContexto = {
  Header: {
    Origem: ColunaOrigemHeader,
    Empresa: ColunaEmpresaHeader,
    Distribuicao: ColunaDistribuicaoHeader,
    Acoes: ColunaAcoesDistribuicaoHeader
  },
  Cell: {
    Origem: ColunaOrigemCell,
    Empresa: ColunaEmpresaCell,
    Distribuicao: ColunaDistribuicaoCell,
    Acoes: ColunaAcoesDistribuicaoCell
  }
};

export default ColunasContexto;