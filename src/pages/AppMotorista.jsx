import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Truck, LogIn } from "lucide-react";
import AppMotoristaCompleto from "@/components/expedicao/AppMotoristaCompleto";

/**
 * V21.2 - Página Pública do App Motorista
 * Login simplificado via código do motorista
 */
export default function AppMotorista() {
  const [codigoMotorista, setCodigoMotorista] = useState('');
  const [motoristaLogado, setMotoristaLogado] = useState(null);

  // Tentar recuperar da sessão
  useEffect(() => {
    const saved = localStorage.getItem('motorista_id');
    if (saved) {
      base44.entities.Colaborador.get(saved)
        .then(m => setMotoristaLogado(m))
        .catch(() => localStorage.removeItem('motorista_id'));
    }
  }, []);

  const handleLogin = async () => {
    if (!codigoMotorista) {
      alert('Digite o código do motorista');
      return;
    }

    try {
      const motoristas = await base44.entities.Colaborador.filter({
        pode_dirigir: true,
        cpf: codigoMotorista
      });

      if (motoristas.length === 0) {
        alert('Motorista não encontrado. Verifique o código.');
        return;
      }

      const motorista = motoristas[0];
      setMotoristaLogado(motorista);
      localStorage.setItem('motorista_id', motorista.id);
    } catch (error) {
      alert(`Erro: ${error.message}`);
    }
  };

  const handleLogout = () => {
    setMotoristaLogado(null);
    localStorage.removeItem('motorista_id');
  };

  if (motoristaLogado) {
    return (
      <div>
        <div className="p-4 bg-blue-600 text-white flex items-center justify-between">
          <p className="font-bold">🚛 {motoristaLogado.nome_completo}</p>
          <Button size="sm" variant="outline" onClick={handleLogout}>
            Sair
          </Button>
        </div>
        <AppMotoristaCompleto motoristaId={motoristaLogado.id} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-blue-600 rounded-full mx-auto mb-4 flex items-center justify-center">
              <Truck className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">App Motorista</h1>
            <p className="text-sm text-slate-600">ERP Zuccaro v21.2</p>
          </div>

          <Alert className="border-blue-300 bg-blue-50 mb-6">
            <AlertDescription className="text-xs text-blue-800">
              Digite seu CPF para acessar suas entregas do dia
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2">CPF do Motorista</label>
              <input
                type="text"
                value={codigoMotorista}
                onChange={(e) => setCodigoMotorista(e.target.value)}
                placeholder="000.000.000-00"
                className="w-full p-3 border-2 rounded-lg"
              />
            </div>

            <Button
              onClick={handleLogin}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              <LogIn className="w-4 h-4 mr-2" />
              Acessar App
            </Button>
          </div>

          <p className="text-xs text-center text-slate-500 mt-6">
            🔒 Acesso restrito a motoristas autorizados
          </p>
        </div>
      </div>
    </div>
  );
}