import {existsSync, readFileSync, readdirSync, statSync} from 'node:fs';
import {join, relative} from 'node:path';

const outputDir = 'out';
const indexPath = join(outputDir, 'index.html');

if (!existsSync(indexPath)) {
  throw new Error('verify-export: out/index.html was not generated');
}

const indexHtml = readFileSync(indexPath, 'utf8');
if (!indexHtml.includes('/app/_next/')) {
  throw new Error('verify-export: index.html does not reference /app/_next assets');
}

const files = [];
const walk = (dir) => {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    const stat = statSync(path);
    if (stat.isDirectory()) walk(path);
    else files.push(path);
  }
};
walk(outputDir);

const forbidden = [
  '@google/genai',
  'getDemoDefaultState',
  'handleDemoApiCall',
  'zooma_app_mock_state_v1',
  'zooma_demo_user',
  'inv_demo_',
  'firebase',
  'AI Studio',
];

const textExtensions = new Set(['.html', '.js', '.css', '.json', '.txt', '.map']);
const productionText = files
  .filter((path) => textExtensions.has(path.slice(path.lastIndexOf('.'))))
  .map((path) => `\n/* ${relative(outputDir, path)} */\n${readFileSync(path, 'utf8')}`)
  .join('\n');

for (const token of forbidden) {
  if (productionText.includes(token)) {
    throw new Error(`verify-export: forbidden development token found: ${token}`);
  }
}

const hasJs = files.some((path) => path.endsWith('.js'));
const hasCss = files.some((path) => path.endsWith('.css'));
if (!hasJs || !hasCss) {
  throw new Error('verify-export: expected JavaScript and CSS assets were not generated');
}

console.log(`verify-export: OK (${files.length} generated files)`);
