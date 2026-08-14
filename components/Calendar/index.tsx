import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

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
    CalendarWeekday,
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
    convertGregorianToBikramSambat,
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
    jsDateToGregorian,
    toNepaliDigits,
} from "../../utils/date";
import List, {
    KeyExtractor,
    ListRenderItem,
    ListRenderItemProps,
} from "../List";

const DAYS_IN_WEEK = 7;

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

// BS's real convertible span is narrower than Gregorian's declared 1900-2100 range.
const BIKRAM_SAMBAT_SUPPORTED_GREGORIAN_RANGE = {
    minimum: convertBikramSambatToGregorian({
        year: MINIMUM_BIKRAM_SAMBAT_YEAR,
        month: 1,
        day: 1,
    }),
    maximum: convertBikramSambatToGregorian({
        year: MAXIMUM_BIKRAM_SAMBAT_YEAR,
        month: 12,
        day: getDaysInBikramSambatMonth(MAXIMUM_BIKRAM_SAMBAT_YEAR, 12),
    }),
};

const convertViewDate = (
    fromSystem: CalendarSystem,
    toSystem: CalendarSystem,
    date: CalendarDate,
): CalendarDate => {
    if (fromSystem === toSystem) {
        return date;
    }
    if (fromSystem === "nepali") {
        return jsDateToGregorian(convertBikramSambatToGregorian(date));
    }
    const asJsDate = gregorianToJsDate(date);
    if (asJsDate < BIKRAM_SAMBAT_SUPPORTED_GREGORIAN_RANGE.minimum) {
        return { year: MINIMUM_BIKRAM_SAMBAT_YEAR, month: 1, day: 1 };
    }
    if (asJsDate > BIKRAM_SAMBAT_SUPPORTED_GREGORIAN_RANGE.maximum) {
        return { year: MAXIMUM_BIKRAM_SAMBAT_YEAR, month: 12, day: 1 };
    }
    return convertGregorianToBikramSambat(asJsDate);
};

// Clamps a year/month into [minimumBound, maximumBound], carrying month over/underflow into the year first.
const clampMonthToBounds = (
    year: number,
    month: number,
    minimumBound: CalendarDate,
    maximumBound: CalendarDate,
): { year: number; month: number } => {
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
        return { year: minimumBound.year, month: minimumBound.month };
    }
    if (
        year > maximumBound.year ||
        (year === maximumBound.year && month > maximumBound.month)
    ) {
        return { year: maximumBound.year, month: maximumBound.month };
    }
    return { year, month };
};

interface VisibleWindow {
    system: CalendarSystem;
    year: number;
    month: number;
}

interface NavigationOption {
    value: number;
    label: string;
}

const navigationOptionKeyExtractor = (option: NavigationOption) => option.value;
const navigationOptionValueExtractor = (option: NavigationOption) =>
    option.label;

type CalendarCell =
    | { type: "empty" }
    | { type: "day"; day: number }
    | { type: "outside"; year: number; month: number; day: number };

const dayKeyExtractor: KeyExtractor<CalendarCell> = (item, index) => {
    if (item.type === "empty") {
        return `empty-${index}`;
    }
    if (item.type === "outside") {
        return `outside-${item.year}-${item.month}-${item.day}`;
    }
    return String(item.day);
};

interface AdjacentMonth {
    year: number;
    month: number;
    daysInMonth: number;
}

