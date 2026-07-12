import type { NextConfig } from "next";

function getAllowedDevOrigins(): string[] | undefined {
  const raw = process.env.ALLOWED_DEV_ORIGINS;
  if (!raw) {
    return undefined;
  }

  const origins = raw
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  return origins.length > 0 ? origins : undefined;
}

const nextConfig: NextConfig = {
  allowedDevOrigins: getAllowedDevOrigins(),
};

export default nextConfig;
