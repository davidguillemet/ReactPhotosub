#!/usr/bin/env node

/**
 * Internationalization Helper Script
 *
 * Usage:
 *   node i18n-helper.js --file=path/to/file.js --line=217 --fr="Par régions" --en="By regions"
 *   node i18n-helper.js --file=path/to/file.js --key="filterTab:byRegions" --fr="Par régions" --en="By regions"
 */

const fs = require('fs');
const path = require('path');

// Parse command line arguments
const args = process.argv.slice(2).reduce((acc, arg) => {
    const [key, value] = arg.split('=');
    acc[key.replace('--', '')] = value;
    return acc;
}, {});

const PROJECT_ROOT = path.join(__dirname, '..');
const FR_JSON_PATH = path.join(PROJECT_ROOT, 'public', 'translations', 'fr.json');
const EN_JSON_PATH = path.join(PROJECT_ROOT, 'public', 'translations', 'en.json');

/**
 * Derive namespace from file path
 * Example: src/pages/destinations/DateFilter.js -> pages.destinations.dateFilter
 */
function getNamespaceFromFilePath(filePath) {
    // Normalize path
    const normalized = filePath.replace(/\\/g, '/');

    // Remove .js extension
    let withoutExt = normalized.replace(/\.js$/, '');

    // Get part after 'src/'
    const srcMatch = withoutExt.match(/src\/(.+)/);
    if (!srcMatch) {
        throw new Error(`Invalid file path: ${filePath}. Must be under src/ directory.`);
    }

    let parts = srcMatch[1].split('/');

    // Special handling for subdirectories
    // src/pages/destinations/DateFilter -> pages.destinations.dateFilter
    // src/components/form/Form -> components.form
    // src/pages/admin/images/Images -> pages.admin.images

    const result = [];
    for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        // Convert camelCase to lowercase
        const lowerPart = part.charAt(0).toLowerCase() + part.slice(1);
        result.push(lowerPart);
    }

    return result.join('.');
}

/**
 * Create a key from French text
 * Example: "Par régions" -> "filterTab:byRegions"
 * If key is provided, use it directly
 */
function generateKeyFromText(text, context = '') {
    if (args.key) {
        return args.key;
    }

    // Simple heuristic: use provided key or generate from text
    const words = text.trim().split(/[\s:]+/).filter(w => w);

    // If text contains special markers, use them
    if (text.includes(':')) {
        return text.toLowerCase().replace(/\s+/g, ':');
    }

    // Default: use context + camelCase words
    if (context) {
        const camelCase = words.slice(1).reduce((acc, word) => {
            return acc + word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        }, words[0].toLowerCase());
        return `${context}:${camelCase}`;
    }

    // Fallback: just camelCase
    const camelCase = words.slice(1).reduce((acc, word) => {
        return acc + word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    }, words[0].toLowerCase());

    return camelCase;
}

/**
 * Add or update translation key in JSON files
 */
function updateTranslationFiles(namespace, keyName, frText, enText) {
    const key = keyName.includes(':') ? keyName : `${keyName}`;

    // Read existing JSON files
    let frJson = JSON.parse(fs.readFileSync(FR_JSON_PATH, 'utf8'));
    let enJson = JSON.parse(fs.readFileSync(EN_JSON_PATH, 'utf8'));

    // Navigate to correct namespace in object
    const namespaceParts = namespace.split('.');
    let frNav = frJson;
    let enNav = enJson;

    // Ensure all nested keys exist
    for (const part of namespaceParts) {
        if (!frNav[part]) {
            frNav[part] = {};
        }
        if (!enNav[part]) {
            enNav[part] = {};
        }
        frNav = frNav[part];
        enNav = enNav[part];
    }

    // Add the translation
    frNav[key] = frText;
    enNav[key] = enText;

    // Write back to files
    fs.writeFileSync(FR_JSON_PATH, JSON.stringify(frJson, null, 4) + '\n');
    fs.writeFileSync(EN_JSON_PATH, JSON.stringify(enJson, null, 4) + '\n');

    return { key, namespace };
}

/**
 * Update JS file with useTranslation hook and translation call
 */
function updateJsFile(filePath, lineNumber, originalText, translationKey, namespace) {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');

    // Check if useTranslation is already imported
    const hasImport = lines.some(line =>
        line.includes('useTranslation') && line.includes('from')
    );

    let updatedContent = content;

    // Add import if not present
    if (!hasImport) {
        // Find where to insert import (after other imports)
        const importRegex = /^import\s+.*\s+from\s+['"].*['"];?$/m;
        const lastImportMatch = content.match(new RegExp(importRegex, 'gm'));

        if (lastImportMatch) {
            const lastImportLine = lastImportMatch[lastImportMatch.length - 1];
            const insertPoint = content.indexOf(lastImportLine) + lastImportLine.length;
            updatedContent =
                content.slice(0, insertPoint) +
                "\nimport { useTranslation } from 'utils';" +
                content.slice(insertPoint);
        }
    }

    // Check if useTranslation is called in the component
    const componentMatch = updatedContent.match(/const\s+(\w+)\s*=\s*(?:withLoading\()?\(\{[\s\S]*?\}\)\s*=>\s*\{/);
    if (componentMatch) {
        const componentName = componentMatch[1];
        const hasTranslationCall = updatedContent.includes(`const t = useTranslation("${namespace}")`);

        if (!hasTranslationCall) {
            // Find the opening of the component function and add the hook
            const hookInsertRegex = new RegExp(
                `(const\\s+${componentName}\\s*=\\s*.*?\\(\\{[^}]*\\}\\)\\s*=>\\s*\\{)`,
                'm'
            );
            updatedContent = updatedContent.replace(hookInsertRegex, (match) => {
                return match + `\n    const t = useTranslation("${namespace}");`;
            });
        }
    }

    // Replace the hardcoded text with t() call
    const replacement = `t("${translationKey}")`;
    updatedContent = updatedContent.replace(originalText, replacement);

    // Write back
    fs.writeFileSync(filePath, updatedContent);
}

// Main execution
async function main() {
    try {
        if (!args.file || !args.fr || !args.en) {
            console.error('Error: Missing required arguments');
            console.error('Usage: node i18n-helper.js --file=path/to/file.js --fr="French text" --en="English text" [--key="custom:key"]');
            process.exit(1);
        }

        const filePath = path.join(PROJECT_ROOT, args.file);

        // Validate file exists
        if (!fs.existsSync(filePath)) {
            throw new Error(`File not found: ${filePath}`);
        }

        // Get namespace from file path
        const namespace = getNamespaceFromFilePath(filePath);
        console.log(`📍 Namespace: ${namespace}`);

        // Generate or use provided key
        const keyName = args.key || generateKeyFromText(args.fr);
        console.log(`🔑 Key: ${keyName}`);

        // Update JSON translation files
        updateTranslationFiles(namespace, keyName, args.fr, args.en);
        console.log(`✅ Updated translation files (fr.json, en.json)`);

        // Update JS file (if line or originalText provided)
        if (args.line && args.original) {
            updateJsFile(filePath, parseInt(args.line), args.original, keyName, namespace);
            console.log(`✅ Updated JS file: ${args.file}`);
        } else {
            console.log(`⚠️  Provide --line and --original to update JS file automatically`);
            console.log(`   Example: --original='Label text' --line=217`);
        }

        console.log(`\n✨ Done! Use: t("${keyName}") in your component`);

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

main();
