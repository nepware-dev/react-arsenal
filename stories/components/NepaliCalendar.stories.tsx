import { useState } from 'react';
import type { Meta } from '@storybook/react-vite';
import { action } from 'storybook/actions';

import Calendar from '@ra/components/Calendar';
import type { CalendarDate, CalendarProps } from '@ra/components/Calendar';
import {
    convertBikramSambatToGregorian,
    convertGregorianToBikramSambat,
    formatBikramSambatDate,
    getDaysInBikramSambatMonth,
    getTodayBikramSambatDate,
} from '@ra/utils/date';

const SelectableCalendar = (props: Partial<CalendarProps>) => {
    const [selectedDate, setSelectedDate] = useState<CalendarDate | null>(null);

    const handleDateChange = (date: CalendarDate) => {
        setSelectedDate(date);
        action('changed')(date);
    };

    return (
        <div style={{ maxWidth: 320 }}>
            <Calendar
                system="nepali"
                value={selectedDate}
                onChange={handleDateChange}
                {...props}
            />
        </div>
    );
};

export const Story = () => <SelectableCalendar />;

Story.storyName = 'Default';

export const BoundedStory = () => {
    const today = getTodayBikramSambatDate();

    return (
        <SelectableCalendar
            minimumDate={{ year: today.year, month: 1, day: 1 }}
            maximumDate={{
                year: today.year,
                month: 12,
                day: getDaysInBikramSambatMonth(today.year, 12),
            }}
        />
    );
};

BoundedStory.storyName = 'Bounded Min/Max (Current BS Year)';

export const NepaliLanguageStory = () => <SelectableCalendar language="ne" />;

NepaliLanguageStory.storyName = 'Nepali Language (implies Nepali digits)';

export const DropdownNavigationStory = () => (
    <SelectableCalendar enableYearDropdown enableMonthDropdown />
);

DropdownNavigationStory.storyName = 'Year/Month Quick-Jump Dropdowns';

export const ConversionStory = () => {
    const newYearBikramSambat = { year: 2081, month: 1, day: 1 };
    const newYearGregorian =
        convertBikramSambatToGregorian(newYearBikramSambat);
    const roundTripBikramSambat =
        convertGregorianToBikramSambat(newYearGregorian);
    const todayBikramSambat = getTodayBikramSambatDate();

    return (
        <div
            style={{
                display: 'grid',
                gridTemplateColumns: 'auto auto',
                gap: '8px 24px',
                width: 'fit-content',
            }}
        >
            <span>BS 2081-01-01 in AD</span>
            <strong>{newYearGregorian.toDateString()}</strong>
            <span>AD {newYearGregorian.toDateString()} back in BS</span>
            <strong>{formatBikramSambatDate(roundTripBikramSambat)}</strong>
            <span>Today ({new Date().toDateString()}) in BS</span>
            <strong>
                {formatBikramSambatDate(todayBikramSambat, 'MMMM D, YYYY')}
            </strong>
            <span>Today in BS (Nepali)</span>
            <strong>
                {formatBikramSambatDate(todayBikramSambat, 'MMMM D, YYYY', {
                    language: 'ne',
                    useNepaliDigits: true,
                })}
            </strong>
        </div>
    );
};

ConversionStory.storyName = 'BS/AD Conversion Example';

export default {
    title: 'Components/Nepali Calendar',
    component: Calendar,
} satisfies Meta<typeof Calendar>;
