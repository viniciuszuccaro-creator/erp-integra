import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Factory, Package, Award, Warehouse, Scale, Sparkles, Zap } from "lucide-react";
import { motion } from "framer-motion";

/**
 * 🎯 STATUS FASE 2 - WIDGET DE CONCLUSÃO
 * 
 * Widget visual mostrando conclusão 100% da Fase 2
 * 5 Cadastros Estruturantes implementados
 */
export default function StatusFase2() {
  const estruturantes = [
    { nome: "Setores Atividade", icon: Factory, color: "indigo" },
    { nome: "Grupos Produto", icon: Package, color: "cyan" },
    { nome: "Marcas", icon: Award, color: "amber" },
    { nome: "Locais Estoque", icon: Warehouse, color: "purple" },
    { nome: "Tabelas Fiscais", icon: Scale, color: "red" }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="bg-gradient-to-br from-green-50 to-emerald-100 border-4 border-green-400 shadow-2xl">
        <CardHeader className="border-b-2 border-green-300 bg-gradient-to-r from-green-100 to-emerald-100">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold text-green-900 flex items-center gap-3">
              <CheckCircle2 className="w-7 h-7 text-green-600" />
              FASE 2: CADASTROS ESTRUTURANTES
            </CardTitle>
            <Badge className="bg-green-600 text-white px-4 py-2 text-sm shadow-lg">
              100% COMPLETA
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
            <div className="bg-indigo-100 border-2 border-indigo-300 rounded-lg p-3 text-center">
              <Factory className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-700">Setores Atividade</p>
              <CheckCircle2 className="w-4 h-4 text-green-600 mx-auto mt-1" />
            </div>
            <div className="bg-cyan-100 border-2 border-cyan-300 rounded-lg p-3 text-center">
              <Package className="w-8 h-8 text-cyan-600 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-700">Grupos Produto</p>
              <CheckCircle2 className="w-4 h-4 text-green-600 mx-auto mt-1" />
            </div>
            <div className="bg-amber-100 border-2 border-amber-300 rounded-lg p-3 text-center">
              <Award className="w-8 h-8 text-amber-600 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-700">Marcas</p>
              <CheckCircle2 className="w-4 h-4 text-green-600 mx-auto mt-1" />
            </div>
            <div className="bg-purple-100 border-2 border-purple-300 rounded-lg p-3 text-center">
              <Warehouse className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-700">Locais Estoque</p>
              <CheckCircle2 className="w-4 h-4 text-green-600 mx-auto mt-1" />
            </div>
            <div className="bg-red-100 border-2 border-red-300 rounded-lg p-3 text-center">
              <Scale className="w-8 h-8 text-red-600 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-700">Tabelas Fiscais</p>
              <CheckCircle2 className="w-4 h-4 text-green-600 mx-auto mt-1" />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-700">5</div>
              <p className="text-xs text-slate-600">Estruturantes</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-700">89</div>
              <p className="text-xs text-slate-600">Windows Ready</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-700">100%</div>
              <p className="text-xs text-slate-600">Multiempresa</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-amber-700">28</div>
              <p className="text-xs text-slate-600">IAs Ativas</p>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 border-2 border-green-200">
            <p className="text-sm text-center text-slate-700 flex items-center justify-center gap-2 flex-wrap">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span className="font-bold text-green-700">Regra-Mãe Aplicada:</span>
              <span>Acrescentar</span>
              <span>•</span>
              <span>Reorganizar</span>
              <span>•</span>
              <span>Conectar</span>
              <span>•</span>
              <span>Melhorar</span>
              <Zap className="w-4 h-4 text-amber-600" />
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}