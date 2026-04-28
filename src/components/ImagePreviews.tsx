"use client";

import { useState, type ChangeEvent, type DragEvent } from "react";

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
  const [isDragging, setIsDragging] = useState(false);

  async function processFiles(fileList: File[]) {
    const { default: heic2any } = await import("heic2any");
    const imageCompression = (await import("browser-image-compression"))
      .default as (
      file: File | Blob,
      options?: ImageCompressionOptions
    ) => Promise<File | Blob>;

    const compressedFiles: File[] = [];
    const urls: string[] = [];

    for (const file of fileList) {
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

  async function handleFileSelect(e: ChangeEvent<HTMLInputElement>) {
    const inputFiles = e.target.files ? Array.from(e.target.files) : [];
    await processFiles(inputFiles);
    e.target.value = "";
  }

  async function handleDrop(e: DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files || []);
    await processFiles(droppedFiles);
  }

  return (
    <label
      className={`flex min-h-28 cursor-pointer flex-col items-center justify-center rounded-[1.75rem] border border-dashed px-6 py-5 text-center transition ${
        isDragging
          ? "border-emerald-500 bg-emerald-50"
          : "border-stone-300 bg-stone-50 hover:border-emerald-400 hover:bg-emerald-50"
      }`}
      onDragEnter={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        setIsDragging(false);
      }}
      onDrop={handleDrop}
    >
      <span className="text-sm font-semibold text-gray-900">
        Drag images here or click to browse
      </span>
      <span className="mt-1 text-xs text-stone-500">
        HEIC files are converted automatically and large images are compressed.
      </span>
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
