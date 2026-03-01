#!/usr/bin/env node

/**
 * i18n Integration Script
 * Wrapper that handles both CLI and programmatic usage
 */

const path = require('path');
const agent = require('./i18n-agent.js');
const { parseArgs, log } = require('./i18n-cli.js');

/**
 * Example usage script
 * Shows how to use the agent programmatically
 */

console.log(`
╔════════════════════════════════════════════════════════════════╗
║  i18n Agent - Usage Examples                                   ║
╚════════════════════════════════════════════════════════════════╝
`);

// Example 1: Deduce namespace
console.log('Example 1: Namespace Deduction\n');
const examples = [
    'src/pages/destination/Destination.js',
    'src/components/gallery/Gallery.js',
    'src/dialogs/ConfirmDialog.js',
    'src/pages/dates/DateFilter.js'
];

examples.forEach(examplePath => {
    const ns = agent.deduceNamespace(examplePath);
    console.log(`  ${examplePath}`);
    console.log(`    → namespace: "${ns}"\n`);
});

// Example 2: Key generation
console.log('\nExample 2: Key Generation\n');
const labels = [
    { label: 'No images found', context: 'error' },
    { label: 'Aucune année disponible', context: 'message' },
    { label: 'Choose a year', context: 'button' },
    { label: 'Enter your email', context: 'placeholder' }
];

labels.forEach(({ label, context }) => {
    const key = agent.generateTranslationKey(label, context);
    console.log(`  "${label}"`);
    console.log(`    → key: "${key}"\n`);
});

// Example 3: Programmatic usage
console.log('\nExample 3: Programmatic Usage\n');
const codeExample = `
// In your Node.js script:
const agent = require('./scripts/i18n-agent.js');

// Deduce namespace
const namespace = agent.deduceNamespace('src/pages/myPage/MyPage.js');

// Generate key
const key = agent.generateTranslationKey('My Label', 'button');

// Read JSON file
const translations = agent.readJsonFile('public/translations/en.json');

// Update nested property
agent.setNestedProperty(translations, '\${namespace}.\${key}', 'My Label EN');

// Write back
agent.writeJsonFile('public/translations/en.json', translations);

// Or launch interactive session
await agent.interactiveI18nSession('src/pages/myPage/MyPage.js');
`;
console.log(codeExample);

console.log('\n✅ Check scripts/I18N_AGENT_README.md for full documentation\n');
