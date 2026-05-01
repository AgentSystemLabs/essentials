import { mkdirSync, existsSync, cpSync } from 'node:fs';
import { join } from 'node:path';
import { normalizeCodexSkill } from '../lib/codex.js';
import { resolveDest, resolveHarness } from '../lib/paths.js';
import { discoverSkills, parsePluginFilter, resolvePluginFilter } from '../lib/skills.js';

export async function initCommand(opts) {
  let harness;
  let dest;
  try {
    harness = resolveHarness(opts.harness);
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

  const skills = discoverSkills(filter);

  if (skills.length === 0) {
    console.error('No skills found to install.');
    if (filter) console.error(`Plugin filter: ${filter.join(', ')}`);
    process.exit(1);
  }

  mkdirSync(dest, { recursive: true });

  const targetLabel = opts.dest
    ? `custom destination for ${harness.name}`
    : `${opts.global ? 'global ' : ''}${harness.name}`;
  console.log(`Installing AgentSystem skills for ${targetLabel}: ${dest}`);
  console.log('');

  let installed = 0;
  let skipped = 0;
  for (const { plugin, skill, dir } of skills) {
    const target = join(dest, skill);
    if (existsSync(target) && !opts.force) {
      console.log(`  skip   ${skill}  (exists — pass --force to overwrite)`);
      skipped++;
      continue;
    }
    cpSync(dir, target, { recursive: true, force: true });
    if (harness.id === 'codex') {
      normalizeCodexSkill(join(target, 'SKILL.md'), skill);
    }
    console.log(`  ok     ${plugin}:${skill}`);
    installed++;
  }

  console.log('');
  console.log(`Installed ${installed} skill${installed === 1 ? '' : 's'} to ${dest}`);
  if (skipped > 0) console.log(`Skipped ${skipped} (already present)`);
}
