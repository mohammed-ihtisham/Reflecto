import { json } from '@sveltejs/kit';
import { geminiGenerate, geminiGenerateImage } from '$lib/gemini.js';

/**
 * Generate a comic-style snapshot from conversation history
 * 
 * POST /api/snapshot
 * Body: { history: Array<{role: string, content: string}> }
 * Returns: { imageUrl: string, summary: string, panels: Array<{prompt: string, imageUrl: string}> }
 */
export async function POST({ request }) {
  const body = await request.json();
  const { history } = body || {};

  if (!Array.isArray(history) || history.length === 0) {
    return json({ error: 'history array is required' }, { status: 400 });
  }

  try {
    // Step 1: Generate a summary and comic panel descriptions from the conversation
    const summaryPrompt = `Based on this journaling conversation, create a comic-style "snapshot of the day" with 4-6 panels.
    
    Analyze the conversation and identify:
    1. Key moments, emotions, or themes
    2. Visual scenes that would work well as comic panels
    3. The overall mood and tone
    
    Generate a JSON response with:
    - summary: A brief 2-3 sentence summary of the day
    - panels: An array of 4-6 panel descriptions, each with:
      - title: A short title for the panel (2-4 words)
      - prompt: A detailed image generation prompt in comic book style (include "comic book style", "comic panel", "vibrant colors", "dynamic lines")
      - mood: The emotional tone (e.g., "joyful", "reflective", "challenging", "peaceful")
    
    Make the prompts vivid and specific, suitable for generating comic-style illustrations.`;

    const contents = history.map((m) => ({ 
      role: m.role === 'user' ? 'user' : 'model', 
      parts: [{ text: m.content }] 
    }));

    const summaryResult = await geminiGenerate({
      contents,
      systemPrompt: summaryPrompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'OBJECT',
          properties: {
            summary: { type: 'STRING' },
            panels: {
              type: 'ARRAY',
              items: {
                type: 'OBJECT',
                properties: {
                  title: { type: 'STRING' },
                  prompt: { type: 'STRING' },
                  mood: { type: 'STRING' }
                },
                required: ['title', 'prompt', 'mood']
              }
            }
          },
          required: ['summary', 'panels']
        }
      }
    });

    let snapshotData;
    try {
      snapshotData = JSON.parse(summaryResult.text);
    } catch (e) {
      // Fallback if JSON parsing fails
      snapshotData = {
        summary: 'A day of reflection and growth.',
        panels: [
          {
            title: 'Morning Thoughts',
            prompt: 'comic book style illustration of a person reflecting in the morning, vibrant colors, comic panel, dynamic lines',
            mood: 'reflective'
          },
          {
            title: 'Daily Moments',
            prompt: 'comic book style illustration of everyday moments, vibrant colors, comic panel, dynamic lines',
            mood: 'neutral'
          }
        ]
      };
    }

    // Step 2: Generate images for each panel
    const panels = [];
    for (const panel of snapshotData.panels || []) {
      try {
        const { imageUrl } = await geminiGenerateImage({
          prompt: panel.prompt,
          model: 'gemini-2.5-flash-image',
          numberOfImages: 1
        });
        
        panels.push({
          title: panel.title,
          imageUrl: imageUrl,
          mood: panel.mood
        });
      } catch (error) {
        console.error(`Failed to generate image for panel "${panel.title}":`, error);
        // Continue with other panels even if one fails
        panels.push({
          title: panel.title,
          imageUrl: null,
          mood: panel.mood,
          error: 'Image generation failed'
        });
      }
    }

    return json({
      summary: snapshotData.summary || 'A day of reflection.',
      panels: panels,
      success: true
    });

  } catch (err) {
    const msg = String(err?.message || err || '').toLowerCase();
    if (msg.includes('gemini_api_key') || msg.includes('gemini') || msg.includes('api key')) {
      return json({ error: 'Gemini API key not found' }, { status: 400 });
    }
    console.error('Snapshot generation error:', err);
    return json({ 
      error: 'Snapshot generation failed', 
      details: String(err?.message || err) 
    }, { status: 500 });
  }
}

