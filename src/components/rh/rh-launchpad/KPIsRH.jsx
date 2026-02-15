import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserCircle, Calendar, Clock, CheckCircle } from "lucide-react";

export default function KPIsRH({ 
  colaboradoresAtivos, 
  totalColaboradores,
  feriasAprovadas, 
  feriasPendentes, 
  totalPontos 
}) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5">
      <Card className="border-0 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-3">
          <CardTitle className="text-xs font-medium">Ativos</CardTitle>
          <UserCircle className="w-4 h-4 text-purple-600" />
        </CardHeader>
        <CardContent className="px-3 pb-2">
          <div className="text-2xl font-bold text-purple-600">{colaboradoresAtivos}</div>
          <p className="text-xs text-slate-500">de {totalColaboradores} no total</p>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-3">
          <CardTitle className="text-xs font-medium">Férias</CardTitle>
          <Calendar className="w-4 h-4 text-green-600" />
        </CardHeader>
        <CardContent className="px-3 pb-2">
          <div className="text-2xl font-bold text-green-600">{feriasAprovadas}</div>
          <p className="text-xs text-slate-500">aprovadas</p>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-3">
          <CardTitle className="text-xs font-medium">Pendentes</CardTitle>
          <Clock className="w-4 h-4 text-orange-600" />
        </CardHeader>
        <CardContent className="px-3 pb-2">
          <div className="text-2xl font-bold text-orange-600">{feriasPendentes}</div>
          <p className="text-xs text-slate-500">solicitações</p>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-3">
          <CardTitle className="text-xs font-medium">Pontos</CardTitle>
          <CheckCircle className="w-4 h-4 text-blue-600" />
        </CardHeader>
        <CardContent className="px-3 pb-2">
          <div className="text-2xl font-bold text-blue-600">{totalPontos}</div>
          <p className="text-xs text-slate-500">registros</p>
        </CardContent>
      </Card>
    </div>
  );
}