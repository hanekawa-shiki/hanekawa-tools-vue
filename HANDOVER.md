# 项目交接文档

> 最后更新：2026-07-31
> 仓库地址：git@github.com:hanekawa-shiki/hanekawa-tools-vue.git

---

## 一、技术栈与核心依赖版本

| 分类         | 技术                                   | 版本          |
| ------------ | -------------------------------------- | ------------- |
| 框架         | Vue                                    | 3.5.40        |
| 构建         | Vite                                   | 8.2.0         |
| 语言         | TypeScript                             | ~6.0.3        |
| 样式         | Tailwind CSS                           | 4.3.3         |
| UI 组件      | shadcn-vue (reka-ui)                   | 2.10.1        |
| 图标         | Hugeicons (@hugeicons/vue)             | 4.2.3 / 1.0.7 |
| 路由         | vue-router                             | 5.2.0         |
| HTTP         | axios                                  | 1.19.0        |
| 提示框       | vue-sonner                             | 2.0.9         |
| 日期         | dayjs                                  | 1.11.21       |
| 农历         | lunisolar                              | 2.6.0         |
| Torrent 解析 | parse-torrent                          | 11.0.24       |
| PDF 合并     | pdf-lib                                | 1.17.1        |
| 拖拽排序     | 原生 HTML5 Drag and Drop               | -             |
| 模糊搜索     | fuse.js                                | 7.5.0         |
| 本地字体     | lxgw-wenkai-webfont                    | 1.7.0         |
| PWA          | vite-plugin-pwa + workbox-window       | 1.3.0 / 7.4.1 |
| 包管理       | pnpm                                   | 10.34.5       |
| Node         | Node.js                                | >=24          |
| Lint         | @antfu/eslint-config                   | 9.2.0         |
| Formatter    | Prettier + prettier-plugin-tailwindcss | 3.9.6         |

---

## 二、项目目录结构

