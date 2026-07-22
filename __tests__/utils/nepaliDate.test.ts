import { describe, it, expect, vi, afterEach } from 'vitest';

import {
    MINIMUM_BIKRAM_SAMBAT_YEAR,
    MAXIMUM_BIKRAM_SAMBAT_YEAR,
    BIKRAM_SAMBAT_MONTH_LABELS,
    BIKRAM_SAMBAT_WEEKDAY_LABELS,
    compareBikramSambatDates,
    convertBikramSambatToGregorian,
    convertGregorianToBikramSambat,
    formatBikramSambatDate,
    getBikramSambatMonthLabel,
    getBikramSambatWeekdayIndex,
    getBikramSambatWeekdayLabel,
    getDaysInBikramSambatMonth,
    getDaysInBikramSambatYear,
    getTodayBikramSambatDate,
    isValidBikramSambatDate,
    parseBikramSambatDate,
    toNepaliDigits,
    type BikramSambatDate,
} from '../../utils/date';

const REFERENCE_DATES: [BikramSambatDate, [number, number, number]][] = [
    [{ year: 1975, month: 1, day: 1 }, [1918, 4, 13]],
    [{ year: 2000, month: 1, day: 1 }, [1943, 4, 14]],
    [{ year: 2062, month: 1, day: 1 }, [2005, 4, 14]],
    [{ year: 2076, month: 2, day: 32 }, [2019, 6, 15]],
    [{ year: 2077, month: 1, day: 1 }, [2020, 4, 13]],
    [{ year: 2080, month: 1, day: 1 }, [2023, 4, 14]],
    [{ year: 2081, month: 1, day: 1 }, [2024, 4, 13]],
    [{ year: 2081, month: 12, day: 31 }, [2025, 4, 13]],
    [{ year: 2082, month: 1, day: 1 }, [2025, 4, 14]],
    [{ year: 2083, month: 1, day: 1 }, [2026, 4, 14]],
];

describe('bikram sambat conversion', () => {
    it('converts known reference dates from BS to AD', () => {
        REFERENCE_DATES.forEach(([bikramSambatDate, [year, month, day]]) => {
            const gregorianDate = convertBikramSambatToGregorian(bikramSambatDate);
            expect(gregorianDate.getFullYear()).toBe(year);
            expect(gregorianDate.getMonth()).toBe(month - 1);
            expect(gregorianDate.getDate()).toBe(day);
        });
    });

    it('converts known reference dates from AD to BS', () => {
        REFERENCE_DATES.forEach(([bikramSambatDate, [year, month, day]]) => {
            const converted = convertGregorianToBikramSambat(new Date(year, month - 1, day));
            expect(converted).toEqual(bikramSambatDate);
        });
    });

    it('round-trips BS -> AD -> BS across the supported range', () => {
        for (let year = MINIMUM_BIKRAM_SAMBAT_YEAR; year <= MAXIMUM_BIKRAM_SAMBAT_YEAR; year += 5) {
            for (const month of [1, 6, 12]) {
                const lastDay = getDaysInBikramSambatMonth(year, month);
                for (const day of [1, 15, lastDay]) {
                    const date = { year, month, day };
                    const roundTripped = convertGregorianToBikramSambat(
                        convertBikramSambatToGregorian(date),
                    );
                    expect(roundTripped).toEqual(date);
                }
            }
        }
    });

    it('round-trips AD -> BS -> AD for consecutive days across a year boundary', () => {
        const start = Date.UTC(2024, 3, 1);
        for (let dayOffset = 0; dayOffset < 30; dayOffset++) {
            const utcDate = new Date(start + dayOffset * 24 * 60 * 60 * 1000);
            const gregorianDate = new Date(
                utcDate.getUTCFullYear(),
                utcDate.getUTCMonth(),
                utcDate.getUTCDate(),
            );
            const roundTripped = convertBikramSambatToGregorian(
                convertGregorianToBikramSambat(gregorianDate),
            );
            expect(roundTripped.getTime()).toBe(gregorianDate.getTime());
        }
    });

    it('throws for dates outside the supported range', () => {
        expect(() => convertGregorianToBikramSambat(new Date(1918, 3, 12))).toThrow(RangeError);
        expect(() => convertGregorianToBikramSambat(new Date(2044, 3, 13))).toThrow(RangeError);
        expect(() =>
            convertBikramSambatToGregorian({ year: 1974, month: 12, day: 30 }),
        ).toThrow(RangeError);
        expect(() =>
            convertBikramSambatToGregorian({ year: 2101, month: 1, day: 1 }),
        ).toThrow(RangeError);
    });
});

