import { useEffect, useState } from 'react'

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'

const SCENES = {
  sky: {
    video: '/ambience/sky.mp4?v=anime-scene-2',
    poster: '/ambience/sky.webp?v=anime-scene-2',
  },
  shanhai: {
    video: '/ambience/shanhai.mp4?v=anime-scene-2',
    poster: '/ambience/shanhai.webp?v=anime-scene-2',
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
  const [failed, setFailed] = useState(false)
  const source = SCENES[scene]

  useEffect(() => {
    const media = window.matchMedia?.(REDUCED_MOTION_QUERY)
    if (!media) return
    const sync = () => setReducedMotion(media.matches)
    sync()
    media.addEventListener?.('change', sync)
    return () => media.removeEventListener?.('change', sync)
  }, [])

  const animate = motion && !reducedMotion && !failed

  return (
    <div
      key={scene}
      className={`scenic-ambience scenic-${scene} scenic-${variant}`}
      data-scene={scene}
      data-animated={animate ? 'true' : 'false'}
      aria-hidden="true"
    >
      <div
        className="scenic-poster"
        style={{ backgroundImage: `url("${source.poster}")` }}
      />
      {animate && (
        <video
          key={scene}
          className="scenic-video"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          tabIndex={-1}
          poster={source.poster}
          onError={() => setFailed(true)}
        >
          <source src={source.video} type="video/mp4" />
        </video>
      )}
      <div className="scenic-tint" />
    </div>
  )
}
