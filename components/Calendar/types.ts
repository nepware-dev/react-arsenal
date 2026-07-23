import type { ReactNode } from 'react';

export type CalendarSystem = 'gregorian' | 'nepali';

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
    isDisabled: boolean;
    isToday: boolean;
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

export interface CalendarClassNames {
    root?: string;
    header?: string;
    navigationButton?: string;
    title?: string;
    titleMonth?: string;
    titleYear?: string;
    headerSelect?: string;
    weekdays?: string;
    weekday?: string;
    days?: string;
    day?: string;
    selectedDay?: string;
    today?: string;
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
    isDateDisabled?: (date: CalendarDate) => boolean;
    renderDay?: (date: CalendarDate, info: CalendarDayInfo) => ReactNode;
}
