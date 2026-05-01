import { discoverPlugins, discoverSkills } from '../lib/skills.js';

export async function listCommand() {
  const plugins = discoverPlugins();
  let total = 0;
  for (const plugin of plugins) {
    const skills = discoverSkills([plugin]);
    if (skills.length === 0) continue;
    console.log(`${plugin}  (${skills.length})`);
    for (const { skill } of skills) {
      console.log(`  - ${skill}`);
    }
    console.log('');
    total += skills.length;
  }
  console.log(`${total} skill${total === 1 ? '' : 's'} across ${plugins.length} plugin${plugins.length === 1 ? '' : 's'}.`);
}
