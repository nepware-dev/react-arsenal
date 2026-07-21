import React from 'react';

import styles from './styles.module.scss';
import type { DateTimePickerInputClassNames } from './types';
import Localize from '../../I18n/Localize';
import TimeInput from '../TimeInput';
import cs from '../../../cs';

export interface TimeOption {
    minutes: number;
    time: string;
    label: string;
}

interface DateTimeSelectorProps {
    timeMode: 'list' | 'native';
    disabled: boolean;
    timeText: string;
    timeOptions: TimeOption[];
    timeInputRef: React.RefObject<HTMLInputElement | null>;
    timeInputClassName?: string;
    effectiveMinimumTime?: string;
    effectiveMaximumTime?: string;
    isTimeOptionDisabled: (option: TimeOption) => boolean;
    onTimeChange: (target: HTMLInputElement) => void;
    onTimeOptionSelect: (option: TimeOption) => void;
    classNames?: DateTimePickerInputClassNames;
}

const DateTimeSelector: React.FC<DateTimeSelectorProps> = ({
    timeMode,
    disabled,
    timeText,
    timeOptions,
    timeInputRef,
    timeInputClassName,
    effectiveMinimumTime,
    effectiveMaximumTime,
    isTimeOptionDisabled,
    onTimeChange,
    onTimeOptionSelect,
    classNames,
}) => {
    if (timeMode === 'native') {
        return (
            <div className={cs(styles.timeRow, 'date-time-row', classNames?.timeRow)}>
                <span className={cs(styles.timeLabel, 'date-time-label', classNames?.timeLabel)}>
                    <Localize>Time</Localize>
                </span>
                <TimeInput
                    inputRef={timeInputRef}
                    className={cs(styles.timeInput, 'date-time-field', timeInputClassName, classNames?.timeInput)}
                    value={timeText}
                    disabled={disabled}
                    min={effectiveMinimumTime}
                    max={effectiveMaximumTime}
                    onChange={onTimeChange}
                />
            </div>
        );
    }

    return (
        <div className={cs(styles.timeColumn, 'date-time-column', timeInputClassName, classNames?.timeColumn)}>
            <div className={styles.timeColumnInner}>
                <div className={cs(styles.timeColumnHeader, 'date-time-column-header', classNames?.timeColumnHeader)}>
                    <Localize>Time</Localize>
                </div>
                <div className={styles.timeColumnScroll}>
                    {timeOptions.map((option) => {
                        const optionDisabled = disabled || isTimeOptionDisabled(option);
                        const optionSelected = option.time === timeText;
                        return (
                            <button
                                key={option.minutes}
                                type="button"
                                className={cs(
                                    styles.timeOption,
                                    'date-time-option',
                                    classNames?.timeOption,
                                    { [styles.selected]: optionSelected, [styles.disabled]: optionDisabled },
                                    optionSelected && 'date-time-option-selected',
                                    optionSelected && classNames?.selectedTimeOption,
                                )}
                                disabled={optionDisabled}
                                onClick={() => onTimeOptionSelect(option)}
                            >
                                {option.label}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default DateTimeSelector;
