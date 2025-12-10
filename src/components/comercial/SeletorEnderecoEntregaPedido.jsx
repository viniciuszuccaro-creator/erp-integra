import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Plus, ExternalLink } from "lucide-react";

export default function SeletorEnderecoEntregaPedido({ cliente, enderecoSelecionado, onSelect }) {
  const onChange = onSelect; // Alias para manter compatibilidade
  if (!cliente) return null;

  const enderecosDisponiveis = [
    ...(cliente?.locais_entrega || []),
    ...(cliente?.endereco_principal?.cidade ? [{
      apelido: "Endereço Principal",
      tipo_endereco: "Principal",
      ...cliente.endereco_principal
    }] : [])
  ];

  const handleSelecionarEndereco = (enderecoId) => {
    const endereco = enderecosDisponiveis.find((e, idx) => 
      (e.id || `temp-${idx}`) === enderecoId
    );
    
    if (endereco) {
      const mapaUrl = endereco.latitude && endereco.longitude
        ? `https://www.google.com/maps?q=${endereco.latitude},${endereco.longitude}`
        : endereco.cep
        ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
            `${endereco.logradouro}, ${endereco.numero}, ${endereco.cidade}, ${endereco.estado}`
          )}`
        : "";

      onChange({
        ...endereco,
        mapa_url: mapaUrl
      });
    }
  };

  return (
    <div className="space-y-4">
      <Label>Endereço de Entrega *</Label>

      {enderecosDisponiveis.length > 0 ? (
        <Select
          value={enderecoSelecionado?.id || enderecoSelecionado?.apelido || ""}
          onValueChange={handleSelecionarEndereco}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione um endereço..." />
          </SelectTrigger>
          <SelectContent className="z-[99999]">
            {enderecosDisponiveis.map((end, idx) => (
              <SelectItem key={end.id || `temp-${idx}`} value={end.id || `temp-${idx}`}>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  <div>
                    <p className="font-medium">
                      {end.apelido || `${end.cidade}, ${end.estado}`}
                    </p>
                    <p className="text-xs text-slate-600">
                      {end.logradouro}, {end.numero} - {end.bairro}
                    </p>
                  </div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <div className="text-center py-4 border-2 border-dashed border-slate-200 rounded-lg bg-slate-50">
          <MapPin className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-sm text-slate-500">Nenhum endereço cadastrado para este cliente</p>
        </div>
      )}

      {enderecoSelecionado && (
        <Card className="border-0 shadow-sm bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  <p className="font-semibold text-blue-900">
                    {enderecoSelecionado.apelido || "Endereço Selecionado"}
                  </p>
                  {enderecoSelecionado.tipo_endereco && (
                    <Badge variant="outline" className="text-xs">
                      {enderecoSelecionado.tipo_endereco}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-blue-800">
                  {enderecoSelecionado.logradouro}, {enderecoSelecionado.numero}
                  {enderecoSelecionado.complemento && ` - ${enderecoSelecionado.complemento}`}
                </p>
                <p className="text-sm text-blue-700">
                  {enderecoSelecionado.bairro} - {enderecoSelecionado.cidade}/{enderecoSelecionado.estado}
                  {enderecoSelecionado.cep && ` - CEP: ${enderecoSelecionado.cep}`}
                </p>

                {enderecoSelecionado.mapa_url && (
                  <a
                    href={enderecoSelecionado.mapa_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-2"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Ver no Google Maps
                  </a>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}