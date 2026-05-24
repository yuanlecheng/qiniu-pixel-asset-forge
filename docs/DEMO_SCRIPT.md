# Demo 讲解脚本

本脚本用于录制正式讲解版 Demo。仓库已经提供可播放的展示页 [`demo/index.html`](../demo/index.html) 与无声演示视频 [`demo/demo.webm`](../demo/demo.webm)，评审可直接打开在线 Demo 页查看项目效果。

## 建议时长

正式讲解版建议控制在 2 到 3 分钟。仓库内置的 `demo.webm` 是无声快速展示版，适合作为在线预览页首屏材料。

## 讲解顺序

1. 打开在线预览地址  
   https://yuanlecheng.github.io/qiniu-pixel-asset-forge/

2. 简介项目定位  
   Pixel Asset Forge 是一个浏览器端 2D 像素游戏素材生成工具，面向 Game Jam、课程项目、独立游戏原型和轻量级 2D 开发场景。项目以开源仓库形式交付，评审或开发者可以直接复现。

3. 展示快速演示区  
   点击“英雄角色”“敌方单位”“装备道具”“地图地块”“技能图标”，说明每个案例都会自动切换提示词、素材类型、动作用途和视觉风格。

4. 展示自定义提示词  
   输入几个游戏相关提示词，例如：

   ```text
   floating blue ghost holding lantern
   emerald skull key with green glow
   blue mana star spell ui icon with glow
   lava cracked dungeon floor tile
   ```

   说明生成器会解析主体、颜色、材质、环境和特效，并根据素材类型调整轮廓。

5. 展示非人形单位和道具主体  
   对比 slime、ghost、key、tile、spell icon 等类型，说明项目不是固定人形模板换色，而是根据关键词组合主体、装饰和特效。

6. 展示动作帧与变体  
   切换 Idle、Run、Attack、Hit，展示 4 帧动作预览；点击“换一版”，展示同一提示词下的稳定变体。

7. 展示一键项目素材包  
   点击“完整素材包”或“生成一套项目素材包”，说明工具会生成角色、敌人、道具、地块和 UI 图标，并加入项目素材库。

8. 展示导出能力  
   依次说明透明 PNG、精灵表、JSON 元数据和素材库 manifest。强调导出的 JSON 包含 seed、调色板、帧信息和 Unity / Godot / Aseprite 导入建议。

9. 展示复现能力  
   说明项目没有后端服务、没有 npm 依赖，克隆仓库后可以直接打开 `index.html`，或运行 `python -m http.server 4173` 复现。

10. 总结提交材料  
    作品覆盖题目“2D 游戏素材生成”，并提供在线预览、源码、复现文档、Demo 视频、提交自检清单、许可证和 CI 检查。

## 录屏建议

- 浏览器窗口宽度建议 1280px 以上。
- 先展示在线预览，再展示 Demo 页和 GitHub README。
- 录制时保持鼠标操作节奏稳定，每次点击后停留 2 到 3 秒。
- 如上传到视频平台或网盘，确保链接无需登录即可播放或下载。
