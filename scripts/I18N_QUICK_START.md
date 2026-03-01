# 🌍 i18n Internationalization Agent - Complete Suite

Welcome! You now have a complete automated system for internationalizing your React application.

## 📚 Documentation Files

### 1. **[I18N_AGENT_README.md](./I18N_AGENT_README.md)** - START HERE
   - Overview of the agent
   - Core features
   - Quick start guide
   - Complete usage examples
   - Best practices
   - **Read this first!**

### 2. **[I18N_EXAMPLE_WORKFLOW.js](./I18N_EXAMPLE_WORKFLOW.js)** - Real Examples
   - Complete before/after example
   - Shows exact transformations
   - Demonstrates the workflow steps
   - Includes multiple real-world cases
   - Programmatic API examples

### 3. **[TROUBLESHOOTING.md](./TROUBLESHOOTING.md)** - Problem Solving
   - Common issues & solutions
   - Advanced configuration
   - Migration guide for large codebases
   - Performance tips
   - Testing & validation
   - Contributing guidelines

---

## 🛠️ Script Files

### Core Scripts

| File | Purpose | Run Command |
|------|---------|-------------|
| **i18n-agent.js** | Main agent (core logic) | `node scripts/i18n-agent.js` |
| **i18n-cli.js** | CLI interface | `node scripts/i18n-cli.js` |
| **i18n-examples.js** | Usage examples | `node scripts/i18n-examples.js` |

### npm Scripts (Added to package.json)

```json
{
  "scripts": {
    "i18n": "node scripts/i18n-cli.js",
    "i18n:file": "node scripts/i18n-cli.js --file",
    "i18n:examples": "node scripts/i18n-examples.js"
  }
}
```

---

## 🚀 Quick Start

### 1️⃣ First Time: Run Examples
```bash
npm run i18n:examples
```
This shows you how the agent works with real examples.

### 2️⃣ Second Time: Read Documentation
Open `[I18N_AGENT_README.md](./I18N_AGENT_README.md)` for full documentation.

### 3️⃣ Ready to Use: Internationalize a File
```bash
npm run i18n
# or
npm run i18n:file src/pages/myPage/MyPage.js
```

---

## 📋 Agent Capabilities

The agent **automatically handles**:

✅ **Namespace Deduction**
- Analyzes file path: `src/pages/dates/Dates.js` → `pages.dates`
- Works with pages, components, dialogs, etc.

✅ **Smart Key Generation**
- "Aucune année disponible" → `noYearAvailable`
- "No images found" → `noImagesFound`
- Context-aware prefixes for errors, buttons, etc.

✅ **Import Management**
- Adds `useTranslation` import
- Updates existing imports automatically
- Resolves correct relative paths

✅ **Hook Integration**
- Injects `useTranslation` hook call
- Inserts at optimal location in component
- Maintains code structure and formatting

✅ **Translation Files Management**
- Creates JSON hierarchy automatically
- Handles nested namespaces
- Preserves existing translations
- Proper formatting and indentation

✅ **String Replacement**
- Finds hardcoded strings
- Replaces with dynamic `t()` calls
- Supports single/double quotes
- Maintains code readability

---

## 🎯 Workflow Overview

```
┌─────────────────────────────────────────────────────────────┐
│ 1. User runs: npm run i18n                                  │
├─────────────────────────────────────────────────────────────┤
│ 2. Agent asks: "Enter JS file path"                         │
├─────────────────────────────────────────────────────────────┤
│ 3. Agent deduces namespace from path                        │
│    Example: src/pages/dates/Dates.js → pages.dates         │
├─────────────────────────────────────────────────────────────┤
│ 4. Agent detects hardcoded strings                          │
│    Shows: "No year available", "Choose a year", etc.       │
├─────────────────────────────────────────────────────────────┤
│ 5. User selects which strings to translate                 │
│    Selects: 1,2,3 (comma-separated)                        │
├─────────────────────────────────────────────────────────────┤
│ 6. Agent prompts for translations                           │
│    🇬🇧 English: No year available                          │
│    🇫🇷 Français: Aucune année disponible                   │
├─────────────────────────────────────────────────────────────┤
│ 7. Agent applies changes:                                   │
│    ✅ Updates en.json                                       │
│    ✅ Updates fr.json                                       │
│    ✅ Updates JS file with useTranslation                  │
├─────────────────────────────────────────────────────────────┤
│ 8. Done! View changes in your IDE                          │
└─────────────────────────────────────────────────────────────┘
```

