# Pixel Asset Forge

Pixel Asset Forge 是一个浏览器端 2D 像素素材生成工具。它通过文本描述和少量参数生成角色、道具、地块与 UI 图标，面向 Game Jam、独立游戏原型、课程项目和轻量级 2D 游戏开发场景。

项目采用原生 HTML、CSS、JavaScript 和 Canvas API 实现，不依赖后端服务或构建工具。克隆仓库后即可运行，生成结果可导出为 PNG、四帧精灵表和 JSON 元数据，便于接入 Unity、Godot、Aseprite 等常见 2D 游戏开发流程。

## Features

- 文本描述驱动的确定性素材生成，同一组输入可复现同一结果
- 角色、道具、地块、UI 图标四类素材
- Idle、Run、Attack、Hit 四种动作/用途参数
- 4 帧动作预览与横向 sprite sheet 导出
- 街机像素、奇幻冒险、科幻霓虹、温暖手作、森林童话五套风格
- 提示词关键词解析，支持冰、火、森林、法师、剑、盾、药水、金币、血量等语义方向
- 调色板预览、自定义与锁定，便于保持项目内资产风格一致
- 像素描边、接地阴影、变体预览和元数据预览
- PNG、精灵表、JSON 元数据导出
- Unity / Godot / Aseprite 导入建议
- 零运行时依赖，可离线运行

## Quick Start

克隆仓库：

```bash
git clone https://github.com/yuanlecheng/qiniu-pixel-asset-forge.git
cd qiniu-pixel-asset-forge
```

方式一：直接用浏览器打开：

```text
index.html
```

方式二：启动任意静态服务器：

```bash
python -m http.server 4173
```

然后访问：

```text
http://localhost:4173/
```

## Usage

1. 输入素材描述，例如“冰霜法师，蓝色披风，适合横版冒险游戏”。
2. 选择素材类型、动作、风格和尺寸。
3. 根据项目视觉规范调整或锁定调色板。
4. 点击“生成”或“换一版”查看主图、动作帧和风格一致变体。
5. 导出单张 PNG、四帧精灵表或 JSON 元数据。
6. 按页面中的工具链建议导入 Unity、Godot 或 Aseprite。

## Reproducibility

Pixel Asset Forge 的生成逻辑是确定性的。提示词、素材类型、动作、风格、调色板和 seed 偏移相同时，生成结果保持一致。

项目不依赖外部 API 或远程模型，断网环境也可以运行。完整复现步骤见 [docs/REPRODUCIBILITY.md](./docs/REPRODUCIBILITY.md)。

## Project Structure

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

## Development

本项目没有安装步骤和构建步骤。修改 `index.html`、`styles.css` 或 `app.js` 后刷新浏览器即可查看结果。

如本地安装了 Node.js，可以执行语法检查：

```bash
node --check app.js
```

GitHub Actions 会在 push 和 pull request 时执行同样的 JavaScript 语法检查，并确认关键项目文件存在。

## Design Notes

Pixel Asset Forge 当前版本以 Canvas 程序化生成作为 MVP 基线，优先保证低成本、可复现、可离线运行和易于演示。它关注常规 2D 游戏开发中的四类高频资产：角色、道具、地图地块和 UI 图标。

导出的 JSON 元数据包含素材名称、类型、动作、尺寸、调色板、seed、帧数和导入建议，可作为后续接入 Unity `.meta`、Godot `.tres`、Aseprite 文件或素材包打包流程的基础。

## Demo

Demo 视频将在功能定型后补充。

## License

本项目基于 [MIT License](./LICENSE) 开源。

## Contributing

欢迎提交 issue 和 pull request。贡献前请阅读 [CONTRIBUTING.md](./CONTRIBUTING.md)。新增依赖、外部素材、模型 API 或复用历史代码时，需要在 PR 描述和 README 中说明来源、用途与许可证。

## Roadmap

- 批量生成和素材包 ZIP 导出
- Godot `.tres`、Unity `.meta`、Aseprite `.aseprite` 辅助文件
- 可编辑像素网格，用于二次修正生成结果
- 项目级风格模板，统一生成同一游戏中的角色、敌人、道具和地块
- 程序化控制与图像模型结合的混合式生成流水线

## Challenge Context

Pixel Asset Forge 起源于七牛云训练营首期议题二「2D 游戏素材生成」。仓库保留 [SUBMISSION_CHECKLIST.md](./SUBMISSION_CHECKLIST.md) 作为活动提交自检材料，项目本身以通用开源工具的形式持续维护。
