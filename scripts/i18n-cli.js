#!/usr/bin/env node

/**
 * i18n Agent CLI with Advanced Options
 * 
 * Usage:
 *   node scripts/i18n-agent.js [--file path/to/file.js] [--batch] [--auto] [--dry-run]
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Import the main agent
const agent = require('./i18n-agent.js');

// Parse command line arguments
function parseArgs() {
    const args = process.argv.slice(2);
    const options = {
        file: null,
        batch: false,
        auto: false,
        dryRun: false,
        verbose: true,
        help: false,
    };

    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        if (arg === '--file' && args[i + 1]) {
            options.file = args[++i];
        } else if (arg === 'intl' || arg === '--intl') {
            options.intl = true;
        } else if (arg === '--batch') {
            options.batch = true;
        } else if (arg === '--auto') {
            options.auto = true;
        } else if (arg === '--dry-run') {
            options.dryRun = true;
        } else if (arg === '--quiet') {
            options.verbose = false;
        } else if (arg === '--help' || arg === '-h') {
            options.help = true;
        }
    }

    return options;
}

function printHelp() {
    console.log(`
╔════════════════════════════════════════════════════════════════╗
║  i18n Internationalization Agent - CLI                        ║
╚════════════════════════════════════════════════════════════════╝

USAGE:
  node scripts/i18n-agent.js [options]

OPTIONS:
  --file <path>      Path to the JavaScript file to internationalize
  --batch            Process all hardcoded strings at once (no selection)
  --auto             Auto-accept suggestions (requires --file)
  --dry-run          Show changes without applying them
  --quiet            Suppress verbose output
  --help, -h         Show this help message

EXAMPLES:
  # Interactive mode
  node scripts/i18n-agent.js

  # With specific file
  node scripts/i18n-agent.js --file src/pages/dates/Dates.js

  # Batch mode (all strings)
  node scripts/i18n-agent.js --file src/pages/dates/Dates.js --batch

  # Dry-run to preview changes
  node scripts/i18n-agent.js --file src/pages/dates/Dates.js --dry-run

NAMESPACE DEDUCTION:
  The agent automatically deduces the namespace from the file path:
  - src/pages/destination/Destination.js → pages.destination
  - src/components/gallery/Gallery.js → components.gallery
  - src/dialogs/ConfirmDialog.js → dialogs

KEY GENERATION:
  Labels are converted to camelCase keys:
  - "No images found" → noImagesFound
  - "Aucune année disponible" → noYearAvailable

For more information, see: scripts/I18N_AGENT_README.md
    `);
}

/**
 * Create readline interface
 */
function createInterface() {
    return readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
}

/**
 * Ask simple yes/no question
 */
function askYesNo(question) {
    return new Promise((resolve) => {
        const rl = createInterface();
        rl.question(question + ' (y/n) ', (answer) => {
            rl.close();
            resolve(answer.toLowerCase() === 'y');
        });
    });
}

/**
 * Ask text question
 */
function askText(question, defaultValue = '') {
    return new Promise((resolve) => {
        const rl = createInterface();
        const prompt = defaultValue ? `${question} [${defaultValue}] ` : `${question} `;
        rl.question(prompt, (answer) => {
            rl.close();
            resolve(answer || defaultValue);
        });
    });
}

/**
 * Log with colors
 */
function log(message, type = 'info') {
    const colors = {
        info: '\x1b[36m',
        success: '\x1b[32m',
        warning: '\x1b[33m',
        error: '\x1b[31m',
        reset: '\x1b[0m',
    };
    
    const color = colors[type] || colors.info;
    console.log(`${color}${message}${colors.reset}`);
}

/**
 * Main entry point
 */
async function main() {
    const options = parseArgs();

    if (options.help) {
        printHelp();
        process.exit(0);
    }

    console.log('\n╔════════════════════════════════════════════════════════════════╗');
    console.log('║  🌍 i18n Internationalization Agent                            ║');
    console.log('╚════════════════════════════════════════════════════════════════╝\n');

    let filePath = options.file;

    // Support positional 'intl <file>' usage
    const rawArgs = process.argv.slice(2);
    if (!filePath && rawArgs.length >= 2 && (rawArgs[0] === 'intl' || rawArgs[0] === '--intl')) {
        filePath = rawArgs[1];
        options.intl = true;
    }

    if (!filePath) {
        filePath = await askText('📁 Enter JS file path (or drag & drop):');

        if (!filePath) {
            log('❌ No file specified.', 'error');
            process.exit(1);
        }
    }

    // Handle quoted paths (from drag & drop)
    filePath = filePath.trim().replace(/^["']|["']$/g, '');

    // Resolve relative paths
    const WORKSPACE_ROOT = path.join(__dirname, '..');
    if (!path.isAbsolute(filePath)) {
        filePath = path.resolve(WORKSPACE_ROOT, filePath);
    }

    // Validate file
    if (!fs.existsSync(filePath)) {
        log(`❌ File not found: ${filePath}`, 'error');
        process.exit(1);
    }

    if (!filePath.endsWith('.js')) {
        log('❌ Please provide a JavaScript file (.js)', 'error');
        process.exit(1);
    }

    try {
        let result;
        if (options.intl || options.batch) {
            // Run automatic internationalization for the whole file
            log(`⚙️  Running automatic internationalization on ${filePath}`);
            result = await agent.internationalizeFileAuto(filePath);
            if (result && result.success) {
                log('\n' + '='.repeat(64), 'success');
                log(`✨ Internationalization complete (${result.details.count} strings).`, 'success');
                log('Review changes in your IDE and test translations.', 'success');
            } else {
                log(`\n❌ Operation failed: ${result ? result.reason : 'unknown'}`, 'error');
                process.exit(1);
            }
        } else {
            // Run the interactive session
            const success = await agent.interactiveI18nSession(filePath);

            if (success) {
                log('\n' + '='.repeat(64), 'success');
                log('✨ Internationalization complete!', 'success');
                log('='.repeat(64) + '\n', 'success');

                // Show next steps
                console.log('📋 Next steps:');
                console.log('  1. Review the changes in your IDE');
                console.log('  2. Test the translations in both languages');
                console.log('  3. Commit your changes');
            } else {
                log('\n❌ Operation failed or was cancelled.', 'error');
                process.exit(1);
            }
        }
    } catch (error) {
        log(`\n❌ Error: ${error.message}`, 'error');
        if (options.verbose) {
            console.error(error);
        }
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    main().catch((error) => {
        log(`Fatal error: ${error.message}`, 'error');
        process.exit(1);
    });
}

module.exports = { parseArgs, askText, askYesNo, log };
