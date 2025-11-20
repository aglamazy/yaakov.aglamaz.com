import { Timestamp } from 'firebase-admin/firestore';

export interface StaffLocale {
  name?: string;
  position?: string;
  bio?: string;
}

export interface StaffLocales {
  [locale: string]: StaffLocale;
}

export interface IStaff {
  id: string;
  email: string;
  primaryLocale: string;
  locales: StaffLocales;
  avatarUrl?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
