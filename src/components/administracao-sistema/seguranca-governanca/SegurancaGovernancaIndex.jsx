import React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import usePermissions from "@/components/lib/usePermissions";
import DashboardSeguranca from "@/components/sistema/DashboardSeguranca";
import MonitorAcessoRealtime from "@/components/sistema/MonitorAcessoRealtime";
import PainelGovernanca from "@/components/governanca/PainelGovernanca";
import IAGovernancaCompliance from "@/components/ia/IAGovernancaCompliance";

export default function SegurancaGovernancaIndex() {
  const { isAdmin } = usePermissions();
  if (!isAdmin()) return <div className="p-4 text-sm text-slate-500">Acesso restrito.</div>;

  return (
    <div className="w-full h-full flex flex-col">
      <Tabs defaultValue="seguranca" className="w-full h-full">
        <TabsList className="flex flex-wrap gap-2">
          <TabsTrigger value="seguranca">Segurança</TabsTrigger>
          <TabsTrigger value="acesso">Acesso Realtime</TabsTrigger>
          <TabsTrigger value="governanca">Governança</TabsTrigger>
          <TabsTrigger value="compliance">Compliance IA</TabsTrigger>
        </TabsList>

        <TabsContent value="seguranca" className="mt-4">
          <Card className="w-full">
            <CardContent className="p-4">
              <DashboardSeguranca
                estatisticas={{ cobertura: 0, totalUsuarios: 0, conflitosTotal: 0 }}
                usuarios={[]}
                auditoriaAcessos={[]}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="acesso" className="mt-4">
          <Card className="w-full">
            <CardContent className="p-4">
              <MonitorAcessoRealtime />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="governanca" className="mt-4">
          <Card className="w-full">
            <CardContent className="p-4">
              <PainelGovernanca />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="mt-4">
          <Card className="w-full">
            <CardContent className="p-4">
              <IAGovernancaCompliance />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}