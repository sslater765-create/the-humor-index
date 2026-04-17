import { NextResponse } from 'next/server';
import { generateNewsletterContent, createBeehiivDraft, getNextFriday9amET } from '@/lib/newsletter';

export const dynamic = 'force-dynamic';

async function handleGenerate(request: Request) {
  // Verify cron secret to prevent unauthorized calls
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Generate newsletter content from site data
    const content = await generateNewsletterContent();

    // Schedule for next Friday at 9am ET
    const scheduledFor = getNextFriday9amET();

    // Create draft in Beehiiv
    const draft = await createBeehiivDraft(content, scheduledFor);

    return NextResponse.json({
      success: true,
      draft: {
        id: draft.id,
        title: draft.title,
        status: draft.status,
        web_url: draft.web_url,
        scheduled_for: scheduledFor,
      },
    });
  } catch (error) {
    console.error('Newsletter generation failed:', error);
    return NextResponse.json(
      { error: 'Failed to generate newsletter', details: String(error) },
      { status: 500 }
    );
  }
}

// Vercel cron jobs send GET requests
export async function GET(request: Request) {
  return handleGenerate(request);
}

// Allow manual POST triggers too
export async function POST(request: Request) {
  return handleGenerate(request);
}
