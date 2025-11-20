import { NextRequest } from 'next/server';
import { TranslationService } from '@/services/TranslationService';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { key, text, targetLocale, sourceLocale } = await req.json();

    if (!text || !targetLocale || !sourceLocale) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!TranslationService.isEnabled()) {
      return Response.json({ error: 'Translation service disabled' }, { status: 503 });
    }

    const translation = await TranslationService.translateText({
      text,
      from: sourceLocale,
      to: targetLocale,
    });

    return Response.json({ translation });
  } catch (error) {
    console.error('[translate API] Translation failed:', error);
    return Response.json({ error: 'Failed to translate' }, { status: 500 });
  }
}
