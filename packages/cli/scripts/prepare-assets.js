const fs = require('fs');
const path = require('path');

const cliDir = path.resolve(__dirname, '..');
const frontendDist = path.resolve(cliDir, '..', 'frontend', 'dist');
const dbDrizzle = path.resolve(cliDir, '..', 'db', 'drizzle');

const cliAssetsDist = path.resolve(cliDir, 'dist', 'assets');
const cliDrizzleDist = path.resolve(cliDir, 'dist', 'drizzle');

function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();
  if (isDirectory) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    fs.readdirSync(src).forEach((childItemName) => {
      copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

console.log('[prepare-assets] Cleaning old assets...');
if (fs.existsSync(cliAssetsDist)) fs.rmSync(cliAssetsDist, { recursive: true, force: true });
if (fs.existsSync(cliDrizzleDist)) fs.rmSync(cliDrizzleDist, { recursive: true, force: true });

console.log('[prepare-assets] Copying frontend assets...');
if (fs.existsSync(frontendDist)) {
  copyRecursiveSync(frontendDist, cliAssetsDist);
  console.log('Frontend assets copied successfully.');
} else {
  console.warn('Frontend dist not found at', frontendDist);
}

console.log('[prepare-assets] Copying DB migrations...');
if (fs.existsSync(dbDrizzle)) {
  copyRecursiveSync(dbDrizzle, cliDrizzleDist);
  console.log('DB migrations copied successfully.');
} else {
  console.warn('DB drizzle migrations not found at', dbDrizzle);
}

const rootReadme = path.resolve(cliDir, '..', '..', 'README.md');
const cliReadme = path.resolve(cliDir, 'README.md');

console.log('[prepare-assets] Copying root README.md to CLI package...');
if (fs.existsSync(rootReadme)) {
  fs.copyFileSync(rootReadme, cliReadme);
  console.log('README.md copied successfully.');
} else {
  console.warn('Root README.md not found at', rootReadme);
}
