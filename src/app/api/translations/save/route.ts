import { NextRequest, NextResponse } from 'next/server';
import { translationRepository, TranslationMeta } from '@/repositories/TranslationRepository';

export async function POST(req: NextRequest) {
  try {
    const { locale, key, text, meta } = await req.json();

    if (!locale || !key || !text || !meta) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    await translationRepository.upsertTranslation(locale, key, text, meta as TranslationMeta);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API /translations/save] Error:', error);
    return NextResponse.json(
      { error: 'Failed to save translation' },
      { status: 500 }
    );
  }
}
