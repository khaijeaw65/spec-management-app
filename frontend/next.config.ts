import type { NextConfig } from "next";
import path from 'path';
import { fileURLToPath } from 'url';

const _dirname = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  /* config options here */
  turbopack: {
    root: _dirname,
  }
};

export default nextConfig;