describe('bikram sambat data table integrity', () => {
    it('has 12 plausible month lengths for every supported year', () => {
        for (let year = MINIMUM_BIKRAM_SAMBAT_YEAR; year <= MAXIMUM_BIKRAM_SAMBAT_YEAR; year++) {
            let totalDays = 0;
            for (let month = 1; month <= 12; month++) {
                const daysInMonth = getDaysInBikramSambatMonth(year, month);
                expect(daysInMonth).toBeGreaterThanOrEqual(29);
                expect(daysInMonth).toBeLessThanOrEqual(32);
                totalDays += daysInMonth;
            }
            expect(totalDays).toBe(getDaysInBikramSambatYear(year));
            expect(totalDays).toBeGreaterThanOrEqual(364);
            expect(totalDays).toBeLessThanOrEqual(366);
        }
    });

    it('keeps year starts contiguous with the previous year length', () => {
        for (let year = MINIMUM_BIKRAM_SAMBAT_YEAR; year < MAXIMUM_BIKRAM_SAMBAT_YEAR; year++) {
            const yearStart = convertBikramSambatToGregorian({ year, month: 1, day: 1 });
            const nextYearStart = convertBikramSambatToGregorian({
                year: year + 1,
                month: 1,
                day: 1,
            });
            const dayDifference = Math.round(
                (nextYearStart.getTime() - yearStart.getTime()) / (24 * 60 * 60 * 1000),
            );
            expect(dayDifference).toBe(getDaysInBikramSambatYear(year));
        }
    });

    it('throws for unsupported years and months', () => {
        expect(() => getDaysInBikramSambatMonth(1974, 1)).toThrow(RangeError);
        expect(() => getDaysInBikramSambatMonth(2101, 1)).toThrow(RangeError);
        expect(() => getDaysInBikramSambatMonth(2081, 0)).toThrow(RangeError);
        expect(() => getDaysInBikramSambatMonth(2081, 13)).toThrow(RangeError);
    });
});

describe('isValidBikramSambatDate', () => {
    it('accepts valid dates including 32-day months', () => {
        expect(isValidBikramSambatDate({ year: 2081, month: 1, day: 31 })).toBe(true);
        expect(isValidBikramSambatDate({ year: 2076, month: 2, day: 32 })).toBe(true);
    });

    it('rejects invalid or out-of-range dates', () => {
        expect(isValidBikramSambatDate(null)).toBe(false);
        expect(isValidBikramSambatDate(undefined)).toBe(false);
        expect(isValidBikramSambatDate({ year: 2081, month: 13, day: 1 })).toBe(false);
        expect(isValidBikramSambatDate({ year: 2081, month: 0, day: 1 })).toBe(false);
        expect(isValidBikramSambatDate({ year: 2081, month: 1, day: 0 })).toBe(false);
        expect(isValidBikramSambatDate({ year: 2081, month: 1, day: 32 })).toBe(false);
        expect(isValidBikramSambatDate({ year: 1974, month: 1, day: 1 })).toBe(false);
        expect(isValidBikramSambatDate({ year: 2101, month: 1, day: 1 })).toBe(false);
        expect(isValidBikramSambatDate({ year: 2081, month: 1.5, day: 1 })).toBe(false);
    });
});

describe('getTodayBikramSambatDate', () => {
    afterEach(() => {
        vi.useRealTimers();
    });

    it('returns the current date in BS', () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date(2026, 6, 21));
        expect(getTodayBikramSambatDate()).toEqual({ year: 2083, month: 4, day: 5 });
    });
});

