"use client";

import React, { useState, useRef, useEffect } from "react";
import Navigation from "@/components/Navigation";
import { useTranslation } from 'react-i18next';
import { LogOut, Users, User } from 'lucide-react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { IUser } from "@/entities/User";
import { IStaff } from "@/entities/Staff";
import { useLoginModalStore } from '@/store/LoginModalStore';
import { useEditUserModalStore } from '@/store/EditUserModalStore';
import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from '@/i18n';
import { LANGUAGES } from '@/constants/languages';

interface HeaderProps {
  user?: IUser;
  staff?: IStaff;
  onLogout?: () => void;
}

export default function Header({ user, staff, onLogout }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { i18n, t } = useTranslation();
  const userMenuRef = useRef(null);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const openLogin = useLoginModalStore((s) => s.open);
  const openEdit = useEditUserModalStore((s) => s.open);

  // Get staff name from locales
  const staffName = staff?.locales?.[staff.primaryLocale]?.name || user?.name || 'Yaakov Aglamaz';

  useEffect(() => {
    function handleClickOutside(event) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    }

    if (isUserMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isUserMenuOpen]);

  const normalizedLocale = (i18n.language || '').split('-')[0];
  const currentLocale = SUPPORTED_LOCALES.includes(normalizedLocale) ? normalizedLocale : DEFAULT_LOCALE;

  const handleLangChange = (lang: string) => {
    const targetLocale = SUPPORTED_LOCALES.includes(lang) ? lang : DEFAULT_LOCALE;

    // Set dir attribute immediately before navigation to prevent layout shift
    const rtlLocales = ['he', 'ar'];
    const newDir = rtlLocales.includes(targetLocale) ? 'rtl' : 'ltr';
    if (typeof document !== 'undefined') {
      document.documentElement.dir = newDir;
      document.documentElement.lang = targetLocale;
    }

    if (i18n.language !== targetLocale) {
      i18n.changeLanguage(targetLocale);
    }

    try {
      const currentPath = pathname || '/';
      const isPrivateRoute = currentPath.startsWith('/app') || currentPath.startsWith('/admin');
      if (isPrivateRoute) {
        const params = new URLSearchParams(searchParams?.toString());
        params.set('locale', targetLocale);
        const queryString = params.toString();
        const nextUrl = queryString ? `${currentPath}?${queryString}` : currentPath;
        router.replace(nextUrl, { scroll: false });
        router.refresh();
      } else {
        const segments = currentPath.split('/').filter(Boolean);
        let nextPath = currentPath;

        if (segments.length > 0 && SUPPORTED_LOCALES.includes(segments[0])) {
          const rest = segments.slice(1).join('/');
          nextPath = `/${targetLocale}${rest ? `/${rest}` : ''}`;
        } else if (segments.length === 0) {
          nextPath = `/${targetLocale}`;
        }

        if (nextPath !== currentPath) {
          router.replace(nextPath, { scroll: false });
        } else {
          router.replace(currentPath, { scroll: false });
        }
        router.refresh();
      }
    } catch (error) {
      console.error('[Header] failed to update locale path', error);
    }

    setIsLangMenuOpen(false);
  };

  const menuPosition = i18n.language === 'he' ? 'left-0' : 'right-0';

  // Show "Start" button only on landing page (e.g., /en, /he)
  const isLandingPage = pathname && /^\/[a-z]{2}\/?$/.test(pathname);

  return (
    <header className="w-full flex items-center justify-between px-4 py-2 bg-white shadow-sm sticky top-0 z-50">
      {/* Left: Site title */}
      <div className="text-xl font-semibold text-sage-700">
        {staffName}
      </div>
      {/* Center: Empty for admin area */}
      <div className="flex-1"></div>
      {/* Right: Flags + Avatar */}
      <div className="flex items-center gap-2 relative">
        {/* Language Selector */}
        <div className="relative">
          <button
            onClick={() => setIsLangMenuOpen((v) => !v)}
            className="h-8 w-8 rounded-full flex items-center justify-center text-xl bg-gray-100 hover:bg-gray-200 border border-gray-300"
            aria-label={t('changeLanguage') as string}
          >
            {LANGUAGES.find(l => l.code === currentLocale)?.flag || '🌐'}
          </button>
          {isLangMenuOpen && (
            <div className={`language-menu ${menuPosition}`}>
              <div className="py-1 flex flex-col">
                {LANGUAGES.map(({ code, label, flag }) => (
                  <button
                    key={code}
                    onClick={() => handleLangChange(code)}
                    className={`language-menu-item ${currentLocale === code ? 'font-bold' : ''}`}
                  >
                    <span>{flag}</span>
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        {/* Avatar + User Menu */}
        {user && staff && onLogout ? (
        <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setIsUserMenuOpen((v) => !v)}
              className="h-8 w-8 rounded-full bg-sage-600 text-white flex items-center justify-center font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sage-500 transition-colors duration-200"
              aria-label={t('userMenu') as string}
            >
              {staff.avatarUrl ? (
                <img src={staff.avatarUrl} alt={staffName} className="h-8 w-8 rounded-full" />
              ) : (
                <span>{staffName.charAt(0).toUpperCase()}</span>
              )}
            </button>
            {isUserMenuOpen && (
              <div
                className={`origin-top-right absolute ${menuPosition} mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50`}>
                <div className="py-1">
                  {/* Admin menu items */}
                  {staff && (
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        router.push('/admin/staff');
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-green-700 hover:bg-green-50 transition-colors duration-200"
                    >
                      <Users size={16} className="mr-3"/>
                      {t('staffManagement')}
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      onLogout?.();
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-sage-700 hover:bg-sage-50 transition-colors duration-200"
                  >
                    <LogOut size={16} className="mr-3"/>
                    {t('logout')}
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={openLogin}
            className="h-8 px-3 rounded-full bg-sage-600 text-white text-sm whitespace-nowrap"
          >
            {t('signIn')}
          </button>
        )}
      </div>
    </header>
  );
}
