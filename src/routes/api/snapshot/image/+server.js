import { json } from '@sveltejs/kit';
import { geminiGenerateImage } from '$lib/gemini.js';

/**
 * Generate a single comic panel image from a prompt
 * 
 * POST /api/snapshot/image
 * Body: { prompt: string }
 * Returns: { imageUrl: string }
 */
export async function POST({ request }) {
  const body = await request.json();
  const prompt = (body?.prompt || '').trim();

  if (!prompt) {
    return json({ error: 'prompt is required' }, { status: 400 });
  }

  try {
    const { imageUrl } = await geminiGenerateImage({
      prompt,
      model: 'gemini-2.5-flash-image',
      numberOfImages: 1
    });

    return json({ imageUrl, success: true });
  } catch (err) {
    console.error('Panel image generation failed:', err);
    return json({ error: 'Image generation failed', details: String(err?.message || err) }, { status: 500 });
  }
}


