import { cpSync, existsSync, mkdirSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const dist = path.join(root, "node_modules/tesseract.js/dist");
const coreDist = path.join(root, "node_modules/tesseract.js-core");
const languages = ["eng", "deu"];
const out = path.join(root, "public/tesseract");
const coreOut = path.join(out, "core");
const langOut = path.join(out, "lang");

mkdirSync(out, { recursive: true });
mkdirSync(coreOut, { recursive: true });
mkdirSync(langOut, { recursive: true });

cpSync(path.join(dist, "tesseract.min.js"), path.join(out, "tesseract.min.js"));
cpSync(path.join(dist, "worker.min.js"), path.join(out, "worker.min.js"));

for (const file of readdirSync(coreDist)) {
  if (file.startsWith("tesseract-core")) {
    cpSync(path.join(coreDist, file), path.join(coreOut, file));
  }
}

for (const lang of languages) {
  const langData = path.join(
    root,
    `node_modules/@tesseract.js-data/${lang}/4.0.0_best_int/${lang}.traineddata.gz`,
  );

  if (!existsSync(langData)) {
    throw new Error(
      `Missing @tesseract.js-data/${lang} — run npm install to fetch OCR language data.`,
    );
  }

  cpSync(langData, path.join(langOut, `${lang}.traineddata.gz`));
}

console.log("Copied tesseract browser assets to public/tesseract/");
