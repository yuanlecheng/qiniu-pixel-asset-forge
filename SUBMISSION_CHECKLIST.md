# 作品提交规则自检清单

依据训练营作品提交规则整理。提交前可按本表逐项核对。

## 必交材料

- [x] 公开可访问仓库：`https://github.com/yuanlecheng/qiniu-pixel-asset-forge`
- [x] README 文档：已包含项目介绍、在线预览、运行方式、功能说明、依赖说明、复现入口和 Demo 链接。
- [x] 在线预览：`https://yuanlecheng.github.io/qiniu-pixel-asset-forge/`
- [x] 可播放 Demo：仓库内置 [`demo/demo.webm`](./demo/demo.webm)，并可通过 GitHub Pages 的 [`demo/`](./demo/) 展示页播放。
- [x] Demo 访问方式无需登录：当前使用仓库内置 WebM 与 GitHub Pages 展示页；若活动后续指定视频平台，可再补充外部链接。

## 作品有效性

- [x] 作品方向符合题目二“2D 游戏素材生成”。
- [x] 代码自主完成，未接入外部图像模型、外部素材库或第三方运行时框架。
- [x] 当前版本为浏览器端静态应用，便于评审直接打开和复现。
- [x] 开发过程使用多次 commit 和 PR，不是最后一次性导入。
- [x] 单人组队，提交者使用个人 Git 配置完成提交。

## PR 规范

- [x] 每个 PR 聚焦相对独立的功能或修复。
- [x] PR 标题用一句话说明改动内容。
- [x] PR 描述包含功能说明、实现思路和验证方式。
- [x] PR 合并后 `main` 分支保持可运行。
- [x] GitHub Actions 已执行 JavaScript 语法检查和关键文件存在检查。

## 依赖与原创说明

- [x] README 已说明项目无 npm 安装步骤、无后端服务、无外部模型 API。
- [x] README 已说明核心能力由原生 HTML / CSS / JavaScript + Canvas API 实现。
- [x] 仓库包含 MIT License。
- [x] 如后续接入外部 API、模型或素材，需要补充来源、用途和许可证说明。

## 开源与复现

- [x] 仓库包含 `LICENSE`、`CONTRIBUTING.md` 和 `.github/PULL_REQUEST_TEMPLATE.md`。
- [x] README 包含 clone、运行、依赖和复现说明入口。
- [x] [`docs/REPRODUCIBILITY.md`](./docs/REPRODUCIBILITY.md) 说明默认参数、导出验证方式和确定性生成机制。
- [x] 线上预览和本地运行使用同一份静态源码。
- [x] CI 或本地 `node --check app.js` 可验证关键 JavaScript 语法有效。

## Demo 视频建议

- [x] 展示输入提示词生成素材。
- [x] 展示素材类型、动作、风格、尺寸、调色板等核心参数。
- [x] 展示一键生成项目素材包。
- [x] 展示动作帧、变体、解析完整度和生成依据。
- [x] 展示 PNG、精灵表、JSON 元数据和素材库 manifest 导出能力。
- [x] 说明 Unity / Godot / Aseprite 导入建议如何服务 2D 游戏开发流程。
- [x] 仓库内置 Demo 视频链接已写入 README。
- [x] 已提供正式讲解版录制脚本 [`docs/DEMO_SCRIPT.md`](./docs/DEMO_SCRIPT.md)；外部人声版视频属于增强材料，不影响当前仓库材料完整性。
