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
    return translations?.[selectedLanguage]?.[key] || key
};

export const defaultKeyTranslator = (object, currentLng, key) => {
    currentLng = currentLng.charAt(0).toUpperCase() + currentLng.slice(1);
    return object[`${key}${currentLng}`] || object[key];
};
