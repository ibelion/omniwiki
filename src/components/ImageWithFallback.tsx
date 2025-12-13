"use client";

import { useState } from "react";
import Image from "next/image";

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
  const [imgSrc, setImgSrc] = useState(src);

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

