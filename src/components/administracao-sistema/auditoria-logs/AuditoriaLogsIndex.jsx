import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AuditTrailPanel from "@/components/auditoria/AuditTrailPanel";
import LogsAuditoria from "@/components/auditoria/LogsAuditoria";
import GlobalAuditLog from "@/components/sistema/GlobalAuditLog";
import { FileText } from "lucide-react";

export default function AuditoriaLogsIndex() {
  const [entidade, setEntidade] = useState('todas');
  return (
    <div className="w-full h-full flex flex-col">
      <Tabs defaultValue="painel" className="w-full h-full">
        <TabsList className="flex flex-wrap gap-2">
          <TabsTrigger value="painel">Painel</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
          <TabsTrigger value="global">Global</TabsTrigger>
        </TabsList>

        <TabsContent value="painel" className="mt-4 h-full">
          <Card className="w-full h-full">
            <CardContent className="p-4 space-y-3 h-full">
              <div className="flex items-center gap-2">
                <Select value={entidade} onValueChange={setEntidade}>
                  <SelectTrigger className="w-56">
                    <SelectValue placeholder="Entidade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todas">Todas as entidades</SelectItem>
                    <SelectItem value="Pedido">Pedido</SelectItem>
                    <SelectItem value="ContaPagar">Conta Pagar</SelectItem>
                    <SelectItem value="ContaReceber">Conta Receber</SelectItem>
                    <SelectItem value="Produto">Produto</SelectItem>
                    <SelectItem value="MovimentacaoEstoque">Movimentação Estoque</SelectItem>
                    <SelectItem value="PerfilAcesso">Perfil de Acesso</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="w-full h-[60vh]">
                <AuditTrailPanel limit={100} entidade={entidade === 'todas' ? null : entidade} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="mt-4">
          <Card className="w-full">
            <CardContent className="p-4">
              <LogsAuditoria />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="global" className="mt-4">
          <Card className="w-full">
            <CardContent className="p-4">
              <GlobalAuditLog />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}