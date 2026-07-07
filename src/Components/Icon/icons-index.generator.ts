import { writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const icons = [
  'Close',
  'Check',
  'Upload',
  'Eye',
  'EyeOff',
  'Info',
  'Success',
  'Warning',
  'TriangleDown',
  'ChevronUp',
  'ChevronLeft',
  'ChevronDown',
  'Indeterminate',

  'Image',
  'Pdf',
  'Document',
  'Spreadsheet',
  'Archive',
  'Audio',
  'Video',
  'File',

  'Burger',
  'Dot',
] as const;

export default async function generate() {
  const content = [
    "export { IconWrapper } from './IconWrapper';",
    '',
    ...icons.map((icon) => `export { ${icon}, ${icon} as ${icon}Icon } from './${icon}';`),
    '',
  ].join('\n');

  const output = join(__dirname, 'index.ts');

  await writeFile(output, content, 'utf8');

  console.log(`Generated ${output}`);
}
