import { json } from '@sveltejs/kit';
import { geminiGenerateImage } from '$lib/gemini.js';
import { getSession } from '$lib/auth/session.js';
import { User } from '$lib/db/models/User.js';

/**
 * Generate a single comic panel image from a prompt
 * 
 * POST /api/snapshot/image
 * Body: { prompt: string }
 * Returns: { imageUrl: string }
 */
export async function POST({ request }) {
  const body = await request.json();
  let prompt = (body?.prompt || '').trim();

  if (!prompt) {
    return json({ error: 'prompt is required' }, { status: 400 });
  }

  try {
    // Get user's depiction description if authenticated
    let userDepictionDescription = '';
    try {
      const session = await getSession(request);
      if (session && session.userId) {
        const user = await User.findById(session.userId);
        if (user && user.depictionDescription) {
          userDepictionDescription = user.depictionDescription.trim();
        }
      }
    } catch (err) {
      console.warn('Could not fetch user depiction description:', err);
    }

    // Append user's depiction description to the prompt if available
    if (userDepictionDescription) {
      prompt = `${prompt} The main character should look like this: ${userDepictionDescription}.`;
    }

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


