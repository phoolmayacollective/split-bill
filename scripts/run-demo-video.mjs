import { spawn, execFileSync } from "node:child_process";
import { createInterface } from "node:readline";
import { setTimeout as delay } from "node:timers/promises";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const DEMO_PORT = 3001;
const BASE_URL = `http://localhost:${DEMO_PORT}`;
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const VIDEOS_DIR = path.join(ROOT, "demo/output/videos");
const OUTPUT_VIDEO = path.join(VIDEOS_DIR, "demo-walkthrough.webm");
const OUTPUT_MP4 = path.join(ROOT, "demo/output/demo-walkthrough.mp4");

function run(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: ROOT,
      stdio: "inherit",
      env: { ...process.env, ...options.env },
      shell: true,
    });

    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`${command} ${args.join(" ")} exited with ${code}`));
      }
    });
  });
}

async function waitForServer(url, timeoutMs = 60_000) {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    try {
      const response = await fetch(url);
      if (response.ok || response.status < 500) {
        return;
      }
    } catch {
      // Server not ready yet.
    }
    await delay(500);
  }

  throw new Error(`Timed out waiting for ${url}`);
}

async function cleanVideosDir() {
  await fs.mkdir(VIDEOS_DIR, { recursive: true });
  const entries = await fs.readdir(VIDEOS_DIR);
  await Promise.all(
    entries.map((entry) =>
      fs.rm(path.join(VIDEOS_DIR, entry), { recursive: true, force: true }),
    ),
  );
}

async function finalizeVideo() {
  const entries = await fs.readdir(VIDEOS_DIR);
  const webmFiles = entries.filter((entry) => entry.endsWith(".webm"));

  if (webmFiles.length === 0) {
    throw new Error("No demo video was recorded");
  }

  if (webmFiles.length > 1) {
    console.warn(
      `Expected one video, found ${webmFiles.length}. Using the newest file.`,
    );
  }

  const newest = await webmFiles.reduce(async (latestPromise, file) => {
    const latest = await latestPromise;
    const filePath = path.join(VIDEOS_DIR, file);
    const stat = await fs.stat(filePath);
    if (!latest || stat.mtimeMs > latest.mtimeMs) {
      return { file, mtimeMs: stat.mtimeMs };
    }
    return latest;
  }, Promise.resolve(null));

  const sourcePath = path.join(VIDEOS_DIR, newest.file);
  if (sourcePath !== OUTPUT_VIDEO) {
    await fs.rename(sourcePath, OUTPUT_VIDEO);
  }

  for (const file of webmFiles) {
    const filePath = path.join(VIDEOS_DIR, file);
    if (filePath !== OUTPUT_VIDEO) {
      await fs.rm(filePath, { force: true });
    }
  }

  return OUTPUT_VIDEO;
}

function hasFfmpeg() {
  try {
    execFileSync("ffmpeg", ["-version"], { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

function convertToMp4(webmPath) {
  execFileSync(
    "ffmpeg",
    ["-y", "-i", webmPath, "-c:v", "libx264", "-crf", "22", OUTPUT_MP4],
    { stdio: "inherit" },
  );
  return OUTPUT_MP4;
}

async function main() {
  console.log("Cleaning previous demo videos…");
  await cleanVideosDir();

  console.log("Building app with demo mode enabled…");
  await run("npm", ["run", "build:demo"]);

  console.log(`Starting demo server on ${BASE_URL}…`);
  const server = spawn("npm", ["run", "start:demo"], {
    cwd: ROOT,
    stdio: ["ignore", "pipe", "pipe"],
    env: process.env,
    shell: true,
  });

  const rlOut = createInterface({ input: server.stdout });
  const rlErr = createInterface({ input: server.stderr });
  rlOut.on("line", (line) => console.log(`[demo-server] ${line}`));
  rlErr.on("line", (line) => console.error(`[demo-server] ${line}`));

  try {
    await waitForServer(BASE_URL);
    console.log("Running Playwright demo walkthrough…");
    await run("npx", ["playwright", "test", "e2e/demo-walkthrough.spec.ts"]);
    const outputPath = await finalizeVideo();
    console.log(`Demo video saved: ${outputPath}`);

    if (hasFfmpeg()) {
      console.log("Converting to MP4…");
      const mp4Path = convertToMp4(outputPath);
      console.log(`Demo MP4 saved: ${mp4Path}`);
    } else {
      console.warn(
        "ffmpeg not found — skipped MP4 conversion. Install ffmpeg to get demo/output/demo-walkthrough.mp4",
      );
    }
  } finally {
    server.kill("SIGTERM");
    await delay(500);
    if (!server.killed) {
      server.kill("SIGKILL");
    }
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
