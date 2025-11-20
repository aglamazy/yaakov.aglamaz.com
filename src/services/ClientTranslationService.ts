/**
 * Client-side translation service
 * Fetches translations from Firebase Storage and handles auto-expansion + GPT translation
 */

import { expandCamelCaseWithExceptions } from '@/utils/camelCaseExpander';

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

class ClientTranslationService {
  private cache: Map<string, TranslationsMap> = new Map();
  private pendingFetches: Map<string, Promise<TranslationsMap>> = new Map();
  private pendingTranslations: Map<string, Promise<string>> = new Map();

  /**
   * Get the API URL for translations (proxied through Next.js API to avoid CORS)
   */
  private getTranslationUrl(locale: string): string {
    return `/api/translations/${locale}`;
  }

  /**
   * Fetch translations from Firebase Storage with caching
   */
  async fetchTranslations(locale: string): Promise<TranslationsMap> {
    // Return cached if available
    if (this.cache.has(locale)) {
      return this.cache.get(locale)!;
    }

    // Return pending fetch if already in progress
    if (this.pendingFetches.has(locale)) {
      return this.pendingFetches.get(locale)!;
    }

    // Start new fetch
    const fetchPromise = (async () => {
      try {
        const url = this.getTranslationUrl(locale);
        const response = await fetch(url, {
          cache: 'default', // Use browser cache with max-age from Storage
        });

        if (!response.ok) {
          if (response.status === 404) {
            console.log(`[ClientTranslationService] No translation file for ${locale}, starting with empty`);
            return {};
          }
          throw new Error(`HTTP ${response.status}`);
        }

        const translations: TranslationsMap = await response.json();
        this.cache.set(locale, translations);
        return translations;
      } catch (error) {
        console.error(`[ClientTranslationService] Failed to fetch translations for ${locale}:`, error);
        return {};
      } finally {
        this.pendingFetches.delete(locale);
      }
    })();

    this.pendingFetches.set(locale, fetchPromise);
    return fetchPromise;
  }

  /**
   * Get a translation, with auto-expand fallback for English
   */
  async getTranslation(locale: string, key: string): Promise<string> {
    const translations = await this.fetchTranslations(locale);

    // If translation exists, return it
    if (translations[key]) {
      return translations[key].text;
    }

    // For English: auto-expand camelCase
    if (locale === 'en') {
      const expanded = expandCamelCaseWithExceptions(key);
      // Save the auto-expanded translation
      this.saveTranslationToBackend(locale, key, expanded, {
        engine: 'auto-expand',
        updatedAt: new Date().toISOString(),
      });
      return expanded;
    }

    // For other locales: request GPT translation from English
    return this.requestGPTTranslation(locale, key);
  }

  /**
   * Request GPT translation from backend
   */
  private async requestGPTTranslation(locale: string, key: string): Promise<string> {
    const cacheKey = `${locale}:${key}`;

    // Return pending translation if already in progress
    if (this.pendingTranslations.has(cacheKey)) {
      return this.pendingTranslations.get(cacheKey)!;
    }

    const translationPromise = (async () => {
      try {
        // First, get the English version (which will auto-expand if needed)
        const englishText = await this.getTranslation('en', key);

        // Request translation from backend
        const response = await fetch('/api/translations/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            key,
            text: englishText,
            targetLocale: locale,
            sourceLocale: 'en',
          }),
        });

        if (!response.ok) {
          throw new Error(`Translation API error: ${response.status}`);
        }

        const { translation } = await response.json();

        // Update cache
        const translations = this.cache.get(locale) || {};
        translations[key] = {
          text: translation,
          meta: {
            engine: 'gpt',
            sourceLocale: 'en',
            updatedAt: new Date().toISOString(),
          },
        };
        this.cache.set(locale, translations);

        return translation;
      } catch (error) {
        console.error(`[ClientTranslationService] GPT translation failed for ${locale}:${key}:`, error);
        // Fallback: return English auto-expand
        return expandCamelCaseWithExceptions(key);
      } finally {
        this.pendingTranslations.delete(cacheKey);
      }
    })();

    this.pendingTranslations.set(cacheKey, translationPromise);
    return translationPromise;
  }

  /**
   * Save a translation to the backend (fire and forget)
   */
  private saveTranslationToBackend(
    locale: string,
    key: string,
    text: string,
    meta: TranslationMeta
  ): void {
    // Fire and forget - don't await
    fetch('/api/translations/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ locale, key, text, meta }),
    }).catch(error => {
      console.error(`[ClientTranslationService] Failed to save translation:`, error);
    });
  }

  /**
   * Clear cache for a locale (useful for admin editing)
   */
  clearCache(locale?: string): void {
    if (locale) {
      this.cache.delete(locale);
    } else {
      this.cache.clear();
    }
  }

  /**
   * Preload translations for a locale
   */
  async preload(locale: string): Promise<void> {
    await this.fetchTranslations(locale);
  }
}

export const clientTranslationService = new ClientTranslationService();
