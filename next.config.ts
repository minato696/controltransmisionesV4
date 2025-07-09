import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Deshabilitar la comprobación de ESLint durante la compilación
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Deshabilitar la comprobación de tipos durante la compilación
    ignoreBuildErrors: true,
  },
};

export default nextConfig;