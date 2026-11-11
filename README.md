# 邢祖赫 · 3D 视觉设计作品集

在线作品集：[https://kuangyuande162-prog.github.io/xingzuhe/](https://kuangyuande162-prog.github.io/xingzuhe/)

以作品为中心的沉浸式网页：产品渲染、家电与场景、空间表现、三维动画及 AI 影像。

## 预览

```sh
npm start
```

打开 http://127.0.0.1:4173 。无需安装第三方依赖，使用 Node.js 20 或更新版本。也可直接打开 `dist/index.html`，通过本地服务器预览可获得更完整的视频与复制邮箱体验。

## 页面体验

- 首屏画廊可左右拖动或按编号切换，图片随滚动轻微移动。
- 精选项目按类别筛选，打开后进入全屏画廊，支持缩略图、左右键、Home/End 和手机轻扫。
- 完整作品库可按五个素材分组浏览；89 张静态图完整收录。
- 16 段视频与 6 段循环动效，桌面悬停静音预览，点击使用原生播放器。
- 手机底部快捷导航、键盘焦点、减少动画偏好、响应式布局。

## 维护

- `dist/index.html`：页面文案与结构。
- `dist/styles.css`、`dist/experience.css`：布局、视觉和交互样式。
- `dist/app.js`：作品分类、画廊、视频与联系交互。
- `dist/experience.js`：首屏拖动、滚动、指针与手机导航。
- `dist/content.js`：素材列表；`dist/assets/`：网页优化版本。
- `npm run check`：检查素材路径、脚本语法与内容清单。

GitHub 仓库现为公开仓库，作品集通过 GitHub Pages 公开发布，无需登录即可浏览。Pages 发布来源为 `gh-pages` 分支的根目录（`/`）。

`main` 分支保留完整源码，网页发布文件位于 `main/dist/`；`gh-pages` 分支的根目录保存可直接部署的网页文件。后续更新需要将 `main/dist/` 的内容同步到 `gh-pages` 根目录，提交后由 GitHub Pages 发布。仅修改 `main` 分支不会自动更新在线网页。

图片最长边 2200px，缩略图最长边 900px；视频为 H264 MP4，支持流式播放。原始素材与原始简历未放入项目，个人生日及电话未展示。作品中的品牌标识属于其权利人，作品用于个人经历与创作展示，未经许可请勿转载。
