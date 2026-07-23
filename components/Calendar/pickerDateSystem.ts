import {
    MAXIMUM_BIKRAM_SAMBAT_YEAR,
    MINIMUM_BIKRAM_SAMBAT_YEAR,
    convertBikramSambatToGregorian,
    convertGregorianToBikramSambat,
    formatBikramSambatDate,
    formatIsoDate,
    fromNepaliDigits,
    gregorianToJsDate,
    isNepaliLanguage,
    isValidBikramSambatDate,
    isValidGregorianDate,
    jsDateToGregorian,
    parseIsoDate,
    type BikramSambatDate,
    type GregorianDate,
} from '../../utils/date';

export type DisplaySystem = 'ad' | 'bs';

export interface CalendarViewParts {
    year: number;
    month?: number;
}

export const gregorianToBikramSambatSafe = (date: GregorianDate): BikramSambatDate | null => {
    try {
        return convertGregorianToBikramSambat(gregorianToJsDate(date));
    } catch {
        return null;
    }
};

export const bikramSambatToGregorian = (date: BikramSambatDate): GregorianDate =>
    jsDateToGregorian(convertBikramSambatToGregorian(date));

export const isoToGregorian = (value?: string | null): GregorianDate | null =>
    parseIsoDate(value ?? undefined);

export const formatDatePart = (
    date: GregorianDate | null,
    system: DisplaySystem,
    language?: string,
): string => {
    if (!date) {
        return '';
    }
    if (system === 'bs') {
        const bikramSambatDate = gregorianToBikramSambatSafe(date);
        if (!bikramSambatDate) {
            return '';
        }
        return formatBikramSambatDate(bikramSambatDate, 'YYYY-MM-DD', {
            language,
            useNepaliDigits: isNepaliLanguage(language),
        });
    }
    return formatIsoDate(date);
};

export const parseDatePart = (text: string, system: DisplaySystem): GregorianDate | null => {
    const normalized = system === 'bs' ? fromNepaliDigits(text.trim()) : text.trim();
    const match = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(normalized);
    if (!match) {
        return null;
    }
    const parts = { year: Number(match[1]), month: Number(match[2]), day: Number(match[3]) };
    if (system === 'bs') {
        if (!isValidBikramSambatDate(parts)) {
            return null;
        }
        return bikramSambatToGregorian(parts);
    }
    return isValidGregorianDate(parts) ? parts : null;
};

export const parseCalendarViewParts = (
    text: string,
    system: DisplaySystem,
): CalendarViewParts | undefined => {
    const normalized = system === 'bs' ? fromNepaliDigits(text.trim()) : text.trim();
    const match = /^(\d{4})(?:-(\d{1,2}))?/.exec(normalized);
    if (!match) {
        return undefined;
    }
    const year = Number(match[1]);
    if (system === 'bs' && (year < MINIMUM_BIKRAM_SAMBAT_YEAR || year > MAXIMUM_BIKRAM_SAMBAT_YEAR)) {
        return undefined;
    }
    const viewParts: CalendarViewParts = { year };
    if (match[2]) {
        const month = Number(match[2]);
        if (month >= 1 && month <= 12) {
            viewParts.month = month;
        }
    }
    return viewParts;
};
