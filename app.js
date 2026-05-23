const $ = (selector) => document.querySelector(selector);

const controls = {
  prompt: $("#prompt"),
  assetType: $("#assetType"),
  actionMode: $("#actionMode"),
  stylePreset: $("#stylePreset"),
  size: $("#size"),
  variance: $("#variance"),
  outline: $("#outline"),
  shadow: $("#shadow"),
  paletteLock: $("#paletteLock"),
  targetUnity: $("#targetUnity"),
  targetGodot: $("#targetGodot"),
  targetAseprite: $("#targetAseprite"),
  colors: [$("#color0"), $("#color1"), $("#color2"), $("#color3"), $("#color4"), $("#color5")],
};

const mainCanvas = $("#mainCanvas");
const variantCanvases = [...document.querySelectorAll(".variant")];
const motionCanvases = [...document.querySelectorAll(".motion")];
const state = {
  seedOffset: 0,
  lastMeta: {},
};

const palettes = {
  arcade: {
    label: "街机像素",
    colors: ["#171923", "#246bfe", "#16a36b", "#f0a92e", "#e65375", "#f8fafc"],
  },
  fantasy: {
    label: "奇幻冒险",
    colors: ["#1f2937", "#3b82f6", "#22c55e", "#f59e0b", "#a855f7", "#fff7ed"],
  },
  sciFi: {
    label: "科幻霓虹",
    colors: ["#08111f", "#00d4ff", "#7c3aed", "#ff3d81", "#9cff6e", "#f8fafc"],
  },
  cozy: {
    label: "温暖手作",
    colors: ["#2b2d42", "#5aa9e6", "#9bc53d", "#f4a261", "#ef476f", "#fff8e8"],
  },
  forest: {
    label: "森林童话",
    colors: ["#1f2a24", "#2f7d5b", "#7db255", "#f2c14e", "#d95d39", "#f7f4df"],
  },
};

const typeNames = {
  character: "角色",
  item: "道具",
  tile: "地块",
  ui: "UI 图标",
};

const actionNames = {
  idle: "Idle 待机",
  run: "Run 奔跑",
  attack: "Attack 攻击",
  hit: "Hit 受击",
};

const keywordMap = [
  { tag: "ice", words: ["冰", "霜", "雪", "frost", "ice", "snow"], color: 1 },
  { tag: "fire", words: ["火", "炎", "lava", "fire"], color: 3 },
  { tag: "forest", words: ["森林", "草", "木", "leaf", "forest"], color: 2 },
  { tag: "magic", words: ["法师", "魔法", "mage", "magic"], shape: "staff" },
  { tag: "blade", words: ["剑", "刀", "sword", "blade"], shape: "blade" },
  { tag: "shield", words: ["盾", "防御", "shield"], shape: "shield" },
  { tag: "potion", words: ["药", "瓶", "potion"], shape: "potion" },
  { tag: "coin", words: ["金币", "钱", "coin"], shape: "coin" },
  { tag: "heart", words: ["血", "心", "health", "heart"], shape: "heart" },
  { tag: "cape", words: ["披风", "斗篷", "cape", "cloak"], detail: "cape" },
];

function hashString(input) {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function createRng(seed) {
  let value = seed >>> 0;
  return () => {
    value += 0x6d2b79f5;
    let next = value;
    next = Math.imul(next ^ (next >>> 15), next | 1);
    next ^= next + Math.imul(next ^ (next >>> 7), next | 61);
    return ((next ^ (next >>> 14)) >>> 0) / 4294967296;
  };
}

function slugify(text) {
  const ascii = text
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_");
  return ascii || `asset_${hashString(text).toString(16).slice(0, 6)}`;
}

function analyzePrompt(prompt) {
  const lower = prompt.toLowerCase();
  const matches = keywordMap.filter((item) => item.words.some((word) => lower.includes(word)));
  const tags = [...new Set(matches.map((item) => item.tag))];
  const colorHint = matches.find((item) => item.color)?.color;
  const shape = matches.find((item) => item.shape)?.shape || "default";
  const details = matches.map((item) => item.detail).filter(Boolean);
  return {
    tags: tags.length ? tags : ["custom"],
    colorHint: colorHint ?? 1,
    shape,
    details,
  };
}

function syncPaletteInputs() {
  const palette = palettes[controls.stylePreset.value].colors;
  controls.colors.forEach((input, index) => {
    if (!controls.paletteLock.checked) input.value = palette[index];
  });
}

function readOptions() {
  const targets = [];
  if (controls.targetUnity.checked) targets.push("Unity");
  if (controls.targetGodot.checked) targets.push("Godot");
  if (controls.targetAseprite.checked) targets.push("Aseprite");

  const prompt = controls.prompt.value.trim() || "fantasy hero";
  return {
    prompt,
    profile: analyzePrompt(prompt),
    assetType: controls.assetType.value,
    actionMode: controls.actionMode.value,
    stylePreset: controls.stylePreset.value,
    size: Number(controls.size.value),
    variance: Number(controls.variance.value),
    outline: controls.outline.checked,
    shadow: controls.shadow.checked,
    paletteLocked: controls.paletteLock.checked,
    palette: controls.colors.map((input) => input.value),
    targets,
  };
}

function clearPixelCanvas(ctx, resolution) {
  ctx.clearRect(0, 0, resolution, resolution);
  ctx.imageSmoothingEnabled = false;
}

function setPixel(ctx, x, y, color, block = 1) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x), Math.round(y), block, block);
}

