import React, { createContext, useContext, useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        if (mounted) {
          setUser(currentUser);
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
      setError(null);
    } catch (err) {
      console.error("Erro ao atualizar usuário:", err);
      setError(err);
    }
  };

  return (
    <UserContext.Provider value={{ user, isLoading, error, refreshUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    // Fallback seguro: evita crash antes do provider montar
    return { user: null, isLoading: true, error: null, refreshUser: async () => {} };
  }
  return context;
}