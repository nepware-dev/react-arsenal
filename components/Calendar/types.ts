import type { ReactNode } from 'react';

export type CalendarSystem = 'gregorian' | 'nepali';

/**
 * Day-of-week index, `0` for Sunday through `6` for Saturday.
 */
export type CalendarWeekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface CalendarDate {
    year: number;
    month: number;
    day: number;
}

export interface CalendarViewDate {
    year?: number;
    month?: number;
}

export interface CalendarDayInfo {
    isSelected: boolean;
    /**
     * Reflects only the date-bounds check (`minDate`/`maxDate`). Outside-month
     * cells are always rendered non-interactive regardless of this value; use
     * `isOutsideMonth` to identify those cells.
     */
    isDisabled: boolean;
    isToday: boolean;
    /**
     * `true` when the cell belongs to an adjacent month, which only happens
     * while `showOutsideDays` is enabled. Always `false` otherwise.
     */
    isOutsideMonth: boolean;
}

export interface CalendarDateSystem {
    getToday: () => CalendarDate;
    isValid: (date?: Partial<CalendarDate> | null) => boolean;
    compare: (first: CalendarDate, second: CalendarDate) => number;
    getDaysInMonth: (year: number, month: number) => number;
    firstWeekdayIndex: (year: number, month: number) => number;
    minimumYear: number;
    maximumYear: number;
    monthLabel: (month: number, language?: string) => string;
    weekdayLabel: (weekdayIndex: number, language?: string) => string;
    numberLabel: (value: number, language?: string) => string;
}

/**
 * Class names for the calendar's internal parts, so a consumer can restyle any
 * piece without forking the component. Every entry is optional and additive:
 * an omitted key contributes no class at all.
 */
export interface CalendarClassNames {
    /** Outermost calendar element. */
    root?: string;
    /** Header row holding the navigation buttons and the month/year title. */
    header?: string;
    /** Every month and year stepper button. */
    navigationButton?: string;
    /** Only the previous-year stepper, applied after `navigationButton`. */
    previousYearButton?: string;
    /** Only the previous-month stepper, applied after `navigationButton`. */
    previousMonthButton?: string;
    /** Only the next-month stepper, applied after `navigationButton`. */
    nextMonthButton?: string;
    /** Only the next-year stepper, applied after `navigationButton`. */
    nextYearButton?: string;
    /** Wrapper around the month and year labels or dropdowns. */
    title?: string;
    /** Month label, when `enableMonthDropdown` is off. */
    titleMonth?: string;
    /** Year label, when `enableYearDropdown` is off. */
    titleYear?: string;
    /** Month and year dropdowns, when they are enabled. */
    headerSelect?: string;
    /** Weekday label row. */
    weekdays?: string;
    /** Each weekday label cell. */
    weekday?: string;
    /** The day grid. */
    days?: string;
    /** Every day cell of the visible month. */
    day?: string;
    /** The day cell matching `value`. */
    selectedDay?: string;
    /** The day cell matching today's date. */
    today?: string;
    /** Day cells that are out of bounds or rejected by `isDateDisabled`. */
    disabledDay?: string;
    /** Adjacent-month day cells rendered by `showOutsideDays`. */
    outsideDay?: string;
    /** Placeholder cells that pad the first week when `showOutsideDays` is off. */
    emptyDay?: string;
}

export interface CalendarProps {
    system: CalendarSystem;
    className?: string;
    classNames?: CalendarClassNames;
    value?: CalendarDate | null;
    onChange?: (date: CalendarDate) => void;
    minimumDate?: CalendarDate;
    maximumDate?: CalendarDate;
    viewDate?: CalendarViewDate;
    language?: string;
    enableYearDropdown?: boolean;
    enableMonthDropdown?: boolean;
    /**
     * Day of the week the grid starts on, `0` for Sunday through `6` for Saturday.
     * Reorders the weekday labels and the leading offset together.
     *
     * @default 0
     */
    weekStartsOn?: CalendarWeekday;
    /**
     * Render the leading and trailing days of the adjacent months instead of blank
     * padding cells, and pad the final week so every row is complete. Outside days
     * are de-emphasized and non-interactive; they are hidden from assistive
     * technology and cannot be selected.
     *
     * @default true
     */
    showOutsideDays?: boolean;
    /**
     * Hide the year stepper buttons on both sides of the header, leaving only the
     * month steppers. Year navigation stays reachable through `enableYearDropdown`.
     *
     * @default false
     */
    hideYearNavigation?: boolean;
    isDateDisabled?: (date: CalendarDate) => boolean;
    renderDay?: (date: CalendarDate, info: CalendarDayInfo) => ReactNode;
}
