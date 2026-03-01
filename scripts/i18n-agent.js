#!/usr/bin/env node

/**
 * i18n Agent - Automated Internationalization Assistant
 * 
 * Automates the process of internationalizing hardcoded labels by:
 * 1. Creating an appropriate translation key
 * 2. Adding entries to en.json and fr.json
 * 3. Updating the JS file to use useTranslation hook
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Configuration
const WORKSPACE_ROOT = path.join(__dirname, '..');
const TRANSLATIONS_DIR = path.join(WORKSPACE_ROOT, 'public', 'translations');
const SRC_DIR = path.join(WORKSPACE_ROOT, 'src');

// Translation files
const EN_FILE = path.join(TRANSLATIONS_DIR, 'en.json');
const FR_FILE = path.join(TRANSLATIONS_DIR, 'fr.json');

/**
 * Read and parse JSON file safely
 */
function readJsonFile(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(content);
    } catch (error) {
        console.error(`❌ Error reading ${filePath}:`, error.message);
        return null;
    }
}

/**
 * Write JSON file with proper formatting
 */
function writeJsonFile(filePath, data) {
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 4) + '\n', 'utf8');
        return true;
    } catch (error) {
        console.error(`❌ Error writing ${filePath}:`, error.message);
        return false;
    }
}

/**
 * Get nested object property by path string (e.g., "pages.about.title")
 */
function getNestedProperty(obj, path) {
    return path.split('.').reduce((current, key) => current?.[key], obj);
}

/**
 * Set nested object property by path string
 */
function setNestedProperty(obj, path, value) {
    const keys = path.split('.');
    const lastKey = keys.pop();
    const target = keys.reduce((current, key) => {
        if (!current[key]) current[key] = {};
        return current[key];
    }, obj);
    target[lastKey] = value;
}

/**
 * Deduce namespace from JS file path
 * Examples:
 *   src/pages/destination/Destination.js -> pages.destination
 *   src/components/gallery/Gallery.js -> components.gallery
 *   src/dialogs/ConfirmDialog.js -> dialogs
 */
function deduceNamespace(jsFilePath) {
    const relative = path.relative(SRC_DIR, jsFilePath);
    const parts = relative.split(path.sep).slice(0, -1); // Remove filename
    
    if (parts.length === 0) return 'root';
    
    // Convert directory names to namespace
    // Handle special cases
    if (parts[0] === 'pages' && parts.length >= 2) {
        // e.g., pages/destination -> pages.destination
        return parts.slice(0, 2).join('.');
    }
    
    if (parts[0] === 'dialogs') {
        return 'dialogs';
    }
    
    if (parts[0] === 'components') {
        return parts.slice(0, 2).join('.');
    }
    
    return parts.join('.');
}

/**
 * Generate a translation key from label and context
 * Converts label to camelCase key
 */
function generateTranslationKey(label, context = '') {
    // Remove common words and punctuation
    let key = label
        .toLowerCase()
        .replace(/[^\w\s]/g, '') // Remove punctuation
        .trim()
        .split(/\s+/)
        .map((word, index) => {
            if (index === 0) return word;
            return word.charAt(0).toUpperCase() + word.slice(1);
        })
        .join('');
    
    // Remove common french articles/words at start
    key = key.replace(/^(le|la|les|un|une|des|du|de|d)/, '');
    
    // Ensure key is not empty
    if (!key) key = 'label';
    
    // Add context prefix if helpful
    if (context && !key.startsWith(context.toLowerCase())) {
        if (context.includes('error')) return `error${key.charAt(0).toUpperCase()}${key.slice(1)}`;
        if (context.includes('button')) return `btn${key.charAt(0).toUpperCase()}${key.slice(1)}`;
        if (context.includes('placeholder')) return `placeholder${key.charAt(0).toUpperCase()}${key.slice(1)}`;
        if (context.includes('tooltip')) return `tooltip${key.charAt(0).toUpperCase()}${key.slice(1)}`;
    }
    
    return key;
}

/**
 * Read a JS file and find hardcoded strings
 */
function readJsFile(filePath) {
    try {
        return fs.readFileSync(filePath, 'utf8');
    } catch (error) {
        console.error(`❌ Error reading ${filePath}:`, error.message);
        return null;
    }
}

/**
 * Update JS file to use useTranslation
 */
