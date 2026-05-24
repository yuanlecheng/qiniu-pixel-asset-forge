# Demo

本目录保存项目演示材料。

- [`demo.webm`](./demo.webm)：可直接播放的无声演示视频，展示在线预览、代表性素材、动作帧、语义解析和导出能力。
- [`record.html`](./record.html)：使用浏览器 Canvas 和 MediaRecorder 生成演示视频的可复现录制页。
- [`../docs/DEMO_SCRIPT.md`](../docs/DEMO_SCRIPT.md)：正式讲解版视频的录制脚本。

如果需要重新生成 `demo.webm`，先在仓库根目录启动静态服务：

```bash
python -m http.server 4173
```

然后访问：

```text
http://localhost:4173/demo/record.html
```

页面录制完成后会输出 WebM 的 Base64 内容，可保存为 `demo/demo.webm`。
