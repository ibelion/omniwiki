"use client";

import { useEffect, useState } from "react";

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
  imgStyle?: React.CSSProperties;
  fallback?: string;
  loading?: "lazy" | "eager";
};

export const ImageWithFallback = ({
  src,
  alt,
  className,
  imgStyle,
  fallback = "/globe.svg",
  loading,
}: ImageWithFallbackProps) => {
  const [imgSrc, setImgSrc] = useState(toCdnSrc(src));

  useEffect(() => {
    setImgSrc(toCdnSrc(src));
  }, [src]);

  const handleError = () => {
    if (imgSrc !== fallback) setImgSrc(fallback);
  };

  return (
    <div className={`relative ${className}`}>
      <img
        src={imgSrc}
        alt={alt}
        loading={loading}
        onError={handleError}
        className="absolute inset-0 h-full w-full object-contain"
        style={imgStyle}
      />
    </div>
  );
};
