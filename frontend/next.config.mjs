/** @type {import('next').NextConfig} */
process.env.EXPERIMENTAL_ENABLE_WASM = "true";

const nextConfig = {
  reactStrictMode: true,
  productionBrowserSourceMaps: false,
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // webpack(config) {
  //   // config.experiments = {
  //   //   ...config.experiments,
  //   //   asyncWebAssembly: true,
  //   // };
  //   config.experiments = { asyncWebAssembly: true, topLevelAwait: true, layers: true, };
  //   // config.module.rules.push({
  //   //   test: /\.wasm$/,
  //   //   type: "asset/resource",
  //   // });
  //   return config;
  // },
}

export default nextConfig