function fillPixelRect(ctx, x, y, width, height, color, block = 1) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x), Math.round(y), Math.round(width / block) * block, Math.round(height / block) * block);
}

function drawSymmetric(ctx, centerX, y, width, height, color, block = 1) {
  for (let row = 0; row < height; row += block) {
    for (let col = 0; col < width; col += block) {
      setPixel(ctx, centerX - col - block, y + row, color, block);
      setPixel(ctx, centerX + col, y + row, color, block);
    }
  }
}

function drawGroundShadow(ctx, size) {
  ctx.fillStyle = "rgba(23, 32, 42, 0.18)";
  ctx.beginPath();
  ctx.ellipse(size / 2, size * 0.79, size * 0.2, size * 0.045, 0, 0, Math.PI * 2);
  ctx.fill();
}

function motionDelta(action, frame, unit) {
  const cycle = [-1, 0, 1, 0][frame % 4] * unit;
  if (action === "run") return { x: cycle, y: frame % 2 === 0 ? -unit : 0, reach: unit * 2 };
  if (action === "attack") return { x: frame >= 2 ? unit * 3 : unit, y: frame === 1 ? -unit : 0, reach: unit * 4 };
  if (action === "hit") return { x: frame % 2 === 0 ? -unit * 2 : unit, y: 0, reach: 0 };
  return { x: 0, y: cycle, reach: unit };
}

function drawCharacter(ctx, rng, palette, size, options, frame) {
  const unit = Math.max(1, Math.floor(size / 32));
  const move = motionDelta(options.actionMode, frame, unit);
  const cx = Math.floor(size / 2 + move.x);
  const skin = palette[5];
  const primary = palette[options.profile.colorHint] || palette[1];
  const accent = palette[3 + Math.floor(rng() * 2)];
  const dark = palette[0];
  const bodyY = Math.floor(size * 0.38 + move.y);
  const bodyH = Math.floor(size * (0.27 + options.variance * 0.011));
  const bodyW = Math.floor(size * 0.15);
  const head = Math.floor(size * 0.18);

  if (options.shadow) drawGroundShadow(ctx, size);
  if (options.profile.details.includes("cape")) {
    drawSymmetric(ctx, cx, bodyY + unit * 2, bodyW + unit * 5, bodyH + unit * 4, palette[4], unit);
  }

  drawSymmetric(ctx, cx, bodyY, bodyW, bodyH, primary, unit);
  drawSymmetric(ctx, cx, bodyY + bodyH - unit, bodyW + unit * 2, unit * 4, accent, unit);

  fillPixelRect(ctx, cx - head / 2, Math.floor(size * 0.18 + move.y), head, head, skin, unit);
  setPixel(ctx, cx - unit * 3, Math.floor(size * 0.28 + move.y), dark, unit);
  setPixel(ctx, cx + unit * 2, Math.floor(size * 0.28 + move.y), dark, unit);
  drawSymmetric(ctx, cx, bodyY + unit * 3, bodyW + unit * 4, unit * 2, accent, unit);
  drawSymmetric(ctx, cx, bodyY + bodyH, unit * 4, Math.floor(size * 0.16), dark, unit);

  const handY = bodyY + unit * 7;
  if (options.profile.shape === "blade") {
    fillPixelRect(ctx, cx + bodyW + unit * 2, handY - move.reach, unit * 2, size * 0.28, palette[5], unit);
    setPixel(ctx, cx + bodyW + unit * 2, handY - move.reach - unit, dark, unit * 2);
  } else {
    fillPixelRect(ctx, cx + bodyW + unit * 4 + move.reach, handY - unit * 5, unit * 2, size * 0.32, dark, unit);
    setPixel(ctx, cx + bodyW + unit * 3 + move.reach, handY - unit * 6, accent, unit * 4);
  }

  for (let i = 0; i < 8 + options.variance; i += 1) {
    const sparkleX = Math.floor(rng() * size);
    const sparkleY = Math.floor(rng() * size * 0.72);
    setPixel(ctx, sparkleX, sparkleY, rng() > 0.45 ? accent : palette[2], unit);
  }
}

