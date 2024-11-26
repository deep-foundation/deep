#!/usr/bin/env node

// Main functionality exports
export * from './deep.js';
export * from './on.js';
export * from './benchmark.js';

const { argv } = process;
const args = argv.slice(2);

// Check if CLI mode is requested
if (args.includes('--cli')) {
  import('./cli.js').then(({ repl }) => {
    // CLI is automatically started in cli.ts
  });
}
