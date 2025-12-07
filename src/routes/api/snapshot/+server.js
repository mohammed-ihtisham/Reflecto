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
  const { history, reflectionText } = body || {};
  const requestedPanelCount = Number.isInteger(body?.panelCount) ? body.panelCount : undefined;
  const layoutDescription = (body?.layoutDescription || '').trim();
  const randomDefaultPanelCount = Math.floor(Math.random() * 3) + 4; // 4-6 panels by default
  const normalizedPanelCount = Math.min(Math.max(requestedPanelCount ?? randomDefaultPanelCount, 1), 8);
  const generateImages = body?.generateImages !== false;
  const cleanReflection = (reflectionText || '').trim();
  const baseHistory = Array.isArray(history) ? history : [];
  const combinedHistory = cleanReflection
    ? [...baseHistory, { role: 'user', content: `Reflection: ${cleanReflection}` }]
    : baseHistory;

  if (combinedHistory.length === 0) {
    return json({ error: 'history or reflection text is required' }, { status: 400 });
  }

  try {
    // Step 1: Generate a summary and comic panel descriptions from the conversation
    const summaryPrompt = `Based on this journaling conversation, create a comic-style "snapshot of the day" with exactly ${normalizedPanelCount} panels.
    
    Analyze the conversation and identify:
    1. Key moments, emotions, or themes
    2. Visual scenes that would work well as comic panels
    3. The overall mood and tone
    
    Generate a JSON response with:
    - summary: A brief 2-3 sentence summary of the day
    - panels: An array of ${normalizedPanelCount} panel descriptions, each with:
      - title: A short title for the panel (2-4 words)
      - prompt: A detailed image generation prompt in comic book style (include "comic book style", "comic panel", "vibrant colors", "dynamic lines")
      - mood: The emotional tone (e.g., "joyful", "reflective", "challenging", "peaceful")
    
    Make the prompts vivid and specific, suitable for generating comic-style illustrations.${layoutDescription ? ` Layout info: ${layoutDescription}.` : ''}`;

    const contents = combinedHistory.map((m) => ({ 
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

    // Step 2: Optionally generate images for each panel
    const panelSources = (snapshotData.panels || []).slice(0, normalizedPanelCount);
    if (!generateImages) {
      return json({
        summary: snapshotData.summary || 'A day of reflection.',
        panels: panelSources.map((panel) => ({
          title: panel.title,
          imageUrl: null,
          mood: panel.mood,
          description: panel.prompt
        })),
        success: true
      });
    }

    const panels = [];
    for (const panel of panelSources) {
      try {
        const { imageUrl } = await geminiGenerateImage({
          prompt: panel.prompt,
          model: 'gemini-2.5-flash-image',
          numberOfImages: 1
        });
        
        panels.push({
          title: panel.title,
          imageUrl: imageUrl,
          mood: panel.mood,
          description: panel.prompt
        });
      } catch (error) {
        console.error(`Failed to generate image for panel "${panel.title}":`, error);
        // Continue with other panels even if one fails
        panels.push({
          title: panel.title,
          imageUrl: null,
          mood: panel.mood,
          description: panel.prompt,
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

