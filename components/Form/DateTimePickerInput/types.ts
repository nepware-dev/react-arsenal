import type { ReactNode } from 'react';

import type {
    CalendarClassNames,
    CalendarDate,
    CalendarDayInfo,
    CalendarProps,
} from '../../Calendar';

export type DateTimePickerMode = 'gregorian' | 'nepali' | 'toggle';

export type DateTimePickerInputChangeCallback = (payload: {
    name?: string;
    value: string | null;
}) => void;

export interface DateTimePickerInputClassNames {
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
    body?: string;
    timeRow?: string;
    timeLabel?: string;
    timeInput?: string;
    timeColumn?: string;
    timeColumnHeader?: string;
    timeOption?: string;
    selectedTimeOption?: string;
    error?: string;
    warning?: string;
    calendar?: CalendarClassNames;
}

export interface DateTimePickerInputProps {
    name?: string;
    className?: string;
    classNames?: DateTimePickerInputClassNames;
    containerClassName?: string;
    dateInputClassName?: string;
    timeInputClassName?: string;
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
    mode?: DateTimePickerMode;
    timeMode?: 'list' | 'native';
    timeStepMinutes?: number;
    language?: string;
    isDateDisabled?: (date: CalendarDate) => boolean;
    renderDay?: (date: CalendarDate, info: CalendarDayInfo) => ReactNode;
    calendarProps?: Omit<CalendarProps, 'value' | 'onChange' | 'system'>;
    onChange?: DateTimePickerInputChangeCallback;
}
