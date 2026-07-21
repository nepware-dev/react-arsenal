// Date helpers for both the Gregorian (AD) and Bikram Sambat (BS) systems.

export interface GregorianDate {
    year: number;
    month: number;
    day: number;
}

export const GREGORIAN_MONTH_LABELS: readonly string[] = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
];

export const GREGORIAN_WEEKDAY_SHORT_LABELS: readonly string[] = [
    'Sun',
    'Mon',
    'Tue',
    'Wed',
    'Thu',
    'Fri',
    'Sat',
];

const twoDigits = (value: number): string => String(value).padStart(2, '0');

export const getDaysInGregorianMonth = (year: number, month: number): number =>
    new Date(year, month, 0).getDate();

export const isValidGregorianDate = (
    date?: Partial<GregorianDate> | null,
): date is GregorianDate => {
    if (!date) {
        return false;
    }
    const { year, month, day } = date;
    if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
        return false;
    }
    if (month! < 1 || month! > 12) {
        return false;
    }
    return day! >= 1 && day! <= getDaysInGregorianMonth(year!, month!);
};

export const gregorianToJsDate = (date: GregorianDate): Date =>
    new Date(date.year, date.month - 1, date.day);

export const jsDateToGregorian = (date: Date): GregorianDate => ({
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate(),
});

export const getTodayGregorianDate = (): GregorianDate => jsDateToGregorian(new Date());

export const compareGregorianDates = (first: GregorianDate, second: GregorianDate): number =>
    first.year - second.year || first.month - second.month || first.day - second.day;

export const getGregorianWeekdayIndex = (date: GregorianDate): number =>
    gregorianToJsDate(date).getDay();

export const getGregorianMonthLabel = (month: number): string => {
    const label = GREGORIAN_MONTH_LABELS[month - 1];
    if (!label) {
        throw new RangeError(`Invalid Gregorian month: ${month}`);
    }
    return label;
};

export const formatIsoDate = (date: GregorianDate): string =>
    `${String(date.year).padStart(4, '0')}-${twoDigits(date.month)}-${twoDigits(date.day)}`;

export const parseIsoDate = (value?: string | null): GregorianDate | null => {
    if (!value) {
        return null;
    }
    const match = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(value.trim());
    if (!match) {
        return null;
    }
    const date = { year: Number(match[1]), month: Number(match[2]), day: Number(match[3]) };
    return isValidGregorianDate(date) ? date : null;
};

// Bikram Sambat (Nepali) calendar system.
export interface BikramSambatDate {
    year: number;
    month: number;
    day: number;
}

export interface BikramSambatMonthLabel {
    english: string;
    nepali: string;
}

export interface BikramSambatWeekdayLabel {
    english: string;
    nepali: string;
    englishShort: string;
    nepaliShort: string;
}

export interface FormatBikramSambatDateOptions {
    language?: string;
    useNepaliDigits?: boolean;
}

// Supported range: 1975-01-01 BS (1918-04-13 AD) through 2100-12-30 BS (2044-04-12 AD).
export const MINIMUM_BIKRAM_SAMBAT_YEAR = 1975;
export const MAXIMUM_BIKRAM_SAMBAT_YEAR = 2100;

