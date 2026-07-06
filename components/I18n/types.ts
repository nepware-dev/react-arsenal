import type React from 'react';

export type Translations = Record<string, any>;

export interface Language {
    code: string;
    title: string;
}

export interface I18nProviderProps extends React.PropsWithChildren {
    /**
     * Translations to be used by the module.
     */
    translations?: Translations;
    /**
     * List of available languages.
     */
    languages?: Language[];
    /**
     * Language Accessor/Extractor key for each item in languages array.
     */
    languageAccessor?: string;
    /**
     * Translator function that maps text to other translations.
     * @param {string} key - The text that is to be translated.
     * @param {string} selectedLanguage - Current language selected.
     * @param {object} translations - Contains the translations object.
     */
    translator?: (
        key: string,
        selectedLanguage: Language['code'],
        translations: Translations,
    ) => string;
    /**
     * Translator function that maps text to other translations (for use with dataKey).
     * @param {object} object - Data object passed as child.
     * @param {string} key - Contains the dataKey value.
     * @param {string} currentLng- Current language selected.
     */
    keyTranslator?: (object: Record<string, any>, key: string, currentLng: string) => string;
    /**
     * Language to be used as default.
     */
    defaultLanguage?: Language['code'];
}

export interface I18nContextValue {
    translations: Translations;
    languages: Language[];
    languageAccessor: string;
    translator: (
        key: string,
        selectedLanguage: Language['code'],
        translations: Translations,
    ) => string;
    keyTranslator: (object: Record<string, any>, key: string, currentLng: string) => string;
    selectedLanguage: Language['code'];
    changeLanguage: (languageCode: Language['code']) => void;
}

export interface UseI18nContextResult {
    translations: Translations;
    languages: Language[];
    languageAccessor: string;
    keyTranslator: I18nContextValue['keyTranslator'];
    i18nTranslator: I18nContextValue['translator'];
    selectedLanguage: Language['code'];
    changeLanguage: I18nContextValue['changeLanguage'];
    /**
     * Override translator passed explicitly as a prop, distinct from the context's default translator (i18nTranslator).
     */
    translator?: I18nContextValue['translator'];
    [key: string]: any;
}

export type NumberFormatter = (num: number) => string | number;

export interface LocalizerScope {
    translator?: I18nContextValue['translator'];
    selectedLanguage?: Language['code'];
    translations: Translations;
    scope?: Record<string, any>;
    numberFormatter?: NumberFormatter;
}

export interface ParseLinkTextArgs {
    text?: string;
    scope?: Record<string, any>;
}

export interface ParsePluralTextArgs {
    text: string;
    textPlural?: string;
    translationCallback: (text: string) => string;
    numberFormatter?: NumberFormatter;
    scope?: Record<string, any>;
}

/**
 * True when a literal string type is known to contain a `{{ ... }}` template marker.
 * A non-literal `string` can't be checked, so it's conservatively treated as `true`.
 */
export type ContainsTemplateVar<T extends string> = string extends T
    ? true
    : T extends `${string}{{ ${string} }}${string}`
      ? true
      : false;

/**
 * defaultLocalizer only returns a plain string when there's no textPlural and text has no
 * template markers to inject (link/newline/etc always resolve to elements, even unmatched ones).
 */
export type LocalizerReturn<T extends string, P extends string | undefined> = P extends string
    ? React.ReactNode
    : true extends ContainsTemplateVar<T>
      ? React.ReactNode
      : string;

export interface LocalizeProps {
    /**
     * The text that is to be translated,
     * OR the object that contains the translations.
     * Must be a single child.
     * If children is passed, it will be used as the text that is translated; text and textPlural props will be ignored.
     * Templates cannot be used here.
     */
    children?: Record<string, any> | React.ReactElement | string;
    /**
     * Denotes the key of the object (passed to children) to be displayed.
     * Passing this prop means that object passed as child must have a key-value pair with this value being the key.
     * Use if translation is available in the data object (child).
     * Can be only used with children.
     */
    dataKey?: string;
    /**
     * Translator function that maps text to other translations.
     * @param {string} key - The text that is to be translated.
     * @param {string} selectedLanguage - Current language selected.
     * @param {object} translations - Contains the translations object.
     */
    translator?: I18nContextValue['translator'];
    /**
     * Translator function that maps text to other translations (for use with dataKey).
     * @param {object} object - Data object passed as child.
     * @param {string} key - Contains the dataKey value.
     * @param {string} currentLng- Current language selected.
     */
    keyTranslator?: I18nContextValue['keyTranslator'];
    /**
     * The text to be translated.
     * Strings with template {{ link:text }}, or {{ newline; }} can be used for injecting elements and components.
     * IMPORTANT: SPACES ARE REQUIRED IN TEMPLATE STRINGS.
     * The variable used within the templates such as 'link', and 'newline' in the above should be passed as separate props.
     */
    text?: string;
    /**
     * The plural version of the text.
     * Strings with template {{ link:text }}, or {{ newline; }} can be used for injecting elements and components.
     * IMPORTANT: SPACES ARE REQUIRED IN TEMPLATE STRINGS.
     * Only one count variable can be used  with template {{ count }} can be used.
     * The variable used within the templates 'link', 'newline', and 'count' in the above should be passed as separate props.
     */
    textPlural?: string;
    /**
     * Formatter function for the plural version of the count variable used.
     * @param {number} num - The evaluated count variable to be formatted.
     * Defaults to an identity function.
     */
    numberFormatter?: NumberFormatter;
    /**
     * Additional scope variables referenced by template strings in text/textPlural (e.g. link, newline, count).
     */
    [key: string]: any;
}
