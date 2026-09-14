# MAP7E Reader

手机优先的私人阅读空间。React 18 + TypeScript + Vite，原生 CSS；没有 Router、后端或完整电子书引擎。

## 运行

```sh
npm ci
npm run dev
npm run build
npm run test:ui
```

`build` 顺序执行 `tsc -b`、`vite build`。`test:ui` 使用构建产物做 DOM 交互回归；jsdom 仅为开发依赖，不进入网站运行包。

## 当前结构

- `src/App.tsx`：页面组合和共享状态。
- `src/hooks/usePage.ts`：轻量 hash 导航，支持直接链接、刷新、浏览器返回。
- `src/types/book.ts`：独立的 Book、Chapter、ReadingPosition、ReaderSettings 类型。
- `src/data/catalog.ts`：旧 mockLibrary 到新 Book 的唯一适配边界，以及原创演示章节。
- `src/components/reader/`：首页、气泡入口、横向书架、封面、书库、详情、阅读、记录、设置和底部面板。
- `src/hooks/useReaderState.ts`：浏览器本地设置与演示阅读位置，含损坏数据和存储不可用的降级。
- `src/index.css`：手机优先布局、天空云层、玻璃与纸张、阅读主题及减少动态设置。
- 旧 `ShelfWall` / `ShelfRow` / `BookSpine` / `ReadingPortal` 和 `useSpatialState` 保留作为旧实现参考，已经不挂载在新入口，也不会进入新首页运行包。

首页展示八本精选示例书；书库保留原有 37 条书籍，支持分类与书名/作者搜索。原生横向滚动负责触屏惯性和滚动吸附，少量 transform/opacity 强调中心书籍；点击中心书进入详情，再进入正文。未使用粒子、Canvas、视频、轮播依赖或新增路由依赖。

## 演示范围

书籍条目及初始进度继承旧 mockLibrary，元数据未作为真实书目校验；封面是程序化书房设计，简介是占位寄语。三章正文为原创演示文本，与书名对应的原著无关，页面有明确说明。

目录、主题、字号、字体切换可用。首次从详情阅读时，示例百分比映射到演示章节位置；之后以本机阅读位置为准。记录只包含实际打开过正文的书籍。设置和进度保存在当前浏览器，不是云同步。

## 验证与限制

- 改动前：TypeScript 通过，Vite 因 `postcss.config.js` 引用未声明的 Tailwind 插件而失败。源码未使用 Tailwind，移除无用插件引用后通过。
- 改动后：构建通过；DOM 检查覆盖 Home→详情→Reader、返回、刷新恢复、目录、字号、字体、主题、分类、作者搜索、空态、损坏存储、不可用存储和异常 URL。
- 公开站点真实 Chromium 浏览器：360 / 375 / 390 / 430px × 四个主页面，共 16 组无页面横向溢出；768 / 1280px × 四页，另外 8 组也无页面横向溢出。桌面浏览器的部分 iframe 页面有 15px 滚动条占位，可用内容宽度因此略小于窗口宽度。
- 公开站点原生横向滚轮操作：书架 scrollLeft 从 374 变为 561，中心书籍从《完美世界》切到《遮天》，点击后进入详情；继续阅读、主题面板和 21px 字号切换均验证生效。检查到的应用警告/错误为 0（不计浏览器扩展自身日志）。这不是物理触屏测试。
- 本地开发服务的 `/`、`/src/main.tsx`、`/src/index.css`、`/maple.svg` 返回 HTTP 200。
- `npm` 的 `http-proxy` 提示来自执行环境配置；测试依赖的 `whatwg-encoding` 弃用提示来自 jsdom 的传递依赖。均不属于 TypeScript/Vite 编译错误。

可在开发服务或构建后的站点打开 `/mobile-check.html`，切换 360 / 375 / 390 / 430 / 768 / 1280px 视口和四个主页面，点击检查横向溢出。这个独立 QA 页面不在产品导航中。

布局使用 `100dvh`、`viewport-fit=cover`、四边安全区、正常页面纵向滚动、独立正文滚动及原生触控滚动；尊重 `prefers-reduced-motion`。

**DOM 检查没有浏览器布局引擎。iframe 检查也不等于 iPhone 真机：Safari 地址栏变化、刘海/底部安全区、惯性手势及 60fps 需要实机验证，不能用构建成功替代。**

后续优先：真机滑动与阅读舒适度、书房视觉的个性化、替换演示数据所需的书籍导入接口。本轮不包含 EPUB/PDF/TXT 解析、登录、同步、统计或后端。
