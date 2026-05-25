import { statSync, readFileSync } from "node:fs";

const requiredFiles = [
  "index.html",
  "styles.css",
  "app.js",
  "README.md",
  "LICENSE",
  "CONTRIBUTING.md",
  "SUBMISSION_CHECKLIST.md",
  "docs/REPRODUCIBILITY.md",
  "docs/DEMO_SCRIPT.md",
  "demo/index.html",
  "demo/demo.webm",
  "demo/record.html",
  "docs/assets/preview-main.png",
  "docs/assets/preview-pack.png",
];

const textFiles = [
  "README.md",
  "SUBMISSION_CHECKLIST.md",
  "docs/REPRODUCIBILITY.md",
  "docs/DEMO_SCRIPT.md",
  "demo/README.md",
  "index.html",
  "demo/index.html",
  "app.js",
];

function read(path) {
  return readFileSync(path, "utf8");
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

for (const file of requiredFiles) {
  assert(statSync(file).isFile(), `Missing required file: ${file}`);
}

for (const file of textFiles) {
  const content = read(file);
  assert(!content.includes("\uFFFD"), `Replacement character found in ${file}`);
}

const index = read("index.html");
const app = read("app.js");
const readme = read("README.md");
const reproducibility = read("docs/REPRODUCIBILITY.md");
const demoPage = read("demo/index.html");

for (const id of [
  "mainCanvas",
  "generatePackBtn",
  "matchScore",
  "copyLinkBtn",
  "metadataOutput",
  "libraryGrid",
]) {
  assert(index.includes(`id="${id}"`), `Missing UI hook: ${id}`);
}

for (const snippet of [
  "function generateStarterPack",
  "function makeQualityReport",
  "function buildReproducibleUrl",
  "reproducibleUrl",
  "seedOffset",
  "paletteLock",
]) {
  assert(app.includes(snippet), `Missing app capability marker: ${snippet}`);
}

for (const snippet of [
  "https://yuanlecheng.github.io/qiniu-pixel-asset-forge/",
  "https://yuanlecheng.github.io/qiniu-pixel-asset-forge/demo/",
  "https://yuanlecheng.github.io/qiniu-pixel-asset-forge/demo/demo.webm",
  "docs/REPRODUCIBILITY.md",
  "SUBMISSION_CHECKLIST.md",
]) {
  assert(readme.includes(snippet), `README missing public entry: ${snippet}`);
}

for (const snippet of ["seedOffset", "reproducibleUrl", "paletteLock=1", "targets"]) {
  assert(reproducibility.includes(snippet), `Reproducibility guide missing: ${snippet}`);
}

assert(demoPage.includes("./demo.webm"), "Demo page does not reference demo.webm");
assert(statSync("demo/demo.webm").size > 5_000_000, "Demo video is unexpectedly small");

console.log("Project check passed");
