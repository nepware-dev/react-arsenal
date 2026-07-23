import React, { useCallback, useEffect, useMemo, useState } from "react";

import {
    FiChevronLeft,
    FiChevronRight,
    FiChevronsLeft,
    FiChevronsRight,
} from "react-icons/fi";

import styles from "./styles.module.scss";
import type {
    CalendarDate,
    CalendarDateSystem,
    CalendarDayInfo,
    CalendarProps,
    CalendarSystem,
} from "./types";
import SelectInput from "../Form/SelectInput";
import { useI18nContext } from "../I18n";
import cs from "../../cs";
import {
    GREGORIAN_WEEKDAY_SHORT_LABELS,
    MAXIMUM_BIKRAM_SAMBAT_YEAR,
    MINIMUM_BIKRAM_SAMBAT_YEAR,
    compareBikramSambatDates,
    compareGregorianDates,
    convertBikramSambatToGregorian,
    getBikramSambatMonthLabel,
    getBikramSambatWeekdayLabel,
    getDaysInBikramSambatMonth,
    getDaysInGregorianMonth,
    getGregorianMonthLabel,
    getTodayBikramSambatDate,
    getTodayGregorianDate,
    gregorianToJsDate,
    isNepaliLanguage,
    isValidBikramSambatDate,
    isValidGregorianDate,
    toNepaliDigits,
} from "../../utils/date";
import List, {
    KeyExtractor,
    ListRenderItem,
    ListRenderItemProps,
} from "../List";

const WEEKDAY_INDICES = [0, 1, 2, 3, 4, 5, 6];

const MINIMUM_GREGORIAN_YEAR = 1900;
const MAXIMUM_GREGORIAN_YEAR = 2100;

const gregorianDateSystem: CalendarDateSystem = {
    getToday: getTodayGregorianDate,
    isValid: isValidGregorianDate,
    compare: compareGregorianDates,
    getDaysInMonth: getDaysInGregorianMonth,
    firstWeekdayIndex: (year, month) =>
        gregorianToJsDate({ year, month, day: 1 }).getDay(),
    minimumYear: MINIMUM_GREGORIAN_YEAR,
    maximumYear: MAXIMUM_GREGORIAN_YEAR,
    monthLabel: (month) => getGregorianMonthLabel(month),
    weekdayLabel: (weekdayIndex) =>
        GREGORIAN_WEEKDAY_SHORT_LABELS[weekdayIndex],
    numberLabel: (value) => String(value),
};

const nepaliDateSystem: CalendarDateSystem = {
    getToday: getTodayBikramSambatDate,
    isValid: isValidBikramSambatDate,
    compare: compareBikramSambatDates,
    getDaysInMonth: getDaysInBikramSambatMonth,
    firstWeekdayIndex: (year, month) =>
        convertBikramSambatToGregorian({ year, month, day: 1 }).getDay(),
    minimumYear: MINIMUM_BIKRAM_SAMBAT_YEAR,
    maximumYear: MAXIMUM_BIKRAM_SAMBAT_YEAR,
    monthLabel: (month, language) => getBikramSambatMonthLabel(month, language),
    weekdayLabel: (weekdayIndex, language) =>
        getBikramSambatWeekdayLabel(weekdayIndex, language, true),
    numberLabel: (value, language) =>
        isNepaliLanguage(language) ? toNepaliDigits(value) : String(value),
};

const DATE_SYSTEMS: Record<CalendarSystem, CalendarDateSystem> = {
    gregorian: gregorianDateSystem,
    nepali: nepaliDateSystem,
};

const VARIANT_CLASS_NAMES: Record<CalendarSystem, string> = {
    gregorian: "gregorian-calendar",
    nepali: "nepali-calendar",
};

interface NavigationOption {
    value: number;
    label: string;
}

const navigationOptionKeyExtractor = (option: NavigationOption) => option.value;
const navigationOptionValueExtractor = (option: NavigationOption) =>
    option.label;

const dayKeyExtractor: KeyExtractor<number | null> = (item, index) =>
    item === null ? `empty-${index}` : String(item);

