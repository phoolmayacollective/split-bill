import { spawn } from "node:child_process";
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

async function main() {
  console.log("Step 1/3 — Generating WaveNet narration…");
  await run("npm", ["run", "demo:narration"]);

  console.log("Cleaning previous demo videos…");
  await cleanVideosDir();

  console.log("Step 2/3 — Building app and recording walkthrough…");
  await run("npm", ["run", "build:demo"]);

  const server = spawn("npm", ["run", "start:demo"], {
    cwd: ROOT,
    stdio: ["ignore", "pipe", "pipe"],
    env: {
      ...process.env,
      DEMO_USE_AUDIO_TIMING: "1",
    },
    shell: true,
  });

  const rlOut = createInterface({ input: server.stdout });
  const rlErr = createInterface({ input: server.stderr });
  rlOut.on("line", (line) => console.log(`[demo-server] ${line}`));
  rlErr.on("line", (line) => console.error(`[demo-server] ${line}`));

  try {
    await waitForServer(BASE_URL);
    await run("npx", ["playwright", "test", "e2e/demo-walkthrough.spec.ts"], {
      env: { DEMO_USE_AUDIO_TIMING: "1" },
    });
    const outputPath = await finalizeVideo();
    console.log(`Recorded: ${outputPath}`);
  } finally {
    server.kill("SIGTERM");
    await delay(500);
    if (!server.killed) {
      server.kill("SIGKILL");
    }
  }

  console.log("Step 3/3 — Compositing final MP4…");
  await run("npm", ["run", "demo:composite"]);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
