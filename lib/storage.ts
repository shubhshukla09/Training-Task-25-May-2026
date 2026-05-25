import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

/**
 * Clean filename to be URL-safe
 */
function cleanFilename(originalName: string): string {
  const ext = path.extname(originalName).toLowerCase();
  const base = path.basename(originalName, ext)
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-");
  
  // Append a unique short hash to avoid duplicate collision overrides
  const hash = crypto.randomBytes(4).toString("hex");
  return `${base}-${hash}${ext}`;
}

export const storage = {
  /**
   * Upload image with automatic Cloudinary API or local filesystem fallback
   */
  async uploadImage(buffer: Buffer, originalName: string): Promise<string> {
    const cloudName = process.env.CLOUDINARY_NAME;
    const apiKey = process.env.CLOUDINARY_KEY;
    const apiSecret = process.env.CLOUDINARY_SECRET;

    if (cloudName && apiKey && apiSecret) {
      try {
        console.log("☁ Uploading to Cloudinary...");
        // Cloudinary uploads can be done via raw HTTP POST to keep dependencies light and bulletproof
        const timestamp = Math.floor(Date.now() / 1000).toString();
        
        // Generate signature
        const signatureString = `timestamp=${timestamp}${apiSecret}`;
        const signature = crypto
          .createHash("sha1")
          .update(signatureString)
          .digest("hex");

        const formData = new FormData();
        formData.append("file", new Blob([new Uint8Array(buffer)]));
        formData.append("api_key", apiKey);
        formData.append("timestamp", timestamp);
        formData.append("signature", signature);

        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
          {
            method: "POST",
            body: formData,
          }
        );

        if (response.ok) {
          const json = await response.json();
          console.log("✔ Cloudinary upload success:", json.secure_url);
          return json.secure_url as string;
        } else {
          const errMsg = await response.text();
          console.warn("⚠️ Cloudinary returned error status, falling back to local storage:", errMsg);
        }
      } catch (err) {
        console.warn("⚠️ Cloudinary upload request failed. Falling back to local storage:", err);
      }
    }

    // LOCAL FILESYSTEM FALLBACK
    try {
      console.log("💾 Cloudinary keys not found. Uploading to local filesystem...");
      const cleanName = cleanFilename(originalName);
      
      // Target directory in Next.js public uploads
      const uploadsDir = path.join(process.cwd(), "public", "uploads");
      
      // Ensure the recursive uploads folder path exists
      await fs.mkdir(uploadsDir, { recursive: true });
      
      const filePath = path.join(uploadsDir, cleanName);
      await fs.writeFile(filePath, buffer);

      console.log("✔ Local file upload success:", `/uploads/${cleanName}`);
      return `/uploads/${cleanName}`;
    } catch (err) {
      console.error("❌ Both Cloudinary and local file system uploads failed:", err);
      throw new Error("Image upload failed");
    }
  }
};
