import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { homedir } from 'node:os';

const __dirname = dirname(fileURLToPath(import.meta.url));

export const packageRoot = resolve(__dirname, '..', '..');
export const pluginsRoot = resolve(packageRoot, 'plugins');

const HARNESS_DEFINITIONS = {
  claude: {
    id: 'claude',
    name: 'Claude Code',
    aliases: ['claude', 'claude-code', 'claudecode'],
    skillsDir: ['.claude', 'skills'],
  },
  codex: {
    id: 'codex',
    name: 'Codex',
    aliases: ['codex'],
    skillsDir: ['.codex', 'skills'],
  },
};

export function supportedHarnesses() {
  return Object.values(HARNESS_DEFINITIONS).map(harness => harness.aliases[0]);
}

export function resolveHarness(rawHarness = 'claude') {
  const requested = rawHarness.toLowerCase();
  const harness = Object.values(HARNESS_DEFINITIONS).find(definition =>
    definition.aliases.includes(requested)
  );

  if (!harness) {
    throw new Error(
      `Unknown harness: ${rawHarness}\nSupported harnesses: ${supportedHarnesses().join(', ')}`
    );
  }

  return harness;
}

export function resolveDest({ global, dest, harness }) {
  if (dest) return resolve(process.cwd(), dest);
  const resolvedHarness = resolveHarness(harness);
  const base = global ? homedir() : process.cwd();
  return resolve(base, ...resolvedHarness.skillsDir);
}
