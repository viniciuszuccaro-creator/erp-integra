import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, MapPin, Phone, DollarSign } from "lucide-react";
import IconeAcessoCliente from "@/components/cadastros/IconeAcessoCliente";

/**
 * V21.1.2 - WINDOW MODE READY
 */
export default function ClientesVinculadosModal({ tabela, clientes, isOpen, onClose, windowMode = false }) {
  if (!tabela) return null;

  const content = (
    <div className={windowMode ? 'w-full h-full overflow-auto bg-white p-6' : ''}>
      {!windowMode && (
        <div className="border-b pb-4 mb-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            Clientes Vinculados - {tabela.nome}
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            {clientes.length} cliente(s) utilizando esta tabela de preço
          </p>
        </div>
      )}

        {clientes.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead>Cliente</TableHead>
                <TableHead>Cidade</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead>Limite Crédito</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clientes.map((cliente) => (
                <TableRow key={cliente.id} className="hover:bg-slate-50">
                  <TableCell>
                    <IconeAcessoCliente cliente={cliente} variant="inline" />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      {cliente.endereco_principal?.cidade || '-'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <Phone className="w-3 h-3 text-slate-400" />
                      {cliente.contatos?.[0]?.valor || '-'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <DollarSign className="w-3 h-3 text-green-600" />
                      <span className="font-semibold">
                        R$ {(cliente.condicao_comercial?.limite_credito || 0).toLocaleString('pt-BR')}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={
                      cliente.status === 'Ativo' ? 'bg-green-100 text-green-700' :
                      cliente.status === 'Prospect' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-700'
                    }>
                      {cliente.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <IconeAcessoCliente cliente={cliente} variant="default" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">Nenhum cliente vinculado a esta tabela</p>
            <p className="text-sm text-slate-400 mt-2">
              Configure a tabela de preço no cadastro do cliente (Cadastros Gerais)
            </p>
          </div>
        )}
    </div>
  );

  if (windowMode) {
    return content;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[620px] overflow-y-auto">
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="text-xl flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            Clientes Vinculados - {tabela.nome}
          </DialogTitle>
          <p className="text-sm text-slate-600">
            {clientes.length} cliente(s) utilizando esta tabela de preço
          </p>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  );
}