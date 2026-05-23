# Pixel Asset Forge

Pixel Asset Forge 是一个浏览器端 2D 像素素材生成工具。它通过文本描述和少量参数生成角色、道具、地块与 UI 图标，面向 Game Jam、独立游戏原型、课程项目和轻量级 2D 游戏开发场景。

项目采用原生 HTML、CSS、JavaScript 和 Canvas API 实现，不依赖后端服务或构建工具。克隆仓库后即可运行，生成结果可导出为 PNG、四帧精灵表和 JSON 元数据，便于接入 Unity、Godot、Aseprite 等常见 2D 游戏开发流程。

## 在线预览

[https://yuanlecheng.github.io/qiniu-pixel-asset-forge/](https://yuanlecheng.github.io/qiniu-pixel-asset-forge/)

## 功能介绍

### 文本驱动素材生成

用户输入一段素材描述后，Pixel Asset Forge 会解析提示词中的语义线索，并将其映射到颜色、形状和装饰规则。例如“冰霜法师”会触发冷色调、魔法标签和披风细节，“火焰水晶剑”会触发火焰、水晶和刀剑结构。生成逻辑由确定性 seed 驱动，同一组输入可以复现同一结果。

### 多类型 2D 游戏资产

工具覆盖 2D 游戏开发中的四类常见资产：

- 角色：适合主角、敌人、NPC 等可行动单位。
- 道具：适合武器、盾牌、药水、金币、水晶等可拾取或装备物品。
- 地块：适合地图 tile、地表纹理和关卡原型。
- UI 图标：适合技能、血量、金币、装备栏等界面元素。

### 动作帧与精灵表

角色和道具可以基于 Idle、Run、Attack、Hit 四种动作/用途生成 4 帧动作预览。导出的横向 sprite sheet 可作为游戏引擎中的动画原型，适合快速接入角色待机、奔跑、攻击或受击状态。

### 风格与调色板控制

内置街机像素、奇幻冒险、科幻霓虹、温暖手作、森林童话五套风格。每套风格提供一组默认调色板，用户也可以手动调整颜色并锁定调色板，用于保持同一项目内多张素材的视觉一致性。

### 质量增强流程

生成器会在基础形状之上叠加多层像素美术规则：

- 提示词轮廓：让主体比例、头部形状、装备结构和图标符号随描述变化。
- 方向性高光：通过亮部和暗部提升体积感。
- 材质细节：为药水、盾牌、剑、水晶、地块等增加切面、裂纹和纹理。
- 语义装饰：根据提示词生成冰晶、藤蔓、熔岩、魔法闪光等细节。

### 项目素材库

用户可以将满意的生成结果保存到项目素材库。素材库会显示缩略图、名称、类型、动作、尺寸和提示词标签，并支持单项 PNG 下载、移除、清空和 manifest 清单导出。manifest 记录每个素材的 seed、调色板、提示词和导入设置，便于后续整理素材包或导入游戏引擎。

### 导出与工具链适配

工具支持导出单张 PNG、4 帧精灵表和 JSON 元数据。元数据包含素材名称、类型、动作、尺寸、调色板、seed、帧数和 Unity / Godot / Aseprite 导入建议，可用于衔接主流 2D 游戏开发流程。

## Quick Start

也可以直接访问在线预览：

```text
https://yuanlecheng.github.io/qiniu-pixel-asset-forge/
```

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

## 操作教程

### 1. 启动工具

完成 Quick Start 后，浏览器会打开 Pixel Asset Forge 主界面。左侧是生成参数面板，右侧是预览、动作帧、变体、素材库和元数据区域。

### 2. 输入素材描述

在“素材描述”中输入目标资产，例如：

```text
冰霜法师，蓝色披风，适合横版冒险游戏
```

也可以尝试更明确的描述：

```text
火焰水晶剑，带金色符文
森林石板地块，带青苔和裂纹
金币 UI 图标，适合像素 RPG 背包
```

描述越具体，生成器越容易提取颜色、形状和装饰方向。

### 3. 配置生成参数

选择素材类型、动作/用途、视觉风格和画布规格。常用组合示例：

- 横版角色：`角色` + `Run 奔跑` + `64 x 64`
- 武器道具：`道具` + `Attack 攻击` + `64 x 64`
- 地图 tile：`地块` + `Idle 待机` + `32 x 32`
- 技能图标：`UI 图标` + `Idle 待机` + `64 x 64`

“变化强度”会影响细节密度和随机扰动。数值较低时素材更稳定简洁，数值较高时会出现更多装饰和变化。

### 4. 调整视觉风格

切换视觉风格会更新默认调色板。若希望一组素材保持统一色彩，可以先调整颜色，再勾选“锁定调色板”。锁定后继续切换素材类型或提示词时，当前颜色组合会被保留。

### 5. 生成与筛选

点击“生成”刷新当前参数下的素材。点击“换一版”会改变 seed 偏移，生成同一提示词下的风格一致变体。右侧会同时展示：

- 主预览：当前选中的素材结果。
- 动作帧：4 帧动作/用途预览。
- 风格一致变体：同一提示词下的多个候选结果。
- 导出元数据：当前素材的 JSON 描述。

### 6. 保存到项目素材库

当某个结果可用时，点击“保存到素材库”。素材会以卡片形式加入项目素材库，包含缩略图、名称、类型、动作、尺寸和提示词标签。素材库中的每个条目都可以单独下载 PNG，也可以移除。

### 7. 导出素材

根据使用场景选择导出方式：

- `PNG`：导出当前主预览，适合单个角色、道具、tile 或图标。
- `精灵表`：导出 4 帧横向 sprite sheet，适合动画原型。
- `JSON`：导出当前素材元数据，包含 seed、调色板和导入建议。
- `导出清单`：导出项目素材库 manifest，适合整理一组候选素材。

### 8. 导入游戏开发工具

Unity / Godot / Aseprite 的导入建议会显示在“工具链适配”区域。一般建议使用 Point Filter、关闭压缩和 mipmap，并按 4 列 sprite sheet 切分动画帧。

### 9. 复现已有结果

若需要复现某张素材，请保留导出的 JSON 元数据。元数据中的提示词、类型、动作、风格、调色板和 seed 可用于定位生成来源。完整复现流程见 [docs/REPRODUCIBILITY.md](./docs/REPRODUCIBILITY.md)。

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

生成器会对素材进行多层质量增强：先根据提示词建立主体轮廓，再叠加方向性高光、暗部、材质纹理和语义装饰。例如法师、战士、射手、机器人和重甲单位会生成不同的人物比例和装备结构；冰雪提示词会生成冷色高光和冰晶，森林提示词会生成藤蔓与叶片，武器、盾牌、药水、金币等提示词会映射到更明确的像素符号。

导出的 JSON 元数据包含素材名称、类型、动作、尺寸、调色板、seed、帧数和导入建议，可作为后续接入 Unity `.meta`、Godot `.tres`、Aseprite 文件或素材包打包流程的基础。

项目素材库用于收集当前会话中的候选素材。manifest 清单记录每个素材的名称、提示词、类型、动作、风格、seed、调色板和导入设置，适合提交给后续关卡编辑、引擎导入或素材包整理流程。

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
