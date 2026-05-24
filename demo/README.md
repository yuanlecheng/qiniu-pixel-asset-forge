# Demo

本目录保存 Pixel Asset Forge 的演示材料，用于评审、线上展示和开源复现。

- [`index.html`](./index.html)：Demo 展示页，包含视频播放器、在线工具入口、讲解脚本入口和源码仓库入口。
- [`demo.webm`](./demo.webm)：可直接播放的无声演示视频，展示项目定位、文本生成、非人形素材、一键素材包、导出与复现闭环。
- [`record.html`](./record.html)：可复现的视频录制页，使用浏览器 Canvas 与 MediaRecorder 生成 `demo.webm`。
- [`../docs/DEMO_SCRIPT.md`](../docs/DEMO_SCRIPT.md)：正式讲解版视频可参考的录制脚本。

## 重新生成视频

在仓库根目录启动静态服务：

```bash
python -m http.server 4173
```

访问录制页：

```text
http://localhost:4173/demo/record.html
```

录制页会自动渲染分章画面，并在页面底部输出 WebM 的 Base64 内容。将输出内容解码后保存为 `demo/demo.webm`，即可得到与仓库同步的演示视频。

## 视频章节

1. 项目定位：说明 Pixel Asset Forge 面向 2D 游戏原型素材生成。
2. 文本生成：展示提示词解析、视觉规则和动作帧。
3. 道具主体：展示 key、skull、glow 等语义组合。
4. 敌人与生物：展示 slime 等非人形游戏单位。
5. 一键素材包：展示素材库、manifest 和工具链建议。
6. 导出复现：展示 PNG、精灵表、JSON 元数据和开源交付。
7. 在线提交材料：展示在线预览、Demo、源码和复现文档的闭环。
