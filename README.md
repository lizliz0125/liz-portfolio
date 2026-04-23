# Liz Portfolio

个人作品集站点：单页纵向滚动、液态导航与滤镜动效、Hero 区 WebGL 像素粒子、中英双语。

## 技术栈

| 类别 | 选用 |
|------|------|
| 框架 | Vue 3（Composition API + `<script setup>`） |
| 构建 | Vite 7 |
| 样式 | Tailwind CSS 4（`@tailwindcss/vite`） |
| 图形 | Three.js（Hero `ParticleImage` 粒子采样） |
| 字体 | Rubik Mono One、Ledger、Inter、Noto Sans SC（见 `index.html`） |

## 项目结构（摘要）

```
src/
  App.vue              # 滚动容器、导航、各区块编排
  views/               # Home, AboutMe*, Projects, Awards, Contact
  components/          # 粒子画布、导航、视差等
  composables/         # 滚动上下文、光标、断点等
  config/              # Hero 视觉锁定参数（heroVisualLock）
  i18n/                # 中英文文案
public/                # 静态资源（背景图、职业图标、联系区素材等）
```

## 环境要求

- **Node.js**：`^20.19.0` 或 `>=22.12.0`（与 `package.json` 中 `engines` 一致）

## 本地开发

```bash
npm install
npm run dev
```

默认开发服务器由 Vite 指定端口；也可使用：

```bash
npm run dev:5174
```

## 构建与预览

```bash
npm run build
npm run preview
```

构建产物输出到 `dist/`（已加入 `.gitignore`，勿提交）。

## 环境变量（可选）

| 变量 | 说明 |
|------|------|
| `VITE_TRACKER_URL` | 若设置，应用挂载后会 `fetch` 该地址（用于自有统计/心跳等，可为空） |

本地可复制 `.env` 或创建 `.env.local`（已被忽略，不会进仓库）。

## 功能说明（维护时参考）

- **Hero**：底图 + `ParticleImage` 从图片采样生成粒子；离开视区后部分浏览器会回收 WebGL，组件内已做 teardown / 重初始化与可见性观察。
- **联系区**：`Contact.vue` 底部立绘与主标题排版；滚动视差与 `AnimatedComponent` 联动。
- **响应式**：大屏 `AboutMe`，小屏 `AboutMeMobile`（`useWindowContext` 断点）。

## 发布到 GitHub

本仓库默认远程与仓库名为 **`liz-portfolio`**（账号 `lizliz0125`）。若你改用其它仓库名，请同步修改：

- `.github/workflows/deploy.yml` 里环境变量 `VITE_BASE_PATH`（须为 `/你的仓库名/`，首尾斜杠保留）。

首次推送后，在 GitHub 仓库 **Settings → Pages** 中把 **Build and deployment** 来源设为 **GitHub Actions**（本仓库已含工作流，见 `.github/workflows/deploy.yml`）。若需访问统计，在仓库 **Settings → Secrets** 中添加可选密钥 `VITE_TRACKER_URL`。

本地构建模拟子路径部署：

```bash
VITE_BASE_PATH=/liz-portfolio/ npm run build && npx vite preview
```

## 许可证

源码以仓库根目录 `LICENSE`（MIT）为准。站点中的个人肖像、项目截图等素材版权归所有者所有，请勿擅自用于其它商业场景。