function drawDiamond(ctx, cx, cy, radius, color, block) {
  for (let y = -radius; y <= radius; y += block) {
    for (let x = -radius; x <= radius; x += block) {
      if (Math.abs(x) + Math.abs(y) < radius) setPixel(ctx, cx + x, cy + y, color, block);
    }
  }
}

function drawItem(ctx, rng, palette, size, options, frame) {
  const unit = Math.max(1, Math.floor(size / 32));
  const move = motionDelta(options.actionMode, frame, unit);
  const cx = Math.floor(size / 2 + move.x * 0.5);
  const cy = Math.floor(size / 2 + move.y);
  const primary = palette[options.profile.colorHint] || palette[1];
  const accent = palette[2 + Math.floor(rng() * 3)];
  const dark = palette[0];
  const radius = Math.floor(size * (0.16 + options.variance * 0.008));

  if (options.shadow) drawGroundShadow(ctx, size);

  if (options.profile.shape === "potion") {
    fillPixelRect(ctx, cx - radius * 0.7, cy - radius, radius * 1.4, radius * 1.8, primary, unit);
    fillPixelRect(ctx, cx - radius * 0.35, cy - radius * 1.45, radius * 0.7, radius * 0.55, palette[5], unit);
    fillPixelRect(ctx, cx - radius * 0.8, cy + radius * 0.55, radius * 1.6, unit * 3, accent, unit);
  } else if (options.profile.shape === "blade") {
    fillPixelRect(ctx, cx - unit, cy - radius * 1.5, unit * 3, radius * 2.4, palette[5], unit);
    fillPixelRect(ctx, cx - radius, cy + radius * 0.7, radius * 2, unit * 3, accent, unit);
    fillPixelRect(ctx, cx - unit, cy + radius, unit * 3, radius, dark, unit);
  } else if (options.profile.shape === "shield") {
    drawDiamond(ctx, cx, cy, radius + unit * 3, primary, unit);
    drawDiamond(ctx, cx, cy, radius, accent, unit);
    fillPixelRect(ctx, cx - unit, cy - radius, unit * 2, radius * 2, palette[5], unit);
  } else {
    drawDiamond(ctx, cx, cy, radius + unit * 2, primary, unit);
    drawDiamond(ctx, cx, cy, radius * 0.55, accent, unit);
  }

  for (let i = 0; i < 5 + options.variance; i += 1) {
    const angle = rng() * Math.PI * 2;
    const dist = radius + unit * (2 + Math.floor(rng() * 5));
    setPixel(ctx, cx + Math.cos(angle) * dist, cy + Math.sin(angle) * dist, accent, unit);
  }
}

function drawTile(ctx, rng, palette, size, options) {
  const unit = Math.max(2, Math.floor(size / 16));
  const base = options.profile.tags.includes("ice") ? palette[1] : options.profile.tags.includes("fire") ? palette[3] : palette[2];
  const detail = options.profile.tags.includes("forest") ? palette[5] : palette[3];
  const dark = palette[0];
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, size, size);

  for (let y = 0; y < size; y += unit) {
    for (let x = 0; x < size; x += unit) {
      const noise = rng();
      if (noise > 0.72 - options.variance * 0.025) setPixel(ctx, x, y, detail, unit);
      if (noise < 0.08) setPixel(ctx, x, y, dark, unit);
    }
  }

  ctx.strokeStyle = "rgba(23, 32, 42, 0.35)";
  ctx.lineWidth = Math.max(1, Math.floor(size / 64));
  ctx.strokeRect(0, 0, size, size);
}

