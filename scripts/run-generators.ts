import fg from 'fast-glob';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

async function runGenerator(file: string) {
  try {
    const url = pathToFileURL(path.resolve(file)).href + `?t=${Date.now()}`;

    const mod = await import(url);

    if (typeof mod.default !== 'function') {
      console.warn(`${file} has no default export.`);
      return;
    }

    console.log(`Generating: ${file}`);

    await mod.default();

    console.log(`✓ Done: ${file}`);
  } catch (error) {
    console.error(`✗ Failed: ${file}`);
    console.error(error);
  }
}

const generators = await fg('src/**/*.generator.ts');

for (const file of generators) {
  await runGenerator(file);
}
