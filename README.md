# MAP7E Reader

手机优先的私人阅读空间。保留 React 18 + TypeScript + Vite、原生 CSS 和轻量 hash 导航，没有新增运行时依赖、Router、后端或完整电子书引擎。

## 运行与验证

```sh
npm ci
npm run dev
npm run build
npm run test:ui
```

`build` 顺序执行 `tsc -b`、`vite build`。`test:ui` 构建后执行 44 项 DOM 交互回归及 10 项文件／IndexedDB 边界检查。jsdom、fake-indexeddb 只用于开发测试，不进入网站运行包。测试文件是明确标注的原创夹具，不是教材正文。

## 页面与第二轮体验

- Home：MAP7E Reader、「你好，枫」、多层天空远景与环境光、四个不等大小的半透明气泡、八本精选书的云间书架。继续阅读和书库拥有更高视觉权重。
- Library：37 本原有演示藏书加《普通心理学》第6版，分类及书名／作者／版次／标签搜索。继续使用原生横向滚动、scroll-snap、transform 和 opacity；当前封面聚焦，书名在滚动稳定后切换。
- Book Detail：封面、作者、版次、分类、学习阶段、个人学习寄语、阅读状态和目录框架。未导入正文的主按钮为「导入书籍开始学习」。
- Reader：纯净正文、目录、字号、字体、主题、进度、返回。首页「继续阅读」直接恢复最近阅读书籍的章节和章节内滚动比例；点击书架或书库封面仍先进入详情。没有实际阅读位置时，气泡引导进入第一本学习书的详情。

保留 `100dvh`、`viewport-fit=cover`、四边 safe-area、正常纵向滚动、独立正文滚动和 reduced-motion。没有新增粒子、视频或 Canvas 动画。

## 书籍与内容结构

```text
src/types/book.ts                       Book / BookContent / Chapter / ReadingPosition
src/data/catalog.ts                     目录适配与内容注册
src/data/books/demo.ts                   明确标记的原创演示内容
src/data/books/psychology-general/
  metadata.ts                           第一本文献的独立元数据
  chapters.ts                           正式目录待补充，目前为空
  index.ts                              书籍入口
src/services/importBook.ts              TXT 解码与分段、导入预览数据接口
src/services/privateBooks.ts            IndexedDB 事务与文件版本隔离
src/hooks/usePrivateLibrary.ts          私人内容加载与保存状态
src/hooks/useReaderState.ts             小型设置与同步位置检查点
src/hooks/usePage.ts                    原有 hash 导航
src/components/reader/                  页面、书架、导入面板与缺少正文状态
```

`Book` 是元数据，包含 `id/title/author/edition/category/description/cover/readingProgress/sourceType/availability/chapters`，并预留 `learningStage/tags/notesCount/learningStatus`。`BookContent` 通过 `bookId` 关联书籍，正文属于各自的 `Chapter`，不再由 Reader 共享 sampleChapters。`ReadingPosition` 含章节 ID、章节索引、滚动比例和内容版本；替换文件时原位置一并重置，旧标签页不能写入新文件的位置。

增加下一本书只需提供元数据和内容注册／私人文件记录，无需修改 Reader 核心组件。演示书保持独立的 demo 内容映射；私人书籍没有任何演示正文回退。

## 《普通心理学》第6版

- ID：`general-psychology-6`
- 作者：彭聃龄、陈宝国；分类：心理学 · 基础。
- 学习定位：心理学专业学习 · 第一阶段；第一本 · 心理学基础。
- 书目信息来自本次用户提供的信息；简介是个人学习寄语。
- 封面由 MAP7E Reader 用 CSS 和文字自制，不使用未经授权的原版高清封面。
- **仓库没有本书正文，也没有经过核对的第6版正式目录。初始章节数组为空，Reader 明确显示「正文文件尚未导入」。没有下载或编造教材正文。**
- 文件导入后的目录来自该私人文件的标题；自动阅读分段不代表经过校对的教材正式目录。

其余 37 本书仍是原有 mockLibrary 演示书目；程序化封面和原创三章演示文本不代表各书原著。阅读记录只包含实际进入过正文的书籍，学习状态字段不等于完整统计／笔记系统。