function drawHeart(ctx, cx, cy, unit, color) {
  const pixels = [
    [0, 0], [1, 0], [3, 0], [4, 0],
    [-1, 1], [0, 1], [1, 1], [2, 1], [3, 1], [4, 1], [5, 1],
    [0, 2], [1, 2], [2, 2], [3, 2], [4, 2],
    [1, 3], [2, 3], [3, 3],
    [2, 4],
  ];
  pixels.forEach(([x, y]) => setPixel(ctx, cx + x * unit, cy + y * unit, color, unit));
}

function drawUiIcon(ctx, rng, palette, size, options, frame) {
  const unit = Math.max(1, Math.floor(size / 32));
  const primary = palette[options.profile.colorHint] || palette[1];
  const accent = palette[4];
  const dark = palette[0];
  const pad = Math.floor(size * 0.18);

  if (options.shadow) drawGroundShadow(ctx, size);
  fillPixelRect(ctx, pad, pad, size - pad * 2, size - pad * 2, primary, unit);
  ctx.clearRect(pad + unit * 3, pad + unit * 3, size - pad * 2 - unit * 6, size - pad * 2 - unit * 6);
  fillPixelRect(ctx, pad, pad, size - pad * 2, unit * 3, dark, unit);
  fillPixelRect(ctx, pad, size - pad - unit * 3, size - pad * 2, unit * 3, dark, unit);

  if (options.profile.shape === "heart") {
    drawHeart(ctx, Math.floor(size * 0.38), Math.floor(size * 0.34), unit * 2, accent);
  } else if (options.profile.shape === "coin") {
    drawDiamond(ctx, size / 2, size / 2, size * 0.17 + frame * unit * 0.4, palette[3], unit);
  } else {
    for (let i = 0; i < 4 + options.variance; i += 1) {
      const x = pad + unit * 4 + Math.floor(rng() * (size - pad * 2 - unit * 8));
      const y = pad + unit * 4 + Math.floor(rng() * (size - pad * 2 - unit * 8));
      setPixel(ctx, x, y, accent, unit * 2);
    }
  }
}

function addPixelOutline(canvas, color) {
  const ctx = canvas.getContext("2d");
  const { width, height } = canvas;
  const source = ctx.getImageData(0, 0, width, height);
  const output = ctx.createImageData(width, height);
  output.data.set(source.data);
  const alphaAt = (x, y) => {
    if (x < 0 || y < 0 || x >= width || y >= height) return 0;
    return source.data[(y * width + x) * 4 + 3];
  };
  const rgb = color.match(/\w\w/g).map((hex) => parseInt(hex, 16));

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const index = (y * width + x) * 4;
      if (source.data[index + 3] > 0) continue;
      const touches = alphaAt(x - 1, y) || alphaAt(x + 1, y) || alphaAt(x, y - 1) || alphaAt(x, y + 1);
      if (touches) {
        output.data[index] = rgb[0];
        output.data[index + 1] = rgb[1];
        output.data[index + 2] = rgb[2];
        output.data[index + 3] = 255;
      }
    }
  }
  ctx.putImageData(output, 0, 0);
}

function drawAssetToCanvas(canvas, options, seedOffset = 0, frame = 0) {
  const resolution = options.size;
  canvas.width = resolution;
  canvas.height = resolution;
  const ctx = canvas.getContext("2d");
  clearPixelCanvas(ctx, resolution);

  const seed = hashString(`${options.prompt}|${options.assetType}|${options.stylePreset}|${options.actionMode}|${seedOffset}`);
  const rng = createRng(seed + options.variance * 991 + frame * 1777);
  const palette = options.palette;

  if (options.assetType === "character") drawCharacter(ctx, rng, palette, resolution, options, frame);
  if (options.assetType === "item") drawItem(ctx, rng, palette, resolution, options, frame);
  if (options.assetType === "tile") drawTile(ctx, rng, palette, resolution, options, frame);
  if (options.assetType === "ui") drawUiIcon(ctx, rng, palette, resolution, options, frame);
  if (options.outline && options.assetType !== "tile") addPixelOutline(canvas, palette[0]);

  return { seed, palette };
}

function makeWorkflowTargets(options) {
  const settings = [];
  if (options.targets.includes("Unity")) settings.push("Unity: Sprite Mode Multiple, Filter Point, Compression None");
  if (options.targets.includes("Godot")) settings.push("Godot: Filter Off, Mipmaps Off, Region 4 columns");
  if (options.targets.includes("Aseprite")) settings.push("Aseprite: 4 frames, 100ms frame duration, indexed palette");
  return settings;
}

