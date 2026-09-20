import { useEffect, useState } from 'react'

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'

const SCENES = {
  sky: {
    video: 'https://videos.pexels.com/video-files/5084245/5084245-uhd_3840_2160_30fps.mp4',
    poster: '/ambience/sky.svg',
  },
  shanhai: {
    video: 'https://videos.pexels.com/video-files/29329514/12642734_1920_1080_30fps.mp4',
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
  const [failed, setFailed] = useState(false)
  const source = SCENES[scene]

  useEffect(() => {
    setFailed(false)
  }, [scene])

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
          key={source.video}
          className="scenic-video"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
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
