import PropTypes from 'prop-types';

import {defaultKeyTranslator, useI18nContext} from './i18nContext';

const propTypes = {
    /**
     * The text that is to be translated,
     * OR the object that contains the translations.
     * Must be a single child.
     */
    children: PropTypes.oneOfType([
        PropTypes.object,
        PropTypes.element,
        PropTypes.string,
    ]).isRequired,
    /**
     * Denotes the key of the object (passed to children) to be displayed.
     * Passing this prop means that object passed as child must have a key-value pair with this value being the key.
     * Use if translation is available in the data object (child).
     */
    dataKey: PropTypes.string,
    /**
     * Translator function that maps text to other translations.
     * @param {string} key - The text that is to be translated.
     * @param {string} selectedLanguage - Current language selected.
     * @param {object} translations - Contains the translations object.
     *
     * If dataKey prop is passed:
     * @param {object} object - Data object passed as child.
     * @param {string} currentLng- Current language selected.
     * @param {string} key - Contains the dataKey value.
     */
    translator: PropTypes.func,
};

export function localizeFn(text) {
    const {
        i18nTranslator,
        selectedLanguage,
        translator,
        translations,
    }= useI18nContext();

    if(translator) {
        return translator(text, selectedLanguage, translations);
    }
    return i18nTranslator(text, selectedLanguage, translations); 
}

const Localize = ({children, ...otherProps}) => {
    const {
        dataKey, 
        i18nTranslator,
        selectedLanguage,
        translator,
        translations,
    }= useI18nContext(otherProps);

    if(dataKey) {
        const keyTranslator = translator || defaultKeyTranslator;
        return keyTranslator(children, selectedLanguage, dataKey);
    }
    if(translator) {
        return translator(children, selectedLanguage, translations);
    }
    return i18nTranslator(children, selectedLanguage, translations);
};

Localize.propTypes = propTypes;

export default Localize;
