# Reproducibility Guide

本文档说明如何从零复现 Pixel Asset Forge 的运行效果和导出结果。

## 环境要求

- 任意现代浏览器：Chrome、Edge、Firefox、Safari 均可。
- 可选：Python 3，用于启动本地静态服务器。
- 可选：Node.js，用于执行语法检查。

项目没有 npm 依赖、没有后端服务、没有构建步骤。

## 从仓库复现

```bash
git clone https://github.com/yuanlecheng/qiniu-pixel-asset-forge.git
cd qiniu-pixel-asset-forge
python -m http.server 4173
```

打开：

```text
http://localhost:4173/
```

也可以直接用浏览器打开 `index.html`。

## 复现默认素材

保持默认参数：

- 素材描述：冰霜法师，蓝色披风，适合横版冒险游戏
- 素材类型：角色
- 动作/用途：Idle 待机
- 视觉风格：街机像素
- 画布规格：64 x 64
- 变化强度：5
- 像素描边：开启
- 接地阴影：开启
- 调色板锁定：关闭

页面加载后应出现：

- 主画布中的像素角色。
- 4 帧动作帧。
- 4 个风格一致变体。
- JSON 元数据，其中包含 `seed`、`palette`、`frames`、`importSettings.workflow`。
- 项目素材库区域，初始状态为空。

## 结果可复现机制

生成器使用提示词、素材类型、视觉风格、动作和 seed 偏移计算确定性 hash，再用伪随机数生成形状、装饰和颜色分布。因此：

- 同一份代码、同一组参数会得到同一结果。
- 点击“换一版”会改变 seed 偏移，生成同风格变体。
- 锁定调色板后切换风格不会覆盖当前颜色，便于团队保持统一视觉语言。

## 导出验证

请在浏览器中依次验证：

1. 点击 `PNG`，应下载单张透明背景素材。
2. 点击 `精灵表`，应下载 4 列横向 sprite sheet。
3. 点击 `JSON`，应下载导入元数据。
4. 点击 `复制`，应将元数据写入剪贴板。
5. 点击 `保存到素材库`，当前素材应出现在项目素材库中。
6. 点击 `导出清单`，应下载 `pixel_asset_forge_manifest.json`。

## 素材库 manifest

素材库 manifest 用于复现和整理一组候选资产。每个条目包含：

- 素材名称、类型、动作和尺寸。
- 原始提示词和解析标签。
- seed 与调色板。
- 建议文件名。
- Unity / Godot / Aseprite 导入设置。

## 语法检查

如已安装 Node.js：

```bash
node --check app.js
```

该命令不运行应用，只检查 JavaScript 语法是否有效。

## 已知边界

- 当前版本是程序化像素生成 MVP，不依赖外部图像模型。
- 复杂角色姿态和高精度图标仍需要后续编辑器或 AI 细化能力。
- 浏览器下载行为可能受隐私设置或弹窗拦截策略影响。
