// Starts the already-built app with `next start` (the production server) for the browser tests.
// Output is mirrored to test-results/server.log so tests can check what the server logged.
// Fails fast with a clear message if there is no production build to serve.
import { spawn } from "node:child_process";
import { createWriteStream, existsSync, mkdirSync } from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "../..");
if (!existsSync(path.join(root, ".next", "BUILD_ID"))) {
  console.error("[serve] No production build found (.next/BUILD_ID). Run `npm run build` first.");
  process.exit(1);
}
const port = process.env.E2E_PORT ?? "3100";
mkdirSync(path.join(root, "test-results"), { recursive: true });
const log = createWriteStream(path.join(root, "test-results", "server.log"), { flags: "w" });

const nextBin = path.join(root, "node_modules", "next", "dist", "bin", "next");
const child = spawn(process.execPath, [nextBin, "start", "--port", port, "--hostname", "127.0.0.1"], {
  cwd: root,
  env: process.env,
  stdio: ["ignore", "pipe", "pipe"],
});
for (const stream of [child.stdout, child.stderr]) {
  stream.on("data", (chunk) => {
    process.stdout.write(chunk);
    log.write(chunk);
  });
}
child.on("exit", (code, signal) => {
  log.end();
  // An unexpected exit fails the run instead of leaving tests to time out.
  const stopped = signal === "SIGTERM" || signal === "SIGINT" || code === 143 || code === 130;
  if (!stopped) console.error(`[serve] next start exited (code ${code}, signal ${signal})`);
  process.exit(stopped ? 0 : (code ?? 1));
});
for (const sig of ["SIGINT", "SIGTERM"]) process.on(sig, () => child.kill(sig));
