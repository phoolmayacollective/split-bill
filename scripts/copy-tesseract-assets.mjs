import { cpSync, mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const dist = path.join(root, "node_modules/tesseract.js/dist");
const out = path.join(root, "public/tesseract");

mkdirSync(out, { recursive: true });
cpSync(path.join(dist, "tesseract.min.js"), path.join(out, "tesseract.min.js"));
cpSync(path.join(dist, "worker.min.js"), path.join(out, "worker.min.js"));

console.log("Copied tesseract browser assets to public/tesseract/");
