import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react";

export default function KPIsFiscal({ total, autorizadas, rascunho, rejeitadas, canceladas }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-1.5">
      <Card className="border-0 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-3">
          <CardTitle className="text-xs font-medium">Total</CardTitle>
          <FileText className="w-4 h-4 text-slate-600" />
        </CardHeader>
        <CardContent className="px-3 pb-2">
          <div className="text-2xl font-bold text-slate-900">{total}</div>
          <p className="text-xs text-slate-500">NF-e</p>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm bg-green-50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-3">
          <CardTitle className="text-xs font-medium">Autorizadas</CardTitle>
          <CheckCircle className="w-4 h-4 text-green-600" />
        </CardHeader>
        <CardContent className="px-3 pb-2">
          <div className="text-2xl font-bold text-green-700">{autorizadas}</div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm bg-yellow-50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-3">
          <CardTitle className="text-xs font-medium">Rascunho</CardTitle>
          <Clock className="w-4 h-4 text-yellow-600" />
        </CardHeader>
        <CardContent className="px-3 pb-2">
          <div className="text-2xl font-bold text-yellow-700">{rascunho}</div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm bg-red-50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-3">
          <CardTitle className="text-xs font-medium">Rejeitadas</CardTitle>
          <XCircle className="w-4 h-4 text-red-600" />
        </CardHeader>
        <CardContent className="px-3 pb-2">
          <div className="text-2xl font-bold text-red-700">{rejeitadas}</div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm bg-slate-100">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-3">
          <CardTitle className="text-xs font-medium">Canceladas</CardTitle>
          <AlertCircle className="w-4 h-4 text-slate-600" />
        </CardHeader>
        <CardContent className="px-3 pb-2">
          <div className="text-2xl font-bold text-slate-700">{canceladas}</div>
        </CardContent>
      </Card>
    </div>
  );
}