function makeMetadata(options, seed, palette) {
  const name = `${slugify(options.prompt)}_${options.assetType}`;
  return {
    name,
    topic: "2D 游戏素材生成",
    type: typeNames[options.assetType],
    action: actionNames[options.actionMode],
    prompt: options.prompt,
    promptTags: options.profile.tags,
    style: palettes[options.stylePreset].label,
    size: `${options.size}x${options.size}`,
    seed,
    palette,
    frames: 4,
    frameDurationMs: 100,
    transparentBackground: options.assetType !== "tile",
    exportTargets: options.targets,
    renderOptions: {
      outline: options.outline,
      shadow: options.shadow,
      paletteLocked: options.paletteLocked,
    },
    importSettings: {
      filterMode: "Point",
      compression: "None",
      pixelsPerUnit: options.size,
      spriteSheet: `${options.size * 4}x${options.size}`,
      workflow: makeWorkflowTargets(options),
    },
  };
}

function renderAll() {
  const options = readOptions();
  const result = drawAssetToCanvas(mainCanvas, options, state.seedOffset, 0);
  variantCanvases.forEach((canvas, index) => drawAssetToCanvas(canvas, options, state.seedOffset + index + 1, index));
  motionCanvases.forEach((canvas, index) => drawAssetToCanvas(canvas, options, state.seedOffset, index));

  const metadata = makeMetadata(options, result.seed, result.palette);
  state.lastMeta = metadata;
  $("#assetName").textContent = metadata.name;
  $("#assetSize").textContent = metadata.size.replace("x", " x ");
  $("#assetStyle").textContent = metadata.style;
  $("#importHint").textContent = metadata.importSettings.filterMode + " / " + metadata.importSettings.compression;
  $("#metadataOutput").textContent = JSON.stringify(metadata, null, 2);
  $("#statusText").textContent = "已生成";
  $("#frameLabel").textContent = `${metadata.action} / 4 frames`;
  $("#workflowText").textContent = metadata.importSettings.workflow.join("；") || "请选择至少一个导出目标";
  $("#promptTags").textContent = metadata.promptTags.join(", ");
}

function downloadCanvas(canvas, filename) {
  const link = document.createElement("a");
  link.download = filename;
  link.href = canvas.toDataURL("image/png");
  link.click();
}

function downloadSpriteSheet() {
  const options = readOptions();
  const sheet = document.createElement("canvas");
  sheet.width = options.size * 4;
  sheet.height = options.size;
  const ctx = sheet.getContext("2d");
  ctx.imageSmoothingEnabled = false;
  for (let i = 0; i < 4; i += 1) {
    const temp = document.createElement("canvas");
    drawAssetToCanvas(temp, options, state.seedOffset, i);
    ctx.drawImage(temp, i * options.size, 0);
  }
  downloadCanvas(sheet, `${state.lastMeta.name}_${options.actionMode}_sheet.png`);
}

function exportMetadata() {
  const text = JSON.stringify(state.lastMeta, null, 2);
  const blob = new Blob([text], { type: "application/json" });
  const link = document.createElement("a");
  link.download = `${state.lastMeta.name}.json`;
  link.href = URL.createObjectURL(blob);
  link.click();
  URL.revokeObjectURL(link.href);
  $("#statusText").textContent = "JSON 已下载";
}

async function copyMetadata() {
  const text = JSON.stringify(state.lastMeta, null, 2);
  try {
    await navigator.clipboard.writeText(text);
    $("#statusText").textContent = "元数据已复制";
  } catch {
    $("#statusText").textContent = "请手动复制";
  }
}

$("#generateBtn").addEventListener("click", renderAll);
$("#randomBtn").addEventListener("click", () => {
  state.seedOffset += 13;
  renderAll();
});
$("#downloadPngBtn").addEventListener("click", () => downloadCanvas(mainCanvas, `${state.lastMeta.name}.png`));
$("#downloadSheetBtn").addEventListener("click", downloadSpriteSheet);
$("#downloadMetaBtn").addEventListener("click", exportMetadata);
$("#copyMetaBtn").addEventListener("click", copyMetadata);
controls.stylePreset.addEventListener("change", () => {
  syncPaletteInputs();
  renderAll();
});
controls.paletteLock.addEventListener("change", renderAll);
controls.colors.forEach((input) => input.addEventListener("input", renderAll));

Object.entries(controls).forEach(([key, control]) => {
  if (key !== "colors" && control instanceof HTMLElement) control.addEventListener("input", renderAll);
});

syncPaletteInputs();
renderAll();
