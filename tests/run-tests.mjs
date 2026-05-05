import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const nodeRequire = createRequire(import.meta.url);

nodeRequire("ts-node").register({
  compilerOptions: {
    module: "commonjs",
    moduleResolution: "node",
  },
  transpileOnly: true,
});

const targetArgs = process.argv.slice(2);

if (targetArgs.length === 0) {
  console.error("At least one test file path is required.");
  process.exit(1);
}

for (const targetArg of targetArgs) {
  const targetPath = path.join(process.cwd(), targetArg);

  if (!fs.existsSync(targetPath)) {
    console.error(`Test file not found: ${targetPath}`);
    process.exit(1);
  }

  nodeRequire(targetPath);
}
