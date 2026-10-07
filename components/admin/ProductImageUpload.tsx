"use client";

import Image from "next/image";
import { useState } from "react";

import { createClient } from "@/lib/supabase/client";

interface ProductImageUploadProps {
  currentImage?: string | null;
  name?: string;
}

export default function ProductImageUpload({
  currentImage,
  name = "image",
}: ProductImageUploadProps) {
  const [preview, setPreview] = useState(currentImage ?? "");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setError("");

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be smaller than 5 MB.");
      return;
    }

    try {
      setUploading(true);

      const supabase = createClient();

      const fileExtension =
        file.name.split(".").pop()?.toLowerCase() || "jpg";

      const filePath = `products/${crypto.randomUUID()}.${fileExtension}`;

      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        throw uploadError;
      }

      const {
        data: { publicUrl },
      } = supabase.storage
        .from("product-images")
        .getPublicUrl(filePath);

      setPreview(publicUrl);
    } catch (error) {
      console.error("Image upload failed:", error);
      setError("Failed to upload image. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <label className="text-sm font-medium text-[#302324]">
        Product Image
      </label>

      <input
        type="hidden"
        name={name}
        value={preview}
        readOnly
      />

      <div className="mt-2 overflow-hidden rounded-2xl border border-[#E7DDDD] bg-[#FCF9F9]">
        {preview ? (
          <div className="relative aspect-square w-full max-w-sm">
            <Image
              src={preview}
              alt="Product preview"
              fill
              className="object-cover"
            />
          </div>
        ) : (
          <div className="flex aspect-square max-w-sm items-center justify-center">
            <p className="text-sm text-[#7A6B6D]">
              No image selected
            </p>
          </div>
        )}

        <div className="border-t border-[#E7DDDD] p-4">
          <label className="inline-flex cursor-pointer rounded-full bg-[#302324] px-5 py-3 text-sm font-semibold text-white hover:bg-[#211819]">
            {uploading ? "Uploading..." : "Choose Image"}

            <input
              type="file"
              accept="image/*"
              onChange={handleUpload}
              disabled={uploading}
              className="hidden"
            />
          </label>

          <p className="mt-3 text-xs text-[#7A6B6D]">
            JPG, PNG, WebP or other image formats. Maximum 5 MB.
          </p>

          {error && (
            <p className="mt-2 text-sm text-red-600">
              {error}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}