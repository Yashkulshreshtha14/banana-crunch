import { spawnSync } from "node:child_process";

const packageManager = process.platform === "win32" ? "pnpm.cmd" : "pnpm";

function run(args) {
  const result = spawnSync(packageManager, args, {
    stdio: "inherit",
    shell: process.platform === "win32",
  });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}

run(["exec", "prisma", "generate"]);

// Apply schema and sample catalog only on production deploys. Vercel previews
// share no writes with the production database during their build.
if (process.env.VERCEL_ENV === "production") {
  run(["exec", "prisma", "migrate", "deploy"]);
  run(["db:seed"]);
}

run(["exec", "next", "build"]);
