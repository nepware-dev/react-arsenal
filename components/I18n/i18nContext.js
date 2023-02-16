import React, {useContext} from 'react';

export const I18nContext = React.createContext(null);

export function useI18nContext(props) {
    const {translator, ...context} = useContext(I18nContext);
    return {
        i18nTranslator: translator,
        ...context, 
        ...props,
    };
}

export const defaultTranslator = (key, selectedLanguage, translations) => {
    return translations?.[selectedLanguage]?.[key] || key;
};

export const defaultKeyTranslator = (object, currentLng, key) => {
    currentLng = currentLng.charAt(0).toUpperCase() + currentLng.slice(1);
    return object[`${key}${currentLng}`] || object[key];
};

export const defaultLocalizer = (
    text,
    textPlural,
    {
        translator,
        selectedLanguage,
        translations,
        scope,
        numberFormatter
    }
) => {
    const translationCallback = translationText => {
        if(translator) {
            return translator(translationText, selectedLanguage, translations);
        }
        return defaultTranslator(translationText, selectedLanguage, translations);
    };

    if(textPlural) {
        return parsePluralText({text, textPlural, translationCallback, scope, numberFormatter});
    }
    return parseLinkText({text: translationCallback(text), scope});
};

const templateVarRegex = /(\{\{\s[^]+?(?=\s\}\})\s\}\})/g;

function isTemplateVariable(text) {
    return new RegExp(templateVarRegex).test(text);
}

function interpolatePluralParts(parts=[], scope, numberFormatter) {
    return parts.map(part => {
        if(!isTemplateVariable(part) || part.includes(':') || /;\s\}\}$/.test(part)) {
            return part;
        }
        const templateVar = part.replace(/^\{\{\s/, '').replace(/\s\}\}$/, '');
        const countValue = scope[templateVar] || 0;
        if(isNaN(countValue)) {
            return part;
        }
        return numberFormatter(scope[templateVar] || 0);
    }).join('')
}

export function parseLinkText({text, scope}) {
    if(!text) {
        return text;
    }
    const parts = text.split(new RegExp(templateVarRegex)).filter(x => x);
    if(!parts.length || (parts.length === 1 && !isTemplateVariable(parts[0]))) {
        return text;
    }
    const parsedParts = parts.map((part, i) => {
        const key = `${part}_${i}`;

        if(!isTemplateVariable(part)) {
            return React.createElement('span', {key}, parts[i]);
        }

        let keyName = part.replace(/^\{\{\s/, '').replace(/\s\}\}$/, '');
        let [scopeKey, scopeChildren] = keyName.split(/:([^]+)/);

        if(scopeKey.endsWith(';')) {
            scopeKey = scopeKey.replace(/;$/, '');
        }

        if(scope[scopeKey] === undefined) {
            return React.createElement('span', {key}, parts[i]);
        }

        const replacement = scope[scopeKey];
        if(!React.isValidElement(replacement)) {
            return React.createElement('span', {key}, String(replacement));
        }

        return !scopeChildren
            ? React.cloneElement(replacement, {key})
            : React.cloneElement(replacement, {key}, scopeChildren);
    });

    return parsedParts.length > 1 ? (
        <span>{parsedParts}</span>
    ) : parsedParts[0];
}

export function parsePluralText({
    text,
    textPlural,
    translationCallback,
    numberFormatter = arg => arg,
    scope={}
}) {
    if(!textPlural) {
        return textPlural;
    }
    const matches = textPlural.match(new RegExp(templateVarRegex));
    const countTemplate = matches.find(match => !(match.includes(':') || /;\s\}\}$/.test(match)));
    if(!countTemplate) {
        return parseLinkText({text: textPlural, scope});
    }
    const countVariable = countTemplate.replace(/^\{\{\s/, '').replace(/\s\}\}$/, '');
    const countValue = scope[countVariable] || 0;
    if(Number(countValue) === 1) {
        return parseLinkText({text: translationCallback(text), scope});
    }

    const translatedPluralText = translationCallback(textPlural);
    const parts = translatedPluralText.split(new RegExp(templateVarRegex)).filter(t => t);

    return parseLinkText({text: interpolatePluralParts(parts, scope, numberFormatter), scope});
}
