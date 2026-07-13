import { useMemo, useCallback } from 'react';

import {
    defaultKeyTranslator,
    useI18nContext,
    parsePluralText,
    parseLinkText,
} from './i18nContext';
import type { LocalizeProps } from './types';

const Localize = (props: LocalizeProps) => {
    const { children, ...otherProps } = props;

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
    } = useI18nContext(otherProps);

    const translationText = useMemo(() => children ?? text ?? '', [children, text]);

    const translationCallback = useCallback(
        (text: string) => {
            if (translator) {
                return translator(text, selectedLanguage, translations);
            }
            return i18nTranslator(text, selectedLanguage, translations);
        },
        [translator, i18nTranslator, selectedLanguage, translations],
    );

    if (children && text) {
        console.warn('Only one of children, or text should be used for Localization.');
    }

    if (children) {
        if (dataKey) {
            const dataKeyTranslator = keyTranslator || defaultKeyTranslator;
            return dataKeyTranslator(children as Record<string, any>, dataKey, selectedLanguage);
        }
        if (translator) {
            return translator(children as string, selectedLanguage, translations);
        }
        return i18nTranslator(children as string, selectedLanguage, translations);
    }

    if (textPlural) {
        return parsePluralText({
            text: translationText as string,
            textPlural,
            translationCallback,
            scope,
            numberFormatter,
        });
    }
    return parseLinkText({ text: translationCallback(text ?? ''), scope });
};

export default Localize;
