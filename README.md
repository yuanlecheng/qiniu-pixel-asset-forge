# 七牛云训练营：Pixel Asset Forge

本项目选择首期议题二：开发一个工具，让用户通过输入文本或简单参数，高效、低成本地生成 2D 游戏素材，并能融入主流 2D 游戏开发流程。

## 开源信息

- 仓库地址：[https://github.com/yuanlecheng/qiniu-pixel-asset-forge](https://github.com/yuanlecheng/qiniu-pixel-asset-forge)
- 开源协议：[MIT License](./LICENSE)
- 贡献指南：[CONTRIBUTING.md](./CONTRIBUTING.md)
- 复现指南：[docs/REPRODUCIBILITY.md](./docs/REPRODUCIBILITY.md)
- CI 检查：GitHub Actions 会在 push 和 pull request 时执行 `node --check app.js` 并检查关键文件是否存在。

## 项目定位

Pixel Asset Forge 是一个零依赖、浏览器端运行的 2D 像素素材生成 MVP。它面向 Game Jam、独立游戏原型和课程作业场景，帮助开发者快速得到风格一致的角色、道具、地块与 UI 图标素材，并导出 PNG、四帧精灵表和工具链元数据。

## 已实现功能

- 文本描述驱动的确定性素材生成，同一提示词可复现同一结果
- 角色、道具、地块、UI 图标四类素材
- Idle、Run、Attack、Hit 四种动作/用途参数，支持 4 帧精灵表
- 街机像素、奇幻冒险、科幻霓虹、温暖手作、森林童话五套风格
- 提示词关键词解析，识别冰、火、森林、法师、剑、盾、药水、金币、血量等方向
- 调色板预览、自定义与锁定，保障团队资产风格一致性
- 像素描边、接地阴影、变体预览和动作帧预览
- PNG 下载、精灵表下载、JSON 元数据导出、元数据复制
- Unity / Godot / Aseprite 导入建议，包含像素过滤、无压缩、4 列精灵表等信息
- 无构建工具、无服务端依赖，可直接运行

## Demo 视频

提交前请将可播放 Demo 视频链接填写在这里：

```text
Demo 视频链接：待录制后补充
```

视频建议覆盖：输入提示词、切换类型/动作/风格、锁定调色板、下载 PNG/精灵表/JSON、解释工具链导入建议。

## 运行方式

从 GitHub 克隆：

```bash
git clone https://github.com/yuanlecheng/qiniu-pixel-asset-forge.git
cd qiniu-pixel-asset-forge
```

直接用浏览器打开：

```text
index.html
```

也可以用任意静态服务器托管本目录，例如：

```bash
python -m http.server 4173
```

## 使用流程

1. 输入素材描述，例如“冰霜法师，蓝色披风，适合横版冒险游戏”。
2. 选择素材类型、动作、风格和尺寸。
3. 根据团队项目需要锁定或调整调色板。
4. 点击“生成”或“换一版”查看主图、动作帧和风格一致变体。
5. 下载单张 PNG、四帧精灵表或 JSON 元数据。
6. 按页面中的 Unity / Godot / Aseprite 建议导入游戏项目。

## 文件结构

```text
.
├── index.html
├── styles.css
├── app.js
├── README.md
├── LICENSE
├── CONTRIBUTING.md
├── SUBMISSION_CHECKLIST.md
├── docs/
│   └── REPRODUCIBILITY.md
├── .github/
│   ├── PULL_REQUEST_TEMPLATE.md
│   └── workflows/
│       └── ci.yml
└── .gitignore
```

## 依赖与原创说明

- 运行时依赖：无。项目使用原生 HTML、CSS、JavaScript 和浏览器 Canvas API。
- 构建依赖：无。无需安装 npm 包或启动构建工具。
- CI 依赖：GitHub Actions 使用 `actions/checkout`、`actions/setup-node` 和 Node.js 20 做语法检查，不影响本地运行。
- 原创功能：提示词解析、像素素材程序化生成、动作帧生成、调色板锁定、导出元数据和工具链导入建议均在本仓库实现。
- 如后续接入第三方 API、模型、素材或历史代码，需要在 PR 描述和 README 中补充来源与用途。

## 可复现性

- 生成逻辑是确定性的：同一提示词、素材类型、动作、风格、调色板和 seed 偏移会生成同一结果。
- 当前版本不依赖外部服务，断网环境也能运行。
- 详细复现步骤见 [docs/REPRODUCIBILITY.md](./docs/REPRODUCIBILITY.md)。

## 议题适配说明

本项目围绕常规 2D 游戏开发中的角色、道具、地图地块、UI 图标需求设计，重点覆盖生成效率、素材质量、风格一致性和开发工具链适配。当前版本使用 Canvas 程序化生成作为 72 小时 MVP 基线，优势是可离线运行、成本极低、结果可复现，后续可以接入图像生成模型升级为“程序化控制 + AI 细化”的混合式素材流水线。

## 提交规则自检

- 公开提交 GitHub / Gitee 仓库，并在报名表单中填写仓库地址。
- README 需要保留项目介绍、运行方式、依赖说明和 Demo 视频链接。
- 从议题发布到截止时间内持续产生 commit 和 PR 记录，不要最后一天一次性导入全部代码。
- 每个 PR 只做一件事，标题和描述需包含功能描述、实现思路、测试方式。
- 所有 commit 时间戳需位于本批次开发周期内：2026-05-23 00:00 至 2026-05-25 23:59。
- 当前项目无第三方运行时依赖；若新增依赖，需在 README 中列明。
- 提交前请逐项检查 [SUBMISSION_CHECKLIST.md](./SUBMISSION_CHECKLIST.md)。

## 后续计划

- 增加批量生成和素材包 ZIP 导出
- 增加 Godot `.tres`、Unity `.meta`、Aseprite `.aseprite` 辅助文件
- 增加可编辑像素网格，用于二次修正生成结果
- 增加项目级风格模板，支持同一游戏的角色、敌人、道具和地块统一生成
- 接入图像模型 API，提升复杂角色和高质量图标的表现力
