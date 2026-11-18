import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { makeRedirectUri } from 'expo-auth-session';
import { supabase } from '@/lib/supabase';
import { cancelarNotificacionesMantenimiento } from '@/services/notificaciones.service';

const redirectTo = makeRedirectUri({ path: 'auth/callback' });

interface ContextoAutenticacionTipo {
  sesion: Session | null;
  usuario: User | null;
  estaCargando: boolean;
  mostrarBienvenida: boolean;
  cerrarBienvenida: () => void;
  iniciarSesion: (correo: string, contrasena: string) => Promise<void>;
  registrarse: (
    correo: string,
    contrasena: string,
    nombre?: string
  ) => Promise<{ requiereConfirmacion?: boolean }>;
  cerrarSesion: () => Promise<void>;
  // Propiedades habituales de Auth
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  signIn: (correo: string, contrasena: string) => Promise<void>;
  signUp: (
    correo: string,
    contrasena: string,
    nombre?: string
  ) => Promise<{ requiereConfirmacion?: boolean }>;
  signOut: () => Promise<void>;
}

const ContextoAutenticacion = createContext<ContextoAutenticacionTipo | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [sesion, setSesion] = useState<Session | null>(null);
  const [usuario, setUsuario] = useState<User | null>(null);
  const [estaCargando, setEstaCargando] = useState(true);
  const [mostrarBienvenida, setMostrarBienvenida] = useState(false);
  const tieneSesionActiva = useRef(false);

  useEffect(() => {
    let active = true;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!active) return;
      tieneSesionActiva.current = Boolean(session);
      setSesion(session);
      setUsuario(session?.user ?? null);
      setEstaCargando(false);
    }).catch((error: unknown) => {
      if (!active) return;
      console.warn('No se pudo restaurar la sesión de RutaFix:', error);
      setEstaCargando(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((evento, session) => {
      if (!active) return;
      if (evento === 'SIGNED_IN' && session && !tieneSesionActiva.current) {
        setMostrarBienvenida(true);
      }
      tieneSesionActiva.current = Boolean(session);
      setSesion(session);
      setUsuario(session?.user ?? null);
      setEstaCargando(false);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const cerrarBienvenida = useCallback(() => {
    setMostrarBienvenida(false);
  }, []);

  const iniciarSesion = async (correo: string, contrasena: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email: correo.trim(),
      password: contrasena,
    });
    if (error) throw error;
  };

  const registrarse = async (correo: string, contrasena: string, nombre?: string) => {
    const { data, error } = await supabase.auth.signUp({
      email: correo.trim(),
      password: contrasena,
      options: {
        emailRedirectTo: redirectTo,
        ...(nombre?.trim() ? { data: { full_name: nombre.trim() } } : {}),
      },
    });
    if (error) throw error;

    return {
      requiereConfirmacion: !data.session,
    };
  };

  const cerrarSesion = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    cancelarNotificacionesMantenimiento().catch((error: unknown) => {
      console.warn('No se pudieron cancelar los avisos de mantenimiento:', error);
    });
  };

  const valor = useMemo(
    () => ({
      sesion,
      usuario,
      estaCargando,
      mostrarBienvenida,
      cerrarBienvenida,
      iniciarSesion,
      registrarse,
      cerrarSesion,
      session: sesion,
      user: usuario,
      isLoading: estaCargando,
      signIn: iniciarSesion,
      signUp: registrarse,
      signOut: cerrarSesion,
    }),
    [sesion, usuario, estaCargando, mostrarBienvenida, cerrarBienvenida]
  );

  return <ContextoAutenticacion.Provider value={valor}>{children}</ContextoAutenticacion.Provider>;
}

export function useAuth() {
  const contexto = useContext(ContextoAutenticacion);
  if (!contexto) {
    throw new Error('useAuth debe ser utilizado dentro de AuthProvider');
  }
  return contexto;
}

export const ProveedorAutenticacion = AuthProvider;
export const useAutenticacion = useAuth;