```
hanekawa-tools-vue/
├── env/                           # 多环境配置
│   ├── .env                       # dev 默认（VITE_API_BASE_URL=/api）
│   ├── .env.cf                    # Cloudflare Workers 部署（VITE_API_BASE_URL=/api）
│   └── .env.gh                    # GitHub Pages 部署（VITE_API_BASE_URL=完整 worker URL）
├── src/
│   ├── api/                       # API 接口层
│   │   ├── request.ts             # createApi 泛型封装（method/url → 返回函数）
│   │   └── index.ts               # 接口列表（fetchHolidayApi、fetchOilPriceApi）
│   ├── assest/                    # 静态资源
│   │   └── avatar.jpeg            # 侧边栏头像图片
│   ├── components/
│   │   ├── icon.vue               # 图标封装组件（@hugeicons/vue + @hugeicons/core-free-icons，32 个图标）
│   │   ├── mode-toggle.vue        # 深色/浅色/跟随系统切换
│   │   ├── month-picker.vue       # 月份选择器（4×3 网格，支持年份导航）
│   │   ├── nav-main.vue           # 导航菜单（router-link + Icon 组件）
│   │   ├── page-header.vue        # 页面标题组件（IntersectionObserver 滚动阴影）
│   │   ├── sw-update-toast.vue    # PWA 版本更新提示组件（vue-sonner toast）
│   │   ├── theme-provider.vue     # 主题上下文 Provider（provide/inject）
│   │   └── ui/                    # shadcn-vue 组件（通过 CLI 安装）
│   │       ├── button/            # Button 组件
│   │       ├── card/              # Card 组件（7 个子组件）
│   │       ├── collapsible/       # Collapsible 折叠面板
│   │       ├── dropdown-menu/     # DropdownMenu 下拉菜单（15 个子组件）
│   │       ├── input/             # Input 输入框
│   │       ├── popover/           # Popover 弹出层
│   │       ├── select/            # Select 下拉选择（11 个子组件）
│   │       ├── separator/         # Separator 分隔线
│   │       ├── sheet/             # Sheet 抽屉组件（9 个子组件）
│   │       ├── sidebar/           # 侧边栏核心组件（24 个子组件）
│   │       ├── skeleton/          # Skeleton 骨架屏
│   │       ├── sonner/            # Toast 通知（适配 useTheme）
│   │       ├── table/             # Table 表格组件（9 个子组件 + utils）
│   │       └── tooltip/           # Tooltip 提示
│   ├── composables/               # Vue 组合式函数
│   │   └── use-auto-routes.ts     # 自动生成导航菜单项
│   ├── data/
│   │   └── holidays.ts            # 法定节假日（从 worker API 获取 + 内存缓存）
│   ├── layout/
│   │   └── index.vue              # 主布局：SidebarProvider + Sidebar + SidebarInset + RouterView
│   ├── lib/
│   │   ├── request.ts             # axios 实例（baseURL 从 VITE_API_BASE_URL 读取）
│   │   └── utils.ts               # cn() 工具函数
│   ├── pages/
│   │   ├── 404.vue                # 404 页面（含 Space Invaders 小游戏）
│   │   ├── index.vue              # 首页（工具卡片列表，读取 config.pageMeta）
│   │   ├── query/
│   │   │   ├── calendar.vue       # 日历主页面（组合子组件）
│   │   │   ├── oil-prices.vue     # 油价页面（全国各地油价查询，PC 双列/移动单列）
│   │   │   ├── media-types.vue    # Media Types 查询页面（Fuse.js 模糊搜索 + 虚拟滚动）
│   │   │   └── components/        # 日历子组件（不生成路由菜单）
│   │   │       ├── calendar-utils.ts      # 工具函数 + CalendarCell 类型 + 常量
│   │   │       ├── CalendarDateDetail.vue  # 右侧日期详情面板
│   │   │       ├── CalendarDayCell.vue     # 单个日期格子
│   │   │       ├── CalendarLegend.vue      # 图例
│   │   │       ├── CalendarMonthGrid.vue   # 月历网格
│   │   │       └── CalendarNav.vue         # 导航栏（Popover + MonthPicker 年月选择 + 一周起始日）
│   │   └── transform/
│   │       ├── torrent2magnet.vue   # 种子转磁力链工具（支持逐条删除 + 清除全部）
│   │       ├── invoice-merge.vue    # 发票合并工具（HTML5 拖拽排序 + pdf-lib 导出 A4 PDF）
│   │       └── color-picker.vue     # 取色器（HEX/RGB/HSL/HSV/CMYK）
│   ├── router/
│   │   └── config.ts              # 路由配置（pageMeta/dirMeta/路由定义）
│   └── env.d.ts                   # 全局类型声明
├── components.json                # shadcn-vue 配置
├── vite.config.ts                 # Vite 配置（env/ + proxy + fontSwitch + PWA + Brotli + code splitting）
└── vite-plugins/
    ├── fontSwitch.ts              # 字体切换插件（dev 用本地包，prod 用 CDN）
    └── htmlBuildTime.ts           # 构建时间注入到 HTML
```

---

## 三、核心架构说明

### 路由系统

- 路由定义在 `src/main.ts` 中，使用 `createWebHashHistory`
- 菜单配置在 `src/router/config.ts` 的 `pageMeta`（页面级：title/icon/hidden）和 `dirMeta`（目录级：title/icon/isActive）
- 导航菜单由 `src/composables/use-auto-routes.ts` 根据 `pageMeta` 自动生成
- **新增页面**：在 `src/pages/` 下创建 `.vue` 文件，然后在 `src/router/config.ts` 中添加路由和 pageMeta

### API 层架构

```
src/lib/request.ts（axios 实例，baseURL 从 import.meta.env.VITE_API_BASE_URL 读取，带 toast 错误拦截）
    ↓
src/api/request.ts（createApi 泛型封装：method + url → 返回请求函数）
    ↓
src/api/index.ts（具体接口定义，如 fetchHolidayApi、fetchOilPriceApi）
    ↓
src/data/holidays.ts（节假日业务逻辑：内存缓存 + 数据转换 + getHolidayInfo）
```

### 多环境构建

| 环境 | 命令            | VITE_API_BASE_URL                                      | 输出目录 |
| ---- | --------------- | ------------------------------------------------------ | -------- |
| dev  | `pnpm start`    | `/api`（走 vite proxy 转发）                           | -        |
| CF   | `pnpm build:cf` | `/api`                                                 | dist-cf/ |
| GH   | `pnpm build:gh` | `https://holiday-cn-worker.angelbeast.workers.dev/api` | dist-gh/ |

### PWA 架构

