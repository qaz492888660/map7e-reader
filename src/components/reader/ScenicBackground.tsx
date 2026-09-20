import { useEffect, useState } from 'react'

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'

const SCENES = {
  sky: {
    video:
      'https://assets.mixkit.co/videos/preview/mixkit-blue-sky-seen-directly-with-some-clouds-moving-21574-large.mp4',
    poster: '/ambience/sky.svg',
  },
  shanhai: {
    video:
      'https://assets.mixkit.co/videos/preview/mixkit-sunset-over-the-sea-4318-large.mp4',
    poster: '/ambience/shanhai.svg',
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
  const [videoFailed, setVideoFailed] = useState(false)

  useEffect(() => {
    setVideoFailed(false)
  }, [scene])

  useEffect(() => {
    const media = window.matchMedia?.(REDUCED_MOTION_QUERY)
    if (!media) return
    const sync = () => setReducedMotion(media.matches)
    sync()
    media.addEventListener?.('change', sync)
    return () => media.removeEventListener?.('change', sync)
  }, [])

  const animate = motion && !reducedMotion && !videoFailed
  const source = SCENES[scene]

  return (
    <div
      className={`scenic-ambience scenic-${scene} scenic-${variant}`}
      data-animated={animate ? 'true' : 'false'}
      aria-hidden="true"
    >
      {animate ? (
        <video
          className="scenic-video"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          tabIndex={-1}
          poster={source.poster}
          onError={() => setVideoFailed(true)}
        >
          <source src={source.video} type="video/mp4" />
        </video>
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
