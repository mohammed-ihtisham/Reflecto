import { env } from "$env/dynamic/private";
import { GoogleGenAI } from "@google/genai";

export function hasGemini(overrideKey) {
  return Boolean(overrideKey || env.GEMINI_API_KEY);
}

export async function geminiGenerate({
  contents,
  systemPrompt = "",
  config = {},
}) {
  const key = env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY not set");

  const ai = new GoogleGenAI({ apiKey: key });
  if (systemPrompt) {
    config.systemInstruction = {
      role: "model",
      parts: [{ text: systemPrompt }],
    };
  }

  const request = {
    model: "gemini-2.5-flash",
    contents: contents,
    config: config,
  };

  const response = await ai.models.generateContent(request);
  const text = typeof response?.text === "string" ? response.text : "";
  return { text, raw: response };
}

/**
 * Generate an image using Google's Imagen 4 model via REST API
 * @param {string} prompt - Text description for the image
 * @param {object} options - Optional configuration
 * @returns {Promise<{imageUrl: string, imageBytes: Buffer}>}
 */
export async function geminiGenerateImage({
  prompt,
  model = "imagen-4.0-generate-001",
  numberOfImages = 1,
}) {
  const key = env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY not set");

  // Use REST API directly for Imagen models
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateImages?key=${key}`;

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: prompt,
        number_of_images: numberOfImages,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Imagen API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();

    if (data?.generated_images && data.generated_images.length > 0) {
      const image = data.generated_images[0];
      // Image data might be in different formats depending on API version
      let imageBytes;
      let base64;

      if (image.image?.image_bytes) {
        // Binary format
        imageBytes = Buffer.from(image.image.image_bytes, "base64");
        base64 = image.image.image_bytes;
      } else if (image.image_bytes) {
        imageBytes = Buffer.from(image.image_bytes, "base64");
        base64 = image.image_bytes;
      } else if (image.base64) {
        imageBytes = Buffer.from(image.base64, "base64");
        base64 = image.base64;
      } else {
        throw new Error("Unexpected image format in response");
      }

      const imageUrl = `data:image/png;base64,${base64}`;
      return { imageUrl, imageBytes };
    }

    throw new Error("No images generated in response");
  } catch (error) {
    console.error("Image generation error:", error);
    throw new Error(`Image generation failed: ${error.message}`);
  }
}
