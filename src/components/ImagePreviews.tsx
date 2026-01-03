"use client";

import { ChangeEvent } from "react";

export default function ImagePreviews({
  onChange,
}: {
  onChange: (files: File[], previews: string[]) => void;
}) {
  async function handleFileSelect(e: ChangeEvent<HTMLInputElement>) {
    const { default: heic2any } = await import("heic2any");
    const files = e.target.files ? Array.from(e.target.files) : [];
    const urls: string[] = [];
    for (const file of files) {
      const isHeic =
        /\.heic$/i.test(file.name) ||
        file.type === "image/heic" ||
        file.type === "image/heif";
      if (isHeic) {
        try {
          const output = (await heic2any({
            blob: file,
            toType: "image/jpeg",
            quality: 0.8,
          })) as Blob;
          urls.push(URL.createObjectURL(output));
        } catch (error) {
          console.error(error);
        }
      } else {
        urls.push(URL.createObjectURL(file));
      }
    }
    onChange(files, urls);
  }

  return (
    <label className="inline-block px-4 py-2 bg-emerald-600 text-white rounded-full hover:bg-emerald-500 cursor-pointer transition">
      Choose Images
      <input
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />
    </label>
  );
}
