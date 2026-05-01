#!/usr/bin/env node
import { Command } from 'commander';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { initCommand } from './commands/init.js';
import { listCommand } from './commands/list.js';
import { uninstallCommand } from './commands/uninstall.js';
import { collectPlugin } from './lib/skills.js';
import { supportedHarnesses } from './lib/paths.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(readFileSync(resolve(__dirname, '..', 'package.json'), 'utf-8'));

const program = new Command();

program
  .name('agentsystem-essentials')
  .description('Install AgentSystem essentials skills into any project')
  .version(pkg.version);

program
  .command('init')
  .description('Install skills for a supported agent harness')
  .option('--harness <name>', `Agent harness: ${supportedHarnesses().join(', ')}`, 'claude')
  .option('-g, --global', 'Install to the harness home directory')
  .option('-d, --dest <dir>', 'Custom destination directory')
  .option('-p, --plugin <name>', 'Plugin to install (short or full name; repeat or comma-separate for multiple)', collectPlugin, [])
  .option('-f, --force', 'Overwrite existing skill folders')
  .action(initCommand);

program
  .command('list')
  .description('List available plugins and skills')
  .action(listCommand);

program
  .command('uninstall')
  .description('Remove installed AgentSystem skills from target directory')
  .option('--harness <name>', `Agent harness: ${supportedHarnesses().join(', ')}`, 'claude')
  .option('-g, --global', 'Uninstall from the harness home directory')
  .option('-d, --dest <dir>', 'Custom directory to uninstall from')
  .option('-p, --plugin <name>', 'Plugin to remove (short or full name; repeat or comma-separate for multiple)', collectPlugin, [])
  .action(uninstallCommand);

program.parseAsync(process.argv);
