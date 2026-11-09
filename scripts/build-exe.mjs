import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const electronDistDir = path.join(rootDir, 'node_modules', 'electron', 'dist');
const releaseDir = path.join(rootDir, 'release', 'VNotch-win32-x64');
const resourcesAppDir = path.join(releaseDir, 'resources', 'app');

console.log('=== Packaging VNotch Dynamic Island (.exe) ===');

if (!fs.existsSync(electronDistDir)) {
  console.error('Error: Electron binary not found at', electronDistDir);
  process.exit(1);
}

// 1. Clean previous release folder
if (fs.existsSync(releaseDir)) {
  fs.rmSync(releaseDir, { recursive: true, force: true });
}
fs.mkdirSync(releaseDir, { recursive: true });

// 2. Copy Electron runtime files
console.log('1/4 Copying Electron Windows x64 runtime...');
fs.cpSync(electronDistDir, releaseDir, { recursive: true });

// 3. Remove default_app.asar and unused locale .pak files to reduce size
const defaultAsar = path.join(releaseDir, 'resources', 'default_app.asar');
if (fs.existsSync(defaultAsar)) {
  fs.rmSync(defaultAsar, { force: true });
}

const localesDir = path.join(releaseDir, 'locales');
if (fs.existsSync(localesDir)) {
  for (const file of fs.readdirSync(localesDir)) {
    if (file !== 'en-US.pak' && file !== 'id.pak') {
      fs.rmSync(path.join(localesDir, file), { force: true });
    }
  }
}

// 4. Copy compiled app bundle (dist, dist-electron, minimal package.json) into resources/app
console.log('2/4 Bundling compiled TypeScript & React assets into resources/app...');
fs.mkdirSync(resourcesAppDir, { recursive: true });

fs.cpSync(path.join(rootDir, 'dist'), path.join(resourcesAppDir, 'dist'), {
  recursive: true,
});
fs.cpSync(
  path.join(rootDir, 'dist-electron'),
  path.join(resourcesAppDir, 'dist-electron'),
  { recursive: true }
);

const rootPkg = JSON.parse(
  fs.readFileSync(path.join(rootDir, 'package.json'), 'utf8')
);
const prodPkg = {
  name: rootPkg.name,
  productName: 'VNotch Dynamic Island',
  version: rootPkg.version,
  description: rootPkg.description,
  main: 'dist-electron/electron/main.js',
};

fs.writeFileSync(
  path.join(resourcesAppDir, 'package.json'),
  JSON.stringify(prodPkg, null, 2),
  'utf8'
);

// 5. Rename electron.exe -> VNotch.exe
console.log('3/4 Creating VNotch.exe executable...');
const oldExe = path.join(releaseDir, 'electron.exe');
const newExe = path.join(releaseDir, 'VNotch.exe');
if (fs.existsSync(oldExe)) {
  fs.renameSync(oldExe, newExe);
}

console.log('4/4 Done! Executable created at:');
console.log('    ' + newExe);
