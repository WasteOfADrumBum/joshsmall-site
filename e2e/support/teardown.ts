import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

/**
 * After the whole run: the server log must not contain anything a visitor typed. Every synthetic
 * submission uses a tess.e2e-... address and a "Synthetic message" body, so either showing up in
 * the log means the handler logged personal data.
 */
export default function teardown() {
  const file = path.join(process.cwd(), "test-results", "server.log");
  if (!existsSync(file)) return;
  const log = readFileSync(file, "utf8");
  const leaks = log.split("\n").filter((line) => /tess\.[\w-]+@example\.test|Synthetic message|Tess Tester/.test(line));
  if (leaks.length) throw new Error(`Server log contains submitted personal data:\n${leaks.slice(0, 5).join("\n")}`);
}
