import React, { useCallback, useEffect, useState, useRef } from 'react';
import { Loading } from '../components/hoc';
import LoadingOverlay from '../components/loading';

const TranslationContext = React.createContext(null);

const LANGUAGE_FR = "fr";
const LANGUAGE_EN = "en";

const unknownKey = (key) => `[[${key}]]`;

const getNavigatorLanguage = () => {
    if (process.env.REACT_APP_HANDLE_LANGUAGES === "false") {
        return "fr";
    }
    const language = (navigator.languages && navigator.languages[0]) ||
            navigator.language ||
            navigator.userLanguage;
    // fr-FR
    return language.split('-')[0];
}

export const TranslationProvider = ({children}) => {

    const [language, setLanguage] = useState(null);
    const resources = useRef(null);
    const translators = useRef(new Map());

    const [backDropOpen, setBackDropOpen] = React.useState(false);

    const loadLanguage = useCallback((language) => {
        setBackDropOpen(true);
        const resourceFileName = `/translations/${language}.json`;
        fetch(resourceFileName, {
            headers : {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        })
        .then(response => {
            return response.json()
        })
        .then(data => {
            resources.current = data;
            setLanguage(language);
        })
        .catch(err => {
            setLanguage(LANGUAGE_FR);
        })
        .finally(() => setBackDropOpen(false));
    }, []);

    useEffect(() => {
        loadLanguage(getNavigatorLanguage());
    }, [loadLanguage]);

    const getTranslation = useCallback((resourceMap, id, args) => {
        const label = id.split('.').reduce((o, key) => (o === undefined ? unknownKey(key) : o[key]) || unknownKey(key), resourceMap);
        if (args !== undefined) {
            if (!Array.isArray(args)) {
                args = [args];
            }
            return args.reduce((res, arg, index) => res.replaceAll(`{${index}}`, arg), label);
        } else {
            return label;
        }
    }, []);

    const translatorFromNamespace = useCallback((namespace = "root") => {
        const translatorKey = `${language}::${namespace}`;
        if (translators.current.has(translatorKey)) {
            return translators.current.get(translatorKey);
        }

        let translator = null;
        if (namespace === "root") {
            translator = (id, args) => getTranslation(resources.current, id, args);
        }

        const resourceMap = namespace.split('.').reduce((o, key) => o[key], resources.current);
        translator = (id, args) => getTranslation(resourceMap, id, args);

        translators.current.set(translatorKey, translator);

        return translator;
    }, [language, getTranslation]);

    if (resources.current === null) {
        return <Loading />
    }

    return (
        <TranslationContext.Provider value={{
                language: language,
                setLanguage: loadLanguage,
                supportedLanguages: [LANGUAGE_FR, LANGUAGE_EN],
                fromNamespace: translatorFromNamespace 
            }}
        >
            {children}
            <LoadingOverlay open={backDropOpen} />
        </TranslationContext.Provider>
    );
}

export function useTranslation(namespace) {
    const context = React.useContext(TranslationContext);
    if (context === undefined || context === null) {
        throw new Error("useTranslation must be used within a TranslationProvider");
    }
    return context.fromNamespace(namespace);
}

export function useLanguage() {
    const context = React.useContext(TranslationContext);
    if (context === undefined || context === null) {
        throw new Error("useTranslation must be used within a TranslationProvider");
    }
    return context;
}