---

## 📝 Example: Before & After

### Before (Hardcoded)
```javascript
const Dates = () => {
    return <h2>"Choisir une année"</h2>;
}
```

### After (Internationalized)
```javascript
import { useTranslation } from '../../utils';

const Dates = () => {
    const t = useTranslation("pages.dates");
    return <h2>{t("chooseYear")}</h2>;
}
```

### Translation Files Added
```json
// en.json: "chooseYear": "Choose a year",
// fr.json: "chooseYear": "Choisir une année"
```

---

## 🎓 Key Concepts

### Namespace
The translation context/scope, derived from file path structure.
```
src/pages/destination/Destination.js → namespace: "pages.destination"
src/components/gallery/Gallery.js → namespace: "components.gallery"
```

### Translation Key
A unique identifier for a translated string, generated from the label content.
```
"No year available" → key: "noYearAvailable"
"Choisir une année" → key: "chooseYear"
```

### Hook Call
The way you integrate translation in your component.
```javascript
const t = useTranslation("pages.dates");
return <p>{t("noYearAvailable")}</p>;
```

### Translation Files
JSON hierarchies that store all label translations.
```json
{
  "pages": {
    "dates": {
      "noYearAvailable": "No year available",
      "chooseYear": "Choose a year"
    }
  }
}
```

---

## 🔗 File Locations

```
Your Project Root/
├── public/
│   └── translations/
│       ├── en.json          ← English translations
│       └── fr.json          ← French translations
├── src/
│   └── utils/
│       └── useTranslation.js    ← Translation hook (from app)
└── scripts/
    ├── i18n-agent.js                    ← Core agent
    ├── i18n-cli.js                      ← CLI wrapper
    ├── i18n-examples.js                 ← Usage examples
    ├── I18N_AGENT_README.md             ← Main docs
    ├── I18N_EXAMPLE_WORKFLOW.js         ← Before/after examples
    ├── TROUBLESHOOTING.md               ← Problem solving
    └── I18N_QUICK_START.md              ← This file
```

---

## ✨ Features Summary

| Feature | Status | Details |
|---------|--------|---------|
| Automated namespace deduction | ✅ | From file path |
| Smart key generation | ✅ | Context-aware |
| Interactive UI | ✅ | User-friendly prompts |
| Batch processing | ✅ | Process multiple strings |
| Import management | ✅ | Auto-adds imports |
| JSON hierarchy handling | ✅ | Creates structure |
| Dry-run mode | ⏳ | Planned |
| Programmatic API | ✅ | Reusable functions |
| String replacement | ✅ | Hardcoded → dynamic |
| Translation validation | ⏳ | Planned |
| Rollback support | ⏳ | Use git instead |

---

## 🆘 Need Help?

1. **First time?** Read [I18N_AGENT_README.md](./I18N_AGENT_README.md)
2. **Want examples?** Check [I18N_EXAMPLE_WORKFLOW.js](./I18N_EXAMPLE_WORKFLOW.js)
3. **Troubleshooting?** See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
4. **Quick reference?** Regular expression + namespace deduction
5. **Got stuck?** Manually edit JSON files and add `useTranslation` hooks

---

## 💡 Tips & Tricks

- **Run `npm run i18n:examples`** to understand how the agent works
- **Always review changes** before committing to git
- **Use `--batch` mode** when all strings should be translated
- **Check namespace** - it must match your file location
- **Test both languages** after running the agent
- **Keep keys short** but descriptive (max 2-3 words)
- **Group related keys** under the same namespace

---

## 🎯 Next Steps

1. ✅ Review this file
2. ✅ Read `I18N_AGENT_README.md`
3. ✅ Run `npm run i18n:examples`
4. ✅ Pick a component with hardcoded labels
5. ✅ Run `npm run i18n -- --file path/to/component.js`
6. ✅ Review the changes
7. ✅ Test in your browser
8. ✅ Commit to git

---

## 📊 Agent Statistics

- **Files created:** 7 (scripts + documentation)
- **Total lines of code:** 1000+
- **Supported languages:** English, French (extensible)
- **Namespaces supported:** pages, components, dialogs, etc.
- **Key naming patterns:** 10+ contextual rules
- **Documentation pages:** 4

---

## 🚀 You're Ready!

The agent is fully set up and documented. Start with:

```bash
npm run i18n
```

Good luck with your internationalization! 🌍
