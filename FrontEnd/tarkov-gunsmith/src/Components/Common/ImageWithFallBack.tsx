import React, { useState } from 'react';

interface ImageWithDefaultFallbackProps {
    src: string;
    alt: string;
    height? : number;
    loading? : "eager" | "lazy" | undefined;
    className?: string;
  }

export default function ImageWithDefaultFallback( props:ImageWithDefaultFallbackProps ) {
  const [imageSrc, setImageSrc] = useState(props.src);

  const handleImageError = () => {
    setImageSrc(process.env.PUBLIC_URL + '/TG_ImageFallback.png');
  };

  return <img src={imageSrc} onError={handleImageError} alt={props.alt} height={props.height} loading={props.loading} />;
}