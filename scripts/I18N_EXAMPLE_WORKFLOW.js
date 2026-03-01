/**
 * i18n Agent - Complete Before/After Example
 * 
 * This file demonstrates how the i18n agent transforms hardcoded labels
 * into properly internationalized components.
 */

// ============================================================================
// BEFORE: Component with hardcoded labels
// ============================================================================

// File: src/pages/dates/Dates-BEFORE.js
const DatesBefore = () => {
    const availableYears = [2020, 2021, 2022];

    if (availableYears.length === 0) {
        return <p>"Aucune année disponible"</p>;  // HARDCODED - French
    }

    return (
        <div>
            <h2>"Choisir une année"</h2>  {/* HARDCODED - French */}
            {availableYears.map(year => (
                <button key={year}>
                    {year}
                </button>
            ))}
            <p>"Années par destination"</p>  {/* HARDCODED - French */}
        </div>
    );
};

// ============================================================================
// AFTER: Same component, fully internationalized
// ============================================================================

// File: src/pages/dates/Dates-AFTER.js
import React from 'react';
import { useTranslation } from 'utils';

const DatesAfter = () => {
    const t = useTranslation("pages.dates");  // ADDED: useTranslation hook
    const availableYears = [2020, 2021, 2022];

    if (availableYears.length === 0) {
        return <p>{t("noYearAvailable")}</p>;  // REPLACED: Dynamic key
    }

    return (
        <div>
            <h2>{t("chooseYear")}</h2>  {/* REPLACED: Dynamic key */}
            {availableYears.map(year => (
                <button key={year}>
                    {year}
                </button>
            ))}
            <p>{t("yearsByDestination")}</p>  {/* REPLACED: Dynamic key */}
        </div>
    );
};

// ============================================================================
// AGENT OUTPUT: Translation Files
// ============================================================================

/*
File: public/translations/en.json
============================================
{
    "pages": {
        "dates": {
            "noYearAvailable": "No year available",
            "chooseYear": "Choose a year",
            "yearsByDestination": "Years by destination"
        }
    }
}
*/

/*
File: public/translations/fr.json
============================================
{
    "pages": {
        "dates": {
            "noYearAvailable": "Aucune année disponible",
            "chooseYear": "Choisir une année",
            "yearsByDestination": "Années par destination"
        }
    }
}
*/

// ============================================================================
// AGENT WORKFLOW
// ============================================================================

/**
 * Step 1: User runs the agent
 * ─────────────────────────────────────────────────────────────────────────
 * 
 * $ npm run i18n
 * 
 * 🌍 i18n Internationalization Agent
 * 📁 Enter JS file path: src/pages/dates/Dates.js
 * 
 */

/**
 * Step 2: Agent detects hardcoded strings
 * ─────────────────────────────────────────────────────────────────────────
 * 
 * 📄 Internationalizing: src/pages/dates/Dates.js
 * 📦 Deduced namespace: "pages.dates"
 * 
 * 🔍 Found 3 potential hardcoded label(s):
 *    1. "Aucune année disponible"
 *    2. "Choisir une année"
 *    3. "Années par destination"
 * 
 * ✏️  Which ones to internationalize? (comma-separated indices): 1,2,3
 * 
 */

/**
 * Step 3: User provides translations
 * ─────────────────────────────────────────────────────────────────────────
 * 
 * ⚙️  Processing: "Aucune année disponible"
 *    Suggested key: "pages.dates.noYearAvailable"
 *    🇬🇧 English: No year available
 *    🇫🇷 Français: Aucune année disponible
 *    ✅ Added translations for pages.dates.noYearAvailable
 * 
 * ⚙️  Processing: "Choisir une année"
 *    Suggested key: "pages.dates.chooseYear"
 *    🇬🇧 English: Choose a year
 *    🇫🇷 Français: Choisir une année
 *    ✅ Added translations for pages.dates.chooseYear
 * 
 * ⚙️  Processing: "Années par destination"
 *    Suggested key: "pages.dates.yearsByDestination"
 *    🇬🇧 English: Years by destination
 *    🇫🇷 Français: Années par destination
 *    ✅ Added translations for pages.dates.yearsByDestination
 * 
 */

