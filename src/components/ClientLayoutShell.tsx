'use client';
import React, { useEffect, useState } from "react";
import { useUserStore } from '../store/UserStore';
import { useRouter } from "next/navigation";
import { useTranslation } from 'react-i18next';
import { Loader } from "../components/ui/Loader";
import I18nGate from "@/components/I18nGate";
import { landingPage } from "@/app/settings";
import Header from "@/components/Header";
import type { IStaff } from "@/entities/Staff";

interface ClientLayoutShellProps {
  children: React.ReactNode;
}

export default function ClientLayoutShell({ children }: ClientLayoutShellProps) {
  const { user, loading, logout, checkAuth, hydrateFromWindow: hydrateUser } = useUserStore();
  const router = useRouter();
  const { t } = useTranslation();

  // Hydrate user from window on mount (before checkAuth)
  useEffect(() => {
    hydrateUser();
  }, [hydrateUser]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const handleLogout = async () => {
    await logout();
    router.push(landingPage);
  };

  if (loading) {
    return (
      <Loader size={24} thickness={3} text={t('loading') as string}/>
    );
  }

  // Create staff representation from user for header display
  const staff: IStaff | undefined = user ? {
    id: user.user_id,
    email: user.email,
    primaryLocale: 'he',
    locales: {
      he: {
        name: user.name,
        position: 'Software Engineer',
      }
    },
    avatarUrl: undefined,
    createdAt: null as any,
    updatedAt: null as any,
  } : undefined;

  return (
    <I18nGate>
      <div className="min-h-screen bg-gray-50">
        {mounted && user && staff && (
          <Header
            user={user}
            staff={staff}
            onLogout={handleLogout}
          />
        )}
        <main>
          {children}
        </main>
      </div>
    </I18nGate>
  );
}
