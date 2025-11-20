import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { initAdmin } from '../firebase/admin';

export interface StaffLocale {
  name?: string;
  name$meta?: LocaleMeta;
  position?: string;
  position$meta?: LocaleMeta;
  bio?: string;
  bio$meta?: LocaleMeta;
}

export interface LocaleMeta {
  updatedAt: Timestamp;
  engine: 'manual' | 'gpt';
  sourceLocale?: string;
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

export interface StaffLocaleUpsertPayload {
  name?: string;
  position?: string;
  bio?: string;
  engine?: 'manual' | 'gpt';
  sourceLocale?: string;
}

function cloneMeta(meta: LocaleMeta | undefined) {
  if (!meta) return undefined;
  return { ...meta };
}

type FirestoreDoc = FirebaseFirestore.QueryDocumentSnapshot | FirebaseFirestore.DocumentSnapshot;

export class StaffRepository {
  private readonly collection = 'staff';

  private getDb() {
    initAdmin();
    return getFirestore();
  }

  private createFieldMeta(locale: string, payload: StaffLocaleUpsertPayload, timestamp: Timestamp): LocaleMeta {
    const engine = payload.engine ?? 'manual';
    const normalizedLocale = locale.toLowerCase();
    const sourceLocaleRaw = payload.sourceLocale ?? (engine === 'manual' ? normalizedLocale : undefined);
    const sourceLocale = sourceLocaleRaw ? sourceLocaleRaw.toLowerCase() : undefined;
    return { updatedAt: timestamp, engine, sourceLocale };
  }

  private makeLocaleSnapshot(
    locale: string,
    payload: StaffLocaleUpsertPayload,
    timestamp: Timestamp,
  ): StaffLocale {
    const normalized = locale.toLowerCase();
    const meta = this.createFieldMeta(normalized, payload, timestamp);
    const snapshot: StaffLocale = {};
    if (payload.name !== undefined) {
      snapshot.name = payload.name;
      snapshot.name$meta = cloneMeta(meta);
    }
    if (payload.position !== undefined) {
      snapshot.position = payload.position;
      snapshot.position$meta = cloneMeta(meta);
    }
    if (payload.bio !== undefined) {
      snapshot.bio = payload.bio;
      snapshot.bio$meta = cloneMeta(meta);
    }
    return snapshot;
  }

  private makeLocaleUpdate(
    locale: string,
    payload: StaffLocaleUpsertPayload,
    timestamp: Timestamp,
  ): Record<string, unknown> {
    const normalized = locale.toLowerCase();
    const update: Record<string, unknown> = {};
    const meta = this.createFieldMeta(normalized, payload, timestamp);
    const prefix = `locales.${normalized}`;
    if (payload.name !== undefined) {
      update[`${prefix}.name`] = payload.name;
      update[`${prefix}.name$meta`] = cloneMeta(meta);
    }
    if (payload.position !== undefined) {
      update[`${prefix}.position`] = payload.position;
      update[`${prefix}.position$meta`] = cloneMeta(meta);
    }
    if (payload.bio !== undefined) {
      update[`${prefix}.bio`] = payload.bio;
      update[`${prefix}.bio$meta`] = cloneMeta(meta);
    }
    return update;
  }

  private mapDoc(doc: FirestoreDoc): IStaff {
    const raw = doc.data();
    if (!raw) {
      throw new Error(`Staff ${doc.id} is missing data`);
    }
    const locales = (raw.locales as StaffLocales | undefined) || {};
    const primaryLocale = (raw.primaryLocale || Object.keys(locales)[0] || 'en').toLowerCase();
    return {
      id: doc.id,
      email: raw.email,
      primaryLocale,
      locales,
      avatarUrl: raw.avatarUrl,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    };
  }

  async getById(id: string): Promise<IStaff | null> {
    const db = this.getDb();
    const doc = await db.collection(this.collection).doc(id).get();
    if (!doc.exists) return null;
    return this.mapDoc(doc);
  }

  async getFirst(): Promise<IStaff | null> {
    const db = this.getDb();
    const snap = await db.collection(this.collection).limit(1).get();
    if (snap.empty) return null;
    return this.mapDoc(snap.docs[0]);
  }

  async getAll(): Promise<IStaff[]> {
    const db = this.getDb();
    const snap = await db.collection(this.collection).orderBy('createdAt', 'desc').get();
    return snap.docs.map((doc) => this.mapDoc(doc));
  }

  async getByEmail(email: string): Promise<IStaff | null> {
    const db = this.getDb();
    const snap = await db.collection(this.collection).where('email', '==', email).limit(1).get();
    if (snap.empty) return null;
    return this.mapDoc(snap.docs[0]);
  }

  async upsertLocale(id: string, locale: string, payload: StaffLocaleUpsertPayload): Promise<void> {
    const db = this.getDb();
    const ref = db.collection(this.collection).doc(id);
    const timestamp = Timestamp.now();
    const localeUpdate = this.makeLocaleUpdate(locale, payload, timestamp);
    if (Object.keys(localeUpdate).length === 0) return;
    await ref.set({ ...localeUpdate, updatedAt: timestamp }, { merge: true });
  }

  async update(
    id: string,
    updates: Partial<Omit<IStaff, 'id' | 'createdAt' | 'updatedAt' | 'locales'>>,
  ): Promise<void> {
    const db = this.getDb();
    await db.collection(this.collection).doc(id).update({ ...updates, updatedAt: Timestamp.now() });
  }
}

export const staffRepository = new StaffRepository();
