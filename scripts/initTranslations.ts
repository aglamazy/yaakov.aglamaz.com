/**
 * Initialize empty translation files in Firebase Storage
 * Run with: npx tsx scripts/initTranslations.ts
 */

import { translationRepository } from '../src/repositories/TranslationRepository';

const LOCALES = ['he', 'en', 'tr', 'ar'];

async function initTranslations() {
  console.log('Initializing translation files in Firebase Storage...');

  for (const locale of LOCALES) {
    try {
      // Check if file already exists
      const existing = await translationRepository.getTranslations(locale);

      if (Object.keys(existing).length > 0) {
        console.log(`✓ ${locale}.json already exists with ${Object.keys(existing).length} keys`);
        continue;
      }

      // Create empty file
      await translationRepository.saveTranslations(locale, {});
      console.log(`✓ Created empty ${locale}.json`);
    } catch (error) {
      console.error(`✗ Failed to initialize ${locale}.json:`, error);
    }
  }

  console.log('Done!');
}

initTranslations().catch(console.error);
