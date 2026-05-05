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

const targetArg = process.argv[2];

if (!targetArg) {
  console.error("A test file path is required.");
  process.exit(1);
}

const targetPath = path.join(process.cwd(), targetArg);

if (!fs.existsSync(targetPath)) {
  console.error(`Test file not found: ${targetPath}`);
  process.exit(1);
}

nodeRequire(targetPath);
