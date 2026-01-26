import React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import ConfigGlobal from "@/components/sistema/ConfigGlobal";
import ConfiguracaoBackup from "@/components/sistema/ConfiguracaoBackup";
import ConfiguracaoMonitoramento from "@/components/sistema/ConfiguracaoMonitoramento";
import ConfiguracaoSeguranca from "@/components/sistema/ConfiguracaoSeguranca";

export default function ConfiguracoesGeraisIndex() {
  return (
    <div className="w-full h-full flex flex-col">
      <Tabs defaultValue="global" className="w-full h-full">
        <TabsList className="flex flex-wrap gap-2">
          <TabsTrigger value="global">Globais</TabsTrigger>
          <TabsTrigger value="backup">Backup</TabsTrigger>
          <TabsTrigger value="monitoramento">Monitoramento</TabsTrigger>
          <TabsTrigger value="seguranca">Segurança</TabsTrigger>
        </TabsList>

        <TabsContent value="global" className="mt-4">
          <Card className="w-full">
            <CardContent className="p-4">
              <ConfigGlobal />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="backup" className="mt-4">
          <Card className="w-full">
            <CardContent className="p-4">
              <ConfiguracaoBackup />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitoramento" className="mt-4">
          <Card className="w-full">
            <CardContent className="p-4">
              <ConfiguracaoMonitoramento />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seguranca" className="mt-4">
          <Card className="w-full">
            <CardContent className="p-4">
              <ConfiguracaoSeguranca />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}