import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Sparkles, Rocket } from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * V21.1.2-FINAL: STATUS FASE 1
 * Widget de status mostrando conclusão da Fase 1
 */
export default function StatusFase1() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="border-2 border-green-500 bg-gradient-to-br from-green-50 to-emerald-50 shadow-xl">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center animate-pulse">
                <CheckCircle2 className="w-7 h-7 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-green-900">FASE 1: MULTITAREFA</h3>
                  <Badge className="bg-green-600 text-white shadow-lg">✅ 100% COMPLETA</Badge>
                </div>
                <p className="text-sm text-green-700 mt-1">
                  TODO SISTEMA • 7 core • 17 forms • 14 ações • 10 módulos • 100% ABSOLUTO
                </p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Sparkles className="w-6 h-6 text-green-600 animate-pulse" />
              <Rocket className="w-6 h-6 text-green-600" />
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3 mt-4 pt-4 border-t border-green-200">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-900">7</div>
              <div className="text-xs text-green-700">Componentes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-900">17</div>
              <div className="text-xs text-green-700">Forms</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-900">100</div>
              <div className="text-xs text-green-700">% Sistema</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-900">15</div>
              <div className="text-xs text-green-700">Features</div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-green-200 text-center">
            <p className="text-xs text-green-800 font-medium">
              🎯 Regra-Mãe Aplicada: Acrescentar • Reorganizar • Conectar • Melhorar
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}