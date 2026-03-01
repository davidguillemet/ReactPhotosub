# 🔧 i18n Agent - Troubleshooting & Advanced Guide

## Common Issues & Solutions

### 1. "Module not found" Error

**Problem:** `Error: Cannot find module './i18n-agent.js'`

**Solution:**
- Ensure you're running the script from the workspace root or with correct paths
- Check that `scripts/i18n-agent.js` exists
- Use absolute paths if running from different directories

```bash
# From workspace root
node scripts/i18n-cli.js

# Or with npm
npm run i18n
```

---

### 2. JSON Parsing Error

**Problem:** `Error: JSON.parse: unexpected character in line X`

**Solution:**
- The translation JSON files might be corrupted
- Check for missing commas or quotes in `public/translations/en.json` and `fr.json`
- Restore from version control if needed

```bash
# Validate JSON manually
cat public/translations/en.json | jq .

# Or fix formatting
npm install -g jsonlint
jsonlint public/translations/en.json
```

---

### 3. Namespace Not Found in Translations

**Problem:** After running the agent, the translation key doesn't appear

**Solution:**
- Verify the namespace was correctly deduced
- Check the translation file hierarchy matches the namespace path
- Ensure the JSON file was properly saved with correct formatting

```javascript
// Debug: Check what namespace is deduced
const agent = require('./scripts/i18n-agent.js');
console.log(agent.deduceNamespace('src/pages/dates/DateFilter.js'));
```

---

### 4. Hardcoded Strings Not Detected

**Problem:** The agent doesn't find expected hardcoded strings

