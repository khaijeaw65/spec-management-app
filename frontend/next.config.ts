import type { NextConfig } from "next";
import path from 'path';
import { fileURLToPath } from 'url';

const _dirname = path.dirname(fileURLToPath(import.meta.url));
/** Monorepo root so Turbopack can resolve `file:../packages/schemas` from node_modules. */
const monorepoRoot = path.join(_dirname, "..");

const nextConfig: NextConfig = {
  transpilePackages: ["@spec-app/schemas"],
  turbopack: {
    root: monorepoRoot,
  },
};

export default nextConfig;
