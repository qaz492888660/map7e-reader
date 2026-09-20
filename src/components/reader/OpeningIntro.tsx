import { useEffect, useRef, useState } from 'react'

const VIDEO = '/opening/sky-to-sea.mp4?v=1'
const POSTER = '/opening/first-frame.webp?v=1'

export default function OpeningIntro({ onComplete }: { onComplete: () => void }) {
  const video = useRef<HTMLVideoElement>(null)
  const finishing = useRef(false)
  const [leaving, setLeaving] = useState(false)

  function finish() {
    if (finishing.current) return
    finishing.current = true
    setLeaving(true)
  }

  useEffect(() => {
    const previous = document.documentElement.style.overflow
    document.documentElement.style.overflow = 'hidden'
    // A stalled download or blocked autoplay must never trap the reader.
    const fallback = window.setTimeout(finish, 11000)
    video.current?.play().catch(finish)
    return () => {
      window.clearTimeout(fallback)
      document.documentElement.style.overflow = previous
    }
  }, [])

  useEffect(() => {
    if (!leaving) return
    const fade = window.setTimeout(onComplete, 950)
    return () => window.clearTimeout(fade)
  }, [leaving, onComplete])

  return (
    <div
      className={`opening-intro${leaving ? ' opening-intro-leaving' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label="书房开场动画"
    >
      <video
        ref={video}
        className="opening-intro-video"
        src={VIDEO}
        poster={POSTER}
        autoPlay
        muted
        playsInline
        preload="auto"
        aria-hidden="true"
        onEnded={finish}
        onError={finish}
      />
      <button type="button" className="opening-intro-skip" onClick={finish}>
        跳过开场
      </button>
    </div>
  )
}