const getAdjacentMonth = (
    dateSystem: CalendarDateSystem,
    year: number,
    month: number,
    offset: -1 | 1,
): AdjacentMonth | null => {
    let targetYear = year;
    let targetMonth = month + offset;
    if (targetMonth < 1) {
        targetYear -= 1;
        targetMonth = 12;
    } else if (targetMonth > 12) {
        targetYear += 1;
        targetMonth = 1;
    }
    if (
        targetYear < dateSystem.minimumYear ||
        targetYear > dateSystem.maximumYear
    ) {
        return null;
    }
    return {
        year: targetYear,
        month: targetMonth,
        daysInMonth: dateSystem.getDaysInMonth(targetYear, targetMonth),
    };
};

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
        weekStartsOn = 0,
        showOutsideDays = true,
        hideYearNavigation = false,
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

    const [visibleWindow, setVisibleWindow] = useState<VisibleWindow>(() => ({
        system,
        year: initialDate.year,
        month: initialDate.month,
    }));

    const windowAnchorRef = useRef<{ system: CalendarSystem; date: CalendarDate }>({
        system,
        date: initialDate,
    });

    let visibleYear = visibleWindow.year;
    let visibleMonth = visibleWindow.month;
    if (visibleWindow.system !== system) {
        const anchor = windowAnchorRef.current;
        const target = dateSystem.isValid(value)
            ? (value as CalendarDate)
            : convertViewDate(anchor.system, system, anchor.date);
        const clamped = clampMonthToBounds(
            target.year,
            target.month,
            minimumBound,
            maximumBound,
        );
        visibleYear = clamped.year;
        visibleMonth = clamped.month;
        setVisibleWindow({ system, year: visibleYear, month: visibleMonth });
    }

    useEffect(() => {
        if (dateSystem.isValid(value)) {
            const selected = value as CalendarDate;
            windowAnchorRef.current = { system, date: selected };
            setVisibleWindow({
                system,
                year: selected.year,
                month: selected.month,
            });
        }
    }, [dateSystem, system, value]);

    const navigateToMonth = useCallback(
        (year: number, month: number) => {
            const clamped = clampMonthToBounds(year, month, minimumBound, maximumBound);
            windowAnchorRef.current = {
                system,
                date: { year: clamped.year, month: clamped.month, day: 1 },
            };
            setVisibleWindow({
                system,
                year: clamped.year,
                month: clamped.month,
            });
        },
        [system, minimumBound, maximumBound],
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

    const weekdayIndices = useMemo<CalendarWeekday[]>(
        () =>
            Array.from(
                { length: DAYS_IN_WEEK },
                (_, index) =>
                    ((weekStartsOn + index) % DAYS_IN_WEEK) as CalendarWeekday,
            ),
        [weekStartsOn],
    );

    const dayCells = useMemo<CalendarCell[]>(() => {
        const firstWeekdayIndex = dateSystem.firstWeekdayIndex(
            visibleYear,
            visibleMonth,
        );
        const daysInMonth = dateSystem.getDaysInMonth(
            visibleYear,
            visibleMonth,
        );
        const leadingCount =
            (firstWeekdayIndex - weekStartsOn + DAYS_IN_WEEK) % DAYS_IN_WEEK;
        const monthCells: CalendarCell[] = Array.from(
            { length: daysInMonth },
            (_, index) => ({ type: "day", day: index + 1 }),
        );

        if (!showOutsideDays) {
            const emptyCells: CalendarCell[] = Array.from(
                { length: leadingCount },
                () => ({ type: "empty" }),
            );
            return [...emptyCells, ...monthCells];
        }

        const previousMonth = getAdjacentMonth(
            dateSystem,
            visibleYear,
            visibleMonth,
            -1,
        );
        const firstLeadingDay = previousMonth
            ? previousMonth.daysInMonth - leadingCount + 1
            : 0;
        const leadingCells: CalendarCell[] = previousMonth
            ? Array.from({ length: leadingCount }, (_, index) => ({
                  type: "outside" as const,
                  year: previousMonth.year,
                  month: previousMonth.month,
                  day: firstLeadingDay + index,
              }))
            : Array.from({ length: leadingCount }, () => ({
                  type: "empty" as const,
              }));

        const nextMonth = getAdjacentMonth(
            dateSystem,
            visibleYear,
            visibleMonth,
            1,
        );
        const trailingCount =
            (DAYS_IN_WEEK - ((leadingCount + daysInMonth) % DAYS_IN_WEEK)) %
            DAYS_IN_WEEK;
        const trailingCells: CalendarCell[] = nextMonth
            ? Array.from({ length: trailingCount }, (_, index) => ({
                  type: "outside" as const,
                  year: nextMonth.year,
                  month: nextMonth.month,
                  day: index + 1,
              }))
            : Array.from({ length: trailingCount }, () => ({
                  type: "empty" as const,
              }));

        return [...leadingCells, ...monthCells, ...trailingCells];
    }, [dateSystem, visibleYear, visibleMonth, weekStartsOn, showOutsideDays]);

    const isDayDisabled = useCallback(
        (date: CalendarDate) => {
            if (
                dateSystem.compare(date, minimumBound) < 0 ||
                dateSystem.compare(date, maximumBound) > 0
            ) {
                return true;
            }
            return isDateDisabled ? isDateDisabled(date) : false;
        },
        [dateSystem, minimumBound, maximumBound, isDateDisabled],
    );

    const handleDayClick = useCallback(
        (day: number) => {
            const date = { year: visibleYear, month: visibleMonth, day };
            if (isDayDisabled(date)) {
                return;
            }
            onChange?.(date);
        },
        [onChange, visibleYear, visibleMonth, isDayDisabled],
    );

    const handleOutsideDayClick = useCallback((item: CalendarDate) => {
        if (isDayDisabled(item)) {
            return;
        }
        onChange?.(item);
    }, [isDayDisabled, onChange]);

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
        const lowerMonth =
            visibleYear === minimumBound.year ? minimumBound.month : 1;
        const upperMonth =
            visibleYear === maximumBound.year ? maximumBound.month : 12;
        return Array.from(
            { length: upperMonth - lowerMonth + 1 },
            (_, index) => ({
                value: lowerMonth + index,
                label: dateSystem.monthLabel(lowerMonth + index, language),
            }),
        );
    }, [
        visibleYear,
        minimumBound.year,
        minimumBound.month,
        maximumBound.year,
        maximumBound.month,
        dateSystem,
        language,
    ]);

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

    const renderDayCell: ListRenderItem<CalendarCell> = useCallback(
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
                    onOutsideDayClick={handleOutsideDayClick}
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
            handleOutsideDayClick,
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
                {!hideYearNavigation && (
                    <button
                        type="button"
                        className={cs(
                            styles.navigationButton,
                            "calendar-nav-button",
                            classNames?.navigationButton,
                            classNames?.previousYearButton,
                        )}
                        aria-label="Previous year"
                        disabled={!canShowPreviousYear}
                        onClick={handleGoToPreviousYear}
                    >
                        <FiChevronsLeft />
                    </button>
                )}
                <button
                    type="button"
                    className={cs(
                        styles.navigationButton,
                        "calendar-nav-button",
                        classNames?.navigationButton,
                        classNames?.previousMonthButton,
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
                        classNames?.nextMonthButton,
                    )}
                    aria-label="Next month"
                    disabled={!canShowNextMonth}
                    onClick={handleGoToNextMonth}
                >
                    <FiChevronRight />
                </button>
                {!hideYearNavigation && (
                    <button
                        type="button"
                        className={cs(
                            styles.navigationButton,
                            "calendar-nav-button",
                            classNames?.navigationButton,
                            classNames?.nextYearButton,
                        )}
                        aria-label="Next year"
                        disabled={!canShowNextYear}
                        onClick={handleGoToNextYear}
                    >
                        <FiChevronsRight />
                    </button>
                )}
            </div>
            <div
                className={cs(
                    styles.weekdays,
                    "calendar-weekdays",
                    classNames?.weekdays,
                )}
            >
                {weekdayIndices.map((weekdayIndex) => (
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
    props: ListRenderItemProps<CalendarCell> & {
        classNames: CalendarProps["classNames"];
        visibleYear: number;
        visibleMonth: number;
        dateSystem: CalendarDateSystem;
        today: CalendarDate;
        value: CalendarProps["value"];
        isDayDisabled: (date: CalendarDate) => boolean;
        onDayClick: (day: number) => void;
        onOutsideDayClick: (item: CalendarDate) => void;
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
        onOutsideDayClick,
        formatNumberLabel,
        renderDay,
    } = props;

    const handleDayClick = useCallback(() => {
        if (item.type === "day") {
            onDayClick(item.day);
        } else if (item.type === "outside") {
            onOutsideDayClick({ day: item.day, month: item.month, year: item.year });
        }
    }, [item, onDayClick, onOutsideDayClick]);

    if (item.type === "empty") {
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

    const date =
        item.type === "outside"
            ? { year: item.year, month: item.month, day: item.day }
            : { year: visibleYear, month: visibleMonth, day: item.day };
    const isSelected =
        dateSystem.isValid(value) &&
        dateSystem.compare(date, value as CalendarDate) === 0;
    const isToday = dateSystem.compare(date, today) === 0;
    const disabled = isDayDisabled(date);
    const dayInfo: CalendarDayInfo = {
        isSelected,
        isDisabled: disabled,
        isToday,
        isOutsideMonth: item.type === "outside",
    };
    const label = renderDay
        ? renderDay(date, dayInfo)
        : formatNumberLabel(item.day);

    if (item.type === "outside") {
        return (
            <button
                type="button"
                className={cs(
                    styles.outsideDay,
                    "calendar-outside-day",
                    classNames?.outsideDay,
                )}
                disabled={disabled}
                aria-hidden={disabled ? 'true' : undefined}
                tabIndex={disabled ? -1 : undefined}
                onClick={handleDayClick}
            >
                {label}
            </button>
        );
    }

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
                disabled && classNames?.disabledDay,
            )}
            disabled={disabled}
            onClick={handleDayClick}
        >
            {label}
        </button>
    );
}

export default Calendar;

export * from "./types";