**Solution:**
- The detection uses regex and may miss edge cases:
  - Template literals with expressions: `Hello ${name}` (won't be detected)
  - Strings split across lines
  - Dynamically generated strings
  
**Workaround:** Manually select which strings to process, or manually edit the file after running the agent

---

### 5. Incorrect Import Paths

**Problem:** `useTranslation` import fails because the path is wrong

**Solution:**
The agent tries to determine the correct relative path. If it fails:

```javascript
// Wrong
import { useTranslation } from '../utils';

// Correct (from different depths)
import { useTranslation } from '../../utils';        // pages/destination/
import { useTranslation } from '../../../utils';     // pages/destination/nested/
import { useTranslation } from '../../utils';        // components/gallery/
```

Manually adjust if needed.

---

### 6. Accidental Replacement of Legitimate Strings

**Problem:** The agent replaced a string that shouldn't be replaced

**Solution:**
- Always review changes before committing
- Use `--dry-run` mode to preview changes
- Manually select which strings to process (don't use `--batch`)

```bash
# Preview without applying changes
node scripts/i18n-cli.js --file src/pages/my/Page.js --dry-run
```

---

## Advanced Configuration

### Customize Namespace Deduction

Edit the `deduceNamespace()` function in `scripts/i18n-agent.js`:

```javascript
function deduceNamespace(jsFilePath) {
    const relative = path.relative(SRC_DIR, jsFilePath);
    const parts = relative.split(path.sep).slice(0, -1);
    
    // Add your custom logic here
    if (parts[0] === 'custom' && parts[1] === 'section') {
        return `custom.${parts[1]}`;
    }
    
    return parts.join('.');
}
```

### Customize Key Generation

Modify the `generateTranslationKey()` function:

```javascript
function generateTranslationKey(label, context = '') {
    // Your custom logic
    let key = label
        .toLowerCase()
        .replace(/[^\w\s]/g, '')
        .trim()
        .split(/\s+/)
        .map((word, index) => {
            if (index === 0) return word;
            return word.charAt(0).toUpperCase() + word.slice(1);
        })
        .join('');
    
    // Add custom prefixes or suffixes
    if (context === 'error') return `err_${key}`;
    
    return key;
}
```

---

## Migration Guide: Large Codebase

If you need to internationalize many files at once:

### 1. Create a Batch Script

```javascript
// scripts/i18n-batch.js
const fs = require('fs');
const path = require('path');
const agent = require('./i18n-agent.js');

const filesPath = 'src/pages/*/';
const files = glob.sync(filesPath).filter(f => f.endsWith('.js'));

for (const file of files) {
    console.log(`Processing ${file}...`);
    // Interactive session for each file
    // Note: This would need to be adjusted for non-interactive mode
}
```

### 2. Use Dry-Run Mode

Always test changes before applying them:

```bash
git checkout -b i18n/migration
npm run i18n -- --file src/pages/About.js --dry-run
```

### 3. Review Before Commit

```bash
# Check what changed
git diff

# Review the translation files specifically
git diff public/translations/

# Test in browser
npm start
```

---

## Performance Tips

### Large File Handling

If a file has many strings:
1. Run the agent on sections of the file
2. Use `--batch` mode for faster processing
3. Split large components into smaller ones

### Bulk Namespace Updates

If you need to rename a namespace:

```bash
# Manual find-and-replace
find src -name "*.js" -type f -exec sed -i 's/"old\.namespace"/"new.namespace"/g' {} \;

# Update translation files
node -e "
const agent = require('./scripts/i18n-agent.js');
const en = agent.readJsonFile('public/translations/en.json');
// Manually restructure here
agent.writeJsonFile('public/translations/en.json', en);
"
```

---

## Best Practices

### ✅ DO

- ✅ Review the agent's suggestions before accepting
- ✅ Use meaningful, descriptive keys
- ✅ Keep related translations in the same namespace
- ✅ Test translations in both languages after updating
- ✅ Commit translation changes separately from code changes
- ✅ Use version control to track all changes

### ❌ DON'T

- ❌ Run the agent on generated or minified files
- ❌ Translate technical identifiers or variable names
- ❌ Create keys that are identical to the English label
- ❌ Mix namespaces in the same component unnecessarily
- ❌ Manually edit translation files while the agent is running
- ❌ Use special characters in translation keys

---

## Testing & Validation

### Unit Test Example

```javascript
// tests/i18n-agent.test.js
const agent = require('../scripts/i18n-agent.js');

describe('i18n Agent', () => {
    test('deduceNamespace should work correctly', () => {
        expect(agent.deduceNamespace('src/pages/home/Home.js'))
            .toBe('pages.home');
    });

    test('generateTranslationKey creates valid keys', () => {
        const key = agent.generateTranslationKey('No images found');
        expect(key).toMatch(/^[a-z][a-zA-Z0-9]*$/);
    });

    test('should handle nested properties', () => {
        const obj = {};
        agent.setNestedProperty(obj, 'a.b.c', 'value');
        expect(obj.a.b.c).toBe('value');
    });
});
```

### Manual Testing Checklist

- [ ] Component renders without errors
- [ ] English translations display correctly
- [ ] French translations display correctly
- [ ] Switching languages updates the UI
- [ ] All hardcoded strings are replaced
- [ ] No extra whitespace or formatting issues
- [ ] JSON files are properly formatted
- [ ] No duplicate keys in translation files

---

## Getting Help

1. **Check the Examples**
   - See `scripts/I18N_EXAMPLE_WORKFLOW.js` for real-world examples
   
2. **Review Existing Code**
   - Find similar components that are already translated
   - Copy their pattern

3. **Debug Mode**
   - Add console.log statements in the script
   - Check the generated keys before accepting them

4. **Manual Fallback**
   - If the agent doesn't work as expected, you can:
     - Manually add entries to translation files
     - Manually add useTranslation hooks to components
     - Manually replace strings with t() calls

---

## Script Architecture

```
scripts/
├── i18n-agent.js              # Core agent (main logic)
├── i18n-cli.js               # CLI wrapper (user interface)
├── i18n-examples.js          # Usage examples
├── I18N_AGENT_README.md      # Main documentation
├── I18N_EXAMPLE_WORKFLOW.js  # Before/after examples
└── TROUBLESHOOTING.md        # This file

Key Functions:
- deduceNamespace()           # Analysis of file paths
- generateTranslationKey()    # Smart key generation
- readJsonFile/writeJsonFile()# File I/O with error handling
- getNestedProperty/setNestedProperty()  # Navigation of JSON
- updateJsFileWithTranslation()  # Code modification
- interactiveI18nSession()    # User interaction flow
```

---

## Future Enhancements

Potential improvements for the i18n agent:

- [ ] Support for JSX markup within translations
- [ ] Automatic detection of plural forms
- [ ] Support for translation parameters/interpolation
- [ ] Integration with translation management APIs (Crowdin, etc.)
- [ ] Batch processing of multiple files
- [ ] Automatic French-to-English fallback
- [ ] Components for common patterns (buttons, dialogs, etc.)
- [ ] Linting for unused translation keys
- [ ] Performance optimization for large files

---

## Contributing

Found an issue or want to improve the agent?
- Report issues by adding console.error logs
- Test extensively before deploying
- Keep the code readable and well-commented
- Follow the existing style and conventions
