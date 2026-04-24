import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { RefreshCw } from 'lucide-react';

/**
 * ToggleRow — componente reutilizável para configurações on/off.
 * Compatível com useToggleConfig (optimistic UI + persistência banco).
 */
export default function ToggleRow({ configs, chave, categoria, label, desc, saving, isFetching, onToggle, getToggleValue, accentColor = 'green' }) {
  const val = getToggleValue(configs, chave);
  const isSaving = !!saving[chave];

  const badgeClass = isSaving
    ? 'bg-blue-100 text-blue-700 border-blue-200 text-[10px]'
    : val
      ? accentColor === 'purple'
        ? 'bg-purple-100 text-purple-700 border-purple-200 text-[10px]'
        : 'bg-green-100 text-green-700 border-green-200 text-[10px]'
      : 'bg-slate-100 text-slate-500 text-[10px]';

  return (
    <div className={`flex items-center justify-between p-3 border rounded-lg transition-colors ${isSaving ? 'bg-blue-50 border-blue-200' : 'hover:bg-slate-50'}`}>
      <div className="flex-1 min-w-0 mr-3">
        <p className="font-medium text-sm">{label}</p>
        {desc && <p className="text-xs text-slate-500 mt-0.5">{desc}</p>}
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {isSaving && <RefreshCw className="w-3 h-3 text-blue-500 animate-spin" />}
        <Badge className={badgeClass}>
          {isSaving ? 'Salvando…' : val ? 'Ativo' : 'Inativo'}
        </Badge>
        <Switch
          checked={val}
          disabled={isSaving || isFetching}
          onCheckedChange={(checked) => onToggle(chave, categoria, checked)}
        />
      </div>
    </div>
  );
}