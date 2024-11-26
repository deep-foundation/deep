import fs from 'fs';
const pckg = JSON.parse(fs.readFileSync('./package.json', 'utf8'));

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    tsconfigPath: './tsconfig.next.json',
  },
  distDir: pckg.serverPath,
  basePath: '',
  webpack: (config) => {
    config.resolve.extensionAlias = {
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
    };
    return config;
  },
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

export default nextConfig;
