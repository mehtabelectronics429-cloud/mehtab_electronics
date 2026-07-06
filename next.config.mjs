/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // Client-side loading of remote royalty-free imagery (Unsplash).
    // unoptimized avoids build-time fetches so the project builds offline.
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
  transpilePackages: ["three"],
  webpack: (config, { dev }) => {
    // Belt-and-suspenders: neutralise optional peers that some libraries
    // reference but we don't use.
    config.resolve.alias = {
      ...config.resolve.alias,
      "hls.js": false,
    };
    // This project may live in a synced folder (OneDrive / Claude Projects)
    // where webpack's on-disk cache can't perform atomic renames, producing
    // "invalid block type" / ENOENT rename errors. Use an in-memory cache in
    // dev to keep hot-reload fast and stable there.
    if (dev) config.cache = { type: "memory" };
    return config;
  },
};

export default nextConfig;
