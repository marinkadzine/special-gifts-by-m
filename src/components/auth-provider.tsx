"use client";

import { createContext, startTransition, useContext, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { getBrowserSupabaseClient } from "@/lib/supabase";
import { Profile } from "@/types/store";

type AuthContextValue = {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  isAdmin: boolean;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

async function fetchProfile(user: User | null) {
  if (!user) {
    return null;
  }

  const supabase = getBrowserSupabaseClient();

  if (!supabase) {
    return null;
  }

  const { data } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
  return (data as Profile | null) ?? null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(() => Boolean(getBrowserSupabaseClient()));

  async function refreshProfile() {
    const supabase = getBrowserSupabaseClient();

    if (!supabase) {
      setProfile(null);
      return;
    }

    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser();

    setUser(currentUser);
    setProfile(await fetchProfile(currentUser));
  }

  async function signOut() {
    const supabase = getBrowserSupabaseClient();

    if (!supabase) {
      return;
    }

    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  }

  useEffect(() => {
    const supabaseClient = getBrowserSupabaseClient();

    if (!supabaseClient) {
      return;
    }

    let mounted = true;

    async function bootstrap() {
      const {
        data: { user: currentUser },
      } = await supabaseClient!.auth.getUser();

      if (!mounted) {
        return;
      }

      setUser(currentUser);
      setProfile(await fetchProfile(currentUser));
      setLoading(false);
    }

    bootstrap();

    const {
      data: { subscription },
    } = supabaseClient!.auth.onAuthStateChange((_event, session) => {
      startTransition(() => {
        setUser(session?.user ?? null);
        if (!session?.user) {
          setProfile(null);
          setLoading(false);
          return;
        }

        fetchProfile(session.user).then((nextProfile) => {
          if (!mounted) {
            return;
          }

          setProfile(nextProfile);
          setLoading(false);
        });
      });
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        isAdmin: profile?.role === "admin",
        refreshProfile,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
