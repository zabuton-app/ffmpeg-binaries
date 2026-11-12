// Builds the release assets from the upstream archives pinned in sources.json.
//
// For every target it downloads the archive, checks it against the pinned
// SHA-256, extracts the one executable and writes it gzip-compressed to
// dist/<tool>-<target>.gz. The SHA-256 of each extracted executable goes into
// binaries.json, which install.js checks every download against.
//
// Requires `7z` on PATH (it reads both the .zip and the .7z archives).
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { gzipSync } from "node:zlib";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const sources = JSON.parse(fs.readFileSync(path.join(root, "sources.json")));
const work = path.join(root, "work");
const dist = path.join(root, "dist");
fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(work, { recursive: true });
fs.mkdirSync(dist, { recursive: true });

const sha256 = (data) => createHash("sha256").update(data).digest("hex");

// Several tools can come from one archive, so each URL is downloaded once.
const archives = new Map();
async function archive(url, expected) {
  if (!archives.has(url)) {
    const file = path.join(work, sha256(url));
    if (!fs.existsSync(file) || sha256(fs.readFileSync(file)) !== expected) {
      console.log(`download ${url}`);
      const response = await fetch(url);
      if (!response.ok) throw new Error(`${url}: HTTP ${response.status}`);
      fs.writeFileSync(file, Buffer.from(await response.arrayBuffer()));
    }
    const actual = sha256(fs.readFileSync(file));
    if (actual !== expected) {
      throw new Error(`${url}: SHA-256 is ${actual}, expected ${expected}`);
    }
    archives.set(url, file);
  }
  return archives.get(url);
}

const files = {};
for (const [target, tools] of Object.entries(sources.targets)) {
  files[target] = {};
  for (const [tool, source] of Object.entries(tools)) {
    const file = await archive(source.url, source.sha256);
    const binary = execFileSync("7z", ["e", "-so", file, source.member], {
      maxBuffer: 512 * 1024 * 1024,
    });
    if (binary.length === 0) {
      throw new Error(`${source.member} not found in ${source.url}`);
    }
    // Level 9 and no timestamp, so the same input always gives the same asset.
    fs.writeFileSync(
      path.join(dist, `${tool}-${target}.gz`),
      gzipSync(binary, { level: 9 }),
    );
    files[target][tool] = { sha256: sha256(binary), size: binary.length };
    console.log(`${tool}-${target}: ${binary.length} bytes`);
  }
}

fs.writeFileSync(
  path.join(root, "binaries.json"),
  JSON.stringify({ ffmpeg: sources.ffmpeg, files }, null, 2) + "\n",
);
