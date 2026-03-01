#!/usr/bin/env node

/**
 * i18n Agent - Validation & Setup Check
 * 
 * Verifies that the i18n agent is properly installed and configured
 */

const fs = require('fs');
const path = require('path');

const WORKSPACE_ROOT = path.join(__dirname, '..');
const EN_FILE = path.join(WORKSPACE_ROOT, 'public', 'translations', 'en.json');
const FR_FILE = path.join(WORKSPACE_ROOT, 'public', 'translations', 'fr.json');
const SRC_DIR = path.join(WORKSPACE_ROOT, 'src');

let errors = [];
let warnings = [];
let successes = [];

function check(name, condition, errorMsg, warningMsg) {
    if (condition) {
        successes.push(`✅ ${name}`);
        return true;
    } else if (warningMsg && !condition) {
        warnings.push(`⚠️  ${name}: ${warningMsg}`);
        return null;
    } else {
        errors.push(`❌ ${name}: ${errorMsg}`);
        return false;
    }
}

function fileExists(filepath) {
    return fs.existsSync(filepath);
}

function isValidJson(filepath) {
    try {
        JSON.parse(fs.readFileSync(filepath, 'utf8'));
        return true;
    } catch {
        return false;
    }
}

function main() {
    console.log('\n╔════════════════════════════════════════════════════════════════╗');
    console.log('║  🔍 i18n Agent - Validation Check                             ║');
    console.log('╚════════════════════════════════════════════════════════════════╝\n');

    // Section 1: Core Files
    console.log('📋 Checking Core Files...');
    check(
        'i18n-agent.js',
        fileExists(path.join(__dirname, 'i18n-agent.js')),
        'Core agent script not found',
        'Make sure you ran: npm install'
    );
    check(
        'i18n-cli.js',
        fileExists(path.join(__dirname, 'i18n-cli.js')),
        'CLI wrapper not found',
        'Make sure you ran: npm install'
    );
    check(
        'package.json modifications',
        fs.readFileSync(path.join(WORKSPACE_ROOT, 'package.json'), 'utf8').includes('"i18n"'),
        'npm scripts not added to package.json',
        'Add "i18n" scripts manually'
    );

    // Section 2: Documentation Files
    console.log('\n📚 Checking Documentation...');
    check(
        'I18N_AGENT_README.md',
        fileExists(path.join(__dirname, 'I18N_AGENT_README.md')),
        'Main documentation not found'
    );
    check(
        'I18N_EXAMPLE_WORKFLOW.js',
        fileExists(path.join(__dirname, 'I18N_EXAMPLE_WORKFLOW.js')),
        'Example workflow not found'
    );
    check(
        'TROUBLESHOOTING.md',
        fileExists(path.join(__dirname, 'TROUBLESHOOTING.md')),
        'Troubleshooting guide not found'
    );
    check(
        'I18N_QUICK_START.md',
        fileExists(path.join(__dirname, 'I18N_QUICK_START.md')),
        'Quick start guide not found'
    );

    // Section 3: Translation Files
    console.log('\n🌍 Checking Translation Files...');
    check(
        'en.json exists',
        fileExists(EN_FILE),
        'English translation file not found at public/translations/en.json'
    );
    check(
        'en.json is valid JSON',
        isValidJson(EN_FILE),
        'en.json is not valid JSON - check formatting',
        'en.json exists but may be empty'
    );
    check(
        'fr.json exists',
        fileExists(FR_FILE),
        'French translation file not found at public/translations/fr.json'
    );
    check(
        'fr.json is valid JSON',
        isValidJson(FR_FILE),
        'fr.json is not valid JSON - check formatting',
        'fr.json exists but may be empty'
    );

    // Section 4: Project Structure
    console.log('\n📁 Checking Project Structure...');
    check(
        'src/ directory',
        fileExists(SRC_DIR),
        'src/ directory not found'
    );
    check(
        'src/utils/ directory',
        fileExists(path.join(SRC_DIR, 'utils')),
        'src/utils/ directory not found - useTranslation hook should be there'
    );
    check(
        'src/components/ directory',
        fileExists(path.join(SRC_DIR, 'components')),
        'src/components/ directory not found'
    );
    check(
        'src/pages/ directory',
        fileExists(path.join(SRC_DIR, 'pages')),
        'src/pages/ directory not found'
    );

    // Section 5: useTranslation Hook
    console.log('\n🔧 Checking useTranslation Setup...');
    const utilsIndex = path.join(SRC_DIR, 'utils', 'index.js');
    let hasUseTranslationExport = false;
    if (fileExists(utilsIndex)) {
        const content = fs.readFileSync(utilsIndex, 'utf8');
        hasUseTranslationExport = content.includes('useTranslation');
    }
    check(
        'useTranslation exported',
        hasUseTranslationExport,
        'useTranslation hook not exported from src/utils/index.js',
        'Check that your utils module exports useTranslation'
    );

    const useTranslationFile = path.join(SRC_DIR, 'utils', 'useTranslation.js');
    check(
        'useTranslation hook exists',
        fileExists(useTranslationFile),
        'useTranslation.js hook not found at src/utils/useTranslation.js',
        'This hook is needed for the agent to work'
    );

    // Section 6: permissions
    console.log('\n🔐 Checking File Permissions...');
    try {
        fs.accessSync(path.join(__dirname, 'i18n-agent.js'), fs.constants.R_OK);
        successes.push('✅ Scripts are readable');
    } catch {
        warnings.push('⚠️  Scripts: May need to fix file permissions');
    }

    try {
        fs.accessSync(EN_FILE, fs.constants.W_OK);
        fs.accessSync(FR_FILE, fs.constants.W_OK);
        successes.push('✅ Translation files are writable');
    } catch {
        errors.push('❌ Translation files: Not writable - check file permissions');
    }

    // Print Results
    console.log('\n' + '='.repeat(64));
    
    if (successes.length > 0) {
        console.log('\n✅ Successes:');
        successes.forEach(s => console.log('  ' + s));
    }

    if (warnings.length > 0) {
        console.log('\n⚠️  Warnings:');
        warnings.forEach(w => console.log('  ' + w));
    }

    if (errors.length > 0) {
        console.log('\n❌ Errors:');
        errors.forEach(e => console.log('  ' + e));
    }

    console.log('\n' + '='.repeat(64));

    // Summary
    const totalChecks = successes.length + warnings.length + errors.length;
    const successRate = Math.round((successes.length / totalChecks) * 100);

    console.log(`\n📊 Summary: ${successRate}% checks passed (${successes.length}/${totalChecks})\n`);

    if (errors.length === 0) {
        console.log('✨ All systems ready! You can now use the i18n agent:\n');
        console.log('   npm run i18n\n');
        process.exit(0);
    } else {
        console.log('🔧 Please fix the errors above before using the i18n agent.\n');
        console.log('For help, see: scripts/I18N_AGENT_README.md\n');
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = { check };
