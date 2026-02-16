import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UserCircle, Building2, ExternalLink, Users } from "lucide-react";
import useContextoVisual from "@/components/lib/useContextoVisual";
import SearchInput from "@/components/ui/SearchInput";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import IconeAcessoCliente from "@/components/cadastros/IconeAcessoCliente";
import { Button } from "@/components/ui/button";
import { useWindow } from "@/components/lib/useWindow";
import VisualizadorUniversalEntidade from '../cadastros/VisualizadorUniversalEntidade';
import CadastroClienteCompleto from '../cadastros/CadastroClienteCompleto';

export default function ClientesTab({ clientes }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("todos");

  const { estaNoGrupo, empresasDoGrupo } = useContextoVisual();
  const { openWindow } = useWindow();

  const filteredClientes = clientes.filter(c => {
    const matchSearch = c.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       c.razao_social?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       c.cnpj?.includes(searchTerm) ||
                       c.cpf?.includes(searchTerm);
    const matchStatus = selectedStatus === "todos" || c.status === selectedStatus;
    return matchSearch && matchStatus;
  });

  const obterNomeEmpresa = (empresaId) => {
    if (!empresaId) return '-';
    const empresa = empresasDoGrupo.find(e => e.id === empresaId);
    return empresa?.nome_fantasia || empresa?.razao_social || '-';
  };

  return (
    <div className="w-full h-full">
      <VisualizadorUniversalEntidade
        nomeEntidade="Cliente"
        tituloDisplay="Clientes"
        icone={Users}
        camposPrincipais={["nome","razao_social","cnpj","cpf","status","email","telefone","endereco_principal"]}
        componenteEdicao={CadastroClienteCompleto}
        queryKey={["clientes"]}
      />
    </div>
  );
}