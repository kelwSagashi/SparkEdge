const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');

const cliDir = path.resolve(__dirname, '..');
const releaseDir = path.resolve(cliDir, 'release-artifacts');
if (!fs.existsSync(releaseDir)) {
  fs.mkdirSync(releaseDir, { recursive: true });
}

const pkg = require(path.join(cliDir, 'package.json'));
const version = pkg.version || '0.0.0';

const targets = [
  { bun: 'bun-windows-x64', platform: 'windows', arch: 'x64', ext: '.exe', archive: 'zip' },
  { bun: 'bun-linux-x64', platform: 'linux', arch: 'x64', ext: '', archive: 'zip' },
  { bun: 'bun-linux-arm64', platform: 'linux', arch: 'arm64', ext: '', archive: 'zip' }
];

console.log(`[build-release] Starting cross-compilation for version ${version}...`);

const crypto = require('crypto');
function sha256(filePath) {
  const hash = crypto.createHash('sha256');
  const data = fs.readFileSync(filePath);
  hash.update(data);
  return hash.digest('hex');
}

const checksums = {};

for (const target of targets) {
  const baseName = `spark-edge-${version}-${target.platform}-${target.arch}`;
  const binName = `spark-edge${target.ext}`;
  const binPath = path.join(releaseDir, binName);
  
  console.log(`\n=> Compiling for ${target.bun}...`);
  try {
    execSync(`bun build --compile --target=${target.bun} ./bin/spark-edge --outfile "${binPath}"`, {
      cwd: cliDir,
      stdio: 'inherit'
    });
  } catch (err) {
    console.error(`Failed to compile for ${target.bun}`);
    continue;
  }

  console.log(`=> Packaging ${target.bun}...`);
  if (target.archive === 'zip') {
    const zipPath = path.join(releaseDir, `${baseName}.zip`);
    const zip = new AdmZip();
    zip.addLocalFile(binPath, '', binName);
    
    // Add assets
    const assetsDir = path.join(cliDir, 'dist', 'assets');
    if (fs.existsSync(assetsDir)) zip.addLocalFolder(assetsDir, 'dist/assets');
    
    const drizzleDir = path.join(cliDir, 'dist', 'drizzle');
    if (fs.existsSync(drizzleDir)) zip.addLocalFolder(drizzleDir, 'drizzle');

    // Windows launcher bat
    const batContents = `@echo off\r\nREM Launcher for spark-edge\r\n"%~dp0\\${binName}" %* ^> con 2^>&1\r\necho.\r\necho Pressione qualquer tecla para sair...\r\npause >nul\r\n`;
    zip.addFile('spark-edge.bat', Buffer.from(batContents, 'utf8'));

    zip.writeZip(zipPath);
    console.log(`Created ${zipPath}`);
    checksums[path.basename(zipPath)] = sha256(zipPath);
    
  } else if (target.archive === 'tar') {
    const tarPath = path.join(releaseDir, `${baseName}.tar.gz`);
    const tarCmd = `tar -czf "${tarPath}" -C "${releaseDir}" "${binName}"`;
    try {
      execSync(tarCmd, { cwd: cliDir, stdio: 'inherit' });
      
      if (fs.existsSync(path.join(cliDir, 'dist', 'assets'))) {
        execSync(`tar -rzf "${tarPath}" -C "${path.join(cliDir, '..')}" "packages/cli/dist/assets" --transform="s/packages\\/cli\\///"`, { cwd: cliDir, stdio: 'inherit' });
      }
      if (fs.existsSync(path.join(cliDir, 'dist', 'drizzle'))) {
        execSync(`tar -rzf "${tarPath}" -C "${path.join(cliDir, '..')}" "packages/cli/dist/drizzle" --transform="s/packages\\/cli\\/dist\\/drizzle/drizzle/"`, { cwd: cliDir, stdio: 'inherit' });
      }
      
      console.log(`Created ${tarPath}`);
      checksums[path.basename(tarPath)] = sha256(tarPath);
    } catch (err) {
      console.error(`Failed to package ${tarPath} (requires tar)`);
    }
  }

  // Cleanup binary
  if (fs.existsSync(binPath)) {
    fs.unlinkSync(binPath);
  }
}

console.log('\n[build-release] Generating checksums...');
const checksPath = path.join(releaseDir, `spark-edge-${version}.sha256`);
const lines = Object.entries(checksums)
  .map(([name, sum]) => `${sum}  ${name}`)
  .join('\n') + '\n';
fs.writeFileSync(checksPath, lines);
console.log(`Wrote checksums to ${checksPath}`);
console.log('[build-release] Done!');
