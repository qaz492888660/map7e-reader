// Runs the actual production bundle in a DOM environment. No layout engine or
// physical touch device is emulated: mobile geometry/Safari need browser QA.
const { JSDOM, VirtualConsole } = require('jsdom')
const { readFileSync } = require('node:fs')
const assert = require('node:assert/strict')
const path = require('node:path')
const html = readFileSync(path.join(__dirname, '../dist/index.html'), 'utf8')
const entry = html.match(/<script[^>]+src="([^"]+)"/)[1]
const bundle = readFileSync(path.join(__dirname, '../dist', entry), 'utf8')
const pause = () => new Promise((resolve) => setTimeout(resolve, 100))
const key = 'map7e-reader:v1'
let checks = 0
function check(message, condition) {
  assert.ok(condition, message)
  checks++
  console.log(`PASS ${message}`)
}
async function launch(hash = '#/home', stored, blocked = false) {
  const errors = []
  const console = new VirtualConsole()
  console.on('jsdomError', (error) => errors.push(error.message))
  console.on('error', (...args) => errors.push(args.join(' ')))
  const dom = new JSDOM(
    '<!doctype html><html><body><div id="root"></div></body></html>',
    {
      url: `https://reader.example/${hash}`,
      runScripts: 'outside-only',
      pretendToBeVisual: true,
      virtualConsole: console,
    },
  )
  const w = dom.window
  w.scrollTo = () => {}
  w.matchMedia = () => ({ matches: false })
  w.ResizeObserver = class {
    observe() {}
    disconnect() {}
  }
  w.HTMLElement.prototype.scrollTo = function ({ left = 0, top = 0 }) {
    this.scrollLeft = left
    this.scrollTop = top
    // JSDOM has no layout. Do not invent a scroll event for a zero-sized box.
    if (this.clientWidth > 0) this.dispatchEvent(new w.Event('scroll'))
  }
  w.HTMLDialogElement.prototype.showModal = function () {
    this.open = true
  }
  w.HTMLDialogElement.prototype.close = function () {
    this.open = false
  }
  if (stored !== undefined) w.localStorage.setItem(key, stored)
  if (blocked)
    Object.defineProperty(w, 'localStorage', {
      get() {
        throw new Error('Storage unavailable')
      },
    })
  w.eval(bundle)
  for (
    let attempt = 0;
    attempt < 20 && !w.document.querySelector('main') && !errors.length;
    attempt++
  )
    await pause()
  await pause()
  assert.deepEqual(errors, [], 'Application mount runtime errors')
  return { dom, w, d: w.document, errors }
}
function button(t, text) {
  return [...t.d.querySelectorAll('button')].find(
    (b) =>
      b.textContent.trim() === text || b.getAttribute('aria-label') === text,
  )
}
async function click(t, text) {
  const b = button(t, text)
  assert.ok(b, `Button exists: ${text}`)
  b.click()
  await pause()
}
async function input(t, value) {
  const field = t.d.querySelector('input')
  Object.getOwnPropertyDescriptor(
    t.w.HTMLInputElement.prototype,
    'value',
  ).set.call(field, value)
  field.dispatchEvent(new t.w.Event('input', { bubbles: true }))
  await pause()
}
async function go(t, hash) {
  t.w.location.hash = hash
  await pause()
}
;(async () => {
  let t = await launch()
  check(
    'Home renders eight books and four bubble entries',
    t.d.querySelectorAll('.book-slide').length === 8 &&
      t.d.querySelectorAll('.bubble').length === 4,
  )
  check(
    'Home selects the expected central book',
    t.d.querySelector('.is-current .cover-title').textContent === '完美世界',
  )
  await click(t, '查看《完美世界》')
  check(
    'Book click opens detail before reader',
    t.w.location.hash === '#/book/b03' &&
      !!t.d.querySelector('.detail') &&
      !t.d.querySelector('.reader'),
  )
  await click(t, '继续阅读')
  check(
    'Resume maps the displayed 45% to demo chapter 2',
    t.w.location.hash === '#/reader/b03' &&
      t.d.querySelector('.reader-content h1').textContent === '沿着风的方向',
  )
  await click(t, '目录')
  check(
    'Contents opens as a labelled modal',
    t.d.querySelector('dialog[aria-label="目录"]').open,
  )
  const chapters = t.d.querySelectorAll('.contents-list button')
  chapters[2].click()
  await pause()
  check(
    'Contents navigation changes the chapter and closes the panel',
    t.d.querySelector('.reader-content h1').textContent ===
      '把夜晚留给一页书' && !t.d.querySelector('dialog'),
  )
  await click(t, '字体')
  await click(t, '23')
  await click(t, '黑体 / 无衬线')
  check(
    'Font size and font family change',
    t.d.querySelector('.reader').style.getPropertyValue('--reading-size') ===
      '23px' && !!t.d.querySelector('.font-sans'),
  )
  await click(t, '关闭面板')
  await click(t, '主题')
  await click(t, '字夜读')
  await click(t, '关闭面板')
  check(
    'Night theme changes and persists',
    !!t.d.querySelector('.reader.theme-night') &&
      JSON.parse(t.w.localStorage.getItem(key)).settings.theme === 'night',
  )
  const scroller = t.d.querySelector('.reader-scroll')
  Object.defineProperties(scroller, {
    scrollHeight: { value: 2000 },
    clientHeight: { value: 500 },
  })
  scroller.scrollTop = 750
  scroller.dispatchEvent(new t.w.Event('scroll'))
  await pause()
  t.w.dispatchEvent(new t.w.Event('pagehide'))
  await pause()
  check(
    'Pagehide synchronously saves the last scroll position',
    JSON.parse(t.w.localStorage.getItem(key)).positions.b03.fraction === 0.5,
  )
  const saved = t.w.localStorage.getItem(key)
  await click(t, '返回')
  check('Reader back returns to detail', !!t.d.querySelector('.detail'))
  await go(t, '#/history')
  check(
    'History contains only actually visited books',
    t.d.querySelectorAll('.history-list>button').length === 1,
  )
  await go(t, '#/library')
  check(
    'Library retains all 37 original book entries',
    t.d.querySelectorAll('.book-slide').length === 37,
  )
  await click(t, '仙侠奇缘')
  check(
    'Category filtering shows seven matching books',
    t.d.querySelectorAll('.book-slide').length === 7,
  )
  await input(t, '不存在的书')
  check(
    'Search has a usable empty state',
    t.d.querySelector('.empty-state').textContent.includes('换一个关键词'),
  )
  await input(t, '忘语')
  check(
    'Author search works within the category',
    t.d.querySelectorAll('.book-slide').length === 1 &&
      t.d.querySelector('.cover-title').textContent === '凡人修仙传',
  )
  await click(t, '查看《凡人修仙传》')
  await click(t, '返回')
  check(
    'Returning to Library preserves search and category',
    t.d.querySelector('input').value === '忘语' &&
      button(t, '仙侠奇缘').getAttribute('aria-pressed') === 'true',
  )
  await go(t, '#/settings')
  await click(t, '云层动态')
  check(
    'Motion switch stops ambient animation',
    !!t.d.querySelector('.motion-paused'),
  )
  check('Main interaction flow has no runtime errors', t.errors.length === 0)
  t.dom.window.close()
  t = await launch('#/reader/b03', saved)
  check(
    'Refresh restores the chapter, font, and theme',
    t.d.querySelector('.reader-content h1').textContent ===
      '把夜晚留给一页书' &&
      !!t.d.querySelector('.theme-night') &&
      t.d.querySelector('.reader').style.getPropertyValue('--reading-size') ===
        '23px',
  )
  await click(t, '读完了，合上书')
  check(
    'Direct reader link has a safe back fallback',
    t.w.location.hash === '#/home',
  )
  check('Refresh flow has no runtime errors', t.errors.length === 0)
  t.dom.window.close()
  t = await launch('#/book/missing', '{broken')
  check(
    'Unknown book and corrupted storage do not crash',
    t.d.querySelector('h1').textContent === '这本书不在书架上。' &&
      !t.errors.length,
  )
  await click(t, '回到书库')
  check('Missing-book recovery opens Library', !!t.d.querySelector('.library'))
  t.dom.window.close()
  t = await launch('#/reader/b03', undefined, true)
  check(
    'Unavailable localStorage does not crash Reader',
    !!t.d.querySelector('.reader') && !t.errors.length,
  )
  t.dom.window.close()
  t = await launch('#/book/%E0%A4%A')
  check(
    'Malformed URL safely falls back to Home',
    !!t.d.querySelector('.home') && !t.errors.length,
  )
  t.dom.window.close()
  console.log(
    `\n${checks} checks passed. DOM-only: no claims about real touch, layout, or FPS.`,
  )
})().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
