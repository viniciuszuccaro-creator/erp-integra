import ValidadorFase1Component from "@/components/sistema/ValidadorFase1";

export default function ValidadorFase1() {
  return (
    <div className="w-full p-4 sm:p-6 lg:p-8 overflow-y-auto min-h-[calc(100vh-4rem)] max-w-full" style={{ width: '100%', maxWidth: '100%' }}> {/* ETAPA 1: w-full + inline */}
      <ValidadorFase1Component />
    </div>
  );
}