const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const DIST_DIR = path.join(ROOT, 'dist');
const PACKAGE_JSON = path.join(ROOT, 'package.json');

// 1️⃣ Lire la version depuis package.json
const pkg = JSON.parse(fs.readFileSync(PACKAGE_JSON, 'utf8'));
const version = pkg.version;

if (!version) {
  console.error('❌ Version introuvable dans package.json');
  process.exit(1);
}

console.log(`📦 Version package.json: ${version}`);

// 2️⃣ Renommer les fichiers (espaces → -)
fs.readdirSync(DIST_DIR).forEach(item => {
  const fullPath = path.join(DIST_DIR, item);
  if (fs.statSync(fullPath).isFile()) {
    const newName = item.replace(/ /g, '-');
    const newPath = path.join(DIST_DIR, newName);
    if (newName !== item) {
      fs.renameSync(fullPath, newPath);
      console.log(`🔁 Renommé: ${item} → ${newName}`);
    }
  }
});

// 3️⃣ Fichiers à uploader (PAS les dossiers)
const files = fs.readdirSync(DIST_DIR)
  .filter(f => fs.statSync(path.join(DIST_DIR, f)).isFile())
  .map(f => `"${path.join(DIST_DIR, f)}"`);

if (files.length === 0) {
  console.error('❌ Aucun fichier à uploader');
  process.exit(1);
}

// 4️⃣ Création de la release GitHub
const cmd = `gh release create ${version} ${files.join(' ')} ^
 --title "Release ${version}" ^
 --notes "Build automatique Electron" ^
 --clobber`;

try {
  execSync(cmd, {
    stdio: 'inherit',
    env: { ...process.env, GH_FORCE_TTY: '0' }
  });
  console.log(`✅ Release v${version} créée`);
} catch (err) {
  console.error('❌ Échec création release');
  process.exit(1);
}