describe('weekdays', () => {
    it('computes the weekday index of a BS date', () => {
        expect(getBikramSambatWeekdayIndex({ year: 2081, month: 1, day: 1 })).toBe(6);
        expect(getBikramSambatWeekdayIndex({ year: 2082, month: 1, day: 1 })).toBe(1);
    });
});

describe('formatting and parsing', () => {
    it('formats with default and custom patterns', () => {
        const date = { year: 2081, month: 4, day: 5 };
        expect(formatBikramSambatDate(date)).toBe('2081-04-05');
        expect(formatBikramSambatDate(date, 'D M YYYY')).toBe('5 4 2081');
        expect(formatBikramSambatDate(date, 'MMMM D, YYYY')).toBe('Shrawan 5, 2081');
        expect(formatBikramSambatDate(date, 'MMMM D, YYYY', { language: 'ne' })).toBe(
            'साउन 5, 2081',
        );
        expect(
            formatBikramSambatDate(date, 'YYYY-MM-DD', { useNepaliDigits: true }),
        ).toBe('२०८१-०४-०५');
    });

    it('throws when formatting an invalid date', () => {
        expect(() => formatBikramSambatDate({ year: 2081, month: 13, day: 1 })).toThrow(
            RangeError,
        );
    });

    it('parses valid date strings and rejects invalid ones', () => {
        expect(parseBikramSambatDate('2081-04-05')).toEqual({ year: 2081, month: 4, day: 5 });
        expect(parseBikramSambatDate('2076-2-32')).toEqual({ year: 2076, month: 2, day: 32 });
        expect(parseBikramSambatDate('2081-13-01')).toBeNull();
        expect(parseBikramSambatDate('2081-01-32')).toBeNull();
        expect(parseBikramSambatDate('not-a-date')).toBeNull();
        expect(parseBikramSambatDate('')).toBeNull();
        expect(parseBikramSambatDate(null)).toBeNull();
    });

    it('round-trips format and parse', () => {
        const date = { year: 2083, month: 4, day: 5 };
        expect(parseBikramSambatDate(formatBikramSambatDate(date))).toEqual(date);
    });

    it('converts digits to Devanagari', () => {
        expect(toNepaliDigits(2081)).toBe('२०८१');
        expect(toNepaliDigits('01-23')).toBe('०१-२३');
    });
});

describe('localized labels', () => {
    it('provides 12 month and 7 weekday labels', () => {
        expect(BIKRAM_SAMBAT_MONTH_LABELS).toHaveLength(12);
        expect(BIKRAM_SAMBAT_WEEKDAY_LABELS).toHaveLength(7);
    });

    it('returns month labels for the requested language', () => {
        expect(getBikramSambatMonthLabel(1)).toBe('Baishakh');
        expect(getBikramSambatMonthLabel(1, 'ne')).toBe('वैशाख');
        expect(getBikramSambatMonthLabel(12, 'en')).toBe('Chaitra');
        expect(() => getBikramSambatMonthLabel(13)).toThrow(RangeError);
    });

    it('returns weekday labels for the requested language', () => {
        expect(getBikramSambatWeekdayLabel(0)).toBe('Sunday');
        expect(getBikramSambatWeekdayLabel(0, 'ne')).toBe('आइतबार');
        expect(getBikramSambatWeekdayLabel(6, 'en', true)).toBe('Sat');
        expect(getBikramSambatWeekdayLabel(6, 'ne', true)).toBe('शनि');
        expect(() => getBikramSambatWeekdayLabel(7)).toThrow(RangeError);
    });
});

describe('compareBikramSambatDates', () => {
    it('orders dates correctly', () => {
        const date = { year: 2081, month: 4, day: 5 };
        expect(compareBikramSambatDates(date, { ...date })).toBe(0);
        expect(
            compareBikramSambatDates(date, { year: 2081, month: 4, day: 6 }),
        ).toBeLessThan(0);
        expect(
            compareBikramSambatDates(date, { year: 2081, month: 3, day: 31 }),
        ).toBeGreaterThan(0);
        expect(
            compareBikramSambatDates(date, { year: 2080, month: 12, day: 30 }),
        ).toBeGreaterThan(0);
    });
});
