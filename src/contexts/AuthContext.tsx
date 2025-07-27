import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '@/integrations/firebase/config';
import { 
  User,
  onAuthStateChanged,
  signOut
} from 'firebase/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
  isSignedIn: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      throw error;
    }
  };

  const value = {
    user,
    loading,
    logout,
    isSignedIn: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
