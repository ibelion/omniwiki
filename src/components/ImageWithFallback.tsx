"use client";

import { useState } from "react";
import Image from "next/image";

const CDN_BASE = "https://raw.githubusercontent.com/ibelion/omniwiki/main/cdn";

function toCdnSrc(src: string): string {
  if (!src || src.startsWith("http") || !src.startsWith("/")) return src;
  if (src.startsWith("/leaguecontent/") || src.startsWith("/pokemoncontent/")) {
    return `${CDN_BASE}${src}`;
  }
  return src;
}

type ImageWithFallbackProps = {
  src: string;
  alt: string;
  className?: string;
  fallback?: string;
  loading?: "lazy" | "eager";
};

export const ImageWithFallback = ({
  src,
  alt,
  className,
  fallback = "/globe.svg",
  loading,
}: ImageWithFallbackProps) => {
  const [imgSrc, setImgSrc] = useState(toCdnSrc(src));

  const handleError = () => {
    setImgSrc(fallback);
  };

  return (
    <div className={`relative ${className}`}>
      <Image
        src={imgSrc}
        alt={alt}
        fill
        className="object-contain"
        loading={loading}
        onError={handleError}
      />
    </div>
  );
};

