import { json } from "@sveltejs/kit";
import { getSession } from "$lib/auth/session.js";
import { uploadImagesToGCS, generateComicImagePath } from "$lib/storage/gcs.js";

/**
 * Upload comic images to GCS
 * POST /api/journal/upload-images
 * Body: { date: string, images: Array<{imageData: string, panelIndex: number}> }
 * Returns: { urls: Array<string> }
 */
export async function POST({ request }) {
  try {
    const session = await getSession(request);

    if (!session || !session.userId) {
      return json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    const { date, images } = body;

    if (!date) {
      return json({ error: "Date is required" }, { status: 400 });
    }

    if (!Array.isArray(images) || images.length === 0) {
      return json({ error: "Images array is required" }, { status: 400 });
    }

    const entryDate = new Date(date);
    if (isNaN(entryDate.getTime())) {
      return json({ error: "Invalid date format" }, { status: 400 });
    }

    // Prepare images for upload
    const imagesToUpload = images.map(({ imageData, panelIndex }) => {
      if (!imageData) {
        throw new Error(`Missing imageData for panel ${panelIndex}`);
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

      return {
        imageData: base64Data,
        fileName,
        mimeType,
      };
    });

    // Upload all images to GCS
    const uploadResults = await uploadImagesToGCS(imagesToUpload);

    // Return URLs in the same order as panel indices
    const urls = uploadResults
      .sort((a, b) => {
        // Extract panel index from fileName to sort
        const indexA = parseInt(a.fileName.match(/panel-(\d+)/)?.[1] || "0");
        const indexB = parseInt(b.fileName.match(/panel-(\d+)/)?.[1] || "0");
        return indexA - indexB;
      })
      .map((result) => result.url);

    return json({
      success: true,
      urls,
    });
  } catch (error) {
    console.error("Upload images error:", error);
    return json(
      { error: error.message || "Failed to upload images" },
      { status: 500 }
    );
  }
}
