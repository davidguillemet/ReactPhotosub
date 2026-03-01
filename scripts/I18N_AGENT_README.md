# 🌍 i18n Internationalization Agent

Un agent automatisé spécialisé pour l'internationalisation des libellés hardcodés dans votre application React.

## 🎯 Fonctionnalités

L'agent effectue les tâches suivantes de manière automatisée :

1. **Génère une clé de traduction** appropriée basée sur le libellé et le contexte
   - Convertit les labels en clés camelCase lisibles
   - Exemple: "Aucune année disponible" → `noYearAvailable`

2. **Crée les entrées de traduction** dans `en.json` et `fr.json`
   - Ajoute les clés au niveau de hiérarchie correspondant au namespace
   - Exemple: Pour un fichier `src/pages/dates/Dates.js`, crée `pages.dates.noYearAvailable`
   - Gère automatiquement la création des niveaux de hiérarchie manquants

3. **Intègre le hook useTranslation** dans le fichier JavaScript
   - Ajoute l'import du hook si nécessaire
   - Appelle le hook en passant le namespace approprié
   - Remplace les labels hardcodés par des appels `t("clé")`

4. **Déduit le namespace** automatiquement du chemin du fichier
   - `src/pages/destination/Destination.js` → `pages.destination`
   - `src/components/gallery/Gallery.js` → `components.gallery`
   - `src/dialogs/ConfirmDialog.js` → `dialogs`

## 📋 Conventions de nommage

Les clés de traduction suivent une hiérarchie logique:

```json
{
  "menu": {
    "home": "Home",
    "logout": "Logout"
  },
  "pages": {
    "destination": {
      "title": "Destination",
      "noImagesFound": "No images found"
    },
    "dates": {
      "noYearAvailable": "No year available"
    }
  },
  "dialogs": {
    "confirm": "Confirm",
    "cancel": "Cancel"
  }
}
```

### Préfixes spéciaux (optionnels)
- `field:` pour les champs de formulaire
- `error:` pour les messages d'erreur
- `btn` pour les boutons
- `placeholder` pour les placeholders

## 🚀 Utilisation

### Installation

Rendre le script exécutable:
```bash
chmod +x scripts/i18n-agent.js
```

### Exécution

```bash
node scripts/i18n-agent.js
```

Ou via npm (ajouter un script dans `package.json`):
```json
{
  "scripts": {
    "i18n": "node scripts/i18n-agent.js"
  }
}
```

Puis exécuter:
```bash
npm run i18n
```

### Flux interactif

1. **Entrez le chemin du fichier** à internationaliser
   ```
   📁 Enter JS file path: src/pages/dates/Dates.js
   ```

2. **L'agent détecte** les labels potentiels
   ```
   🔍 Found 3 potential hardcoded label(s):
      1. "Aucune année disponible"
      2. "Choisir une année"
      3. "Années par destination"
   ```

3. **Sélectionnez les labels** à internationaliser
   ```
   ✏️  Which ones to internationalize? (comma-separated indices): 1,2,3
   ```

4. **Fournissez les traductions** pour chaque label
   ```
   📝 Enter translations for key: "noYearAvailable"
   🇬🇧 English: No year available
   🇫🇷 Français: Aucune année disponible
   ```

5. **L'agent effectue les modifications** automatiquement
   ```
   ✅ Updated en.json
   ✅ Updated fr.json
   ✅ Updated JS file with useTranslation
   ```

## 📝 Exemple complet

### Avant (hardcodé)

**src/pages/dates/Dates.js**
```javascript
import React from 'react';

const Dates = () => {
    const years = getYears();
    
    if (years.length === 0) {
        return <p>Aucune année disponible</p>;
    }
    
    return (
        <div>
            <h2>Choisir une année</h2>
            {years.map(year => <button key={year}>{year}</button>)}
        </div>
    );
}
```

### Après (internationalisé)

**src/pages/dates/Dates.js**
```javascript
import React from 'react';
import { useTranslation } from '../../utils';

const Dates = () => {
    const t = useTranslation("pages.dates");
    const years = getYears();
    
    if (years.length === 0) {
        return <p>{t("noYearAvailable")}</p>;
    }
    
    return (
        <div>
            <h2>{t("chooseYear")}</h2>
            {years.map(year => <button key={year}>{year}</button>)}
        </div>
    );
}
```

**public/translations/en.json**
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

**public/translations/fr.json**
```json
{
    "pages": {
        "dates": {
            "noYearAvailable": "Aucune année disponible",
            "chooseYear": "Choisir une année"
        }
    }
}
```

## 🔧 Configuration avancée

### Modifier les répertoires de base

Éditer le fichier `scripts/i18n-agent.js`:
```javascript
const WORKSPACE_ROOT = path.join(__dirname, '..');
const TRANSLATIONS_DIR = path.join(WORKSPACE_ROOT, 'public', 'translations');
const SRC_DIR = path.join(WORKSPACE_ROOT, 'src');
```

### Personnaliser la génération de clés

Modifier la fonction `generateTranslationKey()` pour adapter la logique de création de clés à vos conventions.

## ⚙️ API programmée

L'agent peut aussi être utilisé de façon programmatique:

```javascript
const {
    deduceNamespace,
    generateTranslationKey,
    interactiveI18nSession,
} = require('./scripts/i18n-agent.js');

// Déduire le namespace
const ns = deduceNamespace('src/pages/destination/Destination.js');
// → "pages.destination"

// Générer une clé
const key = generateTranslationKey("Aucune année disponible");
// → "noYearAvailable"

// Lancer une session interactive
await interactiveI18nSession('src/pages/dates/Dates.js');
```

## 🎓 Best Practices

1. **Traiter un fichier à la fois** pour mieux contrôler les modifications

2. **Vérifier les clés générées** - elles doivent être descriptives et courtes

3. **Préparer les traductions** dans votre langue source avant de lancer l'agent

4. **Valider les modifications** après l'exécution:
   - Vérifier que les clés sont au bon niveau de hiérarchie
   - Tester que les traductions s'affichent correctement
   - Vérifier l'absence de caractères spéciaux mal échappés

5. **Utiliser des commentaires** pour les labels complexes ou ambigus

## 🐛 Limitations et améliorations futures

- La détection de strings hardcodés utilise une regex simple et peut avoir des faux positifs
- Les templates littéraux (backticks) ne sont pas toujours détectés
- Les chaînes JSX multilignes peuvent ne pas être correctement remplacées

## 📚 Ressources

- Structure des traductions: `public/translations/`
- Hook useTranslation: `src/utils/useTranslation.js`
- Exemples d'utilisation dans l'app:
  - `src/pages/notFound/NotFound.js`
  - `src/dialogs/ConfirmDialog.js`
  - `src/pages/finning/Finning.js`