/**
 * Step 4: Agent applies all changes automatically
 * ─────────────────────────────────────────────────────────────────────────
 * 
 * ✅ Updated en.json
 * ✅ Updated fr.json
 * ✅ Updated JS file with useTranslation
 * 
 * ============================================================
 * ✨ Internationalization complete!
 * ============================================================
 * 
 * 📋 Next steps:
 *   1. Review the changes in your IDE
 *   2. Test the translations in both languages
 *   3. Commit your changes
 * 
 */

// ============================================================================
// AGENT CAPABILITIES
// ============================================================================

/**
 * ✅ What the agent automatically handles:
 * 
 * 1. NAMESPACE DEDUCTION
 *    - Analyzes file path: src/pages/dates/Dates.js
 *    - Deduces namespace: pages.dates
 *    - Works with: pages, components, dialogs, utils, etc.
 * 
 * 2. KEY GENERATION
 *    - "Aucune année disponible" → noYearAvailable
 *    - "No images found" → noImagesFound
 *    - "Choose a year" → chooseYear
 *    - Smart conversion to camelCase
 * 
 * 3. IMPORT MANAGEMENT
 *    - Adds useTranslation import if missing
 *    - Updates existing utils imports
 *    - Proper path resolution
 * 
 * 4. HOOK INTEGRATION
 *    - Adds useTranslation hook call with correct namespace
 *    - Inserts at the right place in component
 *    - Maintains code structure
 * 
 * 5. TRANSLATION FILES
 *    - Creates proper JSON hierarchy
 *    - Handles nested namespaces
 *    - Maintains existing translations
 *    - Formats with proper indentation
 * 
 * 6. STRING REPLACEMENT
 *    - Finds and replaces hardcoded strings
 *    - Supports both single and double quotes
 *    - Converts to dynamic t() calls
 * 
 */

// ============================================================================
// REAL-WORLD EXAMPLES
// ============================================================================

/*
Example 1: Dialog Component
──────────────────────────────────────

Before:
  const MyDialog = () => {
    return (
      <Dialog>
        <DialogTitle>Confirm</DialogTitle>
        <DialogContent>Delete this item?</DialogContent>
        <DialogActions>
          <Button>Cancel</Button>
          <Button>Delete</Button>
        </DialogActions>
      </Dialog>
    );
  }

After:
  const MyDialog = () => {
    const t = useTranslation("dialogs");
    return (
      <Dialog>
        <DialogTitle>{t("confirm")}</DialogTitle>
        <DialogContent>{t("deleteItemConfirm")}</DialogContent>
        <DialogActions>
          <Button>{t("cancel")}</Button>
          <Button>{t("delete")}</Button>
        </DialogActions>
      </Dialog>
    );
  }

---
Example 2: Complex Page with Multiple Sections
───────────────────────────────────────────────

Before:
  const MyPage = () => {
    return (
      <div>
        <header>
          <h1>Welcome to Gallery</h1>
          <p>Browse amazing photos</p>
        </header>
        <main>
          <h2>Featured Images</h2>
          <p>No images found</p>
        </main>
      </div>
    );
  }

After:
  const MyPage = () => {
    const t = useTranslation("pages.gallery");
    return (
      <div>
        <header>
          <h1>{t("welcome")}</h1>
          <p>{t("subtitle")}</p>
        </header>
        <main>
          <h2>{t("featured")}</h2>
          <p>{t("noImagesFound")}</p>
        </main>
      </div>
    );
  }

Translation keys created:
  - pages.gallery.welcome
  - pages.gallery.subtitle
  - pages.gallery.featured
  - pages.gallery.noImagesFound

*/

// ============================================================================
// ADVANCED USAGE: Programmatic API
// ============================================================================

/*
If you want to use the agent in your own scripts:

const agent = require('./scripts/i18n-agent.js');

// 1. Deduce namespace from path
const ns = agent.deduceNamespace('src/pages/destination/Destination.js');
console.log(ns);  // "pages.destination"

// 2. Generate a key from label
const key = agent.generateTranslationKey('No images found', 'error');
console.log(key);  // "noImagesFound"

// 3. Read translations
const enTranslations = agent.readJsonFile('public/translations/en.json');

// 4. Add new translation
agent.setNestedProperty(enTranslations, 'pages.gallery.noImagesFound', 'No images found');

// 5. Write back
agent.writeJsonFile('public/translations/en.json', enTranslations);

// 6. Or run interactive session
await agent.interactiveI18nSession('src/pages/destination/Destination.js');
*/

export { DatesBefore, DatesAfter };
