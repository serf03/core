"use client";
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, User } from 'firebase/auth';
import { createContext, useContext, useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { User as Users } from '@/lib/types';
import { auth, db } from '@/lib/firebaseClient'; // Usar SDK del cliente

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => { // Usar auth del cliente
      if (currentUser) {
        setUser(currentUser);
        getUserById(currentUser.uid).then((user) => {
          if (user) {
            const userWithRole = { 
              id: user.id, 
              idAdm: user.role === "Administrador" ? user.id : user.idAdministrador, 
              role: user.role 
            };
            localStorage.setItem('user', JSON.stringify(userWithRole));
            localStorage.setItem('uid', user.idAdministrador ?? '');
          }
        });
      } else {
        setUser(null);
        localStorage.removeItem('uid');
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const getUserById = async (userId: string): Promise<Users | null> => {
    try {
      const userDoc = await getDoc(doc(db, "users", userId)); // Usar db del cliente
      return userDoc.exists() ? ({ id: userDoc.id, ...userDoc.data() } as Users) : null;
    } catch (error) {
      console.error("Error fetching user:", error);
      return null;
    }
  };

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const logout = async () => {
    await signOut(auth);
    localStorage.removeItem('uid');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};