import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Users } from "lucide-react";

export default function HeaderRHCompacto() {
  return (
    <Card className="border-0 shadow-sm bg-gradient-to-r from-purple-600 to-pink-600">
      <CardContent className="p-2.5">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white">Recursos Humanos</h1>
            <p className="text-purple-100 text-xs">Colaboradores e gestão de pessoas</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}