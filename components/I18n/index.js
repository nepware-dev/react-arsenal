import React, {useMemo, useState} from 'react';
import PropTypes from 'prop-types';

import {I18nContext, useI18nContext, defaultTranslator} from './i18nContext';
import Localize, {localizeFn} from './Localize';

const propTypes = {
    children: PropTypes.oneOfType([
        PropTypes.arrayOf(PropTypes.element),
        PropTypes.element,
    ]).isRequired,
    /**
     * Translations to be used by the module.
     */
    translations: PropTypes.object,
    /**
     * List of available languages.
     */
    languages: PropTypes.array,
    /**
     * Language Accessor/Extractor key for each item in languages array.
     */
    languageAccessor: PropTypes.string,
    /**
     * Translator function that maps text to other translations.
     * @param {string} key - The text that is to be translated.
     * @param {string} selectedLanguage - Current language selected.
     * @param {object} translations - Contains the translations object.
     */
    translator: PropTypes.function,
    /**
     * Language to be used as default.
     */
    defaultLanguage: PropTypes.string,
};

const I18nProvider = props => {
    const {
        children, 
        translations, 
        languages, 
        languageAccessor, 
        translator, 
        defaultLanguage = 'en', 
    } = props;

    const [selectedLanguage, setSelectedLanguage] = useState(defaultLanguage);

    const defaultContext = useMemo(() => ({
        translations: translations || {},
        languages: languages || [
            {code: 'en', title: 'English'},
        ],
        languageAccessor: languageAccessor || 'code',
        translator: translator || defaultTranslator,
        selectedLanguage,
        changeLanguage: setSelectedLanguage,
    }), [translations, languages, languageAccessor, translator, selectedLanguage]);

    return (
        <I18nContext.Provider value={defaultContext}>
            {children}
        </I18nContext.Provider>
    );
};
I18nProvider.propTypes = propTypes;

export {useI18nContext, Localize, localizeFn};

export default I18nProvider;
