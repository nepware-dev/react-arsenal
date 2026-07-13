import React, { useContext } from 'react';

import type {
    I18nContextValue,
    LocalizerReturn,
    LocalizerScope,
    NumberFormatter,
    ParseLinkTextArgs,
    ParsePluralTextArgs,
    UseI18nContextResult,
} from './types';

export const I18nContext = React.createContext<I18nContextValue | null>(null);

export const defaultTranslator = (
    key: string,
    selectedLanguage: string,
    translations: Record<string, any>,
) => {
    return translations?.[selectedLanguage]?.[key] || key;
};

export const defaultKeyTranslator = (
    object: Record<string, any>,
    key: string,
    currentLng: string,
) => {
    currentLng = currentLng.charAt(0).toUpperCase() + currentLng.slice(1);
    return object[`${key}${currentLng}`] || object[key];
};

export const defaultContext: I18nContextValue = {
    translations: {},
    languages: [{ code: 'en', title: 'English' }],
    languageAccessor: 'code',
    translator: defaultTranslator,
    keyTranslator: defaultKeyTranslator,
    selectedLanguage: 'en',
    changeLanguage: () => {},
};

export function useI18nContext(props?: Record<string, any>): UseI18nContextResult {
    const { translator, ...context } = useContext(I18nContext) ?? defaultContext;

    return {
        i18nTranslator: translator,
        ...context,
        ...props,
    };
}

export function defaultLocalizer<T extends string, P extends string | undefined = undefined>(
    text: T,
    textPlural: P,
    { translator, selectedLanguage = '', translations, scope, numberFormatter }: LocalizerScope,
): LocalizerReturn<T, P> {
    const translationCallback = (translationText: string) => {
        if (translator) {
            return translator(translationText, selectedLanguage, translations);
        }
        return defaultTranslator(translationText, selectedLanguage, translations);
    };

    if (textPlural) {
        return parsePluralText({
            text,
            textPlural,
            translationCallback,
            scope,
            numberFormatter,
        }) as LocalizerReturn<T, P>;
    }
    return parseLinkText({ text: translationCallback(text), scope }) as LocalizerReturn<T, P>;
}

const templateVarRegex = /(\{\{\s[^]+?(?=\s\}\})\s\}\})/g;

function isTemplateVariable(text: string) {
    return new RegExp(templateVarRegex).test(text);
}

function interpolatePluralParts(
    parts: string[] = [],
    scope: Record<string, any>,
    numberFormatter?: NumberFormatter,
) {
    return parts
        .map((part) => {
            if (!isTemplateVariable(part) || part.includes(':') || /;\s\}\}$/.test(part)) {
                return part;
            }
            const templateVar = part.replace(/^\{\{\s/, '').replace(/\s\}\}$/, '');
            const countValue = scope[templateVar] || 0;
            if (isNaN(countValue)) {
                return part;
            }
            return numberFormatter?.(scope[templateVar] || 0);
        })
        .join('');
}

export const parseLinkText = ({ text, scope = {} }: ParseLinkTextArgs) => {
    if (!text) {
        return text;
    }
    const parts = text.split(new RegExp(templateVarRegex)).filter((x) => x);
    if (!parts.length || (parts.length === 1 && !isTemplateVariable(parts[0]))) {
        return text;
    }
    const parsedParts = parts.map((part, i) => {
        const key = `${part}_${i}`;

        if (!isTemplateVariable(part)) {
            return React.createElement('span', { key }, parts[i]);
        }

        let keyName = part.replace(/^\{\{\s/, '').replace(/\s\}\}$/, '');
        let [scopeKey, scopeChildren] = keyName.split(/:([^]+)/);

        if (scopeKey.endsWith(';')) {
            scopeKey = scopeKey.replace(/;$/, '');
        }

        if (scope[scopeKey] === undefined) {
            return React.createElement('span', { key }, parts[i]);
        }

        const replacement = scope[scopeKey];
        if (!React.isValidElement(replacement)) {
            return React.createElement('span', { key }, String(replacement));
        }

        return !scopeChildren
            ? React.cloneElement(replacement, { key })
            : React.cloneElement(replacement, { key }, scopeChildren);
    });

    return parsedParts.length > 1 ? <span>{parsedParts}</span> : parsedParts[0];
};

export function parsePluralText({
    text,
    textPlural,
    translationCallback,
    numberFormatter = (arg) => arg,
    scope = {},
}: ParsePluralTextArgs): React.ReactNode {
    if (!textPlural) {
        return textPlural;
    }
    const matches = textPlural.match(new RegExp(templateVarRegex)) ?? [];
    const countTemplate = matches.find((match) => !(match.includes(':') || /;\s\}\}$/.test(match)));
    if (!countTemplate) {
        return parseLinkText({ text: textPlural, scope });
    }
    const countVariable = countTemplate.replace(/^\{\{\s/, '').replace(/\s\}\}$/, '');
    const countValue = scope[countVariable] || 0;
    if (Number(countValue) === 1) {
        return parseLinkText({ text: translationCallback(text), scope });
    }

    const translatedPluralText = translationCallback(textPlural);
    const parts = translatedPluralText.split(new RegExp(templateVarRegex)).filter((t) => t);

    return parseLinkText({ text: interpolatePluralParts(parts, scope, numberFormatter), scope });
}
