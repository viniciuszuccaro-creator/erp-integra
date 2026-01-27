import React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import AuditTrailPanel from "@/components/auditoria/AuditTrailPanel";
import LogsAuditoria from "@/components/auditoria/LogsAuditoria";
import GlobalAuditLog from "@/components/sistema/GlobalAuditLog";
import { FileText } from "lucide-react";

export default function AuditoriaLogsIndex() {
  return (
    <div className="w-full h-full flex flex-col">
      <Tabs defaultValue="painel" className="w-full h-full">
        <TabsList className="flex flex-wrap gap-2">
          <TabsTrigger value="painel">Painel</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
          <TabsTrigger value="global">Global</TabsTrigger>
        </TabsList>

        <TabsContent value="painel" className="mt-4">
          <Card className="w-full">
            <CardContent className="p-4">
              <div className="text-center py-10 text-slate-500">
                <FileText className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p>O painel de auditoria será disponibilizado em breve.</p>
                <p className="text-sm">Placeholder temporário até a conclusão da implementação.</p>
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