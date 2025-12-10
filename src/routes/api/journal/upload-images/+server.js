import { json } from "@sveltejs/kit";
import { getSession } from "$lib/auth/session.js";
import { uploadImageToGCS, generateComicImagePath } from "$lib/storage/gcs.js";

/**
 * Upload a single comic image to GCS
 * POST /api/journal/upload-images
 * Body: { date: string, imageData: string, panelIndex: number }
 * Returns: { url: string }
 */
export async function POST({ request }) {
  try {
    const session = await getSession(request);

    if (!session || !session.userId) {
      return json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    const { date, imageData, panelIndex } = body;

    if (!date) {
      return json({ error: "Date is required" }, { status: 400 });
    }

    if (!imageData) {
      return json({ error: "imageData is required" }, { status: 400 });
    }

    if (typeof panelIndex !== "number" || panelIndex < 0) {
      return json({ error: "Valid panelIndex is required" }, { status: 400 });
    }

    const entryDate = new Date(date);
    if (isNaN(entryDate.getTime())) {
      return json({ error: "Invalid date format" }, { status: 400 });
    }

    // Extract base64 data and mime type from data URL
    let base64Data = imageData;
    let mimeType = "image/png";

    if (imageData.startsWith("data:")) {
      const [header, data] = imageData.split(",");
      base64Data = data;
      const mimeMatch = header.match(/data:([^;]+)/);
      if (mimeMatch) {
        mimeType = mimeMatch[1];
      }
    }

    const fileName = generateComicImagePath(
      session.userId,
      entryDate,
      panelIndex
    );

    // Upload single image to GCS
    const url = await uploadImageToGCS(base64Data, fileName, mimeType);

    return json({
      success: true,
      url,
    });
  } catch (error) {
    console.error("Upload image error:", error);
    return json(
      { error: error.message || "Failed to upload image" },
      { status: 500 }
    );
  }
}
