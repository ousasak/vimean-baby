import React, { useState, useEffect } from 'react'
import { cloudinaryUrl } from '@/utils/cloudinary'

const fallback = '/catalog/fallback.svg'

export default function SafeImage({
  src = '',
  alt = '',
  imgClass = 'aspect-square w-full object-cover',
  className = '',
  width = 600,
}) {
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    setFailed(false)
  }, [src])

  const resolved = !src || failed ? fallback : cloudinaryUrl(src, { width })

  return (
    <img
      src={resolved}
      alt={alt}
      className={imgClass || className}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
    />
  )
}
