import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import textToSpeech from "@google-cloud/text-to-speech";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SCENES_PATH = path.join(ROOT, "demo/scenes.json");
const OUT_DIR = path.join(ROOT, "demo/output/audio");
const MANIFEST_PATH = path.join(OUT_DIR, "manifest.json");

const VOICE = {
  languageCode: "en-US",
  name: "en-US-Wavenet-D",
};

function ensureCredentials() {
  if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    console.error(
      "Missing GOOGLE_APPLICATION_CREDENTIALS.\n\n" +
        "Setup:\n" +
        "1. Enable Cloud Text-to-Speech API in Google Cloud Console\n" +
        "2. Create a service account and download JSON key\n" +
        "3. Add to .env.local:\n" +
        "   GOOGLE_APPLICATION_CREDENTIALS=/absolute/path/to/key.json\n",
    );
    process.exit(1);
  }
}

function probeDurationMs(filePath) {
  const output = execFileSync(
    "ffprobe",
    [
      "-v",
      "error",
      "-show_entries",
      "format=duration",
      "-of",
      "default=noprint_wrappers=1:nokey=1",
      filePath,
    ],
    { encoding: "utf8" },
  ).trim();

  const seconds = Number.parseFloat(output);
  if (!Number.isFinite(seconds)) {
    throw new Error(`Could not read duration for ${filePath}`);
  }

  return Math.ceil(seconds * 1000);
}

async function main() {
  ensureCredentials();

  const scenes = JSON.parse(readFileSync(SCENES_PATH, "utf8"));
  mkdirSync(OUT_DIR, { recursive: true });

  const client = new textToSpeech.TextToSpeechClient();
  const manifest = [];

  for (const scene of scenes) {
    console.log(`Generating narration: ${scene.id}`);

    const [response] = await client.synthesizeSpeech({
      input: { text: scene.text },
      voice: VOICE,
      audioConfig: {
        audioEncoding: "MP3",
        speakingRate: 0.95,
      },
    });

    const file = path.join(OUT_DIR, `${scene.id}.mp3`);
    writeFileSync(file, response.audioContent, "binary");

    manifest.push({
      id: scene.id,
      file: path.relative(ROOT, file),
      durationMs: probeDurationMs(file),
      bufferMs: scene.bufferMs ?? 500,
    });
  }

  writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
  console.log(`Wrote ${manifest.length} clips to ${OUT_DIR}`);
  console.log(`Manifest: ${MANIFEST_PATH}`);
}

main().catch((error) => {
  console.error(error.message ?? error);
  process.exit(1);
});
