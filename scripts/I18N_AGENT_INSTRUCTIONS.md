# I18N Agent – Instructions for the Assistant

This document is not for human consumption; it exists so that **the assistant itself** has a precise reference
it can consult when asked to internationalize a hard‑coded label in the repository.

Whenever the user writes something like:

> internationalise le label "Aucune année disponible" dans `src/pages/...`  
> ou : "intl lbl no year available"  
> ou similaire
> ou : `internationalise <path/to/file.js>` ou `intl <path/to/file.js>` pour internationaliser
> tous les labels hardcodés dans le fichier

the assistant should **perform the full workflow immediately** by editing the relevant files in the workspace
(using the same tools the agent script would use).  The steps below describe what the assistant must do.

## Workflow (for the assistant)

1. **Identify the target JS file**
   * If the user mentions a path, use it; otherwise try to infer from earlier context.
   * Fail if the file doesn't exist or is not a `.js` file.

2. **Read the file's contents** and locate the hard‑coded label string(s). (Strings are assumed to be
    literal text in JSX or JavaScript.)
    - If the user provided a specific label, locate that exact string. If multiple occurrences match,
       ask for disambiguation. If none are found, warn the user and stop.
    - If the user did **not** provide a specific label (for example they used `internationalise <file>` or
       `intl <file>`), attempt to find all likely hard‑coded labels in the file and treat each as a
       candidate for internationalization (see heuristics below).

3. **Deduce namespace** from the file path:
   * Remove `src/` prefix, drop filename.
   * Replace `/` by `.`.
   * For `pages/Xyz/...` use the first two segments only (`pages.xyz`).
   * For `components/Xyz/...` use the first two segments (`components.xyz`).
   * `dialogs` is simply `dialogs`.
   * Fallback: join all segments with dots.

4. **Generate a translation key** for each identified label:
   * Lower‑case, remove punctuation.
   * Convert to camelCase (`no year available` → `noYearAvailable`).
   * If the label begins with an article (le, la, un, a, the) strip it.
   * If the namespace or context suggests a prefix (error, btn, field), add it.
   * Prepend the namespace to get full key: `pages.dates.noYearAvailable`.

5. **Update translations files** (`public/translations/en.json` and `fr.json`) for each key
   produced in step 4:
   * Load the JSON content.
   * Walk/create nested objects according to the namespace.
   * Insert each new key with an English and French value (use heuristics to decide which
     file to prefer when the original label is language‑specific, but always insert a fallback
     into the other language file).
   * Write the modified JSON back with indentation.

6. **Modify the JS file**
   * Ensure an import statement for `useTranslation` exists (`from '../../utils'` or similar).
     - If there is an existing import from `utils`, insert `useTranslation` into its braces.
     - Otherwise add a new line after the first import.
   * Ensure a hook call is present within the component body: `const t = useTranslation("{namespace}");`
   * Replace each hard‑coded label with `{t("{key}")}` (or the appropriate expression in template
     strings), processing one label at a time.
   * Save the file.

7. **Report back to the user** describing the changes made; list the file processed,
   the namespace used, and the number of labels internationalized along with the
   new keys and a short translations snippet.

8. **Error handling**
   * If any step fails, inform the user and do not leave partial modifications.
   * Keep copies of the original files so edits can be reversed if needed.

## Example of assistant action

User request:

> Internationalise le label "Aucune année disponible" dans `src/pages/dates/Dates.js`.

Assistant should:

* namespace = `pages.dates`
* key = `pages.dates.noYearAvailable`
* add to en.json / fr.json
* change the JSX in Dates.js exactly as described in the README examples.

The assistant may use the predefined `scripts/i18n-agent.js` logic as reference, but it
need not execute Node; all modifications can be performed with the workspace file tools.

## Notes

* The assistant should treat the workflow as deterministic: when the same label appears again
  after translation, it should reuse the same key if possible.
* This document can be updated over time if the helper behaviour evolves.