import React, { useState } from 'react';
import type { Meta } from '@storybook/react-vite';
import { action } from 'storybook/actions';

import Calendar from '@ra/components/Calendar';
import type { CalendarDate, CalendarProps } from '@ra/components/Calendar';

import styles from './styles.module.scss';

const noteStyle = { marginTop: 0, marginBottom: 12, fontSize: 13, color: '#666', maxWidth: 480 };

const SelectableCalendar = ({
    note,
    ...calendarProps
}: Partial<CalendarProps> & { note?: string }) => {
    const [selectedDate, setSelectedDate] = useState<CalendarDate | null>(null);

    const handleDateChange = (date: CalendarDate) => {
        setSelectedDate(date);
        action('changed')(date);
    };

    return (
        <div>
            {note ? <p style={noteStyle}>{note}</p> : null}
            <Calendar
                system="gregorian"
                value={selectedDate}
                onChange={handleDateChange}
                {...calendarProps}
            />
        </div>
    );
};

const CalendarRow = ({ children }: { children: React.ReactNode }) => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'flex-start' }}>
        {children}
    </div>
);

const LabelledCalendar = ({
    label,
    ...calendarProps
}: Partial<CalendarProps> & { label: string }) => (
    <div>
        <p style={{ ...noteStyle, marginBottom: 8, fontWeight: 600, color: '#333' }}>{label}</p>
        <SelectableCalendar {...calendarProps} />
    </div>
);

export const WeekStartsOnStory = () => (
    <CalendarRow>
        <LabelledCalendar label="weekStartsOn={0} (default, Sunday)" weekStartsOn={0} />
        <LabelledCalendar label="weekStartsOn={1} (Monday)" weekStartsOn={1} />
        <LabelledCalendar label="weekStartsOn={6} (Saturday)" weekStartsOn={6} />
    </CalendarRow>
);

WeekStartsOnStory.storyName = 'weekStartsOn';

export const ShowOutsideDaysStory = () => (
    <CalendarRow>
        <LabelledCalendar label="showOutsideDays={false}" showOutsideDays={false} />
        <LabelledCalendar label="showOutsideDays={true} (default)" showOutsideDays />
        <LabelledCalendar
            label="showOutsideDays with weekStartsOn={1}"
            showOutsideDays
            weekStartsOn={1}
        />
    </CalendarRow>
);

ShowOutsideDaysStory.storyName = 'showOutsideDays';

export const HideYearNavigationStory = () => (
    <CalendarRow>
        <LabelledCalendar label="hideYearNavigation={false} (default)" />
        <LabelledCalendar label="hideYearNavigation={true}" hideYearNavigation />
        <LabelledCalendar
            label="hideYearNavigation with enableYearDropdown"
            hideYearNavigation
            enableYearDropdown
            enableMonthDropdown
        />
    </CalendarRow>
);

HideYearNavigationStory.storyName = 'hideYearNavigation';

export const CustomClassNamesStory = () => {
    const today = new Date();
    const isWeekend = (date: CalendarDate) => {
        const weekday = new Date(date.year, date.month - 1, date.day).getDay();
        return weekday === 0 || weekday === 6;
    };

    return (
        <SelectableCalendar
            note="Every internal part is restyled through the classNames prop: root, header, per-stepper buttons, weekday row, day grid, selected day, today, disabled days and outside days."
            showOutsideDays
            weekStartsOn={1}
            isDateDisabled={isWeekend}
            viewDate={{ year: today.getFullYear(), month: today.getMonth() + 1 }}
            classNames={{
                root: styles.designedCalendar,
                header: styles.designedCalendarHeader,
                navigationButton: styles.designedCalendarNavigationButton,
                previousYearButton: styles.designedCalendarEdgeButton,
                nextYearButton: styles.designedCalendarEdgeButton,
                title: styles.designedCalendarTitle,
                weekdays: styles.designedCalendarWeekdays,
                weekday: styles.designedCalendarWeekday,
                days: styles.designedCalendarDays,
                day: styles.designedCalendarDay,
                selectedDay: styles.designedCalendarSelectedDay,
                today: styles.designedCalendarToday,
                disabledDay: styles.designedCalendarDisabledDay,
                outsideDay: styles.designedCalendarOutsideDay,
            }}
        />
    );
};

CustomClassNamesStory.storyName = 'classNames styling hooks';

export const CssVariableThemeStory = () => (
    <div
        style={{
            '--calendar-background': '#12172b',
            '--calendar-border-color': '#2b3358',
            '--calendar-text-color': '#e6e9f5',
            '--calendar-muted-text-color': '#8d95bb',
            '--calendar-outside-text-color': '#5c648c',
            '--calendar-highlight-background': '#232b4d',
            '--calendar-selected-background': '#7c5cff',
            '--calendar-selected-text-color': '#ffffff',
            '--calendar-today-border-color': '#7c5cff',
            '--calendar-radius': '12px',
            '--calendar-cell-radius': '999px',
            padding: 24,
            background: '#080b16',
            display: 'inline-block',
        } as React.CSSProperties}
    >
        <SelectableCalendar showOutsideDays weekStartsOn={1} />
    </div>
);

CssVariableThemeStory.storyName = 'CSS variable theming';

export const CustomDayRenderStory = () => (
    <SelectableCalendar
        note="renderDay receives the date plus isSelected, isDisabled, isToday and isOutsideMonth, so outside-month cells can be rendered differently from in-month ones."
        showOutsideDays
        renderDay={(date, dayInfo) => (
            <span style={{ opacity: dayInfo.isOutsideMonth ? 0.4 : 1 }}>
                {dayInfo.isToday ? `[${date.day}]` : date.day}
            </span>
        )}
    />
);

CustomDayRenderStory.storyName = 'renderDay with outside-month info';

export default {
    title: 'Components/Calendar',
    component: Calendar,
} satisfies Meta<typeof Calendar>;
