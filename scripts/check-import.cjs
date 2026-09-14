// Parser/storage boundary checks. Fixtures are ours, never textbook contents.
const assert = require('node:assert/strict')
const { buildSync } = require('esbuild')
const { Module } = require('node:module')
const { IDBFactory } = require('fake-indexeddb')
function load(entry) {
  const source = buildSync({
    entryPoints: [entry],
    bundle: true,
    write: false,
    platform: 'node',
    format: 'cjs',
  }).outputFiles[0].text
  const mod = new Module(entry, module)
  mod._compile(source, entry)
  return mod.exports
}
const { splitText, prepareImport, MAX_FILE_BYTES } = load(
  'src/services/importBook.ts',
)
const { storePrivateBook, loadLibrary, storePrivatePosition } = load(
  'src/services/privateBooks.ts',
)
const book = {
  id: 'test-private',
  title: '导入测试',
  author: 'MAP7E',
  sourceType: 'private',
  availability: 'missing',
  chapters: [],
  readingProgress: 0,
}
let count = 0
async function check(name, run) {
  await run()
  count++
  console.log('PASS ' + name)
}
;(async () => {
  await check('BOM, CRLF, headings and preface preserve user text', () => {
    const result = splitText(
      '\uFEFF前言内容\r\n\r\n第一章 测试\r\n甲段\r\n第二章 测试\r\n乙段',
    )
    assert.equal(result.length, 3)
    assert.deepEqual(
      result.map((c) => c.paragraphs.join('')),
      ['前言内容', '甲段', '乙段'],
    )
  })
  await check(
    'Large unstructured TXT is bounded without losing Unicode',
    () => {
      const text = ('字'.repeat(1199) + '🍁').repeat(30)
      const chapters = splitText(text)
      assert.ok(chapters.length > 1)
      assert.equal(chapters.flatMap((c) => c.paragraphs).join(''), text)
      assert.ok(chapters.every((c) => c.paragraphs.join('').length <= 15200))
      assert.ok(
        chapters
          .flatMap((c) => c.paragraphs)
          .every((p) => !/[\uD800-\uDBFF]$/.test(p)),
      )
    },
  )
  await check('Headings-only and binary files are rejected', () => {
    assert.throws(() => splitText('第一章 空章\n第二章 空章'))
    assert.throws(() => splitText('正文\u0000字节'))
  })
  await check(
    'Oversized input is rejected before reading its bytes',
    async () => {
      await assert.rejects(
        prepareImport(
          book,
          {
            size: MAX_FILE_BYTES + 1,
            name: 'large.txt',
            arrayBuffer() {
              throw Error('must not read')
            },
          },
          'utf-8',
        ),
        /20 MB/,
      )
    },
  )
  await check('UTF-16LE imports correctly', async () => {
    const result = await prepareImport(
      book,
      new File([Buffer.from('第一章 测试\n编码文字', 'utf16le')], 'utf16.txt'),
      'utf-16le',
    )
    assert.equal(result.content.chapters[0].paragraphs[0], '编码文字')
  })
  await check('GBK text imports with GB18030 decoding', async () => {
    const result = await prepareImport(
      book,
      new File([new Uint8Array([0xd6, 0xd0, 0xce, 0xc4])], 'gbk.txt'),
      'gb18030',
    )
    assert.equal(result.content.chapters[0].paragraphs[0], '中文')
  })
  await check(
    'Wrong UTF-8 and invalid EPUB signature are rejected',
    async () => {
      await assert.rejects(
        prepareImport(
          book,
          new File([new Uint8Array([0xff, 0xfe])], 'bad.txt'),
          'utf-8',
        ),
        /解码失败/,
      )
      await assert.rejects(
        prepareImport(book, new File(['not a zip'], 'bad.epub'), 'utf-8'),
        /EPUB/,
      )
    },
  )
  global.indexedDB = new IDBFactory()
  const old = await prepareImport(
    book,
    new File(['第一章 旧文\n存储测试正文'], 'old.txt'),
    'utf-8',
  )
  await storePrivateBook(old)
  await check('IndexedDB retains a real Blob and its text', async () => {
    const data = await loadLibrary()
    assert.ok(data.records[0].file instanceof Blob)
    assert.equal(await data.records[0].file.text(), '第一章 旧文\n存储测试正文')
  })
  const replacement = await prepareImport(
    book,
    new File(['第一章 新文\n新的测试内容'], 'new.txt'),
    'utf-8',
  )
  await check(
    'New file revision invalidates old-tab progress writes',
    async () => {
      await storePrivatePosition(book.id, {
        chapter: 0,
        fraction: 0.8,
        updatedAt: 1,
        contentRevision: old.revision,
      })
      await storePrivateBook(replacement)
      await storePrivatePosition(book.id, {
        chapter: 0,
        fraction: 0.9,
        updatedAt: 2,
        contentRevision: old.revision,
      })
      assert.equal((await loadLibrary()).positions.length, 0)
    },
  )
  await check(
    'Failed replacement leaves the previously committed book intact',
    async () => {
      await assert.rejects(
        storePrivateBook({
          ...replacement,
          revision: 'bad',
          uncloneable: () => {},
        }),
      )
      const data = await loadLibrary()
      assert.equal(data.records[0].revision, replacement.revision)
    },
  )
  console.log(`\n${count} import/storage boundary checks passed.`)
})().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
