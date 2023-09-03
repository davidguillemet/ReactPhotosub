import React, { useCallback, useEffect, useState, useRef } from 'react';
import { Loading } from '../components/hoc';
import { useOverlay } from '../components/loading';

const TranslationContext = React.createContext(null);

const LANGUAGE_FR = "fr";
const LANGUAGE_EN = "en";
const LANGUAGE_FALLBACK = 'fr';

const unknownKey = (key) => `[[${key}]]`;
const isUnknown = (caption) => caption.startsWith("[[")
const getMapFromNamespace = (map, namespace) => namespace.split('.').reduce((o, key) => o[key], map);

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

const loadLanguageResources = (language) => {
    const resourceFileName = `/translations/${language}.json`;
    return fetch(resourceFileName, {
        headers : {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    })
    .then(response => {
        return response.json()
    });
}

export const TranslationProvider = ({children}) => {

    const [language, setLanguage] = useState(null);
    const resources = useRef(null);
    const fallBackResources = useRef(null); 
    const translators = useRef(new Map());

    const { setOverlay } = useOverlay();

    const loadLanguage = useCallback((language) => {
        setOverlay(true);
        const promises = [loadLanguageResources(language)];
        if (fallBackResources.current === null && language !== LANGUAGE_FALLBACK) {
            promises.push(loadLanguageResources(LANGUAGE_FALLBACK))
        }
        Promise.all(promises).then((values) => {
            resources.current = values[0];
            if (values.length > 1) {
                fallBackResources.current = values[1];
            } else if (language === LANGUAGE_FALLBACK) {
                fallBackResources.current = values[0];
            }
            setLanguage(language);
        }).catch(err => {
            setLanguage(LANGUAGE_FR);
        }).finally(() => {
            setOverlay(false)
        });
    }, [setOverlay]);

    useEffect(() => {
        loadLanguage(getNavigatorLanguage());
    }, [loadLanguage]);

    const getTranslation = useCallback(({resourceMap, fallbackMap}, id, args) => {
        let caption = null;
        const label = id.split('.').reduce((o, key) => (o === undefined ? unknownKey(key) : o[key]) || unknownKey(key), resourceMap);
        if (args !== undefined && !isUnknown(label)) {
            if (!Array.isArray(args)) {
                args = [args];
            }
            caption = args.reduce((res, arg, index) => res.replaceAll(`{${index}}`, arg), label);
        } else {
            caption = label;
        }
        if (isUnknown(caption) && fallbackMap) {
            caption = getTranslation({resourceMap: fallbackMap}, id, args);
        }
        return caption;
    }, []);

    const translatorFromNamespace = useCallback((namespace = "root") => {
        const translatorKey = `${language}::${namespace}`;
        if (translators.current.has(translatorKey)) {
            return translators.current.get(translatorKey);
        }

        let translator = null;
        if (namespace === "root") {
            translator = (id, args) => getTranslation({
                resourceMap: resources.current, 
                fallbackMap: fallBackResources.current
            }, id, args);
        }

        const resourceMap = getMapFromNamespace(resources.current, namespace);
        const fallbackMap =
            language !== LANGUAGE_FALLBACK ? 
            getMapFromNamespace(fallBackResources.current, namespace) :
            null;
        translator = (id, args) => getTranslation({resourceMap, fallbackMap}, id, args);

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
        </TranslationContext.Provider>
    );
}

export function useTranslation(namespace) {
    const context = React.useContext(TranslationContext);
    if (context === undefined || context === null) {
        throw new Error("useTranslation must be used within a TranslationProvider");
    }
    const translator = context.fromNamespace(namespace);
    translator.language = context.language;
    return translator;
}

export function useLanguage() {
    const context = React.useContext(TranslationContext);
    if (context === undefined || context === null) {
        throw new Error("useTranslation must be used within a TranslationProvider");
    }
    return context;
}
