import React, { createContext, useContext, useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [empresaAtual, setEmpresaAtual] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        if (mounted) {
          setUser(currentUser);
          
          // Buscar empresa atual do usuário
          if (currentUser?.empresa_atual_id) {
            const empresa = await base44.entities.Empresa.get(currentUser.empresa_atual_id);
            setEmpresaAtual(empresa);
          }
          
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          console.error("Erro ao carregar usuário:", err);
          setUser(null);
          setError(err);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    loadUser();

    return () => {
      mounted = false;
    };
  }, []);

  const refreshUser = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      
      if (currentUser?.empresa_atual_id) {
        const empresa = await base44.entities.Empresa.get(currentUser.empresa_atual_id);
        setEmpresaAtual(empresa);
      }
      
      setError(null);
    } catch (err) {
      console.error("Erro ao atualizar usuário:", err);
      setError(err);
    }
  };

  return (
    <UserContext.Provider value={{ user, empresaAtual, isLoading, error, refreshUser, setEmpresaAtual }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser deve ser usado dentro de um UserProvider");
  }
  return context;
}