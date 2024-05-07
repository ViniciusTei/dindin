import {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
} from "react";
import {
  getAuth,
  signOut as firebaseSignOut,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  User,
  AuthError,
} from "firebase/auth";
import app from "../services/firebase";

const auth = getAuth(app);

type AuthContextType = {
  user: User | null;
  signUp: (email: string, password: string) => void;
  signIn: (email: string, password: string) => void;
  signOut: () => void;
};

const AuthContext = createContext({} as AuthContextType);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const userStorage = localStorage.getItem("dindin-user");
    if (userStorage) {
      setUser(JSON.parse(userStorage));
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  const signUp = async (email: string, password: string) => {
    try {
      const { user } = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      setUser(user);
      localStorage.setItem("dindin-user", JSON.stringify(user));
    } catch (error) {
      console.error("Erro ao registrar:", (error as AuthError).message);
    }
  };

  // Método para fazer login
  const signIn = async (email: string, password: string) => {
    try {
      const { user } = await signInWithEmailAndPassword(auth, email, password);
      setUser(user);
      localStorage.setItem("dindin-user", JSON.stringify(user));
    } catch (error) {
      console.error("Erro ao fazer login:", (error as AuthError).message);
    }
  };

  // Método para fazer logout
  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
      localStorage.removeItem("dindin-user");
    } catch (error) {
      console.error("Erro ao fazer logout:", (error as AuthError).message);
    }
  };

  return (
    <AuthContext.Provider value={{ user, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
