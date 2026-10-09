import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { openingMediaSources } from '../../data/openingOcean'

const REDUCED_MOTION = '(prefers-reduced-motion: reduce)'
const RIPPLE_MS = 1200
const REDUCED_MS = 200
const { videoSrc, posterSrc } = openingMediaSources()

export default function OpeningIntro({ onComplete }: { onComplete: () => void }) {
  const gate = useRef<HTMLButtonElement>(null)
  const surface = useRef<HTMLSpanElement>(null)
  const video = useRef<HTMLVideoElement>(null)
  const ripples = useRef<HTMLSpanElement>(null)
  const finishing = useRef(false)
  const completed = useRef(false)
  const duration = useRef(RIPPLE_MS)
  const completeCallback = useRef(onComplete)
  const [entering, setEntering] = useState(false)
  const [failed, setFailed] = useState(false)
  const [ready, setReady] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(
    () => window.matchMedia?.(REDUCED_MOTION).matches ?? false,
  )

  useLayoutEffect(() => {
    completeCallback.current = onComplete
  }, [onComplete])

  useEffect(() => {
    const media = window.matchMedia?.(REDUCED_MOTION)
    const sync = () => setReducedMotion(media?.matches ?? false)
    media?.addEventListener?.('change', sync)
    return () => media?.removeEventListener?.('change', sync)
  }, [])

  useLayoutEffect(() => {
    const previous = document.documentElement.style.overflow
    document.documentElement.style.overflow = 'hidden'
    gate.current?.focus({ preventScroll: true })
    return () => {
      document.documentElement.style.overflow = previous
    }
  }, [])

  useEffect(() => {
    const element = video.current
    if (!element) return
    let disposed = false
    element.muted = true
    const syncPlayback = () => {
      if (document.hidden) {
        element.pause()
      } else if (!finishing.current) {
        element.play().catch(() => {
          if (!disposed && !document.hidden && !finishing.current)
            setFailed(true)
        })
      }
    }
    syncPlayback()
    document.addEventListener('visibilitychange', syncPlayback)
    return () => {
      disposed = true
      document.removeEventListener('visibilitychange', syncPlayback)
      element.pause()
    }
  }, [reducedMotion, failed])

  function enter() {
    if (finishing.current) return
    finishing.current = true
    duration.current = reducedMotion ? REDUCED_MS : RIPPLE_MS
    setEntering(true)
  }

  useEffect(() => {
    if (!entering) return
    const started = performance.now()
    let frame = 0
    const complete = () => {
      if (completed.current) return
      completed.current = true
      video.current?.pause()
      completeCallback.current()
    }
    const draw = (now: number) => {
      if (completed.current) return
      const progress = Math.min(1, Math.max(0, (now - started) / duration.current))
      const eased = progress * progress * (3 - 2 * progress)
      const reach = Math.hypot(window.innerWidth, window.innerHeight) / 2 + 48
      const feather = window.innerWidth < 600 ? 12 : 20
      const radius = reach * eased
      surface.current?.style.setProperty(
        '--opening-hole-inner', `${Math.max(0, radius - feather)}px`,
      )
      surface.current?.style.setProperty('--opening-hole-outer', `${radius + feather}px`)
      const rings = ripples.current?.children
      if (rings) {
        Array.from(rings).forEach((ring, index) => {
          const delayed = Math.max(0, Math.min(1, (progress - index * 0.09) / (1 - index * 0.09)))
          const ringRadius = reach * delayed * delayed * (3 - 2 * delayed)
          const node = ring as HTMLElement
          node.style.width = node.style.height = `${ringRadius * 2}px`
          node.style.opacity = `${(1 - delayed) * (index ? 0.24 : 0.48)}`
        })
      }
      if (progress === 1) complete()
      else frame = window.requestAnimationFrame(draw)
    }
    frame = window.requestAnimationFrame(draw)
    // Only a click starts this timer. An end, error or idle timeout cannot enter.
    const deadline = window.setTimeout(complete, duration.current + 100)
    return () => {
      window.cancelAnimationFrame(frame)
      window.clearTimeout(deadline)
    }
  }, [entering])

  return (
    <button
      ref={gate}
      type="button"
      className={`opening-intro${entering ? ' opening-intro-entering' : ''}`}
      aria-label="进入 MAP7E Reader"
      aria-disabled={entering}
      data-reduced-motion={reducedMotion ? 'true' : 'false'}
      onClick={enter}
    >
      <span ref={surface} className="opening-intro-surface" aria-hidden="true">
        {posterSrc && (
          <span className="opening-intro-poster" style={{ backgroundImage: `url("${posterSrc}")` }} />
        )}
        {videoSrc && !reducedMotion && !failed && (
          <video
            ref={video}
            className="opening-intro-video"
            data-ready={ready ? 'true' : 'false'}
            src={videoSrc}
            poster={posterSrc}
            autoPlay
            muted
            loop
            playsInline
            controls={false}
            disablePictureInPicture
            disableRemotePlayback
            preload="auto"
            tabIndex={-1}
            onPlaying={() => setReady(true)}
            onError={() => setFailed(true)}
          />
        )}
      </span>
      <span ref={ripples} className="opening-water-ripples" aria-hidden="true">
        <span className="opening-water-ring" />
        <span className="opening-water-ring" />
        <span className="opening-water-ring" />
      </span>
    </button>
  )
}
