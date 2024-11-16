import fs from 'fs';
const pckg = JSON.parse(fs.readFileSync('./package.json', 'utf8'));

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    tsconfigPath: './tsconfig.next.json',
  },
  distDir: pckg.serverPath,
  basePath: '',
};

const CLIENT = +process.env.CLIENT;
if (CLIENT) {
  console.log('deep:', 'client building to ./client');
  nextConfig.distDir = pckg.clientPath;
  nextConfig.output = 'export';
} else {
  console.log('deep:', 'server building to ./server');
}

const BASE_PATH = process.env.BASE_PATH;
if (BASE_PATH) {
  console.log('deep:', 'BASE_PATH detected:', BASE_PATH);
  nextConfig.basePath = BASE_PATH;
}

// nextConfig.webpack = (config, { dev, isServer }) => {
//   config.optimization.minimizer.forEach((minimizer) => {
//     if (minimizer.constructor.name === 'TerserPlugin') {
//       minimizer.options.exclude = [
//         /src\/deep.ts$/,
//         /src\/being\.ts$/,
//         /src\/potentials\.ts$/,
//         /src\/on\.ts$/,
//       ];
//     }
//   });
//   config.optimization.minimize = false;

//   return config;
// };

export default nextConfig;
