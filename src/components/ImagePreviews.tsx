"use client";

import { ChangeEvent } from "react";

type ImageCompressionOptions = {
  maxWidthOrHeight?: number;
  maxSizeMB?: number;
  useWebWorker?: boolean;
  [key: string]: unknown;
};

export default function ImagePreviews({
  onChange,
}: {
  onChange: (files: File[], previews: string[]) => void;
}) {
  async function handleFileSelect(e: ChangeEvent<HTMLInputElement>) {
    const { default: heic2any } = await import("heic2any");
    const imageCompression = (await import("browser-image-compression"))
      .default as (
      file: File | Blob,
      options?: ImageCompressionOptions
    ) => Promise<File | Blob>;

    const inputFiles = e.target.files ? Array.from(e.target.files) : [];
    const compressedFiles: File[] = [];
    const urls: string[] = [];

    for (const file of inputFiles) {
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
          const jpg = new File(
            [output],
            file.name.replace(/\.[^.]+$/, ".jpg"),
            { type: "image/jpeg" }
          );
          const compressed = await imageCompression(jpg, {
            maxWidthOrHeight: 1600,
            maxSizeMB: 1,
            useWebWorker: true,
          });
          const finalFile =
            compressed instanceof File
              ? compressed
              : new File([compressed], jpg.name, {
                  type: (compressed as Blob).type,
                });
          compressedFiles.push(finalFile);
          urls.push(URL.createObjectURL(finalFile));
        } catch (error) {
          console.error(error);
        }
      } else {
        try {
          const compressed = await imageCompression(file, {
            maxWidthOrHeight: 1600,
            maxSizeMB: 1,
            useWebWorker: true,
          });
          const finalFile =
            compressed instanceof File
              ? compressed
              : new File([compressed], file.name, {
                  type: (compressed as Blob).type,
                });
          compressedFiles.push(finalFile);
          urls.push(URL.createObjectURL(finalFile));
        } catch (err) {
          console.error("Compression failed, falling back to original", err);
          compressedFiles.push(file);
          urls.push(URL.createObjectURL(file));
        }
      }
    }

    onChange(compressedFiles, urls);
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
