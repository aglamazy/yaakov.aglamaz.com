/**
 * TranslationRepository - manages translations in Firebase Storage as JSON files
 *
 * Structure: gs://bucket/translations/{locale}.json
 *
 * Each JSON file contains:
 * {
 *   "key": {
 *     "text": "translated text",
 *     "meta": {
 *       "engine": "auto-expand" | "gpt" | "manual",
 *       "sourceLocale": "en",
 *       "updatedAt": timestamp
 *     }
 *   }
 * }
 */

import { getStorage } from 'firebase-admin/storage';
import { initAdmin } from '@/firebase/admin';
import { Timestamp } from 'firebase-admin/firestore';

export interface TranslationMeta {
  engine: 'auto-expand' | 'gpt' | 'manual';
  sourceLocale?: string;
  updatedAt: string;
}

export interface TranslationEntry {
  text: string;
  meta: TranslationMeta;
}

export type TranslationsMap = Record<string, TranslationEntry>;

export class TranslationRepository {
  private readonly bucketName: string | undefined;
  private readonly basePath = 'translations';

  constructor(bucketName?: string) {
    this.bucketName = bucketName || process.env.FIREBASE_STORAGE_BUCKET;
  }

  private getBucket() {
    initAdmin();
    // If bucketName is provided, use it; otherwise use default bucket from admin config
    if (this.bucketName) {
      return getStorage().bucket(this.bucketName);
    }
    return getStorage().bucket();
  }

  private getFilePath(locale: string): string {
    return `${this.basePath}/${locale}.json`;
  }

  /**
   * Fetch all translations for a locale from Firebase Storage
   * Creates empty file on first access (pay latency once)
   */
  async getTranslations(locale: string): Promise<TranslationsMap> {
    try {
      const bucket = this.getBucket();
      const file = bucket.file(this.getFilePath(locale));

      const [exists] = await file.exists();
      if (!exists) {
        // Create empty file on first access - translations will be added JIT as needed
        await this.saveTranslations(locale, {});
        return {};
      }

      const [contents] = await file.download();
      const translations = JSON.parse(contents.toString('utf-8'));
      return translations;
    } catch (error) {
      console.error(`[TranslationRepository] Failed to fetch translations for ${locale}:`, error);
      return {};
    }
  }

  /**
   * Save translations for a locale to Firebase Storage
   */
  async saveTranslations(locale: string, translations: TranslationsMap): Promise<void> {
    try {
      const bucket = this.getBucket();
      const file = bucket.file(this.getFilePath(locale));

      const content = JSON.stringify(translations, null, 2);
      await file.save(content, {
        contentType: 'application/json',
        metadata: {
          cacheControl: 'public, max-age=300', // 5 minutes cache
        },
      });

      console.log(`[TranslationRepository] Saved translations for ${locale}`);
    } catch (error) {
      console.error(`[TranslationRepository] Failed to save translations for ${locale}:`, error);
      throw error;
    }
  }

  /**
   * Add or update a single translation key
   */
  async upsertTranslation(
    locale: string,
    key: string,
    text: string,
    meta: TranslationMeta
  ): Promise<void> {
    const translations = await this.getTranslations(locale);
    translations[key] = { text, meta };
    await this.saveTranslations(locale, translations);
  }

  /**
   * Get a single translation key
   */
  async getTranslation(locale: string, key: string): Promise<TranslationEntry | null> {
    const translations = await this.getTranslations(locale);
    return translations[key] || null;
  }

  /**
   * Check if a translation key exists
   */
  async hasTranslation(locale: string, key: string): Promise<boolean> {
    const translation = await this.getTranslation(locale, key);
    return translation !== null;
  }

  /**
   * Delete a translation key
   */
  async deleteTranslation(locale: string, key: string): Promise<void> {
    const translations = await this.getTranslations(locale);
    delete translations[key];
    await this.saveTranslations(locale, translations);
  }

  /**
   * Get all translation keys for a locale
   */
  async getKeys(locale: string): Promise<string[]> {
    const translations = await this.getTranslations(locale);
    return Object.keys(translations);
  }
}

export const translationRepository = new TranslationRepository();
