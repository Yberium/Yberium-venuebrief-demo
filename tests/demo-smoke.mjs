import fs from "node:fs";
import vm from "node:vm";

const html = fs.readFileSync("index.html", "utf8");
const css = fs.readFileSync("assets/product-parity-demo.css", "utf8");
const mobileCss = fs.readFileSync("assets/mobile-action-bar.css", "utf8");
const js = fs.readFileSync("assets/product-parity-demo.js", "utf8");
const manifest = JSON.parse(fs.readFileSync("site.webmanifest", "utf8"));

new vm.Script(js);

const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
if (duplicates.length) throw new Error(`Duplicate IDs: ${[...new Set(duplicates)].join(", ")}`);

const requiredIds = ["reset-button", "back-button", "primary-button", "voice-button", "copy-relay", "share-relay", "brief-output", "relay-output"];
for (const id of requiredIds) if (!html.includes(`id="${id}"`)) throw new Error(`Missing #${id}`);

for (const stage of [1, 2, 3, 4, 5]) if (!html.includes(`data-stage="${stage}"`)) throw new Error(`Missing stage ${stage}`);
for (const method of ["scan", "voice", "type", "venue"]) if (!html.includes(`data-method="${method}"`)) throw new Error(`Missing method ${method}`);

if (!js.includes("invalidateAfter")) throw new Error("Missing downstream invalidation");
if (!js.includes("stopRecognition")) throw new Error("Missing microphone cleanup");
if (!js.includes("navigator.share")) throw new Error("Missing native share support");
if (!css.includes(".mobile-progress")) throw new Error("Missing mobile progress styling");
if (!html.includes("assets/mobile-action-bar.css?v=1.0")) throw new Error("Missing compact mobile action bar stylesheet");
if (!mobileCss.includes(".action-status") || !mobileCss.includes("grid-template-columns")) throw new Error("Incomplete mobile action bar override");
if (!manifest.icons?.some(icon => icon.purpose.includes("maskable"))) throw new Error("Missing maskable install icon");
if (html.includes("product-parity-demo.js?v=1.0") || html.includes("product-parity-demo.css?v=1.0")) throw new Error("Assets were not cache-busted");

console.log("Yberium Pulse demo smoke checks passed.");
