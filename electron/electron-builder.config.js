import fs from 'fs';
const pckg = JSON.parse(fs.readFileSync('../package.json', 'utf8'));

const config = {
  "appId": pckg.appId,
  "directories": {
    "buildResources": "resources"
  },
  "files": [
    "assets/**/*",
    "dist/**/*",
    "capacitor.config.*",
    "client/**/*"
  ],
  "publish": {
    "provider": "github"
  },
  "nsis": {
    "allowElevation": true,
    "oneClick": false,
    "allowToChangeInstallationDirectory": true
  },
  "win": {
    "target": "nsis",
    "icon": "assets/favicon.ico"
  },
  "mac": {
    "category": pckg.macCategory,
    "target": "dmg"
  }
};

export default config;