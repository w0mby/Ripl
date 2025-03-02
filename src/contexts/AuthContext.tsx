import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  User,
  onAuthStateChanged
} from 'firebase/auth';
import { auth, signInWithGoogle, signUp, signIn, signOut } from '../firebase';

// Define the shape of our auth context
interface AuthContextType {
  currentUser: User | null;
  isLoading: boolean;
  signInWithGoogle: () => Promise<{ user: User | null; error: Error | null }>;
  signUp: (email: string, password: string, displayName: string) => Promise<{ user: User | null; error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ user: User | null; error: Error | null }>;
  signOut: () => Promise<{ error: Error | null }>;
}

// Create the auth context with default values
const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  isLoading: true,
  signInWithGoogle,
  signUp,
  signIn,
  signOut
});

//eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  return useContext(AuthContext);
};

// Provider component to wrap the app
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Subscribe to auth state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setIsLoading(false);
    });

    // Cleanup subscription
    return unsubscribe;
  }, []);

  // Value to be provided to consumers
  const value = {
    currentUser,
    isLoading,
    signInWithGoogle,
    signUp,
    signIn,
    signOut
  };

  return (
    <AuthContext.Provider value={value}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
};