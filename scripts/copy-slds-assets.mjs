import { cp, rm, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, "..");
const sldsAssets = resolve(
  projectRoot,
  "node_modules/@salesforce-ux/design-system/assets",
);
const targetRoot = resolve(projectRoot, "public/assets/slds");

const folders = ["icons", "images"];

async function main() {
  if (!existsSync(sldsAssets)) {
    console.error(
      `[slds:assets] Source not found: ${sldsAssets}\nRun \`npm install\` first.`,
    );
    process.exit(1);
  }

  await rm(targetRoot, { recursive: true, force: true });
  await mkdir(targetRoot, { recursive: true });

  for (const folder of folders) {
    const src = join(sldsAssets, folder);
    const dest = join(targetRoot, folder);
    if (!existsSync(src)) {
      console.warn(`[slds:assets] Skipping missing source folder: ${src}`);
      continue;
    }
    await cp(src, dest, { recursive: true, force: true });
    console.log(`[slds:assets] Copied ${folder}/`);
  }

  console.log(`[slds:assets] Done. Output: ${targetRoot}`);
}

main().catch((err) => {
  console.error("[slds:assets] Failed:", err);
  process.exit(1);
});
