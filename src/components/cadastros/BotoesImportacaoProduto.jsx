import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useWindow } from "@/components/lib/useWindow";
import { FileText, Upload, Package } from "lucide-react";
import ImportacaoProdutoNFe from "./ImportacaoProdutoNFe";
import ImportacaoProdutoLote from "./ImportacaoProdutoLote";
import ImportacaoProdutoERP from "./ImportacaoProdutoERP";

/**
 * V21.1.2-R2 - Botões de Importação de Produtos
 * ✅ Via NF-e
 * ✅ Em Lote
 * ✅ Modal independente
 */
export default function BotoesImportacaoProduto({ onProdutosCriados }) {
  const { openWindow } = useWindow();

  return (
    <>
      <div className="flex gap-2 flex-wrap">
        <Button
          variant="outline"
          onClick={() => openWindow(
            ImportacaoProdutoNFe,
            { windowMode: true, onProdutosCriados: (produtos) => { onProdutosCriados && onProdutosCriados(produtos); } },
            { title: 'Importar Produtos via NF-e', width: 1100, height: 800 }
          )}
          className="border-purple-300 hover:bg-purple-50"
        >
          <FileText className="w-4 h-4 mr-2" />
          Importar via NF-e
        </Button>
        
        <Button
          variant="outline"
          onClick={() => openWindow(
            ImportacaoProdutoLote,
            { windowMode: true, onProdutosCriados: (produtos) => { onProdutosCriados && onProdutosCriados(produtos); } },
            { title: 'Importação em Lote', width: 1100, height: 800, ensureOnTop: true, forceTop: true, uniqueKey: 'importacao-lote', zIndex: 9999999999 }
          )}
          className="border-green-300 hover:bg-green-50"
        >
          <Upload className="w-4 h-4 mr-2" />
          Importar em Lote
        </Button>

        <Button
          variant="outline"
          onClick={() => openWindow(
            ImportacaoProdutoERP,
            { windowMode: true, onConcluido: () => { onProdutosCriados && onProdutosCriados(); } },
            { title: 'Importação ERP (Mapeado)', width: 1200, height: 800, ensureOnTop: true, forceTop: true, uniqueKey: 'importacao-erp-mapeado', zIndex: 9999999999 }
          )}
          className="border-indigo-300 hover:bg-indigo-50"
        >
          <Upload className="w-4 h-4 mr-2" />
          Importar do ERP (Mapeado)
        </Button>
      </div>






    </>
  );
}