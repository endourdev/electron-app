# Electron Auto-Updater App

Petit projet Electron qui démontre un système de mise à jour automatisée basé sur `electron-updater`. L'application ouvre d'abord une fenêtre d'update au démarrage, vérifie la disponibilité d'une nouvelle version, télécharge la mise à jour en affichant une interface soignée (Tailwind) et propose d'installer/redémarrer.

## Fonctionnalités principales
- Vérification automatique des mises à jour au démarrage.
- Téléchargement contrôlé avec retour de progression (IPC main → renderer).
- Fenêtre d'update dédiée avec UI stylée (Tailwind CDN) et bouton "Installer et redémarrer".
- Script d'aide à la publication (`scripts/createRelease.js`).

## Structure importante
- `main.js` : logique principale, configuration de `autoUpdater`, routing des événements vers la fenêtre d'update.
- `screens/update/*` : fenêtre d'update (HTML, preload, view, screen) — UI Tailwind.
- `screens/main/*` : fenêtre principale de l'app.
- `scripts/createRelease.js` : script de création de release (utilise la CLI `gh`).
- `watch-dist.bat` : outil Windows pour surveiller `dist` (projet spécifique).

## Prérequis
- Node.js (version active LTS recommandée)
- npm
- En production : configuré pour fonctionner avec `electron-builder` et `electron-updater` (provider GitHub par défaut).

## Installation et démarrage (dev)
1. Installer les dépendances :

```bash
npm install
```

2. Lancer l'application en développement :

```bash
npm run start
```

ou

```bash
electron .
```

Remarque : la fenêtre d'update s'ouvre au démarrage pour vérifier la version.

## Tester le flux de mise à jour localement
En développement, tu peux simuler les événements d'`autoUpdater` depuis la console du processus principal (ou en ajoutant temporairement un script) pour vérifier l'UI et la progression :

```js
const { autoUpdater } = require('electron-updater');
autoUpdater.emit('update-available', {});
autoUpdater.emit('download-progress', { percent: 10, transferred: 100, total: 1000 });
autoUpdater.emit('download-progress', { percent: 50, transferred: 500, total: 1000 });
autoUpdater.emit('download-progress', { percent: 100, transferred: 1000, total: 1000 });
autoUpdater.emit('update-downloaded', {});
```

Attention : `quitAndInstall()` ferme et relance l'application ; ne pas exécuter en dev si tu veux rester connecté.

## Packaging et publication
- Le projet suppose l'utilisation de `electron-builder` pour créer les builds Windows/macOS/Linux.
- `electron-updater` est déjà utilisé dans `main.js`. Pour publier des mises à jour via GitHub Releases :
  1. Configurer `build` dans `package.json` (owner/repo, publisher, etc.).
  2. Générer les artifacts (`npm run build` / `electron-builder`).
  3. Publier la release (ex : `scripts/createRelease.js` utilise `gh` pour créer la release).

Voir la documentation `electron-builder` et `electron-updater` pour une configuration complète de provider et signatures.

## Personnalisation
- UI : la fenêtre d'update utilise Tailwind via CDN (`update.html`). Pour l'utiliser hors-ligne ou en production sans CDN, il est conseillé de builder Tailwind localement et inclure le CSS minifié.
- Comportement d'installation : actuellement le bouton appelle `quitAndInstall()` directement. On peut modifier pour proposer l'installation à la fermeture plutôt que l'instantané.

## Résolution de problèmes
- Si la progression reste à 0% : vérifier les logs du main process (les handlers `download-progress` sont loggés dans la console). Assure-toi que le provider (GitHub, S3...) répond et que les assets sont accessibles.
- En dev, émettre les événements manuellement (voir section test) pour valider l'UI sans publier.

## Prochaines améliorations possibles
- Bundler Tailwind localement (pas de dépendance CDN).
- Afficher une vraie liste de changelog extraite des notes de release GitHub.
- Supporter des options d'installation différée et redémarrage programmé.

## Licence
MIT
