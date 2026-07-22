import type { ReactNode } from 'react';

import type {
    CalendarClassNames,
    CalendarDate,
    CalendarDayInfo,
    CalendarProps,
} from '../../Calendar';

export type DatePickerMode = 'gregorian' | 'nepali' | 'toggle';

export type DatePickerInputChangeCallback = (payload: {
    name?: string;
    value: string | null;
}) => void;

export interface DatePickerInputClassNames {
    container?: string;
    control?: string;
    input?: string;
    systemToggle?: string;
    systemToggleOption?: string;
    activeSystemToggleOption?: string;
    indicator?: string;
    clear?: string;
    calendarToggle?: string;
    popup?: string;
    error?: string;
    warning?: string;
    calendar?: CalendarClassNames;
}

export interface DatePickerInputProps {
    name?: string;
    className?: string;
    classNames?: DatePickerInputClassNames;
    containerClassName?: string;
    controlClassName?: string;
    value?: string | null;
    defaultValue?: string | null;
    placeholder?: string;
    disabled?: boolean;
    required?: boolean;
    showRequired?: boolean;
    clearable?: boolean;
    errorMessage?: string | string[];
    minimumDate?: string;
    maximumDate?: string;
    mode?: DatePickerMode;
    language?: string;
    isDateDisabled?: (date: CalendarDate) => boolean;
    renderDay?: (date: CalendarDate, info: CalendarDayInfo) => ReactNode;
    calendarProps?: Omit<CalendarProps, 'value' | 'onChange' | 'system'>;
    onChange?: DatePickerInputChangeCallback;
}
