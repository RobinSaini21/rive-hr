import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pdfkit", "fontkit"],
  outputFileTracingIncludes: {
    "/api/**": ["./src/lib/server/pdf-fonts/**/*"],
  },
};

export default nextConfig;
