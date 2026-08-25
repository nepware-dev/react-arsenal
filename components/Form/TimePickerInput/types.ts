export type TimePickerInputChangeCallback = (payload: { name?: string; value: string | null }) => void;

export interface CommitTypedValueResult {
    status: 'committed' | 'reset';
    time: string;
}

export interface TimePickerInputClassNames {
    container?: string;
    control?: string;
    input?: string;
    indicator?: string;
    clear?: string;
    toggle?: string;
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
}

export interface TimePickerInputProps {
    name?: string;
    className?: string;
    classNames?: TimePickerInputClassNames;
    containerClassName?: string;
    timeInputClassName?: string;
    value?: string | null;
    defaultValue?: string | null;
    placeholder?: string;
    disabled?: boolean;
    required?: boolean;
    showRequired?: boolean;
    clearable?: boolean;
    errorMessage?: string | string[];
    /**
     * Format "HH:MM", 24-hour.
     */
    minimumTime?: string;
    maximumTime?: string;
    /**
     * Times to exclude from selection. Format "HH:MM", 24-hour.
     */
    excludeTimes?: string[];
    timeMode?: 'list' | 'native';
    align?: 'left' | 'center' | 'right';
    timeStepMinutes?: number;
    language?: string;
    /*
     * If true, the time picker will use 24-hour format.
     * If false, it will use 12-hour format with AM/PM.
     * If language is nepali, will always be true
     */
    is24HourFormat?: boolean;
    scrollToSelectedOnOpen?: boolean;
    onChange?: TimePickerInputChangeCallback;
}
