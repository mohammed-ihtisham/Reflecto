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
 * Generate an image using Google's Gemini native image generation
 * Uses the gemini-2.5-flash-image model via the Gemini API
 *
 * @param {string} prompt - Text description for the image
 * @param {object} options - Optional configuration
 * @returns {Promise<{imageUrl: string, imageBytes: Buffer}>}
 */
export async function geminiGenerateImage({
  prompt,
  model = "gemini-2.5-flash-image",
  numberOfImages = 1,
}) {
  const key = env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY not set");

  const ai = new GoogleGenAI({ apiKey: key });

  console.log("Generating image with prompt:", prompt);

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });

    // Log the response structure for debugging
    console.log("Response structure:", JSON.stringify(response, null, 2));
    console.log("Response type:", typeof response);
    console.log("Response keys:", Object.keys(response || {}));

    // Also check if there's a raw property or different access method
    if (response.raw) {
      console.log(
        "Response.raw structure:",
        JSON.stringify(response.raw, null, 2)
      );
    }

    // Check different possible response structures
    // Structure 1: response.parts (from the example)
    if (response.parts && Array.isArray(response.parts)) {
      for (const part of response.parts) {
        if (part.inlineData) {
          const imageData = part.inlineData.data;
          const mimeType = part.inlineData.mimeType || "image/png";

          const imageBytes = Buffer.from(imageData, "base64");
          const imageUrl = `data:${mimeType};base64,${imageData}`;

          return { imageUrl, imageBytes };
        } else if (part.text) {
          console.warn("Received text instead of image:", part.text);
        }
      }
    }

    // Structure 2: response.candidates[0].content.parts (common Gemini structure)
    if (response.candidates && Array.isArray(response.candidates)) {
      for (const candidate of response.candidates) {
        if (candidate.content?.parts) {
          for (const part of candidate.content.parts) {
            if (part.inlineData) {
              const imageData = part.inlineData.data;
              const mimeType = part.inlineData.mimeType || "image/png";

              const imageBytes = Buffer.from(imageData, "base64");
              const imageUrl = `data:${mimeType};base64,${imageData}`;

              return { imageUrl, imageBytes };
            } else if (part.text) {
              console.warn("Received text instead of image:", part.text);
            }
          }
        }
      }
    }

    // Structure 3: Direct inlineData on response
    if (response.inlineData) {
      const imageData = response.inlineData.data;
      const mimeType = response.inlineData.mimeType || "image/png";

      const imageBytes = Buffer.from(imageData, "base64");
      const imageUrl = `data:${mimeType};base64,${imageData}`;

      return { imageUrl, imageBytes };
    }

    // If we get here, log the full response for debugging
    console.error(
      "Unexpected response structure. Full response:",
      JSON.stringify(response, null, 2)
    );
    throw new Error(
      "No image data found in response. Check logs for response structure."
    );
  } catch (error) {
    console.error("Image generation error:", error);
    throw new Error(`Image generation failed: ${error.message}`);
  }
}
