import path from "path";
import { fileURLToPath } from "url";
import type { NextConfig } from "next";

// The repo root contains its own package-lock.json, which makes Turbopack infer
// the wrong workspace root. Pin it to this directory.
const projectDir = path.dirname(fileURLToPath(import.meta.url));

/**
 * Backend origin overrides (server-only env, read when building the proxy table).
 * Keep the browser-facing NEXT_PUBLIC_* values as-is; only migrate these if the
 * backends live on another host.
 */
const coreBackendOrigin = process.env.CORE_API_ORIGIN ?? "http://localhost:8080";
const aiBackendOrigin = process.env.AI_API_ORIGIN ?? "http://localhost:8000";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    root: projectDir,
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async rewrites() {
    return [
      {
        // MUST come first: auth controllers are rooted at /auth
        // (e.g. /auth/guest-register), so /api/core/auth/* maps accordingly.
        source: "/api/core/auth/:path*",
        destination: `${coreBackendOrigin}/auth/:path*`,
      },
      {
        // Everything else on the core API is rooted at /api (e.g.
        // /api/contents), and /api/** is the public permitAll() slice.
        source: "/api/core/:path*",
        destination: `${coreBackendOrigin}/api/:path*`,
      },
      {
        // FastAPI AI service expects /api/ai root_path (mounted behind a gateway)
        source: "/api/ai/:path*",
        destination: `${aiBackendOrigin}/api/ai/:path*`,
      },
    ];
  },
};

export default nextConfig;
