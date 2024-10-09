"use client";
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, User } from 'firebase/auth';
import { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../../lib/firebaseConfig';

interface AuthContextType {
  user: User | null;
  loading: boolean; // Agregar estado de carga
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true); // Inicializar loading como true

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser); // Actualizar estado del usuario
        localStorage.setItem('uid', currentUser.uid); // Guardar uid en localStorage
      } else {
        setUser(null); // No hay usuario, se establece como null
        localStorage.removeItem('uid'); // Eliminar uid de localStorage
      }
      setLoading(false); // Cambiar loading a false después de validar el usuario
    });

    return () => unsubscribe(); // Desuscribirse en la limpieza
  }, []);

  const login = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem('uid'); // Eliminar uid de localStorage al cerrar sesión
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
