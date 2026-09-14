// Runs the actual production bundle in a DOM environment. No layout engine or
// physical touch device is emulated: mobile geometry/Safari need browser QA.
const { JSDOM, VirtualConsole } = require('jsdom')
const { IDBFactory } = require('fake-indexeddb')
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
async function launch(
  hash = '#/home',
  stored,
  blocked = false,
  database = new IDBFactory(),
) {
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
  w.indexedDB = database
  w.File = File
  w.Blob = Blob
  w.TextDecoder = TextDecoder
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
    t.d.querySelector('.is-current .cover-title').textContent === '普通心理学',
  )
  await click(t, '查看《普通心理学》')
  check(
    'Real book metadata and missing-content CTA render',
    t.d.querySelector('h1').textContent === '普通心理学' &&
      t.d.body.textContent.includes('彭聃龄、陈宝国') &&
      t.d.body.textContent.includes('第6版') &&
      !!button(t, '导入书籍开始学习'),
  )
  await go(t, '#/book/b03')
  check(
    'Demo detail still renders before Reader',
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
    'Library has 37 demos plus the first real book',
    t.d.querySelectorAll('.book-slide').length === 38,
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

  const database = new IDBFactory()
  t = await launch('#/reader/general-psychology-6', undefined, false, database)
  check(
    'Missing real book never displays demo prose',
    t.d.body.textContent.includes('正文文件尚未导入') &&
      !t.d.querySelector('article') &&
      !t.d.body.textContent.includes('云停在窗边'),
  )
  await click(t, '导入私人书籍文件')
  check(
    'File input accepts TXT and EPUB',
    t.d.querySelector('input[type=file]').accept.includes('.epub') &&
      t.d.querySelector('input[type=file]').accept.includes('.txt'),
  )
  async function choose(t, file) {
    const element = t.d.querySelector('input[type=file]')
    Object.defineProperty(element, 'files', {
      configurable: true,
      value: [file],
    })
    element.dispatchEvent(new t.w.Event('change', { bubbles: true }))
    await pause()
    await pause()
  }
  await choose(t, new File([''], 'empty.txt'))
  check(
    'Empty file is rejected before saving',
    t.d.querySelector('[role=alert]').textContent.includes('非空'),
  )
  await choose(t, new File(['wrong'], 'wrong.pdf'))
  check(
    'Unsupported PDF is rejected',
    t.d.querySelector('[role=alert]').textContent.includes('TXT 或 EPUB'),
  )
  const fixture =
    '第一章 私人导入测试\n这不是教材原文，只是验证导入流程的测试文本。\n<script>window.injected=true</script>\n第二章 位置恢复测试\n' +
    '用于确认阅读进度的测试段落。\n'.repeat(100)
  await choose(
    t,
    new File([fixture], 'map7e-test-only.txt', { type: 'text/plain' }),
  )
  check(
    'TXT preview includes only the selected file',
    t.d
      .querySelector('.import-preview')
      .textContent.includes('这不是教材原文') &&
      t.d.querySelector('.import-preview').textContent.includes('2 个阅读分段'),
  )
  await click(t, '确认导入并开始阅读')
  check(
    'TXT opens as private content and renders markup as text',
    t.d
      .querySelector('.reader-content')
      .textContent.includes('<script>window.injected=true</script>') &&
      !t.w.injected &&
      !t.d.body.textContent.includes('演示正文 · 非原著内容'),
  )
  await click(t, '目录')
  const entries = t.d.querySelectorAll('.contents-list button')
  check(
    'Reader TOC comes from this file',
    entries.length === 2 &&
      entries[1].textContent.includes('第二章 位置恢复测试'),
  )
  entries[1].click()
  await pause()
  const privateScroll = t.d.querySelector('.reader-scroll')
  Object.defineProperties(privateScroll, {
    scrollHeight: { value: 2000 },
    clientHeight: { value: 500 },
  })
  privateScroll.scrollTop = 600
  privateScroll.dispatchEvent(new t.w.Event('scroll'))
  await pause()
  t.w.dispatchEvent(new t.w.Event('pagehide'))
  await pause()
  const checkpoint = t.w.localStorage.getItem(key)
  check(
    'Large body never enters localStorage',
    !checkpoint.includes('这不是教材原文') &&
      !checkpoint.includes('用于确认阅读进度'),
  )
  await go(t, '#/home')
  await click(t, '继续阅读')
  check(
    'Continue Reading goes directly to the saved private chapter',
    t.w.location.hash === '#/reader/general-psychology-6' &&
      t.d.querySelector('h1').textContent === '第二章 位置恢复测试' &&
      !t.d.querySelector('.detail'),
  )
  check(
    'Continue Reading restores scroll fraction',
    Number(t.d.querySelector('progress').value) > 0.69,
  )
  t.dom.window.close()
  // No localStorage checkpoint: prove metadata, chapters and position persist in IDB.
  t = await launch('#/reader/general-psychology-6', undefined, false, database)
  check(
    'Refresh recovers private text and position from IndexedDB alone',
    t.d.querySelector('h1').textContent === '第二章 位置恢复测试' &&
      Number(t.d.querySelector('progress').value) > 0.69,
  )
  await go(t, '#/book/general-psychology-6')
  check(
    'Imported book detail shows readable state and file TOC',
    !!button(t, '继续阅读') &&
      t.d
        .querySelector('.detail-contents')
        .textContent.includes('第二章 位置恢复测试'),
  )
  await click(t, '替换私人书籍文件')
  await choose(
    t,
    new File(
      ['第一章 新文件\n这是一份新的导入测试文本。'],
      'replacement-test.txt',
    ),
  )
  check(
    'Replacement explicitly warns about progress reset',
    !!t.d.querySelector('.import-warning'),
  )
  await click(t, '确认导入并开始阅读')
  check(
    'Replacement resets old chapter and shows only new text',
    t.d.querySelector('h1').textContent === '第一章 新文件' &&
      Number(t.d.querySelector('progress').value) === 0 &&
      !t.d.body.textContent.includes('用于确认阅读进度'),
  )
  await go(t, '#/book/general-psychology-6')
  await click(t, '替换私人书籍文件')
  await choose(
    t,
    new File([new Uint8Array([80, 75, 3, 4, 0, 0])], 'container-test.epub'),
  )
  check(
    'EPUB preview clearly states no parser is available',
    !!button(t, '仅保存 EPUB 文件') &&
      t.d
        .querySelector('.import-preview')
        .textContent.includes('等待后续解析支持'),
  )
  await click(t, '仅保存 EPUB 文件')
  await go(t, '#/reader/general-psychology-6')
  check(
    'Stored EPUB never renders previous TXT or demo content',
    t.d.body.textContent.includes('EPUB 文件已保存在本机') &&
      !t.d.querySelector('article'),
  )
  check('Private import flow has no runtime errors', !t.errors.length)
  t.dom.window.close()
  t = await launch('#/reader/general-psychology-6', undefined, false, undefined)
  // Simulate quota denial after successful opening/preview, without a real upload.
  await click(t, '导入私人书籍文件')
  await choose(
    t,
    new File(['第一章 失败测试\n仅用于模拟保存失败。'], 'quota-test.txt'),
  )
  const originalOpen = t.w.indexedDB.open.bind(t.w.indexedDB)
  t.w.indexedDB.open = () => {
    throw new Error('QuotaExceededError')
  }
  await click(t, '确认导入并开始阅读')
  check(
    'Storage failure keeps the preview and reports failure instead of success',
    !!t.d.querySelector('.import-preview') &&
      t.d.querySelector('[role=alert]').textContent.includes('保存失败') &&
      !t.d.querySelector('article'),
  )
  t.w.indexedDB.open = originalOpen
  t.dom.window.close()
  console.log(
    `\n${checks} checks passed. DOM-only: no claims about real touch, layout, or FPS.`,
  )
})().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