function updateJsFileWithTranslation(filePath, namespace, replacements) {
    let content = readJsFile(filePath);
    if (!content) return false;
    
    // Check if useTranslation is already imported
    const hasUseTranslationImport = /from\s+['"](\.\.\/)*utils['"]/.test(content) && 
                                     /useTranslation/.test(content);
    
    const needsImport = !content.includes('useTranslation');
    
    // Add import if needed
    if (needsImport) {
        // Find the first import statement
        const importMatch = content.match(/^import\s+.*?['"];/m);
        if (importMatch) {
            const importLine = importMatch[0];
            const existingUtilsImport = content.match(/import\s+{[^}]*}\s+from\s+['"](\.\.\/)*utils['"]/);
            
            if (existingUtilsImport) {
                // Add useTranslation to existing utils import
                const newImport = existingUtilsImport[0].replace(
                    /from\s+['"]((\.\.\/)*utils)['"]/,
                    (match, path) => {
                        const importContent = match.match(/import\s+{([^}]*)}/)[1];
                        if (!importContent.includes('useTranslation')) {
                            return `from '${path}'`.replace('import {', 'import { useTranslation, ');
                        }
                        return match;
                    }
                );
                content = content.replace(importMatch[0], newImport);
            } else {
                // Add new utils import
                content = content.replace(
                    importMatch[0],
                    `${importMatch[0]}\nimport { useTranslation } from '../../utils';`
                );
            }
        }
    }
    
    // Add hook call in component if needed
    const hasHookCall = content.includes(`useTranslation("${namespace}")`);
    
    if (!hasHookCall) {
        // Find the component function/const
        const componentMatch = content.match(/(?:const|function)\s+\w+\s*(?:\({|=\s*\(|=\s*{)/);
        if (componentMatch) {
            // Add hook call after the component declaration
            const insertPos = componentMatch.index + componentMatch[0].length;
            const hookCall = `\n    const t = useTranslation("${namespace}");`;
            content = content.slice(0, insertPos) + hookCall + content.slice(insertPos);
        }
    }
    
    // Apply replacements
    for (const [oldLabel, keyPath] of replacements) {
        // Escape special regex characters
        const escapedLabel = oldLabel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        // Replace string literals (both single and double quotes)
        content = content.replace(
            new RegExp(`['"](${escapedLabel})['"]['"]`, 'g'),
            `{t("${keyPath}")}`
        );
        // Also handle JSX with strings
        content = content.replace(
            new RegExp(`>\\s*['"](${escapedLabel})['"]\\s*<`, 'g'),
            (match) => `>${"t(\"" + keyPath + "\")"}<`
        );
    }
    
    try {
        fs.writeFileSync(filePath, content, 'utf8');
        return true;
    } catch (error) {
        console.error(`❌ Error writing ${filePath}:`, error.message);
        return false;
    }
}

/**
 * Interactive translation input
 */
async function getTranslationInputs(labelKey) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    
    return new Promise((resolve) => {
        console.log(`\n📝 Enter translations for key: "${labelKey}"`);
        
        rl.question('🇬🇧 English: ', (enLabel) => {
            rl.question('🇫🇷 Français: ', (frLabel) => {
                rl.close();
                resolve({ en: enLabel, fr: frLabel });
            });
        });
    });
}

/**
 * Interactive session for i18n of a specific file
 */
async function interactiveI18nSession(jsFilePath) {
    console.log('\n' + '='.repeat(60));
    console.log(`📄 Internationalizing: ${path.relative(WORKSPACE_ROOT, jsFilePath)}`);
    console.log('='.repeat(60));
    
    const namespace = deduceNamespace(jsFilePath);
    console.log(`📦 Deduced namespace: "${namespace}"`);
    
    const content = readJsFile(jsFilePath);
    if (!content) return false;
    
    // Extract string literals (basic regex - can be improved)
    const stringPattern = /["'`]([^"'`]{10,})['"]/g;
    const strings = new Set();
    let match;
    while ((match = stringPattern.exec(content)) !== null) {
        if (!match[1].startsWith('{{') && !match[1].startsWith('http')) {
            strings.add(match[1]);
        }
    }
    
    if (strings.size === 0) {
        console.log('⚠️  No potential hardcoded strings found.');
        return false;
    }
    
    console.log(`\n🔍 Found ${strings.size} potential hardcoded label(s):`);
    const stringsArray = Array.from(strings);
    stringsArray.forEach((str, idx) => {
        console.log(`   ${idx + 1}. "${str}"`);
    });
    
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    
    return new Promise((resolve) => {
        rl.question('\n✏️  Which ones to internationalize? (comma-separated indices, e.g., 1,3): ', async (indices) => {
            rl.close();
            
            const selectedIndices = indices.split(',').map(i => parseInt(i.trim()) - 1).filter(i => i >= 0 && i < stringsArray.length);
            const selectedStrings = selectedIndices.map(i => stringsArray[i]);
            
            if (selectedStrings.length === 0) {
                console.log('❌ No valid selections.');
                resolve(false);
                return;
            }
            
            // Load translation files
            let enTranslations = readJsonFile(EN_FILE);
            let frTranslations = readJsonFile(FR_FILE);
            
            if (!enTranslations || !frTranslations) {
                resolve(false);
                return;
            }
            
            const replacements = [];
            
            // Process each selected string
            for (const label of selectedStrings) {
                console.log(`\n⚙️  Processing: "${label}"`);
                
                // Generate key
                const suggestedKey = generateTranslationKey(label);
                const finalKey = `${namespace}.${suggestedKey}`;
                
                console.log(`   Suggested key: "${finalKey}"`);
                
                // Get translations
                const inputs = await getTranslationInputs(suggestedKey);
                
                // Add to translation files
                setNestedProperty(enTranslations, finalKey, inputs.en);
                setNestedProperty(frTranslations, finalKey, inputs.fr);
                
                replacements.push([label, finalKey]);
                
                console.log(`   ✅ Added translations for ${finalKey}`);
            }
            
            // Save translation files
            if (!writeJsonFile(EN_FILE, enTranslations)) {
                resolve(false);
                return;
            }
            console.log('✅ Updated en.json');
            
            if (!writeJsonFile(FR_FILE, frTranslations)) {
                resolve(false);
                return;
            }
            console.log('✅ Updated fr.json');
            
            // Update JS file
            if (!updateJsFileWithTranslation(jsFilePath, namespace, replacements)) {
                resolve(false);
                return;
            }
            console.log('✅ Updated JS file with useTranslation');
            
            resolve(true);
        });
    });
}

/**
 * Main CLI interface
 */
async function main() {
    console.log('\n╔═══════════════════════════════════════════════════════════╗');
    console.log('║         🌍 i18n Internationalization Agent 🌍              ║');
    console.log('║  Automate hardcoded label internationalization              ║');
    console.log('╚═══════════════════════════════════════════════════════════╝\n');
    
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    
    rl.question('📁 Enter JS file path (or drag & drop): ', async (filePath) => {
        rl.close();
        
        // Handle quoted paths (from drag & drop)
        filePath = filePath.trim().replace(/^["']|["']$/g, '');
        
        // Resolve relative paths
        if (!path.isAbsolute(filePath)) {
            filePath = path.resolve(WORKSPACE_ROOT, filePath);
        }
        
        // Validate file
        if (!fs.existsSync(filePath)) {
            console.error(`❌ File not found: ${filePath}`);
            process.exit(1);
        }
        
        if (!filePath.endsWith('.js')) {
            console.error('❌ Please provide a JavaScript file (.js)');
            process.exit(1);
        }
        
        // Run interactive session
        const success = await interactiveI18nSession(filePath);
        
        if (success) {
            console.log('\n' + '='.repeat(60));
            console.log('✨ Internationalization complete!');
            console.log('='.repeat(60) + '\n');
        } else {
            process.exit(1);
        }
    });
}

// Run if called directly
if (require.main === module) {
    main().catch(console.error);
}

module.exports = {
    deduceNamespace,
    generateTranslationKey,
    getNestedProperty,
    setNestedProperty,
    readJsonFile,
    writeJsonFile,
    updateJsFileWithTranslation,
    interactiveI18nSession,
};

/**
 * Internationalize all detected hardcoded strings in a file automatically.
 * - generates keys
 * - inserts them into en.json / fr.json (simple fallback: duplicate label for both langs)
 * - updates the JS file to use t() calls
 */
function internationalizeFileAuto(jsFilePath, options = {}) {
    const namespace = deduceNamespace(jsFilePath);
    const content = readJsFile(jsFilePath);
    if (!content) return { success: false, reason: 'file_read_error' };

    // Basic string extraction: match single/double/backtick strings (avoid very short tokens)
    const stringPattern = /["'`]([^"'`]{3,})["'`]/g;
    const strings = new Set();
    let match;
    while ((match = stringPattern.exec(content)) !== null) {
        const s = match[1];
        if (s.startsWith('{{') || s.startsWith('http') || /\$\{/.test(s)) continue;
        // ignore import/require-like strings (very simple heuristic)
        if (/^\.|^\//.test(s)) continue;
        strings.add(s);
    }

    if (strings.size === 0) {
        return { success: false, reason: 'no_strings_found' };
    }

    // Load translation files
    let enTranslations = readJsonFile(EN_FILE);
    let frTranslations = readJsonFile(FR_FILE);
    if (!enTranslations || !frTranslations) return { success: false, reason: 'translations_read_error' };

    const replacements = [];

    for (const label of strings) {
        let suggestedKey = generateTranslationKey(label);
        let finalKey = `${namespace}.${suggestedKey}`;

        // Ensure uniqueness: if key exists, append numeric suffix
        let attempt = 1;
        while (getNestedProperty(enTranslations, finalKey) !== undefined || getNestedProperty(frTranslations, finalKey) !== undefined) {
            attempt += 1;
            suggestedKey = `${suggestedKey}${attempt}`;
            finalKey = `${namespace}.${suggestedKey}`;
        }

        // Simple language guess: accented characters -> French
        const isFrench = /[àâäéèêëîïôöùûüçÀÉÈÙÇ]/.test(label);
        if (isFrench) {
            setNestedProperty(frTranslations, finalKey, label);
            setNestedProperty(enTranslations, finalKey, label);
        } else {
            setNestedProperty(enTranslations, finalKey, label);
            setNestedProperty(frTranslations, finalKey, label);
        }

        replacements.push([label, finalKey]);
    }

    // Save translation files
    if (!writeJsonFile(EN_FILE, enTranslations) || !writeJsonFile(FR_FILE, frTranslations)) {
        return { success: false, reason: 'translations_write_error' };
    }

    // Update JS file
    const updated = updateJsFileWithTranslation(jsFilePath, namespace, replacements);
    if (!updated) {
        return { success: false, reason: 'file_update_error' };
    }

    return { success: true, details: { namespace, count: replacements.length } };
}

module.exports.internationalizeFileAuto = internationalizeFileAuto;