// Month lengths per year, majority-vote across open Bikram Sambat datasets; years beyond ~2083 are projections.
const BIKRAM_SAMBAT_MONTH_LENGTHS: Record<number, readonly number[]> = {
    1975: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
    1976: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
    1977: [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
    1978: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
    1979: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
    1980: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
    1981: [31, 31, 31, 32, 31, 31, 29, 30, 30, 29, 30, 30],
    1982: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
    1983: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
    1984: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
    1985: [31, 31, 31, 32, 31, 31, 29, 30, 30, 29, 30, 30],
    1986: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
    1987: [31, 32, 31, 32, 31, 30, 30, 29, 30, 29, 30, 30],
    1988: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
    1989: [31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30],
    1990: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
    1991: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 30],
    1992: [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
    1993: [31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30],
    1994: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
    1995: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 30],
    1996: [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
    1997: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
    1998: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
    1999: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
    2000: [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
    2001: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
    2002: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
    2003: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
    2004: [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
    2005: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
    2006: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
    2007: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
    2008: [31, 31, 31, 32, 31, 31, 29, 30, 30, 29, 29, 31],
    2009: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
    2010: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
    2011: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
    2012: [31, 31, 31, 32, 31, 31, 29, 30, 30, 29, 30, 30],
    2013: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
    2014: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
    2015: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
    2016: [31, 31, 31, 32, 31, 31, 29, 30, 30, 29, 30, 30],
    2017: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
    2018: [31, 32, 31, 32, 31, 30, 30, 29, 30, 29, 30, 30],
    2019: [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
    2020: [31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30],
    2021: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
    2022: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 30],
    2023: [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
    2024: [31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30],
    2025: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
    2026: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
    2027: [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
    2028: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
    2029: [31, 31, 32, 31, 32, 30, 30, 29, 30, 29, 30, 30],
    2030: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
    2031: [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
    2032: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
    2033: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
    2034: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
    2035: [30, 32, 31, 32, 31, 31, 29, 30, 30, 29, 29, 31],
    2036: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
    2037: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
    2038: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
    2039: [31, 31, 31, 32, 31, 31, 29, 30, 30, 29, 30, 30],
    2040: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
    2041: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
    2042: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
    2043: [31, 31, 31, 32, 31, 31, 29, 30, 30, 29, 30, 30],
    2044: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
    2045: [31, 32, 31, 32, 31, 30, 30, 29, 30, 29, 30, 30],
    2046: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
    2047: [31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30],
    2048: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
    2049: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 30],
    2050: [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
    2051: [31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30],
    2052: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
    2053: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 30],
    2054: [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
    2055: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
    2056: [31, 31, 32, 31, 32, 30, 30, 29, 30, 29, 30, 30],
    2057: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
    2058: [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
    2059: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
    2060: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
    2061: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
    2062: [30, 32, 31, 32, 31, 31, 29, 30, 29, 30, 29, 31],
    2063: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
    2064: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
    2065: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
    2066: [31, 31, 31, 32, 31, 31, 29, 30, 30, 29, 29, 31],
    2067: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
    2068: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
    2069: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
    2070: [31, 31, 31, 32, 31, 31, 29, 30, 30, 29, 30, 30],
    2071: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
    2072: [31, 32, 31, 32, 31, 30, 30, 29, 30, 29, 30, 30],
    2073: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
    2074: [31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30],
    2075: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
    2076: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 30],
    2077: [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
    2078: [31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30],
    2079: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
    2080: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 30],
    2081: [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
    2082: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
    2083: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
    2084: [31, 31, 32, 31, 31, 30, 30, 30, 29, 30, 30, 30],
    2085: [31, 32, 31, 32, 30, 31, 30, 30, 29, 30, 30, 30],
    2086: [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 30, 30],
    2087: [31, 31, 32, 31, 31, 31, 30, 29, 30, 30, 30, 30],
    2088: [30, 31, 32, 32, 30, 31, 30, 30, 29, 30, 30, 30],
    2089: [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 30, 30],
    2090: [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 30, 30],
    2091: [31, 31, 32, 31, 31, 31, 30, 30, 29, 30, 30, 30],
    2092: [30, 31, 32, 32, 31, 30, 30, 30, 29, 30, 30, 30],
    2093: [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 30, 30],
    2094: [31, 31, 32, 31, 31, 30, 30, 30, 29, 30, 30, 30],
    2095: [31, 31, 32, 31, 31, 31, 30, 29, 30, 30, 30, 30],
    2096: [30, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
    2097: [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 30, 30],
    2098: [31, 31, 32, 31, 31, 31, 29, 30, 29, 30, 29, 31],
    2099: [31, 31, 32, 31, 31, 31, 30, 29, 29, 30, 30, 30],
    2100: [31, 32, 31, 32, 30, 31, 30, 29, 30, 29, 30, 30],
};

const BIKRAM_SAMBAT_EPOCH_UTC = Date.UTC(1918, 3, 13);
const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

const NEPALI_DIGITS = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];

export const BIKRAM_SAMBAT_MONTH_LABELS: readonly BikramSambatMonthLabel[] = [
    { english: 'Baishakh', nepali: 'वैशाख' },
    { english: 'Jestha', nepali: 'जेठ' },
    { english: 'Ashadh', nepali: 'असार' },
    { english: 'Shrawan', nepali: 'साउन' },
    { english: 'Bhadra', nepali: 'भदौ' },
    { english: 'Ashwin', nepali: 'असोज' },
    { english: 'Kartik', nepali: 'कात्तिक' },
    { english: 'Mangsir', nepali: 'मंसिर' },
    { english: 'Poush', nepali: 'पुस' },
    { english: 'Magh', nepali: 'माघ' },
    { english: 'Falgun', nepali: 'फागुन' },
    { english: 'Chaitra', nepali: 'चैत' },
];

export const BIKRAM_SAMBAT_WEEKDAY_LABELS: readonly BikramSambatWeekdayLabel[] = [
    { english: 'Sunday', nepali: 'आइतबार', englishShort: 'Sun', nepaliShort: 'आइत' },
    { english: 'Monday', nepali: 'सोमबार', englishShort: 'Mon', nepaliShort: 'सोम' },
    { english: 'Tuesday', nepali: 'मंगलबार', englishShort: 'Tue', nepaliShort: 'मंगल' },
    { english: 'Wednesday', nepali: 'बुधबार', englishShort: 'Wed', nepaliShort: 'बुध' },
    { english: 'Thursday', nepali: 'बिहीबार', englishShort: 'Thu', nepaliShort: 'बिही' },
    { english: 'Friday', nepali: 'शुक्रबार', englishShort: 'Fri', nepaliShort: 'शुक्र' },
    { english: 'Saturday', nepali: 'शनिबार', englishShort: 'Sat', nepaliShort: 'शनि' },
];

export const isNepaliLanguage = (language?: string): boolean => {
    if (!language) {
        return false;
    }
    return language === 'ne' || language === 'np' || language.startsWith('ne-');
};

export const toNepaliDigits = (value: number | string): string => {
    return String(value).replace(/\d/g, (digit) => NEPALI_DIGITS[Number(digit)]);
};

export const fromNepaliDigits = (value: string): string => {
    return value.replace(/[०-९]/g, (digit) => String(NEPALI_DIGITS.indexOf(digit)));
};

export const getBikramSambatMonthLabel = (month: number, language?: string): string => {
    const label = BIKRAM_SAMBAT_MONTH_LABELS[month - 1];
    if (!label) {
        throw new RangeError(`Invalid Bikram Sambat month: ${month}`);
    }
    return isNepaliLanguage(language) ? label.nepali : label.english;
};

export const getBikramSambatWeekdayLabel = (
    weekdayIndex: number,
    language?: string,
    short = false,
): string => {
    const label = BIKRAM_SAMBAT_WEEKDAY_LABELS[weekdayIndex];
    if (!label) {
        throw new RangeError(`Invalid weekday index: ${weekdayIndex}`);
    }
    if (isNepaliLanguage(language)) {
        return short ? label.nepaliShort : label.nepali;
    }
    return short ? label.englishShort : label.english;
};

export const getDaysInBikramSambatMonth = (year: number, month: number): number => {
    const monthLengths = BIKRAM_SAMBAT_MONTH_LENGTHS[year];
    if (!monthLengths || month < 1 || month > 12) {
        throw new RangeError(`Unsupported Bikram Sambat date: year ${year}, month ${month}`);
    }
    return monthLengths[month - 1];
};

export const getDaysInBikramSambatYear = (year: number): number => {
    const monthLengths = BIKRAM_SAMBAT_MONTH_LENGTHS[year];
    if (!monthLengths) {
        throw new RangeError(`Unsupported Bikram Sambat year: ${year}`);
    }
    return monthLengths.reduce((total, days) => total + days, 0);
};

export const isValidBikramSambatDate = (
    date?: Partial<BikramSambatDate> | null,
): date is BikramSambatDate => {
    if (!date) {
        return false;
    }
    const { year, month, day } = date;
    if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
        return false;
    }
    if (
        year! < MINIMUM_BIKRAM_SAMBAT_YEAR ||
        year! > MAXIMUM_BIKRAM_SAMBAT_YEAR ||
        month! < 1 ||
        month! > 12
    ) {
        return false;
    }
    return day! >= 1 && day! <= getDaysInBikramSambatMonth(year!, month!);
};

const getDayOffsetFromEpoch = (date: BikramSambatDate): number => {
    let dayOffset = 0;
    for (let year = MINIMUM_BIKRAM_SAMBAT_YEAR; year < date.year; year++) {
        dayOffset += getDaysInBikramSambatYear(year);
    }
    for (let month = 1; month < date.month; month++) {
        dayOffset += getDaysInBikramSambatMonth(date.year, month);
    }
    return dayOffset + date.day - 1;
};

export const convertBikramSambatToGregorian = (date: BikramSambatDate): Date => {
    if (!isValidBikramSambatDate(date)) {
        throw new RangeError(`Invalid Bikram Sambat date: ${JSON.stringify(date)}`);
    }
    const utcDate = new Date(
        BIKRAM_SAMBAT_EPOCH_UTC + getDayOffsetFromEpoch(date) * MILLISECONDS_PER_DAY,
    );
    return new Date(utcDate.getUTCFullYear(), utcDate.getUTCMonth(), utcDate.getUTCDate());
};

export const convertGregorianToBikramSambat = (date: Date): BikramSambatDate => {
    const dateUtc = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
    let remainingDays = Math.round((dateUtc - BIKRAM_SAMBAT_EPOCH_UTC) / MILLISECONDS_PER_DAY);
    if (remainingDays < 0) {
        throw new RangeError(`Date is before the supported Bikram Sambat range: ${date}`);
    }
    let year = MINIMUM_BIKRAM_SAMBAT_YEAR;
    while (year <= MAXIMUM_BIKRAM_SAMBAT_YEAR && remainingDays >= getDaysInBikramSambatYear(year)) {
        remainingDays -= getDaysInBikramSambatYear(year);
        year++;
    }
    if (year > MAXIMUM_BIKRAM_SAMBAT_YEAR) {
        throw new RangeError(`Date is after the supported Bikram Sambat range: ${date}`);
    }
    let month = 1;
    while (remainingDays >= getDaysInBikramSambatMonth(year, month)) {
        remainingDays -= getDaysInBikramSambatMonth(year, month);
        month++;
    }
    return { year, month, day: remainingDays + 1 };
};

export const getTodayBikramSambatDate = (): BikramSambatDate => {
    return convertGregorianToBikramSambat(new Date());
};

export const getBikramSambatWeekdayIndex = (date: BikramSambatDate): number => {
    return convertBikramSambatToGregorian(date).getDay();
};

export const compareBikramSambatDates = (
    first: BikramSambatDate,
    second: BikramSambatDate,
): number => {
    return first.year - second.year || first.month - second.month || first.day - second.day;
};

export const formatBikramSambatDate = (
    date: BikramSambatDate,
    format = 'YYYY-MM-DD',
    options: FormatBikramSambatDateOptions = {},
): string => {
    const { language, useNepaliDigits = false } = options;
    if (!isValidBikramSambatDate(date)) {
        throw new RangeError(`Invalid Bikram Sambat date: ${JSON.stringify(date)}`);
    }
    const twoDigits = (value: number) => String(value).padStart(2, '0');
    const formatted = format.replace(/YYYY|MMMM|MM|M|DD|D/g, (token) => {
        switch (token) {
            case 'YYYY':
                return String(date.year);
            case 'MMMM':
                return getBikramSambatMonthLabel(date.month, language);
            case 'MM':
                return twoDigits(date.month);
            case 'M':
                return String(date.month);
            case 'DD':
                return twoDigits(date.day);
            case 'D':
                return String(date.day);
            default:
                return token;
        }
    });
    return useNepaliDigits ? toNepaliDigits(formatted) : formatted;
};

export const parseBikramSambatDate = (value?: string | null): BikramSambatDate | null => {
    if (!value) {
        return null;
    }
    const normalized = fromNepaliDigits(value.trim());
    const match = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(normalized);
    if (!match) {
        return null;
    }
    const date = { year: Number(match[1]), month: Number(match[2]), day: Number(match[3]) };
    return isValidBikramSambatDate(date) ? date : null;
};
