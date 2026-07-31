import React, { useMemo } from "react";

import { FiCalendar } from "react-icons/fi";
import { IoMdClose } from "react-icons/io";

import styles from "./styles.module.scss";
import type { DatePickerInputProps } from "./types";
import Popup from "../../Popup";
import cs from "../../../cs";
import {
    compareGregorianDates,
    formatIsoDate,
    type GregorianDate,
} from "../../../utils/date";
import {
    formatDatePart,
    isoToGregorian,
    parseDatePart,
} from "../../Calendar/pickerDateSystem";
import usePickerDateField, {
    type PickerDateFieldModel,
} from "../../Calendar/usePickerDateField";

const areDatesEqual = (
    first: GregorianDate | null,
    second: GregorianDate | null,
): boolean => {
    if (!first && !second) {
        return true;
    }
    if (!first || !second) {
        return false;
    }
    return compareGregorianDates(first, second) === 0;
};

const DatePickerInput: React.FC<DatePickerInputProps> = (props) => {
    const {
        name,
        className,
        classNames,
        containerClassName,
        controlClassName,
        value,
        defaultValue,
        placeholder = "Select date...",
        disabled = false,
        required = false,
        showRequired,
        clearable = true,
        errorMessage,
        minimumDate,
        maximumDate,
        mode = "gregorian",
        language,
        isDateDisabled,
        renderDay,
        calendarProps,
        onChange,
    } = props;

    const minimumAdDate = useMemo(
        () => isoToGregorian(minimumDate),
        [minimumDate],
    );
    const maximumAdDate = useMemo(
        () => isoToGregorian(maximumDate),
        [maximumDate],
    );

    const model = useMemo<PickerDateFieldModel<GregorianDate | null>>(
        () => ({
            empty: null,
            parseIso: (rawValue) => isoToGregorian(rawValue),
            toIsoValue: (date) => (date ? formatIsoDate(date) : null),
            format: (date, displaySystem, formatLanguage) =>
                formatDatePart(date, displaySystem, formatLanguage),
            parseTyped: (trimmedText, displaySystem) =>
                parseDatePart(trimmedText, displaySystem),
            isWithinBounds: (date) => {
                if (!date) {
                    return true;
                }
                if (
                    minimumAdDate &&
                    compareGregorianDates(date, minimumAdDate) < 0
                ) {
                    return false;
                }
                if (
                    maximumAdDate &&
                    compareGregorianDates(date, maximumAdDate) > 0
                ) {
                    return false;
                }
                return true;
            },
            equals: (first, second) => areDatesEqual(first, second),
            getDate: (date) => date,
            withDate: (_currentModel, date) => date,
        }),
        [minimumAdDate, maximumAdDate],
    );

    const field = usePickerDateField<GregorianDate | null>({
        name,
        value,
        defaultValue,
        disabled,
        required,
        showRequired,
        mode,
        language,
        errorMessage,
        containerClassName,
        calendarProps,
        minimumAdDate,
        maximumAdDate,
        isDateDisabled,
        renderDay,
        onChange,
        model,
        styles,
        systemToggleClassName: "date-system-toggle",
        systemToggleClassNames: {
            root: classNames?.systemToggle,
            option: classNames?.systemToggleOption,
            activeOption: classNames?.activeSystemToggleOption,
        },
        calendarClassNames: classNames?.calendar,
        messageClassNames: {
            error: classNames?.error,
            warning: classNames?.warning,
        },
        completesOnDateChange: true,
    });

    const { Wrapper, wrapperProps } = field;
    const showClear = clearable && !disabled && field.selectedDate;

    return (
        <Wrapper {...wrapperProps}>
            <div
                className={cs(
                    styles.dateInputContainer,
                    { disabled, [styles.disabled]: disabled },
                    className,
                    classNames?.container,
                )}
            >
                <div
                    ref={field.controlRef}
                    className={cs(
                        styles.dateControl,
                        "date-control",
                        controlClassName,
                        classNames?.control,
                        [styles.expanded, field.expanded],
                        [styles.warning, !!field.warning],
                        [styles.error, !!field.errorText],
                    )}
                >
                    <input
                        ref={field.inputRef}
                        type="text"
                        className={cs(
                            styles.dateInput,
                            "date-input",
                            classNames?.input,
                        )}
                        value={field.inputText}
                        placeholder={placeholder}
                        disabled={disabled}
                        onFocus={field.handleInputFocus}
                        onChange={field.handleInputChange}
                        onBlur={field.commitTypedValue}
                        onKeyDown={field.handleKeyDown}
                    />
                    {field.systemToggle}
                    <div
                        className={cs(
                            styles.dateIndicator,
                            "date-indicator",
                            classNames?.indicator,
                        )}
                    >
                        {showClear && (
                            <button
                                type="button"
                                className={cs(
                                    styles.clear,
                                    "date-clear",
                                    classNames?.clear,
                                )}
                                onClick={field.handleClearIconClick}
                            >
                                <IoMdClose />
                            </button>
                        )}
                        <button
                            type="button"
                            className={cs(
                                styles.calendarToggle,
                                "date-calendar-toggle",
                                classNames?.calendarToggle,
                            )}
                            aria-label="Toggle calendar"
                            disabled={disabled}
                            onClick={field.toggleCalendar}
                        >
                            <FiCalendar size={16} />
                        </button>
                    </div>
                </div>
                <Popup
                    isVisible={field.expanded}
                    className={cs(
                        styles.popup,
                        "date-popup",
                        classNames?.popup,
                    )}
                    disableFocusLock
                    anchor={field.controlRef}
                    anchorOrigin="bottom left"
                    transformOrigin="top left"
                    onClose={field.dismissCalendar}
                >
                    <div className={styles.pickerPopup}>{field.calendar}</div>
                </Popup>
            </div>
            {field.messages}
        </Wrapper>
    );
};

export default DatePickerInput;

export * from "./types";
