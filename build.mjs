import * as esbuild from "esbuild";

await esbuild.build({
  entryPoints: ["src/index.tsx"],
  bundle: true,
  platform: "node",
  target: "node18",
  format: "esm",
  outfile: "dist/theosis.mjs",
  banner: {
    js: "#!/usr/bin/env node",
  },
  jsx: "automatic",
  external: ["ink", "react", "yoga-layout"],
});

console.log("✓ Build complete → dist/theosis.mjs");
