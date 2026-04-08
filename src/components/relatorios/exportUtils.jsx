export function exportarCSV(dados, nomeArquivo) {
  if (!dados || dados.length === 0) return;
  const headers = Object.keys(dados[0]).join(',');
  const rows = dados.map(item =>
    Object.values(item).map(v => {
      if (v === null || v === undefined) return '';
      if (typeof v === 'object') return `"${JSON.stringify(v).replace(/"/g, "'")}"`;
      const s = String(v);
      return s.includes(',') || s.includes('"') ? `"${s.replace(/"/g, '""')}"` : s;
    }).join(',')
  );
  const csv = [headers, ...rows].join('\n');
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${nomeArquivo}_${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
}