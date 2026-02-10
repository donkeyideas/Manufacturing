import type { Config } from 'tailwindcss';
import baseConfig from '../ui/tailwind.config';

const config: Config = {
  ...baseConfig,
  content: [
    './src/**/*.{ts,tsx}',
    './index.html',
    '../ui/src/**/*.{ts,tsx}',
  ],
};

export default config;
