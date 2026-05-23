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
  library: [],
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
  { tag: "robot", words: ["机器人", "机械", "robot", "mech"], color: 1, detail: "visor" },
  { tag: "crystal", words: ["水晶", "宝石", "crystal", "gem"], shape: "crystal" },
  { tag: "magic", words: ["法师", "魔法", "mage", "magic"], shape: "staff" },
  { tag: "blade", words: ["剑", "刀", "sword", "blade"], shape: "blade" },
  { tag: "shield", words: ["盾", "防御", "shield"], shape: "shield" },
  { tag: "potion", words: ["药", "瓶", "potion"], shape: "potion" },
  { tag: "coin", words: ["金币", "钱", "coin"], shape: "coin" },
  { tag: "heart", words: ["血", "心", "health", "heart"], shape: "heart" },
  { tag: "cape", words: ["披风", "斗篷", "cape", "cloak"], detail: "cape" },
  { tag: "wing", words: ["翅膀", "翼", "wing"], detail: "wing" },
  { tag: "horn", words: ["角", "horn"], detail: "horn" },
  { tag: "archer", words: ["弓", "射手", "archer", "bow"], shape: "bow" },
  { tag: "heavy", words: ["重甲", "巨人", "坦克", "heavy", "giant", "tank"], detail: "heavy" },
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

function clamp(value, min = 0, max = 255) {
  return Math.min(max, Math.max(min, value));
}

function hexToRgb(color) {
  const clean = color.replace("#", "");
  return {
    r: parseInt(clean.slice(0, 2), 16),
    g: parseInt(clean.slice(2, 4), 16),
    b: parseInt(clean.slice(4, 6), 16),
  };
}

function rgbToHex({ r, g, b }) {
  return `#${[r, g, b].map((value) => clamp(Math.round(value)).toString(16).padStart(2, "0")).join("")}`;
}

function mixColor(a, b, amount) {
  const first = hexToRgb(a);
  const second = hexToRgb(b);
  return rgbToHex({
    r: first.r + (second.r - first.r) * amount,
    g: first.g + (second.g - first.g) * amount,
    b: first.b + (second.b - first.b) * amount,
  });
}

function shadeColor(color, amount) {
  return amount >= 0 ? mixColor(color, "#ffffff", amount) : mixColor(color, "#000000", Math.abs(amount));
}

function drawPixelLine(ctx, x1, y1, x2, y2, color, block = 1) {
  const steps = Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1)) / block;
  for (let i = 0; i <= steps; i += 1) {
    const t = steps === 0 ? 0 : i / steps;
    setPixel(ctx, x1 + (x2 - x1) * t, y1 + (y2 - y1) * t, color, block);
  }
}

function drawSparkle(ctx, x, y, color, block = 1) {
  setPixel(ctx, x, y, color, block);
  setPixel(ctx, x - block, y, color, block);
  setPixel(ctx, x + block, y, color, block);
  setPixel(ctx, x, y - block, color, block);
  setPixel(ctx, x, y + block, color, block);
}

function makeDesignRng(options, salt = "") {
  return createRng(hashString(`${options.prompt}|${options.assetType}|${options.stylePreset}|${salt}`));
}

