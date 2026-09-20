import { useEffect, useRef, useState } from 'react'

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'

const SCENES = {
  sky: {
    video: '/ambience/sky.mp4?v=anime-scene-3',
    poster: '/ambience/sky.webp?v=anime-scene-3',
  },
  shanhai: {
    video: '/ambience/shanhai.mp4?v=anime-scene-3',
    poster: '/ambience/shanhai.webp?v=anime-scene-3',
  },
} as const

export default function ScenicBackground({
  scene,
  motion,
  variant,
}: {
  scene: 'sky' | 'shanhai'
  motion: boolean
  variant: 'space' | 'reader'
}) {
  const [reducedMotion, setReducedMotion] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const source = SCENES[scene]
  const animate = motion && !reducedMotion

  useEffect(() => {
    const media = window.matchMedia?.(REDUCED_MOTION_QUERY)
    if (!media) return
    const sync = () => setReducedMotion(media.matches)
    sync()
    media.addEventListener?.('change', sync)
    return () => media.removeEventListener?.('change', sync)
  }, [])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    if (!animate) {
      video.pause()
      return
    }
    video.currentTime = 0
    void video.play().catch(() => {})
  }, [scene, animate])

  useEffect(() => {
    const resume = () => {
      const video = videoRef.current
      if (animate && video && video.paused) void video.play().catch(() => {})
    }
    window.addEventListener('pageshow', resume)
    document.addEventListener('visibilitychange', resume)
    return () => {
      window.removeEventListener('pageshow', resume)
      document.removeEventListener('visibilitychange', resume)
    }
  }, [animate])

  return (
    <div
      key={scene}
      className={`scenic-ambience scenic-${scene} scenic-${variant}`}
      data-scene={scene}
      data-animated={animate ? 'true' : 'false'}
      aria-hidden="true"
    >
      {animate ? (
        <video
          ref={videoRef}
          key={scene}
          className="scenic-video"
          src={source.video}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          tabIndex={-1}
          poster={source.poster}
          disablePictureInPicture
          onLoadedData={(event) => {
            void event.currentTarget.play().catch(() => {})
          }}
        />
      ) : (
        <div
          className="scenic-poster"
          style={{ backgroundImage: `url("${source.poster}")` }}
        />
      )}
      <div className="scenic-tint" />
    </div>
  )
}
