import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { base44 } from '@/api/base44Client';

export default function InventarioContagem({ inventario }) {
  if (!inventario) return null;

  const aplicar = async () => {
    // Basta atualizar o status para disparar automação
    await base44.entities.Inventario.update(inventario.id, { status: 'Aprovado' });
  };

  return (
    <Card className="w-full h-full">
      <CardHeader>
        <CardTitle>Contagem de Inventário</CardTitle>
      </CardHeader>
      <CardContent className="flex gap-2 flex-wrap">
        <Button onClick={aplicar}>Aplicar Ajustes</Button>
      </CardContent>
    </Card>
  );
}