import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
  const [modalAberto, setModalAberto] = useState(null); // 'nfe' | 'lote' | null

  return (
    <>
      <div className="flex gap-2 flex-wrap">
        <Button
          variant="outline"
          onClick={() => setModalAberto('nfe')}
          className="border-purple-300 hover:bg-purple-50"
        >
          <FileText className="w-4 h-4 mr-2" />
          Importar via NF-e
        </Button>
        
        <Button
          variant="outline"
          onClick={() => setModalAberto('lote')}
          className="border-green-300 hover:bg-green-50"
        >
          <Upload className="w-4 h-4 mr-2" />
          Importar em Lote
        </Button>

        <Button
          variant="outline"
          onClick={() => setModalAberto('erp')}
          className="border-indigo-300 hover:bg-indigo-50"
        >
          <Upload className="w-4 h-4 mr-2" />
          Importar do ERP (Mapeado)
        </Button>
      </div>

      {/* Modal de NF-e */}
      <Dialog open={modalAberto === 'nfe'} onOpenChange={(open) => !open && setModalAberto(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-6 h-6 text-purple-600" />
              Importar Produtos via NF-e
            </DialogTitle>
          </DialogHeader>
          <ImportacaoProdutoNFe 
            onProdutosCriados={(produtos) => {
              if (onProdutosCriados) onProdutosCriados(produtos);
              setModalAberto(null);
            }} 
          />
        </DialogContent>
      </Dialog>

      {/* Modal de Lote */}
      <Dialog open={modalAberto === 'lote'} onOpenChange={(open) => !open && setModalAberto(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="w-6 h-6 text-green-600" />
              Importação em Lote
            </DialogTitle>
          </DialogHeader>
          <ImportacaoProdutoLote 
            onProdutosCriados={(produtos) => {
              if (onProdutosCriados) onProdutosCriados(produtos);
              setModalAberto(null);
            }} 
          />
        </DialogContent>
      </Dialog>
    </>
  );
}