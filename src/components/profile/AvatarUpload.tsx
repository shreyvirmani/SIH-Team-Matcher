"use client";

import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function AvatarUpload({
  userId,
  currentUrl,
  onUploaded,
}: {
  userId: string;
  currentUrl?: string | null;
  onUploaded: (url: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState<string | null>(currentUrl || null);
  const inputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const handleFile = async (file: File) => {
    setError("");
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file");
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      setError("Image must be under 3MB");
      return;
    }

    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      // Path is prefixed with the user's own uid — required by the storage
      // RLS policy in schema.postgres.sql (avatar_owner_write).
      const path = `${userId}/avatar-${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage.from("avatars").upload(path, file, {
        cacheControl: "3600",
        upsert: true,
      });
      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      setPreview(data.publicUrl);
      onUploaded(data.publicUrl);
    } catch (err: any) {
      setError(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <div
        className="group relative h-20 w-20 cursor-pointer overflow-hidden rounded-full border-2 border-indigo-400/40 bg-slate-800 shadow-[0_0_20px_-4px_rgba(99,102,241,0.6)]"
        onClick={() => inputRef.current?.click()}
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="Avatar preview" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-2xl text-indigo-300">+</div>
        )}
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
          {uploading ? "…" : "Change"}
        </div>
      </div>
      <div>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="text-sm font-medium text-indigo-300 hover:text-indigo-200"
          disabled={uploading}
        >
          {uploading ? "Uploading…" : "Upload profile photo"}
        </button>
        <p className="text-xs text-slate-400">PNG or JPG, up to 3MB</p>
        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
    </div>
  );
}
