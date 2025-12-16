import React from 'react';
import CertificadoFinalV21_8 from '@/components/sistema/CertificadoFinalV21_8';
import ValidadorFinalV21_8 from '@/components/sistema/ValidadorFinalV21_8';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Award, CheckCircle2, FileCheck } from 'lucide-react';

/**
 * PÁGINA DE CERTIFICAÇÃO V21.8
 * Validação final e certificado oficial do sistema
 */
export default function CertificacaoV21_8() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <Tabs defaultValue="certificado" className="w-full">
        <TabsList className="grid grid-cols-2 w-full max-w-md mx-auto mb-8 bg-white shadow-lg">
          <TabsTrigger value="certificado" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-500 data-[state=active]:to-orange-500 data-[state=active]:text-white">
            <Award className="w-4 h-4 mr-2" />
            Certificado
          </TabsTrigger>
          <TabsTrigger value="validacao" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white">
            <FileCheck className="w-4 h-4 mr-2" />
            Validação
          </TabsTrigger>
        </TabsList>

        <TabsContent value="certificado">
          <CertificadoFinalV21_8 windowMode={false} />
        </TabsContent>

        <TabsContent value="validacao">
          <ValidadorFinalV21_8 windowMode={false} />
        </TabsContent>
      </Tabs>
    </div>
  );
}