const Calendar: React.FC<CalendarProps> = (props) => {
    const {
        system,
        className,
        classNames,
        value,
        onChange,
        minimumDate,
        maximumDate,
        viewDate,
        language: languageProp,
        enableYearDropdown = false,
        enableMonthDropdown = false,
        isDateDisabled,
        renderDay,
    } = props;

    const dateSystem = DATE_SYSTEMS[system];
    const variantClassName = VARIANT_CLASS_NAMES[system];

    const { selectedLanguage } = useI18nContext();
    const language = languageProp ?? selectedLanguage;

    const today = useMemo(() => dateSystem.getToday(), [dateSystem]);

    const minimumBound = useMemo<CalendarDate>(() => {
        if (dateSystem.isValid(minimumDate)) {
            return minimumDate as CalendarDate;
        }
        return { year: dateSystem.minimumYear, month: 1, day: 1 };
    }, [dateSystem, minimumDate]);

    const maximumBound = useMemo<CalendarDate>(() => {
        if (dateSystem.isValid(maximumDate)) {
            return maximumDate as CalendarDate;
        }
        return {
            year: dateSystem.maximumYear,
            month: 12,
            day: dateSystem.getDaysInMonth(dateSystem.maximumYear, 12),
        };
    }, [dateSystem, maximumDate]);

    const initialDate = useMemo<CalendarDate>(() => {
        if (dateSystem.isValid(value)) {
            return value as CalendarDate;
        }
        if (dateSystem.compare(today, minimumBound) < 0) {
            return minimumBound;
        }
        if (dateSystem.compare(today, maximumBound) > 0) {
            return maximumBound;
        }
        return today;
    }, [dateSystem, value, today, minimumBound, maximumBound]);

    const [visibleYear, setVisibleYear] = useState(initialDate.year);
    const [visibleMonth, setVisibleMonth] = useState(initialDate.month);

    useEffect(() => {
        if (dateSystem.isValid(value)) {
            setVisibleYear((value as CalendarDate).year);
            setVisibleMonth((value as CalendarDate).month);
        }
    }, [dateSystem, value]);

    const navigateToMonth = useCallback(
        (year: number, month: number) => {
            if (month < 1) {
                year -= 1;
                month = 12;
            } else if (month > 12) {
                year += 1;
                month = 1;
            }
            if (
                year < minimumBound.year ||
                (year === minimumBound.year && month < minimumBound.month)
            ) {
                year = minimumBound.year;
                month = minimumBound.month;
            } else if (
                year > maximumBound.year ||
                (year === maximumBound.year && month > maximumBound.month)
            ) {
                year = maximumBound.year;
                month = maximumBound.month;
            }
            setVisibleYear(year);
            setVisibleMonth(month);
        },
        [minimumBound, maximumBound],
    );

    useEffect(() => {
        if (!viewDate) {
            return;
        }
        const targetYear =
            typeof viewDate.year === "number" ? viewDate.year : visibleYear;
        const targetMonth =
            typeof viewDate.month === "number" ? viewDate.month : visibleMonth;
        navigateToMonth(targetYear, targetMonth);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [viewDate?.year, viewDate?.month, navigateToMonth]);

    const canShowPreviousMonth =
        visibleYear > minimumBound.year ||
        (visibleYear === minimumBound.year &&
            visibleMonth > minimumBound.month);
    const canShowNextMonth =
        visibleYear < maximumBound.year ||
        (visibleYear === maximumBound.year &&
            visibleMonth < maximumBound.month);
    const canShowPreviousYear = visibleYear > minimumBound.year;
    const canShowNextYear = visibleYear < maximumBound.year;

    const dayCells = useMemo(() => {
        const firstWeekdayIndex = dateSystem.firstWeekdayIndex(
            visibleYear,
            visibleMonth,
        );
        const daysInMonth = dateSystem.getDaysInMonth(
            visibleYear,
            visibleMonth,
        );
        const leadingCells: null[] = Array.from(
            { length: firstWeekdayIndex },
            () => null,
        );
        const dayNumbers = Array.from(
            { length: daysInMonth },
            (_, index) => index + 1,
        );
        return [...leadingCells, ...dayNumbers];
    }, [dateSystem, visibleYear, visibleMonth]);

    const isDayDisabled = useCallback(
        (day: number) => {
            const date = { year: visibleYear, month: visibleMonth, day };
            if (
                dateSystem.compare(date, minimumBound) < 0 ||
                dateSystem.compare(date, maximumBound) > 0
            ) {
                return true;
            }
            return isDateDisabled ? isDateDisabled(date) : false;
        },
        [
            dateSystem,
            visibleYear,
            visibleMonth,
            minimumBound,
            maximumBound,
            isDateDisabled,
        ],
    );

    const handleDayClick = useCallback(
        (day: number) => {
            if (isDayDisabled(day)) {
                return;
            }
            onChange?.({ year: visibleYear, month: visibleMonth, day });
        },
        [onChange, visibleYear, visibleMonth, isDayDisabled],
    );

    const formatNumberLabel = useCallback(
        (numberValue: number) => dateSystem.numberLabel(numberValue, language),
        [dateSystem, language],
    );

    const yearOptions = useMemo<NavigationOption[]>(() => {
        const lowerYear = minimumBound.year;
        const upperYear = maximumBound.year;
        return Array.from(
            { length: upperYear - lowerYear + 1 },
            (_, index) => ({
                value: lowerYear + index,
                label: formatNumberLabel(lowerYear + index),
            }),
        );
    }, [minimumBound.year, maximumBound.year, formatNumberLabel]);

    const monthOptions = useMemo<NavigationOption[]>(() => {
        return Array.from({ length: 12 }, (_, index) => ({
            value: index + 1,
            label: dateSystem.monthLabel(index + 1, language),
        }));
    }, [dateSystem, language]);

    const handleYearSelect = useCallback(
        ({ option }: { option: NavigationOption | null }) => {
            if (option) {
                navigateToMonth(option.value, visibleMonth);
            }
        },
        [navigateToMonth, visibleMonth],
    );

    const handleMonthSelect = useCallback(
        ({ option }: { option: NavigationOption | null }) => {
            if (option) {
                navigateToMonth(visibleYear, option.value);
            }
        },
        [navigateToMonth, visibleYear],
    );

    const selectedYearOption =
        yearOptions.find((option) => option.value === visibleYear) ?? null;
    const selectedMonthOption =
        monthOptions.find((option) => option.value === visibleMonth) ?? null;

    const handleGoToPreviousYear = useCallback(
        () => navigateToMonth(visibleYear - 1, visibleMonth),
        [navigateToMonth, visibleYear, visibleMonth],
    );
    const handleGoToPreviousMonth = useCallback(
        () => navigateToMonth(visibleYear, visibleMonth - 1),
        [navigateToMonth, visibleYear, visibleMonth],
    );
    const handleGoToNextYear = useCallback(
        () => navigateToMonth(visibleYear + 1, visibleMonth),
        [navigateToMonth, visibleMonth, visibleYear],
    );
    const handleGoToNextMonth = useCallback(
        () => navigateToMonth(visibleYear, visibleMonth + 1),
        [navigateToMonth, visibleMonth, visibleYear],
    );

    const renderDayCell: ListRenderItem<number | null> = useCallback(
        (listProps) => {
            return (
                <DayCellItem
                    {...listProps}
                    classNames={classNames}
                    visibleMonth={visibleMonth}
                    visibleYear={visibleYear}
                    value={value}
                    today={today}
                    dateSystem={dateSystem}
                    isDayDisabled={isDayDisabled}
                    onDayClick={handleDayClick}
                    formatNumberLabel={formatNumberLabel}
                    renderDay={renderDay}
                />
            );
        },
        [
            classNames,
            visibleYear,
            visibleMonth,
            value,
            today,
            isDayDisabled,
            handleDayClick,
            formatNumberLabel,
            dateSystem,
            renderDay,
        ],
    );

    return (
        <div
            className={cs(
                styles.calendar,
                "calendar",
                variantClassName,
                className,
                classNames?.root,
            )}
        >
            <div
                className={cs(
                    styles.header,
                    "calendar-header",
                    classNames?.header,
                )}
            >
                <button
                    type="button"
                    className={cs(
                        styles.navigationButton,
                        "calendar-nav-button",
                        classNames?.navigationButton,
                    )}
                    aria-label="Previous year"
                    disabled={!canShowPreviousYear}
                    onClick={handleGoToPreviousYear}
                >
                    <FiChevronsLeft />
                </button>
                <button
                    type="button"
                    className={cs(
                        styles.navigationButton,
                        "calendar-nav-button",
                        classNames?.navigationButton,
                    )}
                    aria-label="Previous month"
                    disabled={!canShowPreviousMonth}
                    onClick={handleGoToPreviousMonth}
                >
                    <FiChevronLeft />
                </button>
                <div
                    className={cs(
                        styles.title,
                        "calendar-title",
                        classNames?.title,
                    )}
                >
                    {enableMonthDropdown ? (
                        <SelectInput
                            className={cs(
                                styles.headerSelect,
                                "calendar-header-select",
                                classNames?.headerSelect,
                            )}
                            options={monthOptions}
                            value={selectedMonthOption}
                            clearable={false}
                            keyExtractor={navigationOptionKeyExtractor}
                            valueExtractor={navigationOptionValueExtractor}
                            onChange={handleMonthSelect}
                        />
                    ) : (
                        <span
                            className={cs(
                                styles.titleMonth,
                                "calendar-title-month",
                                classNames?.titleMonth,
                            )}
                        >
                            {dateSystem.monthLabel(visibleMonth, language)}
                        </span>
                    )}
                    {enableYearDropdown ? (
                        <SelectInput
                            className={cs(
                                styles.headerSelect,
                                "calendar-header-select",
                                classNames?.headerSelect,
                            )}
                            searchable
                            options={yearOptions}
                            value={selectedYearOption}
                            clearable={false}
                            keyExtractor={navigationOptionKeyExtractor}
                            valueExtractor={navigationOptionValueExtractor}
                            onChange={handleYearSelect}
                        />
                    ) : (
                        <span
                            className={cs(
                                styles.titleYear,
                                "calendar-title-year",
                                classNames?.titleYear,
                            )}
                        >
                            {formatNumberLabel(visibleYear)}
                        </span>
                    )}
                </div>
                <button
                    type="button"
                    className={cs(
                        styles.navigationButton,
                        "calendar-nav-button",
                        classNames?.navigationButton,
                    )}
                    aria-label="Next month"
                    disabled={!canShowNextMonth}
                    onClick={handleGoToNextMonth}
                >
                    <FiChevronRight />
                </button>
                <button
                    type="button"
                    className={cs(
                        styles.navigationButton,
                        "calendar-nav-button",
                        classNames?.navigationButton,
                    )}
                    aria-label="Next year"
                    disabled={!canShowNextYear}
                    onClick={handleGoToNextYear}
                >
                    <FiChevronsRight />
                </button>
            </div>
            <div
                className={cs(
                    styles.weekdays,
                    "calendar-weekdays",
                    classNames?.weekdays,
                )}
            >
                {WEEKDAY_INDICES.map((weekdayIndex) => (
                    <div
                        key={weekdayIndex}
                        className={cs(
                            styles.weekday,
                            "calendar-weekday",
                            classNames?.weekday,
                        )}
                    >
                        {dateSystem.weekdayLabel(weekdayIndex, language)}
                    </div>
                ))}
            </div>
            <List
                className={cs(styles.days, "calendar-days", classNames?.days)}
                data={dayCells}
                keyExtractor={dayKeyExtractor}
                renderItem={renderDayCell}
            />
        </div>
    );
};

function DayCellItem(
    props: ListRenderItemProps<number | null> & {
        classNames: CalendarProps["classNames"];
        visibleYear: number;
        visibleMonth: number;
        dateSystem: CalendarDateSystem;
        today: CalendarDate;
        value: CalendarProps["value"];
        isDayDisabled: (day: number) => boolean;
        onDayClick: (day: number) => void;
        formatNumberLabel: (arg: number) => string;
        renderDay?: (date: CalendarDate, info: CalendarDayInfo) => React.ReactNode;
    },
) {
    const {
        item,
        classNames,
        visibleYear,
        visibleMonth,
        dateSystem,
        today,
        value,
        isDayDisabled,
        onDayClick,
        formatNumberLabel,
        renderDay,
    } = props;

    const handleDayClick = useCallback(() => {
        if (item !== null) {
            onDayClick(item);
        }
    }, [item, onDayClick]);

    if (item === null) {
        return (
            <div
                className={cs(
                    styles.emptyDay,
                    "calendar-empty-day",
                    classNames?.emptyDay,
                )}
            />
        );
    }
    const date = { year: visibleYear, month: visibleMonth, day: item };
    const isSelected =
        dateSystem.isValid(value) &&
        dateSystem.compare(date, value as CalendarDate) === 0;
    const isToday = dateSystem.compare(date, today) === 0;
    const disabled = isDayDisabled(item);
    return (
        <button
            type="button"
            className={cs(
                styles.day,
                "calendar-day",
                classNames?.day,
                {
                    [styles.selected]: isSelected,
                    [styles.today]: isToday,
                },
                isSelected && "calendar-day-selected",
                isSelected && classNames?.selectedDay,
                isToday && "calendar-day-today",
                isToday && classNames?.today,
            )}
            disabled={disabled}
            onClick={handleDayClick}
        >
            {renderDay
                ? renderDay(date, { isSelected, isDisabled: disabled, isToday })
                : formatNumberLabel(item)}
        </button>
    );
}

export default Calendar;

export * from "./types";
