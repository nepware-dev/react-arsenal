import React, {useMemo, useCallback} from 'react';
import PropTypes from 'prop-types';

import {defaultKeyTranslator, useI18nContext, parsePluralText, parseLinkText} from './i18nContext';

const propTypes = {
    /**
     * The text that is to be translated,
     * OR the object that contains the translations.
     * Must be a single child.
     * If children is passed, it will be used as the text that is translated; text and textPlural props will be ignored.
     * Templates cannot be used here.
     */
    children: PropTypes.oneOfType([
        PropTypes.object,
        PropTypes.element,
        PropTypes.string,
    ]),
    /**
     * Denotes the key of the object (passed to children) to be displayed.
     * Passing this prop means that object passed as child must have a key-value pair with this value being the key.
     * Use if translation is available in the data object (child).
     * Can be only used with children.
     */
    dataKey: PropTypes.string,
    /**
     * Translator function that maps text to other translations.
     * @param {string} key - The text that is to be translated.
     * @param {string} selectedLanguage - Current language selected.
     * @param {object} translations - Contains the translations object.
     */
    translator: PropTypes.func,
    /**
     * Translator function that maps text to other translations (for use with dataKey).
     * @param {object} object - Data object passed as child.
     * @param {string} key - Contains the dataKey value.
     * @param {string} currentLng- Current language selected.
     */
    keyTranslator: PropTypes.func,
    /**
     * The text to be translated.
     * Strings with template {{ link:text }}, or {{ newline; }} can be used for injecting elements and components.
     * IMPORTANT: SPACES ARE REQUIRED IN TEMPLATE STRINGS.
     * The variable used within the templates such as 'link', and 'newline' in the above should be passed as separate props.
     */
    text: PropTypes.string,
    /**
     * The plural version of the text.
     * Strings with template {{ link:text }}, or {{ newline; }} can be used for injecting elements and components.
     * IMPORTANT: SPACES ARE REQUIRED IN TEMPLATE STRINGS.
     * Only one count variable can be used  with template {{ count }} can be used.
     * The variable used within the templates 'link', 'newline', and 'count' in the above should be passed as separate props.
     */
    textPlural: PropTypes.string,
    /**
     * Formatter function for the plural version of the count variable used.
     * @param {number} num - The evaluated count variable to be formatted.
     * Defaults to an identity function.
     */
    numberFormatter: PropTypes.func,
};

export function localizeFn(text, textPlural, scope) {
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

const Localize = (props) => {
    const {children, ...otherProps} = props;

    const {
        text,
        textPlural,
        dataKey, 
        i18nTranslator,
        selectedLanguage,
        translator,
        keyTranslator,
        translations,
        numberFormatter,
        ...scope
    }= useI18nContext(otherProps);

    const translationText = useMemo(() => children ?? text, [children, text]);

    const translationCallback = useCallback((text) => {
        if(translator) {
            return translator(text, selectedLanguage, translations);
        }
        return i18nTranslator(text, selectedLanguage, translations);
    }, [translator, i18nTranslator, selectedLanguage, translations]);

    if(children && text) {
        console.warn('Only one of children, or text should be used for Localization.');
    }

    if(children) {
        if(dataKey) {
            const dataKeyTranslator = keyTranslator || defaultKeyTranslator;
            return dataKeyTranslator(children, dataKey, selectedLanguage);
        }
        if(translator) {
            return translator(children, selectedLanguage, translations);
        }
        return i18nTranslator(children, selectedLanguage, translations);
    }

    if (textPlural) {
        return parsePluralText({text: translationText, textPlural, translationCallback, scope, numberFormatter});
    }
    return parseLinkText({text: translationCallback(text), scope});
};

Localize.propTypes = propTypes;

export default Localize;