- 使用 `vite-plugin-pwa` + `workbox-window`，`registerType: 'prompt'`（非静默更新）
- Service Worker 更新检测在 `src/components/sw-update-toast.vue` 中处理
- 更新提示：通过 vue-sonner toast 在右下角显示"发现新版本"，用户可选择"刷新"或"稍后"
- 离线缓存策略：
  - 静态资源（JS/CSS/HTML/SVG/字体）：预缓存
  - CDN 字体 CSS：`StaleWhileRevalidate`，30 天过期
  - API 响应（/api/）：`NetworkFirst`，5 秒超时回退缓存，1 天过期

### 代码分割策略

Vite `rolldownOptions.output.codeSplitting.groups` 按功能将第三方库拆分为独立 chunk：

| Chunk 名          | 包含的库                                   |
| ----------------- | ------------------------------------------ |
| `vendor-vue`      | vue, vue-router, @vueuse/core              |
| `vendor-reka`     | reka-ui                                    |
| `vendor-pdf`      | pdf-lib                                    |
| `vendor-sortable` | sortablejs, vuedraggable                   |
| `vendor-date`     | dayjs, lunisolar                           |
| `vendor-icons`    | @hugeicons/core-free-icons, @hugeicons/vue |
| `vendor-torrent`  | parse-torrent                              |
| `vendor-tanstack` | @tanstack/vue-table                        |

所有页面组件通过动态 `import()` 按路由懒加载。

### 图标系统

- 统一使用 `@hugeicons/core-free-icons` + `@hugeicons/vue`（`HugeiconsIcon` 组件）
- 通过 `src/components/icon.vue` 封装，接收 `name` 字符串（如 `'CalendarIcon'`）渲染图标
- 当前注册了 **32 个图标**，涵盖导航、操作、状态等类别
- 图标大小由 CSS 类控制（如 `size-4`、`size-8`），不使用 `size` prop
- shadcn-vue 内部组件使用 `@lucide/vue` 图标

---

## 四、当前进度总结

### ✅ 已完成的功能

| 功能             | 状态    | 关键文件                                                                             |
| ---------------- | ------- | ------------------------------------------------------------------------------------ |
| 路由系统         | ✅ 完成 | `src/main.ts`（createRouter + 路由定义）                                             |
| 侧边栏导航       | ✅ 完成 | `src/components/nav-main.vue`, `src/layout/index.vue`                                |
| 头像区域         | ✅ 完成 | `src/layout/index.vue`（SidebarFooter 中的头像）                                     |
| 主题切换         | ✅ 完成 | `src/components/mode-toggle.vue`, `theme-provider.vue`                               |
| 日历万年历       | ✅ 完成 | `src/pages/query/calendar.vue` + 5个子组件（Calendar* 前缀）                         |
| 日历节假日接口   | ✅ 完成 | `src/data/holidays.ts`（从 worker API 获取 + 内存缓存）                              |
| 油价查询         | ✅ 完成 | `src/pages/query/oil-prices.vue`（全国油价，PC 双列/移动单列）                       |
| Media Types 查询 | ✅ 完成 | `src/pages/query/media-types.vue`（Fuse.js 模糊搜索 + 虚拟滚动）                     |
| 种子转磁力链     | ✅ 完成 | `src/pages/transform/torrent2magnet.vue`（含逐条删除 + 清除全部）                    |
| 发票合并工具     | ✅ 完成 | `src/pages/transform/invoice-merge.vue`（HTML5 拖拽排序 + pdf-lib PDF 合并导出）     |
| 取色器           | ✅ 完成 | `src/pages/transform/color-picker.vue`（HEX/RGB/HSL/HSV/CMYK）                       |
| 404 页面         | ✅ 完成 | `src/pages/404.vue`（含 Space Invaders 小游戏 + 键盘/触摸操控）                      |
| API 请求封装     | ✅ 完成 | `src/lib/request.ts`, `src/api/request.ts`, `src/api/index.ts`                       |
| 全局 Toast 通知  | ✅ 完成 | `vue-sonner`，按类型着色图标（success/info/warning/error）                           |
| 多环境构建配置   | ✅ 完成 | `env/.env`, `env/.env.cf`, `env/.env.gh`                                             |
| 字体切换插件     | ✅ 完成 | `vite-plugins/fontSwitch.ts`（dev 用本地 lxgw-wenkai-webfont 包，prod 用 CDN）       |
| PWA 可安装       | ✅ 完成 | `vite-plugin-pwa`（prompt 模式 + Workbox 离线缓存）                                  |
| PWA 更新提示     | ✅ 完成 | `src/components/sw-update-toast.vue`（页面刷新/路由切换时检测，sonner toast 右下角） |
| 代码分割         | ✅ 完成 | `vite.config.ts` rolldownOptions groups + 动态 import 路由懒加载                     |
| Brotli 压缩      | ✅ 完成 | `vite-plugin-compression`（GH 模式，level 11）                                       |
| 月份选择器       | ✅ 完成 | `src/components/month-picker.vue`（4×3 网格 + 年份导航 + min/max 支持）              |