## 私人文件导入

从详情或缺少正文的 Reader 打开「导入私人书籍文件」，选择并预览后确认。文件只保存在当前浏览器，应用没有上传正文的网络接口。

- **TXT**：实际可读。支持 UTF-8、GB18030 / GBK、UTF-16LE；编码需用户选择。识别常见中文章节标题与 `Chapter N`，保留序言；没有标题时生成阅读分段。长正文自动限制段落和分段长度，避免单章无限增长。原文按纯文本渲染，不执行 HTML。
- **EPUB**：接受选择并保存原始 Blob；仅检查基本 ZIP 文件头，本轮没有完整 EPUB 校验或解析。明确显示「仅保存 EPUB 文件」，正文依然不可读。
- 单文件上限 20 MB。拒绝空文件、明显二进制 TXT、只有标题没有正文的 TXT、非法编码和不支持的格式。超过 3000 个阅读分段会提示拒绝。
- IndexedDB 数据库 `map7e-private-library` 的 `books` 保存 Blob、正文、元数据与版本；`positions` 保存阅读位置。替换文件与重置进度在同一事务内，失败时保留旧文件。
- localStorage 仅保存原有 Reader 设置和小型位置检查点，用于关闭页面时同步落盘；**不保存正文或 Blob**。异步位置同时保存在 IndexedDB。
- 加载、重试、空间不足／存储不可用和替换确认都有明确状态。清理站点数据、更换设备或浏览器会失去本机文件，请保留自己的原始文件；本轮没有云同步或导出备份工具。

## 回归与已知限制

第二轮修改前，25 项原有 DOM 检查及 TypeScript / Vite 构建通过，开发服务成功启动并返回 HTTP 200。

第二轮自动检查覆盖：四个主页面、详情入口、直接继续阅读、章节／滚动恢复、目录、字号／字体／主题、搜索／分类、返回、刷新、异常 URL、损坏或不可用存储；真实书目占位、TXT 预览及安全渲染、仅从 IndexedDB 恢复正文和位置、替换重置、EPUB 无伪造正文、存储失败、文件编码／大小／Unicode、真实 Blob 持久化及事务失败保留旧文件。

第二轮公开站点 Chromium 验收结果：

- 360 / 375 / 390 / 430px × Home、Library、Book Detail、未导入 Reader，共 16 组无页面横向溢出；另外四种宽度的导入面板和导入后实际正文，8 组也无页面横向溢出。部分 iframe 使用桌面滚动条，占用 15px 可用宽度。
- 原创两章测试 TXT 通过真实文件选择器导入；目录跳到第二章，21px／无衬线／夜读生效。章节内滚动到 1100px，离开后首页继续阅读直接恢复到第二章 1100px；刷新后再次恢复同一位置、字号和主题。
- 原生横向滚轮使书架从 scrollLeft 374 移到 561 并稳定吸附，中心书和书名切换到《完美世界》，点击进入详情。心理学分类＋彭聃龄搜索返回一本书，书目及导入后目录显示正确。
- 这些操作发生在隔离的测试浏览器；测试 TXT 不进入仓库，不会为其他用户预置正文。

`/mobile-check.html` 是独立 QA 页面，不在产品导航中，可检查 360 / 375 / 390 / 430 / 768 / 1280px 视口。

**DOM 检查没有浏览器布局引擎；Chromium iframe 也不等于 iPhone 真机。Safari 地址栏、刘海安全区、物理触屏惯性和 60fps 尚需实机验证。**

旧 `ShelfWall`、`ShelfRow`、`BookSpine`、`ReadingPortal`、`useSpatialState` 已确认没有新版或测试依赖后删除。保留原 mockLibrary 数据源，没有进行无关清理。

执行环境可能输出 npm `http-proxy` 配置警告、jsdom 传递依赖 `whatwg-encoding` 弃用提示；它们不是 TypeScript / Vite 编译错误。

下一轮优先：用用户合法提供的实际 TXT 校对目录与段落、iPhone 真机阅读与滑动体验、在独立内容接口上实现经过验证的 EPUB 解析。
