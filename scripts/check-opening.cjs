// Behaviour and mask geometry only. JSDOM cannot certify rendered refraction,
// native video loops, Safari autoplay, device FPS or the visual seam.
const assert = require('node:assert/strict')
const { readFileSync, readdirSync } = require('node:fs')
const path = require('node:path')
const { JSDOM, VirtualConsole } = require('jsdom')
const { build } = require('esbuild')
const root = path.join(__dirname, '..')
const settle = () => new Promise(resolve => setTimeout(resolve, 25))
let checks = 0
function check(message, condition) {
  assert.ok(condition, message)
  checks++
  console.log(`PASS ${message}`)
}

async function main() {
  const compiled = await build({
    stdin: {
      contents: `
        import React from 'react';
        import { createRoot } from 'react-dom/client';
        import OpeningIntro from './src/components/reader/OpeningIntro';
        window.openingTestMount = (complete) => {
          const root = createRoot(document.getElementById('root'));
          const render = callback => root.render(React.createElement(React.StrictMode, null,
            React.createElement(OpeningIntro, {onComplete: callback})));
          render(complete);
          return {render, unmount: () => root.unmount()};
        };`,
      resolveDir: root,
      loader: 'tsx',
    },
    bundle: true,
    jsx: 'automatic',
    platform: 'browser',
    format: 'iife',
    write: false,
    define: {
      'process.env.NODE_ENV': '"development"',
      'import.meta.env.DEV': 'true',
      'import.meta.env.VITE_OPENING_REVIEW_VIDEO': '"/private-review-video.mp4"',
      'import.meta.env.VITE_OPENING_REVIEW_POSTER': '"/private-review-poster.webp"',
    },
  })
  const bundle = compiled.outputFiles[0].text

  async function launch({ reduced = false, rejected = false, width = 390, height = 844 } = {}) {
    const errors = []
    const console = new VirtualConsole()
    console.on('jsdomError', e => errors.push(e.message))
    console.on('error', (...args) => errors.push(args.join(' ')))
    const dom = new JSDOM('<html><body><div id="root"></div></body></html>', {
      url: 'https://private-opening-review.example/',
      pretendToBeVisual: true,
      runScripts: 'outside-only',
      virtualConsole: console,
    })
    const w = dom.window
    const d = w.document
    let now = 0, identifier = 100000, hidden = false, completions = 0
    let plays = 0, pauses = 0
    const frames = new Map(), deadlines = new Map(), mediaListeners = new Set()
    const media = {
      matches: reduced,
      addEventListener: (_, callback) => mediaListeners.add(callback),
      removeEventListener: (_, callback) => mediaListeners.delete(callback),
    }
    w.matchMedia = () => media
    w.innerWidth = width
    w.innerHeight = height
    Object.defineProperty(w.performance, 'now', { value: () => now })
    Object.defineProperty(d, 'hidden', { get: () => hidden })
    w.requestAnimationFrame = callback => {
      const id = ++identifier
      frames.set(id, callback)
      return id
    }
    w.cancelAnimationFrame = id => frames.delete(id)
    const nativeTimeout = w.setTimeout.bind(w)
    const nativeClearTimeout = w.clearTimeout.bind(w)
    w.setTimeout = (callback, delay, ...args) => {
      if (delay >= 100) {
        const id = ++identifier
        deadlines.set(id, { callback, at: now + delay })
        return id
      }
      return nativeTimeout(callback, delay, ...args)
    }
    w.clearTimeout = id => {
      if (!deadlines.delete(id)) nativeClearTimeout(id)
    }
    w.HTMLMediaElement.prototype.play = function () {
      plays++
      return rejected ? Promise.reject(new Error('Autoplay blocked')) : Promise.resolve()
    }
    w.HTMLMediaElement.prototype.pause = function () { pauses++ }
    d.documentElement.style.overflow = 'auto'
    w.eval(bundle)
    const mounted = w.openingTestMount(() => completions++)
    await settle()
    await settle()
    assert.deepEqual(errors, [], 'Opening mounts without runtime errors')
    return {
      w, d, dom, frames, deadlines, mediaListeners, mounted, errors,
      counts: () => ({ completions, plays, pauses }),
      async step(delta) {
        now += delta
        const pending = [...frames.entries()]
        frames.clear()
        pending.forEach(([, callback]) => callback(now))
        for (const [id, timer] of deadlines) {
          if (timer.at <= now) {
            deadlines.delete(id)
            timer.callback()
          }
        }
        await settle()
      },
      async visibility(value) {
        hidden = value
        d.dispatchEvent(new w.Event('visibilitychange'))
        await settle()
      },
      async preference(value) {
        media.matches = value
        mediaListeners.forEach(callback => callback())
        await settle()
      },
      async close() {
        mounted.unmount()
        await settle()
        dom.window.close()
      },
    }
  }

  let t = await launch()
  let video = t.d.querySelector('video')
  check('Video is muted, inline, autoplay and looping with no native controls',
    video.muted && video.autoplay && video.loop && video.playsInline && !video.controls)
  check('No visible copy, skip button or progress widget is present',
    t.d.querySelector('.opening-intro').textContent.trim() === '' &&
    !t.d.querySelector('progress, input, .opening-intro-skip') &&
    t.d.querySelectorAll('button').length === 1)
  check('The entire gate is a keyboard-accessible click target',
    t.d.activeElement === t.d.querySelector('button') &&
    t.d.querySelector('button').getAttribute('aria-label') === '进入 MAP7E Reader')
  await t.step(22000)
  video.dispatchEvent(new t.w.Event('ended'))
  video.dispatchEvent(new t.w.Event('ended'))
  await settle()
  check('Two end events and 22 idle seconds do not complete or schedule navigation',
    t.counts().completions === 0 && t.deadlines.size === 0 && t.frames.size === 0)
  video.dispatchEvent(new t.w.Event('playing'))
  await settle()
  check('The video appears only once playback is ready, above the static fallback',
    t.d.querySelector('video').dataset.ready === 'true' &&
    !!t.d.querySelector('.opening-intro-poster'))
  const beforeHide = t.counts()
  await t.visibility(true)
  check('A hidden page pauses opening video decoding', t.counts().pauses > beforeHide.pauses)
  await t.visibility(false)
  check('Returning to the unopened gate resumes playback', t.counts().plays > beforeHide.plays)
  t.d.querySelector('button').click()
  t.d.querySelector('button').click()
  await settle()
  check('Repeated clicks begin only one transition',
    t.d.querySelector('button').getAttribute('aria-disabled') === 'true' &&
    t.deadlines.size === 1 && t.frames.size === 1 && t.counts().completions === 0)
  await t.step(600)
  const surface = t.d.querySelector('.opening-intro-surface')
  const halfway = parseFloat(surface.style.getPropertyValue('--opening-hole-inner'))
  const rings = [...t.d.querySelectorAll('.opening-water-ring')]
  check('The circular hole grows during the transition rather than after it', halfway > 100)
  check('Three concentric wavefronts follow with staggered size and fading intensity',
    rings.length === 3 && parseFloat(rings[0].style.width) > parseFloat(rings[1].style.width) &&
    parseFloat(rings[1].style.width) > parseFloat(rings[2].style.width) &&
    parseFloat(rings[0].style.opacity) < 0.5)
  let latestCompletions = 0
  t.mounted.render(() => latestCompletions++)
  await settle()
  await t.step(300)
  check('Parent rerenders do not restart the reveal',
    parseFloat(surface.style.getPropertyValue('--opening-hole-inner')) > halfway)
  await t.step(300)
  await t.step(200)
  check('Only the latest callback completes, once, at the original deadline',
    latestCompletions === 1 && t.counts().completions === 0)
  check('The final transparent hole covers every mobile corner',
    parseFloat(surface.style.getPropertyValue('--opening-hole-inner')) > Math.hypot(390, 844) / 2)
  await t.close()
  check('Unmount restores scrolling and removes animation, deadline and media listeners',
    t.d.documentElement.style.overflow === 'auto' && t.frames.size === 0 &&
    t.deadlines.size === 0 && t.mediaListeners.size === 0)

  t = await launch({ rejected: true })
  check('Autoplay rejection keeps the static gate without entering Home',
    !t.d.querySelector('video') && !!t.d.querySelector('button') && t.counts().completions === 0)
  t.d.querySelector('button').click()
  await settle()
  await t.step(1200)
  check('The playback-failure fallback remains clickable', t.counts().completions === 1)
  await t.close()

  t = await launch()
  t.d.querySelector('video').dispatchEvent(new t.w.Event('error'))
  await settle()
  await t.step(22000)
  check('A media error shows the fallback and never enters automatically',
    !t.d.querySelector('video') && t.counts().completions === 0)
  await t.close()

  t = await launch({ reduced: true })
  check('Reduced motion keeps the gate static, with no video decoder',
    !t.d.querySelector('video') && t.counts().plays === 0 &&
    t.d.querySelector('button').dataset.reducedMotion === 'true')
  t.d.querySelector('button').click()
  await settle()
  await t.step(100)
  check('Reduced motion still has a brief reveal rather than immediate navigation', t.counts().completions === 0)
  await t.step(100)
  check('Reduced motion completes in 200 ms after a click', t.counts().completions === 1)
  await t.close()

  t = await launch()
  await t.preference(true)
  check('A changed reduced-motion preference stops video without bypassing the gate',
    !t.d.querySelector('video') && t.counts().completions === 0)
  await t.close()

  for (const [width, height] of [[360, 800], [430, 932], [844, 390], [1920, 1080]]) {
    t = await launch({ width, height })
    t.d.querySelector('button').click()
    await settle()
    await t.step(1200)
    check(`The expanding hole covers all ${width}×${height} viewport corners`,
      parseFloat(t.d.querySelector('.opening-intro-surface').style.getPropertyValue('--opening-hole-inner')) >
      Math.hypot(width, height) / 2 && t.counts().completions === 1)
    await t.close()
  }

  t = await launch()
  t.d.querySelector('button').click()
  await settle()
  await t.step(200)
  const paused = t.counts().pauses
  await t.close()
  await t.step(2000)
  check('Leaving during the reveal pauses video and cannot navigate later',
    t.counts().completions === 0 && t.counts().pauses > paused &&
    t.frames.size === 0 && t.deadlines.size === 0)

  const assets = readdirSync(path.join(root, 'dist/assets'))
  const production = assets.filter(name => name.endsWith('.js'))
    .map(name => readFileSync(path.join(root, 'dist/assets', name), 'utf8')).join('\n')
  check('Production contains no private review environment variables or preview media URL',
    !production.includes('VITE_OPENING_REVIEW_') && !production.includes('private-review-video.mp4') &&
    !production.includes('media.wallpaperengine.space'))
  const css = readFileSync(path.join(root, 'src/index.css'), 'utf8')
  check('Mask and rings use a central origin, feathered mask and WebKit-compatible declarations',
    css.includes('circle at 50% 50%') && css.includes('-webkit-mask-image:') &&
    css.includes('-webkit-backdrop-filter:') && css.includes('object-fit: cover'))
  console.log(`\n${checks} opening checks passed. JSDOM + synthetic time/geometry only; no browser or Safari visual certification.`)
}
main().catch(error => {
  console.error(error)
  process.exitCode = 1
})
