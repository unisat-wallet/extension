const fs = require('fs');
const path = require('path');
const glob = require('glob');

const SRC_DIR = path.resolve(__dirname, '../src');
const OUTPUT_FILE = path.resolve(__dirname, '../extracted-keys.json');
const EXCLUDE_DIRS = ['node_modules', 'dist', 'build'];
const FILE_EXTENSIONS = ['.tsx', '.ts', '.jsx', '.js'];

const extractedTexts = {};

const patterns = [
  /<[^>]*text=["']([^"']+)["'][^>]*>/g,
  /<[^>]*placeholder=["']([^"']+)["'][^>]*>/g,
  /<[^>]*title=["']([^"']+)["'][^>]*>/g,
  /<[^>]*label=["']([^"']+)["'][^>]*>/g,
  /new Error\(["']([^"']+)["']\)/g,
  /tools\.toast(?:Error|Success|Warning)\(["']([^"']+)["']\)/g,
  /throw new Error\(["']([^"']+)["']\)/g
];

function generateKey(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9_\s]/g, '')
    .replace(/\s+/g, '_')
    .substring(0, 50);
}

function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');

    patterns.forEach((pattern) => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const text = match[1].trim();
        if (text && text.length > 1) {
          const key = generateKey(text);
          extractedTexts[key] = { message: text };
        }
      }
    });
  } catch (error) {
    console.error(`Error processing file ${filePath}:`, error);
  }
}

function findFiles() {
  const fileExtPattern = FILE_EXTENSIONS.map((ext) => `**/*${ext}`);
  const excludePattern = EXCLUDE_DIRS.map((dir) => `!**/${dir}/**`);

  return glob.sync([...fileExtPattern, ...excludePattern], { cwd: SRC_DIR });
}

function main() {
  console.log('Starting extraction of i18n keys...');

  const files = findFiles();
  console.log(`Found ${files.length} files to process`);

  files.forEach((file) => {
    const filePath = path.join(SRC_DIR, file);
    processFile(filePath);
  });

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(extractedTexts, null, 2));
  console.log(`Extracted ${Object.keys(extractedTexts).length} keys to ${OUTPUT_FILE}`);
}

main();
