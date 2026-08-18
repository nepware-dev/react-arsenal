import React from 'react';
import type { Meta } from '@storybook/react-vite';

import SelectInput from '@ra/components/Form/SelectInput';
import LocalizeProvider, {
    Localize,
    useI18nContext,
} from '@ra/components/I18n';
import type { Translations, Language } from '@ra/components/I18n/types';
import DateTimeInput from '@ra/components/Form/DateTimeInput';

import TimeUtils from '@ra/utils/time';

import '@ra/styles/_base.scss';
import styles from './styles.module.scss';

export default {
    title: 'Localization',
} satisfies Meta;

const testData = {
    description: 'This is a description.',
    descriptionJp: 'これは説明です。',
    descriptionKr: '이것은 설명이애요.',
    descriptionFr: 'eci est une description',
    descriptionNp: 'यो एक विवरण हो',
};

const translations: Translations = {
    en: {},
    jp: {
        Test: 'TestJP',
    },
    kr: {
        Test: 'TestKR',
    },
    fr: {
        Test: 'TestFR',
    },
    np: {
        Test: 'TestNP',
    },
};

const languages: (Language & { locale: string })[] = [
    { code: 'en', title: 'English', locale: 'en' },
    { code: 'jp', title: '日本語', locale: 'ja-JP' },
    { code: 'kr', title: '한국어', locale: 'ko-KR' },
    { code: 'fr', title: 'French', locale: 'fr' },
    { code: 'np', title: 'नेपाली', locale: 'ne-NP' },
];

interface LocalizationContentProps {
    nested?: boolean;
    title: string;
}

const LocalizationContent = ({ nested, title }: LocalizationContentProps) => {
    const { languages, selectedLanguage, changeLanguage } = useI18nContext();

    return (
        <div className={nested ? undefined : styles.nested}>
            <div className={styles.header}>
                <h4>{title}</h4>
                <SelectInput
                    className={styles.select}
                    searchable={false}
                    clearable={false}
                    defaultValue={languages.find(
                        (lng) => lng.code === selectedLanguage,
                    )}
                    keyExtractor={(item) => item.code}
                    valueExtractor={(item) => item.title}
                    onChange={({ option }) =>
                        option && changeLanguage(option.code)
                    }
                    options={languages}
                />
            </div>
            <p>
                <Localize>Test</Localize>
            </p>
            <p>
                <Localize dataKey="description">{testData}</Localize>
            </p>
            {nested && (
                <LocalizeProvider
                    translations={translations}
                    defaultLanguage="jp"
                    languages={languages.slice(0, -1)}
                >
                    <LocalizationContent title="Nested Context" />
                </LocalizeProvider>
            )}
        </div>
    );
};

export const SingleContext = () => {
    return (
        <LocalizeProvider translations={translations} languages={languages}>
            <LocalizationContent title="Single Localization Context" />
        </LocalizeProvider>
    );
};

export const NestedContexts = () => {
    return (
        <LocalizeProvider translations={translations} languages={languages}>
            <h3>Multiple Localization Contexts</h3>
            <LocalizationContent nested title="First Context" />
        </LocalizeProvider>
    );
};

const TimeServicesContent = () => {
    const {
        languages: contextLanguages,
        selectedLanguage,
        changeLanguage,
    } = useI18nContext();
    const languages = contextLanguages as (Language & { locale: string })[];

    const date = new Date();
    const [referenceDate, setReferenceDate] = React.useState(new Date());

    const selectedLocale =
        languages.find((lng) => lng.code === selectedLanguage)?.locale ?? 'en';

    return (
        <div>
            <div className={styles.header}>
                <h3>{date.toLocaleString(selectedLocale)}</h3>
                <SelectInput
                    className={styles.select}
                    searchable={false}
                    clearable={false}
                    defaultValue={languages.find(
                        (lng) => lng.code === selectedLanguage,
                    )}
                    keyExtractor={(item) => item.code}
                    valueExtractor={(item) => item.title}
                    onChange={({ option }) =>
                        option && changeLanguage(option.code)
                    }
                    options={languages}
                />
            </div>
            <p>
                <b>12 hour time string:</b>{' '}
                {TimeUtils.get12HourTimeString(date, selectedLocale)}
            </p>
            <p>
                <b>Reference Time</b>
                <DateTimeInput
                    className={styles.input}
                    onChange={({ value }) => setReferenceDate(new Date(value))}
                />
            </p>
            <p>
                <b>Time Since Reference Time: </b>
                {String(TimeUtils.timeSince(referenceDate, selectedLocale))}
            </p>
        </div>
    );
};

export const TimeServices = () => {
    return (
        <LocalizeProvider translations={translations} languages={languages}>
            <TimeServicesContent />
        </LocalizeProvider>
    );
};
