import { NextRequest, NextResponse } from 'next/server';
import { translationRepository } from '@/repositories/TranslationRepository';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ locale: string }> }
) {
  try {
    const { locale } = await params;

    if (!locale) {
      return NextResponse.json(
        { error: 'Locale is required' },
        { status: 400 }
      );
    }

    // Fetch translations from Firebase Storage
    const translations = await translationRepository.getTranslations(locale);

    // Return with caching headers
    return NextResponse.json(translations, {
      headers: {
        'Cache-Control': 'public, max-age=300, s-maxage=300',
      },
    });
  } catch (error) {
    console.error(`[API /translations] Error:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch translations' },
      { status: 500 }
    );
  }
}
