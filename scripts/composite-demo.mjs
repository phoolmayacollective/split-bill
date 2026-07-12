import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const VIDEO_PATH = path.join(ROOT, "demo/output/videos/demo-walkthrough.webm");
const MANIFEST_PATH = path.join(ROOT, "demo/output/audio/manifest.json");
const SCENES_PATH = path.join(ROOT, "demo/scenes.json");
const OUT_DIR = path.join(ROOT, "demo/output");
const NARRATION_PATH = path.join(OUT_DIR, "narration.mp3");
const FINAL_PATH = path.join(OUT_DIR, "final-demo.mp4");
const CONCAT_LIST_PATH = path.join(OUT_DIR, "audio-concat.txt");

function runFfmpeg(args) {
  execFileSync("ffmpeg", args, { stdio: "inherit" });
}

function buildNarrationTrack() {
  const manifest = JSON.parse(readFileSync(MANIFEST_PATH, "utf8"));
  const scenes = JSON.parse(readFileSync(SCENES_PATH, "utf8"));
  const sceneOrder = scenes.map((scene) => scene.id);

  const lines = sceneOrder.map((id) => {
    const entry = manifest.find((item) => item.id === id);
    if (!entry) {
      throw new Error(`Missing audio manifest entry for scene: ${id}`);
    }
    const absolute = path.join(ROOT, entry.file);
    if (!existsSync(absolute)) {
      throw new Error(`Missing audio file: ${absolute}`);
    }
    return `file '${absolute.replace(/'/g, "'\\''")}'`;
  });

  writeFileSync(CONCAT_LIST_PATH, `${lines.join("\n")}\n`);
  runFfmpeg([
    "-y",
    "-f",
    "concat",
    "-safe",
    "0",
    "-i",
    CONCAT_LIST_PATH,
    "-c:a",
    "libmp3lame",
    NARRATION_PATH,
  ]);
}

function muxVideoAndAudio() {
  if (!existsSync(VIDEO_PATH)) {
    throw new Error(
      `Missing demo video at ${VIDEO_PATH}. Run npm run demo:video first.`,
    );
  }

  runFfmpeg([
    "-y",
    "-i",
    VIDEO_PATH,
    "-i",
    NARRATION_PATH,
    "-c:v",
    "libx264",
    "-crf",
    "22",
    "-preset",
    "fast",
    "-c:a",
    "aac",
    "-b:a",
    "192k",
    "-movflags",
    "+faststart",
    "-shortest",
    FINAL_PATH,
  ]);
}

function main() {
  mkdirSync(OUT_DIR, { recursive: true });

  if (!existsSync(MANIFEST_PATH)) {
    throw new Error(
      `Missing ${MANIFEST_PATH}. Run npm run demo:narration first.`,
    );
  }

  console.log("Concatenating narration clips…");
  buildNarrationTrack();

  console.log("Muxing video + narration…");
  muxVideoAndAudio();

  console.log(`Final demo video: ${FINAL_PATH}`);
}

main();
