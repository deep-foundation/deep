#!/usr/bin/env node

// Main functionality exports
export * from './deep';
export * from './on';
export * from './benchmark';

// CLI handling
if (require.main === module) {
  const { argv } = process;
  const args = argv.slice(2);
  
  // Check if CLI mode is requested
  if (args.includes('--cli')) {
    import('./cli').then(({ repl }) => {
      // CLI is automatically started in cli.ts
    });
  }
}
