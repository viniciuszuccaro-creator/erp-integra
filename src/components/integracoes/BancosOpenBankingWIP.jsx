import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Banknote } from "lucide-react";

export default function BancosOpenBankingWIP({ closeWindow }) {
  return (
    <div className="w-full h-full p-4">
      <Card className="h-full">
        <CardHeader className="border-b">
          <div className="flex items-center gap-3">
            <Banknote className="w-5 h-5 text-indigo-600" />
            <CardTitle>Bancos (Open Banking)</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-3">
          <Alert>
            <AlertDescription>
              Em desenvolvimento: integração Open Banking para conciliação automática e extratos. 
              Em breve você poderá conectar seus bancos aqui.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}