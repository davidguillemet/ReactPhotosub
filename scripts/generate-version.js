// scripts/generate-version.js
//
// Writes build/version.json so a running tab can detect that a newer release
// has been deployed. Run right after `react-scripts build` in build4deploy,
// while build/ still exists. version.json stays in build/ (served statically by
// Firebase Hosting) even after index.html is moved into functions/web/.
//
// The same git hash is baked into the bundle via REACT_APP_VERSION (set inline
// in the build4deploy script), so the value here and the value in the bundle
// always match for a given deploy.
 
const fs = require('fs');
const { execSync } = require('child_process');
 
const version = execSync('git rev-parse --short HEAD').toString().trim();
fs.writeFileSync('build/version.json', JSON.stringify({ version }));
console.log('Wrote build/version.json:', version);
