import { useEffect, useState } from 'react'

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'

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

  useEffect(() => {
    const media = window.matchMedia?.(REDUCED_MOTION_QUERY)
    if (!media) return
    const sync = () => setReducedMotion(media.matches)
    sync()
    media.addEventListener?.('change', sync)
    return () => media.removeEventListener?.('change', sync)
  }, [])

  const animate = motion && !reducedMotion

  return (
    <div
      className={`scenic-ambience scenic-${scene} scenic-${variant}`}
      data-animated={animate ? 'true' : 'false'}
      aria-hidden="true"
    >
      <div className="scenic-art" />
      <div className="scenic-far" />
      <div className="scenic-near" />
      <div className="scenic-light" />
      <div className="scenic-tint" />
    </div>
  )
}
