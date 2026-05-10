import React from 'react';
import PlanoMelhoriaHeader from '@/components/sistema/plano-melhoria/PlanoMelhoriaHeader';
import PlanoMelhoriaPhaseCard from '@/components/sistema/plano-melhoria/PlanoMelhoriaPhaseCard';
import PlanoMelhoriaGovernanca from '@/components/sistema/plano-melhoria/PlanoMelhoriaGovernanca';
import PlanoMelhoriaNextSteps from '@/components/sistema/plano-melhoria/PlanoMelhoriaNextSteps';
import { melhoriaPlanPhases } from '@/components/sistema/plano-melhoria/melhoriaPlanData';

export default function PlanoMelhoria() {
  const totalProgress = Math.round(
    melhoriaPlanPhases.reduce((sum, phase) => sum + phase.progress, 0) / melhoriaPlanPhases.length
  );

  return (
    <div className="flex h-full w-full flex-col gap-6">
      <PlanoMelhoriaHeader totalProgress={totalProgress} />
      <PlanoMelhoriaGovernanca />
      <div className="grid w-full gap-4 md:grid-cols-2 xl:grid-cols-3">
        {melhoriaPlanPhases.map((phase) => (
          <PlanoMelhoriaPhaseCard key={phase.id} phase={phase} />
        ))}
      </div>
      <PlanoMelhoriaNextSteps />
    </div>
  );
}