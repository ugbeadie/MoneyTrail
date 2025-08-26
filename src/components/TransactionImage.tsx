"use client";

import type React from "react";

import { useCallback } from "react";
import Image from "next/image"; // Import Next.js Image component

interface TransactionImageProps {
  imageUrl: string;
  alt?: string;
}

export function TransactionImage({
  imageUrl,
  alt = "Transaction receipt",
}: TransactionImageProps) {
  const handleImageClick = useCallback((): void => {
    window.open(imageUrl, "_blank", "noopener,noreferrer");
  }, [imageUrl]);

  const handleImageError = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>): void => {
      const target = e.target as HTMLImageElement;
      target.src = "/placeholder.svg?height=80&width=80";
    },
    []
  );

  return (
    <Image
      src={imageUrl || "/placeholder.svg?height=80&width=80"}
      alt={alt}
      width={80}
      height={80}
      className="w-20 h-20 object-cover rounded border cursor-pointer hover:opacity-80 transition-opacity"
      onClick={handleImageClick}
      onError={handleImageError}
    />
  );
}
