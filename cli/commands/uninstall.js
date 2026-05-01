import { existsSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { resolveDest } from '../lib/paths.js';
import { discoverSkills, parsePluginFilter, resolvePluginFilter } from '../lib/skills.js';

export async function uninstallCommand(opts) {
  let dest;
  try {
    dest = resolveDest(opts);
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }

  let filter;
  try {
    filter = resolvePluginFilter(parsePluginFilter(opts.plugin));
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }

  if (!existsSync(dest)) {
    console.error(`Destination does not exist: ${dest}`);
    process.exit(1);
  }

  const skills = discoverSkills(filter);

  let removed = 0;
  let missing = 0;
  for (const { skill } of skills) {
    const target = join(dest, skill);
    if (!existsSync(target)) {
      missing++;
      continue;
    }
    rmSync(target, { recursive: true, force: true });
    console.log(`  removed  ${skill}`);
    removed++;
  }

  console.log('');
  console.log(`Removed ${removed} skill${removed === 1 ? '' : 's'} from ${dest}`);
  if (missing > 0) console.log(`Skipped ${missing} (not present)`);
}
