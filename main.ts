// Leonida Ledger v2 — entry program.
// Copies app/ and screenshots/ into the grader output directory and writes
// dossier.json there with buildDossier from vendor/makefun-frontend.ts.
// Standard library only. Run: MAKEFUN_OUTPUT_DIR=out node main.ts
import { cpSync, mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { buildDossier } from "./vendor/makefun-frontend.ts";

const repoRoot = dirname(fileURLToPath(import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR || join(repoRoot, "out");

function handInEntry() {
  // The dossier is built from the repository (app/ + screenshots/), so the
  // copies below and the dossier always describe the same files.
  mkdirSync(outDir, { recursive: true });
  cpSync(join(repoRoot, "app"), join(outDir, "app"), { recursive: true });
  cpSync(join(repoRoot, "screenshots"), join(outDir, "screenshots"), { recursive: true });
  const dossier = buildDossier(repoRoot, { text_max_bytes: 163840 });
  writeFileSync(join(outDir, "dossier.json"), dossier);
}

handInEntry();