### 🔧 已优化的问题

| 优化项           | 详情                                                                           |
| ---------------- | ------------------------------------------------------------------------------ |
| 侧边栏重构       | 使用 shadcn-vue 内置 Sidebar 组件，替代手写实现                                |
| 图标系统重构     | 通过 `icon.vue` 封装 hugeicons，CSS 控制大小而非 prop                          |
| 项目地址集中管理 | `package.json` 的 `homepage` 字段统一管理项目地址，`layout/index.vue` 动态导入 |

### 🟡 待完善 / 已知问题

1. **ESLint 配置**：当前使用 `@antfu/eslint-config`，可能需要调整 Vue 相关规则。

2. **`src/pages/index.vue` 首页**：工具卡片展示 `config.pageMeta` 中的工具，如果配置了 `description` 字段会显示描述。

---

## 五、新对话启动 Prompt

请将以下内容直接粘贴给新的 AI 对话：

---

> 我正在维护一个名为 `hanekawa-tools-vue` 的 Vue 3 工具集网站（GitHub 仓库：`hanekawa-shiki/hanekawa-tools-vue`）。
>
> **技术栈**：Vue 3.5.40 + Vite 8.2.0 + TypeScript ~6.0.3 + Tailwind CSS 4.3.3 + shadcn-vue (reka-ui 2.10.1) + Hugeicons (4.2.3) + vue-router 5.2.0 + axios 1.19.0 + dayjs 1.11.21 + lunisolar 2.6.0 + vue-sonner 2.0.9 + vite-plugin-pwa 1.3.0 + workbox-window 7.4.1
>
> **关键约定**：
>
> - UI 组件使用 shadcn-vue（reka-ui 基础），通过 `pnpm dlx shadcn-vue@latest add [component]` 安装
> - 图标使用 `@hugeicons/core-free-icons` (4.2.3) + `@hugeicons/vue` (1.0.7)，通过 `src/components/icon.vue` 封装
> - API 请求通过 `src/api/request.ts` 的 `createApi` 封装，接口在 `src/api/index.ts` 中定义
> - 路由定义在 `src/main.ts`，菜单配置在 `src/router/config.ts` 的 `pageMeta` 和 `dirMeta` 中
> - `src/pages/**/components/` 目录下的文件不会生成路由菜单
> - 多环境构建：dev 走 vite proxy，CF 走相对路径 `/api`，GH 走 worker 完整 URL
> - ESLint 配置在 `eslint.config.mjs`（@antfu/eslint-config），格式化用 Prettier
> - PWA 使用 prompt 模式，页面刷新/路由切换时检测更新，通过 sonner toast 在右下角提示
> - 所有页面组件通过动态 `import()` 按路由懒加载，Vite rolldownOptions groups 拆分第三方库
> - 主题使用项目自身的 ThemeProvider（provide/inject 模式）
>
> 项目当前功能包含：路由系统（含懒加载）、侧边栏导航、头像区域、主题切换、日历万年历（含节假日 API 接口）、油价查询（全国各地最新油价）、Media Types 查询（Fuse.js 模糊搜索）、种子转磁力链（含逐条删除 + 清除全部）、发票合并（HTML5 拖拽排序 + pdf-lib A4 PDF 合并导出）、取色器（HEX/RGB/HSL/HSV/CMYK）、月份选择器组件、字体切换插件（dev 本地包 / prod CDN）、PWA 可安装应用（prompt 更新提示 + Workbox 离线缓存）、404 页面（Space Invaders 小游戏）、按类型着色的全局 Toast 通知。
>
> 请先阅读 `HANDOVER.md` 了解完整项目结构，然后告诉我你想做的下一步。

---
