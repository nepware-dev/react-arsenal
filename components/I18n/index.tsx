import { useMemo, useState } from 'react';
import type { Language } from './types';

import { I18nContext, useI18nContext, defaultContext } from './i18nContext';
import Localize from './Localize';
import type { I18nProviderProps } from './types';

const I18nProvider = (props: I18nProviderProps) => {
    const {
        children,
        translations,
        languages,
        languageAccessor,
        translator,
        keyTranslator,
        defaultLanguage = 'en',
    } = props;

    const [selectedLanguage, setSelectedLanguage] = useState<Language['code']>(defaultLanguage);

    const contextValue = useMemo(
        () => ({
            translations: translations || defaultContext.translations,
            languages: languages || defaultContext.languages,
            languageAccessor: languageAccessor || defaultContext.languageAccessor,
            translator: translator || defaultContext.translator,
            keyTranslator: keyTranslator || defaultContext.keyTranslator,
            selectedLanguage,
            changeLanguage: setSelectedLanguage,
        }),
        [translations, selectedLanguage, languages, languageAccessor, translator, keyTranslator],
    );

    return <I18nContext.Provider value={contextValue}>{children}</I18nContext.Provider>;
};

export { useI18nContext, Localize };

export default I18nProvider;