function pickWeighted(rng, values) {
  return values[Math.floor(rng() * values.length)];
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
  const designRng = makeDesignRng(options, "character-silhouette");
  const archetype = options.profile.details.includes("heavy")
    ? "heavy"
    : options.profile.tags.includes("robot")
      ? "robot"
      : options.profile.shape === "blade"
        ? "warrior"
        : options.profile.shape === "bow"
          ? "archer"
          : options.profile.shape === "staff"
            ? "caster"
            : pickWeighted(designRng, ["scout", "guardian", "caster"]);
  const move = motionDelta(options.actionMode, frame, unit);
  const stance = archetype === "heavy" || archetype === "guardian" ? unit * 2 : archetype === "scout" ? -unit : 0;
  const cx = Math.floor(size / 2 + move.x);
  const skin = palette[5];
  const primary = palette[options.profile.colorHint] || palette[1];
  const accent = palette[3 + Math.floor(rng() * 2)];
  const dark = palette[0];
  const primaryLight = shadeColor(primary, 0.28);
  const primaryShade = shadeColor(primary, -0.28);
  const accentLight = shadeColor(accent, 0.26);
  const bodyY = Math.floor(size * (archetype === "heavy" ? 0.36 : 0.38) + move.y);
  const bodyHBase = archetype === "heavy" ? 0.34 : archetype === "scout" || archetype === "archer" ? 0.24 : 0.28;
  const bodyH = Math.floor(size * (bodyHBase + options.variance * 0.008 + designRng() * 0.025));
  const bodyWBase = archetype === "heavy" || archetype === "guardian" ? 0.2 : archetype === "scout" || archetype === "archer" ? 0.11 : 0.15;
  const bodyW = Math.floor(size * (bodyWBase + designRng() * 0.025));
  const headBase = archetype === "robot" ? 0.2 : archetype === "heavy" ? 0.16 : 0.18;
  const head = Math.floor(size * (headBase + designRng() * 0.025));
  const shoulderBonus = archetype === "heavy" || archetype === "guardian" ? unit * 4 : archetype === "scout" ? unit : unit * 2;
  const shoulderY = bodyY + unit * 2;

  if (options.shadow) drawGroundShadow(ctx, size);
  if (options.profile.details.includes("cape") || archetype === "caster") {
    drawSymmetric(ctx, cx, bodyY + unit * 2, bodyW + unit * 4 + shoulderBonus, bodyH + unit * 5, palette[4], unit);
    drawSymmetric(ctx, cx + unit, bodyY + bodyH, bodyW + unit * 4, unit * 4, shadeColor(palette[4], -0.28), unit);
  }
  if (options.profile.details.includes("wing")) {
    drawPixelLine(ctx, cx - bodyW - unit * 2, bodyY + unit * 5, cx - bodyW - unit * 10, bodyY - unit * 2, shadeColor(palette[5], -0.08), unit * 2);
    drawPixelLine(ctx, cx + bodyW + unit * 2, bodyY + unit * 5, cx + bodyW + unit * 10, bodyY - unit * 2, shadeColor(palette[5], -0.08), unit * 2);
  }

  drawSymmetric(ctx, cx, bodyY, bodyW, bodyH, primary, unit);
  drawSymmetric(ctx, cx, shoulderY, bodyW + shoulderBonus, unit * 3, primaryShade, unit);
  fillPixelRect(ctx, cx - bodyW, bodyY + unit * 3, unit * 3, bodyH - unit * 5, primaryLight, unit);
  fillPixelRect(ctx, cx + bodyW - unit * 2, bodyY + unit * 4, unit * 3, bodyH - unit * 5, primaryShade, unit);
  drawSymmetric(ctx, cx, bodyY + bodyH - unit, bodyW + unit * 2, unit * 4, accent, unit);
  fillPixelRect(ctx, cx - bodyW - unit, bodyY + Math.floor(bodyH * 0.58), bodyW * 2 + unit * 2, unit * 2, dark, unit);
  setPixel(ctx, cx - unit, bodyY + Math.floor(bodyH * 0.58), accentLight, unit * 2);
  if (archetype === "heavy" || archetype === "guardian") {
    fillPixelRect(ctx, cx - bodyW - unit * 2, bodyY + unit * 5, unit * 3, bodyH - unit * 7, dark, unit);
    fillPixelRect(ctx, cx + bodyW - unit, bodyY + unit * 5, unit * 3, bodyH - unit * 7, dark, unit);
  }

  const headX = cx - head / 2;
  const headY = Math.floor(size * (archetype === "heavy" ? 0.2 : 0.18) + move.y);
  if (archetype === "robot") {
    fillPixelRect(ctx, headX - unit, headY, head + unit * 2, head, dark, unit);
    fillPixelRect(ctx, headX, headY + unit, head, head - unit * 2, shadeColor(skin, -0.08), unit);
  } else {
    fillPixelRect(ctx, headX, headY, head, head, skin, unit);
  }
  fillPixelRect(ctx, headX, headY, head, unit * (archetype === "heavy" ? 4 : 3), dark, unit);
  fillPixelRect(ctx, headX, headY + head - unit * 3, head, unit * 2, shadeColor(skin, -0.16), unit);
  if (options.profile.details.includes("visor") || archetype === "robot") {
    fillPixelRect(ctx, cx - unit * 5, headY + Math.floor(head * 0.48), unit * 10, unit * 2, accentLight, unit);
  } else {
    setPixel(ctx, cx - unit * 3, headY + Math.floor(head * 0.55), dark, unit);
    setPixel(ctx, cx + unit * 2, headY + Math.floor(head * 0.55), dark, unit);
    setPixel(ctx, cx - unit, headY + Math.floor(head * 0.78), shadeColor(skin, -0.25), unit);
  }
  if (options.profile.details.includes("horn")) {
    drawPixelLine(ctx, cx - unit * 4, headY, cx - unit * 7, headY - unit * 5, palette[5], unit);
    drawPixelLine(ctx, cx + unit * 4, headY, cx + unit * 7, headY - unit * 5, palette[5], unit);
  }
  drawSymmetric(ctx, cx, bodyY + unit * 3, bodyW + unit * 4, unit * 2, accent, unit);
  drawSymmetric(ctx, cx, bodyY + bodyH, unit * (archetype === "scout" ? 2 : 3), Math.floor(size * 0.16), dark, unit);
  setPixel(ctx, cx - unit * (4 + stance / unit), bodyY + bodyH + unit * (frame % 2), primaryShade, unit * 2);
  setPixel(ctx, cx + unit * (3 + stance / unit), bodyY + bodyH + unit * ((frame + 1) % 2), primaryShade, unit * 2);

  const handY = bodyY + unit * 7;
  if (options.profile.shape === "blade" || archetype === "warrior") {
    drawPixelLine(ctx, cx + bodyW + unit * 2, handY + unit * 5, cx + bodyW + unit * 8 + move.reach, handY - unit * 8, palette[5], unit);
    drawPixelLine(ctx, cx + bodyW + unit * 3, handY + unit * 5, cx + bodyW + unit * 9 + move.reach, handY - unit * 7, shadeColor(palette[5], -0.2), unit);
    fillPixelRect(ctx, cx + bodyW, handY, unit * 6, unit * 2, accent, unit);
  } else if (options.profile.shape === "bow" || archetype === "archer") {
    drawPixelLine(ctx, cx + bodyW + unit * 3, handY - unit * 8, cx + bodyW + unit * 3, handY + unit * 8, dark, unit);
    drawPixelLine(ctx, cx + bodyW + unit * 3, handY - unit * 8, cx + bodyW + unit * 8, handY, accent, unit);
    drawPixelLine(ctx, cx + bodyW + unit * 3, handY + unit * 8, cx + bodyW + unit * 8, handY, accent, unit);
    drawPixelLine(ctx, cx + bodyW + unit * 8, handY, cx + bodyW + unit * 13, handY - unit * 2, palette[5], unit);
  } else if (archetype === "guardian") {
    drawDiamond(ctx, cx - bodyW - unit * 6, handY + unit * 3, unit * 6, dark, unit);
    drawDiamond(ctx, cx - bodyW - unit * 6, handY + unit * 3, unit * 4, accent, unit);
  } else {
    fillPixelRect(ctx, cx + bodyW + unit * 4 + move.reach, handY - unit * 5, unit * 2, size * 0.32, dark, unit);
    setPixel(ctx, cx + bodyW + unit * 3 + move.reach, handY - unit * 6, accent, unit * 4);
    setPixel(ctx, cx + bodyW + unit * 4 + move.reach, handY - unit * 5, accentLight, unit * 2);
  }

  for (let i = 0; i < 8 + options.variance; i += 1) {
    const sparkleX = Math.floor(rng() * size);
    const sparkleY = Math.floor(rng() * size * 0.72);
    if (rng() > 0.45) drawSparkle(ctx, sparkleX, sparkleY, rng() > 0.45 ? accent : palette[2], unit);
  }

  if (options.profile.tags.includes("ice")) {
    drawPixelLine(ctx, cx - unit * 7, bodyY - unit * 3, cx - unit * 3, bodyY - unit * 8, palette[1], unit);
    drawPixelLine(ctx, cx + unit * 7, bodyY - unit * 3, cx + unit * 3, bodyY - unit * 8, palette[1], unit);
  }
  if (options.profile.tags.includes("fire")) {
    setPixel(ctx, cx - unit * 2, bodyY - unit * 5, palette[3], unit * 2);
    setPixel(ctx, cx, bodyY - unit * 7, accentLight, unit * 2);
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
  const designRng = makeDesignRng(options, "item-silhouette");
  const defaultShape = pickWeighted(designRng, ["orb", "relic", "scroll", "badge"]);
  const move = motionDelta(options.actionMode, frame, unit);
  const cx = Math.floor(size / 2 + move.x * 0.5);
  const cy = Math.floor(size / 2 + move.y);
  const primary = palette[options.profile.colorHint] || palette[1];
  const accent = palette[2 + Math.floor(rng() * 3)];
  const dark = palette[0];
  const light = shadeColor(primary, 0.32);
  const shade = shadeColor(primary, -0.3);
  const radius = Math.floor(size * (0.16 + options.variance * 0.008));

  if (options.shadow) drawGroundShadow(ctx, size);

  if (options.profile.shape === "potion") {
    fillPixelRect(ctx, cx - radius * 0.82, cy - radius, radius * 1.64, radius * 1.85, shade, unit);
    fillPixelRect(ctx, cx - radius * 0.68, cy - radius + unit, radius * 1.2, radius * 1.55, primary, unit);
    fillPixelRect(ctx, cx - radius * 0.35, cy - radius * 1.45, radius * 0.7, radius * 0.55, palette[5], unit);
    fillPixelRect(ctx, cx - radius * 0.8, cy + radius * 0.55, radius * 1.6, unit * 3, accent, unit);
    fillPixelRect(ctx, cx - radius * 0.42, cy - radius * 0.55, unit * 2, radius * 0.9, light, unit);
    setPixel(ctx, cx + radius * 0.35, cy - radius * 0.2, shadeColor(accent, 0.35), unit * 2);
  } else if (options.profile.shape === "blade") {
    drawPixelLine(ctx, cx - unit * 2, cy + radius * 1.3, cx + unit * 2, cy - radius * 1.7, shadeColor(palette[5], -0.18), unit);
    drawPixelLine(ctx, cx - unit, cy + radius * 1.2, cx + unit * 3, cy - radius * 1.6, palette[5], unit);
    drawPixelLine(ctx, cx + unit, cy + radius * 0.9, cx + unit * 3, cy - radius * 1.2, "#ffffff", unit);
    fillPixelRect(ctx, cx - radius, cy + radius * 0.7, radius * 2, unit * 3, accent, unit);
    fillPixelRect(ctx, cx - unit, cy + radius, unit * 3, radius, dark, unit);
  } else if (options.profile.shape === "shield") {
    drawDiamond(ctx, cx, cy, radius + unit * 4, dark, unit);
    drawDiamond(ctx, cx, cy, radius + unit * 3, primary, unit);
    drawDiamond(ctx, cx, cy, radius, accent, unit);
    fillPixelRect(ctx, cx - unit, cy - radius, unit * 2, radius * 2, palette[5], unit);
    fillPixelRect(ctx, cx - radius * 0.45, cy - radius * 0.55, unit * 2, radius * 0.8, light, unit);
  } else if (options.profile.shape === "crystal") {
    drawDiamond(ctx, cx, cy, radius + unit * 4, dark, unit);
    drawDiamond(ctx, cx, cy, radius + unit * 3, primary, unit);
    drawPixelLine(ctx, cx, cy - radius - unit * 3, cx, cy + radius + unit * 2, light, unit);
    drawPixelLine(ctx, cx - radius, cy, cx + radius, cy, shade, unit);
    setPixel(ctx, cx - unit * 2, cy - unit * 4, "#ffffff", unit * 2);
  } else if (defaultShape === "orb") {
    drawDiamond(ctx, cx, cy, radius + unit * 3, dark, unit);
    drawDiamond(ctx, cx, cy, radius + unit * 2, primary, unit);
    drawDiamond(ctx, cx, cy, radius * 0.55, accent, unit);
    drawPixelLine(ctx, cx - radius * 0.7, cy - unit, cx + radius * 0.6, cy - radius * 0.55, light, unit);
    drawPixelLine(ctx, cx + radius * 0.2, cy + radius * 0.7, cx + radius * 0.78, cy, shade, unit);
  } else if (defaultShape === "scroll") {
    fillPixelRect(ctx, cx - radius, cy - radius * 0.8, radius * 2, radius * 1.6, palette[5], unit);
    fillPixelRect(ctx, cx - radius - unit * 2, cy - radius, unit * 4, radius * 2, shadeColor(palette[5], -0.22), unit);
    fillPixelRect(ctx, cx + radius - unit * 2, cy - radius, unit * 4, radius * 2, shadeColor(palette[5], -0.22), unit);
    drawPixelLine(ctx, cx - radius * 0.45, cy - unit * 2, cx + radius * 0.5, cy - unit * 2, dark, unit);
    drawPixelLine(ctx, cx - radius * 0.45, cy + unit * 2, cx + radius * 0.35, cy + unit * 2, accent, unit);
  } else if (defaultShape === "badge") {
    drawDiamond(ctx, cx, cy, radius + unit * 4, dark, unit);
    drawDiamond(ctx, cx, cy, radius + unit * 2, primary, unit);
    fillPixelRect(ctx, cx - unit * 2, cy - radius * 0.55, unit * 4, radius * 1.1, accent, unit);
    fillPixelRect(ctx, cx - radius * 0.55, cy - unit * 2, radius * 1.1, unit * 4, light, unit);
  } else {
    fillPixelRect(ctx, cx - radius, cy - radius, radius * 2, radius * 2, dark, unit);
    fillPixelRect(ctx, cx - radius + unit * 2, cy - radius + unit * 2, radius * 2 - unit * 4, radius * 2 - unit * 4, primary, unit);
    drawPixelLine(ctx, cx - radius, cy - radius, cx + radius, cy + radius, light, unit);
    drawPixelLine(ctx, cx + radius, cy - radius, cx - radius, cy + radius, shade, unit);
  }

  for (let i = 0; i < 5 + options.variance; i += 1) {
    const angle = rng() * Math.PI * 2;
    const dist = radius + unit * (2 + Math.floor(rng() * 5));
    if (rng() > 0.25) drawSparkle(ctx, cx + Math.cos(angle) * dist, cy + Math.sin(angle) * dist, accent, unit);
  }
}

function drawTile(ctx, rng, palette, size, options) {
  const unit = Math.max(2, Math.floor(size / 16));
  const base = options.profile.tags.includes("ice") ? palette[1] : options.profile.tags.includes("fire") ? palette[3] : palette[2];
  const detail = options.profile.tags.includes("forest") ? palette[5] : palette[3];
  const dark = palette[0];
  const baseLight = shadeColor(base, 0.18);
  const baseShade = shadeColor(base, -0.22);
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, size, size);

  for (let y = 0; y < size; y += unit) {
    for (let x = 0; x < size; x += unit) {
      const noise = rng();
      if (noise > 0.8 - options.variance * 0.022) setPixel(ctx, x, y, detail, unit);
      if (noise > 0.58 && noise < 0.66) setPixel(ctx, x, y, baseLight, unit);
      if (noise < 0.12) setPixel(ctx, x, y, baseShade, unit);
      if (noise < 0.045) setPixel(ctx, x, y, dark, unit);
    }
  }

  for (let i = 0; i < 4 + Math.floor(options.variance / 2); i += 1) {
    const x = Math.floor(rng() * size / unit) * unit;
    const y = Math.floor(rng() * size / unit) * unit;
    drawPixelLine(ctx, x, y, x + unit * (2 + Math.floor(rng() * 4)), y + unit * (rng() > 0.5 ? 1 : -1), baseShade, unit);
  }

  if (options.profile.tags.includes("forest")) {
    for (let i = 0; i < 5; i += 1) {
      const x = Math.floor(rng() * size / unit) * unit;
      const y = Math.floor(rng() * size / unit) * unit;
      drawPixelLine(ctx, x, y, x + unit * 3, y + unit * (rng() > 0.5 ? 1 : -1), palette[2], unit);
      setPixel(ctx, x + unit * 3, y, detail, unit);
    }
  }

  if (options.profile.tags.includes("ice")) {
    for (let i = 0; i < 4; i += 1) {
      const x = Math.floor(rng() * size / unit) * unit;
      const y = Math.floor(rng() * size / unit) * unit;
      drawSparkle(ctx, x, y, "#ffffff", unit);
    }
  }

  if (options.profile.tags.includes("fire")) {
    for (let i = 0; i < 5; i += 1) {
      const x = Math.floor(rng() * size / unit) * unit;
      const y = Math.floor(rng() * size / unit) * unit;
      drawPixelLine(ctx, x, y, x + unit * 4, y, palette[0], unit);
      setPixel(ctx, x + unit * 2, y, palette[3], unit);
    }
  }

  ctx.strokeStyle = "rgba(23, 32, 42, 0.35)";
  ctx.lineWidth = Math.max(1, Math.floor(size / 64));
  ctx.strokeRect(0, 0, size, size);

  ctx.strokeStyle = "rgba(255, 255, 255, 0.22)";
  ctx.strokeRect(unit, unit, size - unit * 2, size - unit * 2);
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
  const designRng = makeDesignRng(options, "ui-symbol");
  const defaultSymbol = pickWeighted(designRng, ["spark", "ring", "rune", "grid"]);
  const primary = palette[options.profile.colorHint] || palette[1];
  const accent = palette[4];
  const dark = palette[0];
  const light = shadeColor(primary, 0.35);
  const shade = shadeColor(primary, -0.28);
  const pad = Math.floor(size * 0.18);

  if (options.shadow) drawGroundShadow(ctx, size);
  fillPixelRect(ctx, pad - unit * 2, pad - unit * 2, size - pad * 2 + unit * 4, size - pad * 2 + unit * 4, dark, unit);
  fillPixelRect(ctx, pad, pad, size - pad * 2, size - pad * 2, primary, unit);
  fillPixelRect(ctx, pad + unit * 2, pad + unit * 2, size - pad * 2 - unit * 4, unit * 3, light, unit);
  fillPixelRect(ctx, pad + unit * 2, size - pad - unit * 5, size - pad * 2 - unit * 4, unit * 3, shade, unit);
  ctx.clearRect(pad + unit * 5, pad + unit * 6, size - pad * 2 - unit * 10, size - pad * 2 - unit * 12);

  if (options.profile.shape === "heart") {
    drawHeart(ctx, Math.floor(size * 0.38), Math.floor(size * 0.34), unit * 2, accent);
  } else if (options.profile.shape === "coin") {
    drawDiamond(ctx, size / 2, size / 2, size * 0.18 + frame * unit * 0.4, dark, unit);
    drawDiamond(ctx, size / 2, size / 2, size * 0.15 + frame * unit * 0.4, palette[3], unit);
    drawPixelLine(ctx, size * 0.44, size * 0.42, size * 0.58, size * 0.58, shadeColor(palette[3], 0.38), unit);
  } else if (options.profile.shape === "shield") {
    drawDiamond(ctx, size / 2, size / 2, size * 0.17, dark, unit);
    drawDiamond(ctx, size / 2, size / 2, size * 0.14, accent, unit);
    fillPixelRect(ctx, size / 2 - unit, size * 0.38, unit * 2, size * 0.23, "#ffffff", unit);
  } else if (options.profile.shape === "blade") {
    drawPixelLine(ctx, size * 0.4, size * 0.66, size * 0.62, size * 0.34, "#ffffff", unit * 2);
    fillPixelRect(ctx, size * 0.36, size * 0.64, size * 0.28, unit * 3, accent, unit);
  } else if (options.profile.shape === "staff") {
    drawPixelLine(ctx, size * 0.42, size * 0.66, size * 0.58, size * 0.34, dark, unit * 2);
    drawSparkle(ctx, size * 0.6, size * 0.32, accent, unit * 2);
  } else if (defaultSymbol === "ring") {
    drawDiamond(ctx, size / 2, size / 2, size * 0.2, dark, unit);
    drawDiamond(ctx, size / 2, size / 2, size * 0.15, accent, unit);
    ctx.clearRect(size * 0.45, size * 0.45, size * 0.1, size * 0.1);
    drawSparkle(ctx, size * 0.62, size * 0.38, light, unit);
  } else if (defaultSymbol === "rune") {
    drawPixelLine(ctx, size * 0.38, size * 0.36, size * 0.62, size * 0.36, accent, unit * 2);
    drawPixelLine(ctx, size * 0.5, size * 0.36, size * 0.42, size * 0.64, dark, unit * 2);
    drawPixelLine(ctx, size * 0.42, size * 0.64, size * 0.62, size * 0.64, light, unit * 2);
  } else if (defaultSymbol === "grid") {
    fillPixelRect(ctx, size * 0.36, size * 0.36, unit * 5, unit * 5, accent, unit);
    fillPixelRect(ctx, size * 0.52, size * 0.36, unit * 5, unit * 5, light, unit);
    fillPixelRect(ctx, size * 0.36, size * 0.52, unit * 5, unit * 5, light, unit);
    fillPixelRect(ctx, size * 0.52, size * 0.52, unit * 5, unit * 5, accent, unit);
  } else {
    for (let i = 0; i < 4 + options.variance; i += 1) {
      const x = pad + unit * 4 + Math.floor(rng() * (size - pad * 2 - unit * 8));
      const y = pad + unit * 4 + Math.floor(rng() * (size - pad * 2 - unit * 8));
      drawSparkle(ctx, x, y, accent, unit);
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
      qualityPasses: ["prompt_silhouette", "directional_light", "material_detail", "semantic_motifs"],
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

function makeLibraryManifest() {
  return {
    project: "Pixel Asset Forge",
    generatedAt: new Date().toISOString(),
    assetCount: state.library.length,
    assets: state.library.map((asset, index) => ({
      index: index + 1,
      id: asset.id,
      name: asset.meta.name,
      type: asset.meta.type,
      action: asset.meta.action,
      style: asset.meta.style,
      size: asset.meta.size,
      seed: asset.meta.seed,
      prompt: asset.meta.prompt,
      promptTags: asset.meta.promptTags,
      palette: asset.meta.palette,
      suggestedFilename: `${asset.meta.name}.png`,
      importSettings: asset.meta.importSettings,
    })),
  };
}

function updateLibraryCount() {
  const count = state.library.length;
  $("#libraryCount").textContent = `${count} 个素材`;
}

function renderLibrary() {
  const grid = $("#libraryGrid");
  grid.replaceChildren();
  updateLibraryCount();

  if (state.library.length === 0) {
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent = "保存满意的生成结果，形成可导出的项目素材清单。";
    grid.append(empty);
    return;
  }

  state.library.forEach((asset) => {
    const card = document.createElement("article");
    card.className = "library-card";

    const image = document.createElement("img");
    image.src = asset.preview;
    image.alt = asset.meta.name;

    const body = document.createElement("div");
    body.className = "library-card-body";

    const title = document.createElement("h4");
    title.textContent = asset.meta.name;

    const details = document.createElement("p");
    details.textContent = `${asset.meta.type} / ${asset.meta.action} / ${asset.meta.size}`;

    const tags = document.createElement("p");
    tags.className = "library-tags";
    tags.textContent = asset.meta.promptTags.join(", ");

    const actions = document.createElement("div");
    actions.className = "library-actions";

    const downloadButton = document.createElement("button");
    downloadButton.type = "button";
    downloadButton.textContent = "PNG";
    downloadButton.addEventListener("click", () => downloadDataUrl(asset.preview, `${asset.meta.name}.png`));

    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.textContent = "移除";
    removeButton.addEventListener("click", () => {
      state.library = state.library.filter((item) => item.id !== asset.id);
      renderLibrary();
      $("#statusText").textContent = "已移除";
    });

    actions.append(downloadButton, removeButton);
    body.append(title, details, tags, actions);
    card.append(image, body);
    grid.append(card);
  });
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

function downloadDataUrl(dataUrl, filename) {
  const link = document.createElement("a");
  link.download = filename;
  link.href = dataUrl;
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

function downloadJson(data, filename) {
  const text = JSON.stringify(data, null, 2);
  const blob = new Blob([text], { type: "application/json" });
  const link = document.createElement("a");
  link.download = filename;
  link.href = URL.createObjectURL(blob);
  link.click();
  URL.revokeObjectURL(link.href);
}

function saveCurrentAsset() {
  const existing = state.library.find((asset) => asset.meta.seed === state.lastMeta.seed);
  if (existing) {
    $("#statusText").textContent = "素材已在库中";
    return;
  }

  state.library = [
    {
      id: `asset_${Date.now().toString(36)}_${state.library.length + 1}`,
      preview: mainCanvas.toDataURL("image/png"),
      meta: JSON.parse(JSON.stringify(state.lastMeta)),
    },
    ...state.library,
  ].slice(0, 12);
  renderLibrary();
  $("#statusText").textContent = "已保存到素材库";
}

function exportLibraryManifest() {
  if (state.library.length === 0) {
    $("#statusText").textContent = "素材库为空";
    return;
  }
  downloadJson(makeLibraryManifest(), "pixel_asset_forge_manifest.json");
  $("#statusText").textContent = "素材清单已下载";
}

function clearLibrary() {
  state.library = [];
  renderLibrary();
  $("#statusText").textContent = "素材库已清空";
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
$("#saveLibraryBtn").addEventListener("click", saveCurrentAsset);
$("#downloadLibraryBtn").addEventListener("click", exportLibraryManifest);
$("#clearLibraryBtn").addEventListener("click", clearLibrary);
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
renderLibrary();
