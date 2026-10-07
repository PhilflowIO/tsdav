const { readFileSync, writeFileSync, mkdtempSync, rmSync } = require('node:fs');
const { resolve, join } = require('node:path');
const { execFileSync } = require('node:child_process');

const root = resolve(__dirname, '..');
const directory = mkdtempSync(join(root, 'tests', '.examples-'));
const pages = ['docs/docs/smart calendar sync.md', 'docs/docs/caldav/import-ical-feed.md'];
try {
  const sources = pages.map((page, index) => {
    const markdown = readFileSync(join(root, page), 'utf8');
    const source = markdown.match(/```ts\n([\s\S]*?)\n```/)?.[1];
    if (!source) throw new Error(`No TypeScript example in ${page}`);
    const filename = join(directory, `example-${index}.ts`);
    writeFileSync(filename, source);
    return filename;
  });
  // The docs import `tsdav`, the name consumers install this fork under
  // (`"tsdav": "npm:@philflow/tsdav@<version>"`). The package itself is
  // published as @philflow/tsdav, so `tsdav` is mapped to it here, the way
  // the alias maps it in a consumer's node_modules.
  const tsconfig = join(directory, 'tsconfig.json');
  writeFileSync(
    tsconfig,
    JSON.stringify({
      compilerOptions: {
        noEmit: true,
        strict: true,
        skipLibCheck: true,
        esModuleInterop: true,
        target: 'ES2018',
        lib: ['ES2019', 'DOM', 'DOM.Iterable'],
        module: 'preserve',
        moduleResolution: 'bundler',
        paths: { tsdav: [root] },
      },
      files: sources,
    }),
  );
  execFileSync('pnpm', ['exec', 'tsc', '-p', tsconfig], { cwd: root, stdio: 'inherit' });
} finally {
  rmSync(directory, { recursive: true, force: true });
}
