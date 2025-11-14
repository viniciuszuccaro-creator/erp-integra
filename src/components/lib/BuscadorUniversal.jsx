import React from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Search, X } from 'lucide-react';

/**
 * 🔍 V20.2: MOTOR DE BUSCA UNIVERSAL
 * Normaliza acentos e busca em TODOS os campos recursivamente
 * 
 * USO:
 * import { useBuscaUniversal, normalizarTexto, buscarEmObjeto } from '@/components/lib/BuscadorUniversal';
 * 
 * const { searchTerm, setSearchTerm, filtrarLista } = useBuscaUniversal();
 * const clientesFiltrados = filtrarLista(clientes);
 */

/**
 * Normaliza texto removendo acentos e convertendo para minúsculas
 */
export const normalizarTexto = (texto) => {
  if (!texto) return '';
  return texto
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, ''); // Remove acentos
};

/**
 * Busca recursiva em objetos (busca em TODOS os campos)
 */
export const buscarEmObjeto = (obj, termo) => {
  if (!obj || typeof obj !== 'object') return false;
  
  const termoNormalizado = normalizarTexto(termo);
  
  // Buscar em todos os valores do objeto recursivamente
  for (const valor of Object.values(obj)) {
    if (valor === null || valor === undefined) continue;
    
    if (typeof valor === 'string' || typeof valor === 'number') {
      if (normalizarTexto(valor.toString()).includes(termoNormalizado)) {
        return true;
      }
    } else if (Array.isArray(valor)) {
      // Buscar em arrays
      for (const item of valor) {
        if (typeof item === 'object') {
          if (buscarEmObjeto(item, termo)) return true;
        } else if (normalizarTexto(item.toString()).includes(termoNormalizado)) {
          return true;
        }
      }
    } else if (typeof valor === 'object') {
      // Buscar recursivamente em objetos aninhados
      if (buscarEmObjeto(valor, termo)) return true;
    }
  }
  
  return false;
};

/**
 * Hook customizado para busca universal
 */
export function useBuscaUniversal() {
  const [searchTerm, setSearchTerm] = React.useState('');

  const filtrarLista = (lista) => {
    if (!searchTerm || searchTerm.trim() === '') return lista;
    return lista.filter(item => buscarEmObjeto(item, searchTerm));
  };

  const limparBusca = () => setSearchTerm('');

  return {
    searchTerm,
    setSearchTerm,
    filtrarLista,
    limparBusca
  };
}

/**
 * Componente visual de busca universal
 */
export function BuscadorUniversal({ 
  searchTerm, 
  setSearchTerm, 
  totalResultados,
  placeholder = "🔍 Buscar em tudo: nome, CPF, CNPJ, endereço, telefone, email... (ignora acentos)",
  showAlert = false
}) {
  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
        <Input
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-12 h-12 text-base shadow-md border-slate-300"
        />
        {searchTerm && (
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
            <Badge className="bg-blue-600 text-white">
              {totalResultados} encontrado{totalResultados !== 1 ? 's' : ''}
            </Badge>
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={() => setSearchTerm('')}
              className="h-6 px-2"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      {showAlert && searchTerm && (
        <Alert className="border-blue-300 bg-blue-50">
          <Search className="w-4 h-4 text-blue-600" />
          <AlertDescription className="text-sm text-blue-900">
            🔍 Buscando por <strong>"{searchTerm}"</strong> em todos os campos
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

export default {
  normalizarTexto,
  buscarEmObjeto,
  useBuscaUniversal,
  BuscadorUniversal
};