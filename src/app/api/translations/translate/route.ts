import { NextRequest, NextResponse } from 'next/server';
import { translationRepository } from '@/repositories/TranslationRepository';
import { TranslationService } from '@/services/TranslationService';

export async function POST(req: NextRequest) {
  try {
    const { key, text, targetLocale, sourceLocale = 'en' } = await req.json();

    if (!key || !text || !targetLocale) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if translation already exists
    const existing = await translationRepository.getTranslation(targetLocale, key);
    if (existing) {
      return NextResponse.json({ translation: existing.text });
    }

    // Translate using GPT
    const translation = await TranslationService.translateText({
      text,
      from: sourceLocale,
      to: targetLocale,
    });

    // If translation is undefined, fallback to original text
    const finalTranslation = translation || text;

    // Save to storage
    await translationRepository.upsertTranslation(
      targetLocale,
      key,
      finalTranslation,
      {
        engine: 'gpt',
        sourceLocale,
        updatedAt: new Date().toISOString(),
      }
    );

    return NextResponse.json({ translation: finalTranslation });
  } catch (error) {
    console.error('[API /translations/translate] Error:', error);
    return NextResponse.json(
      { error: 'Translation failed' },
      { status: 500 }
    );
  }
}
