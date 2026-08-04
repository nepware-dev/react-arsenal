import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import Calendar, { type CalendarProps } from '../../components/Calendar';
import I18nProvider from '../../components/I18n';
import styles from '../../components/Calendar/styles.module.scss';
import {
    MAXIMUM_BIKRAM_SAMBAT_YEAR,
    MINIMUM_BIKRAM_SAMBAT_YEAR,
    convertBikramSambatToGregorian,
    convertGregorianToBikramSambat,
    getBikramSambatMonthLabel,
    getGregorianMonthLabel,
    jsDateToGregorian,
} from '../../utils/date';

describe('Calendar (nepali system)', () => {
    const onChange = vi.fn();

    beforeEach(() => {
        onChange.mockClear();
    });

    it('renders the month title, weekday headers, and all days of the visible month', () => {
        const { container } = render(
            <Calendar system="nepali" value={{ year: 2081, month: 1, day: 15 }} onChange={onChange} />,
        );

        // The month and year render as separate elements so each can become a quick-jump dropdown.
        expect(screen.getByText('Baishakh')).toBeInTheDocument();
        expect(screen.getByText('2081')).toBeInTheDocument();
        // English weekday headers by default.
        expect(screen.getByText('Sun')).toBeInTheDocument();
        expect(screen.getByText('Sat')).toBeInTheDocument();
        expect(container.querySelectorAll(`.${styles.day}`)).toHaveLength(31);
        // Outside days render by default: 6 leading + 5 trailing pad the grid to full weeks.
        expect(container.querySelectorAll(`.${styles.outsideDay}`)).toHaveLength(11);
    });

    it('marks the selected day and calls onChange with the clicked date', () => {
        const { container } = render(
            <Calendar system="nepali" value={{ year: 2081, month: 1, day: 15 }} onChange={onChange} />,
        );

        expect(screen.getByText('15')).toHaveClass(styles.selected);

        fireEvent.click(screen.getByText('20'));
        expect(onChange).toHaveBeenCalledWith({ year: 2081, month: 1, day: 20 });
        expect(container.querySelectorAll(`.${styles.day}`)).toHaveLength(31);
    });

    it('navigates between months and years', () => {
        render(
            <Calendar system="nepali" value={{ year: 2081, month: 1, day: 15 }} onChange={onChange} />,
        );

        fireEvent.click(screen.getByLabelText('Next month'));
        expect(screen.getByText('Jestha')).toBeInTheDocument();
        expect(screen.getByText('2081')).toBeInTheDocument();

        fireEvent.click(screen.getByLabelText('Previous month'));
        fireEvent.click(screen.getByLabelText('Previous month'));
        expect(screen.getByText('Chaitra')).toBeInTheDocument();
        expect(screen.getByText('2080')).toBeInTheDocument();

        fireEvent.click(screen.getByLabelText('Next year'));
        expect(screen.getByText('Chaitra')).toBeInTheDocument();
        expect(screen.getByText('2081')).toBeInTheDocument();
    });

    it('disables days and navigation outside the minimum and maximum bounds', () => {
        render(
            <Calendar
                system="nepali"
                value={{ year: 2081, month: 1, day: 15 }}
                minimumDate={{ year: 2081, month: 1, day: 10 }}
                maximumDate={{ year: 2081, month: 1, day: 20 }}
                onChange={onChange}
            />,
        );

        expect(screen.getByText('9')).toBeDisabled();
        expect(screen.getByText('10')).toBeEnabled();
        expect(screen.getByText('20')).toBeEnabled();
        expect(screen.getByText('21')).toBeDisabled();
        expect(screen.getByLabelText('Previous month')).toBeDisabled();
        expect(screen.getByLabelText('Next month')).toBeDisabled();
        expect(screen.getByLabelText('Previous year')).toBeDisabled();
        expect(screen.getByLabelText('Next year')).toBeDisabled();

        fireEvent.click(screen.getByText('9'));
        expect(onChange).not.toHaveBeenCalled();
    });

    it('renders Devanagari labels and digits for the Nepali language', () => {
        render(
            <Calendar
                system="nepali"
                value={{ year: 2081, month: 1, day: 15 }}
                language="ne"
                onChange={onChange}
            />,
        );

        // Nepali digits are coupled to the language, so the year renders in Devanagari too.
        expect(screen.getByText('वैशाख')).toBeInTheDocument();
        expect(screen.getByText('२०८१')).toBeInTheDocument();
        expect(screen.getByText('आइत')).toBeInTheDocument();
        expect(screen.getByText('१५')).toBeInTheDocument();
    });

    it('uses the selected language from the I18n context', () => {
        render(
            <I18nProvider defaultLanguage="ne">
                <Calendar
                    system="nepali"
                    value={{ year: 2081, month: 1, day: 15 }}
                    onChange={onChange}
                />
            </I18nProvider>,
        );

        expect(screen.getByText('वैशाख')).toBeInTheDocument();
        expect(screen.getByText('२०८१')).toBeInTheDocument();
    });

    it('exposes stable global class names on the calendar parts', () => {
        const { container } = render(
            <Calendar system="nepali" value={{ year: 2081, month: 1, day: 15 }} onChange={onChange} />,
        );

        expect(container.querySelector('.calendar')).toBeInTheDocument();
        expect(container.querySelector('.calendar-header')).toBeInTheDocument();
        expect(container.querySelectorAll('.calendar-nav-button')).toHaveLength(4);
        expect(container.querySelectorAll('.calendar-weekday')).toHaveLength(7);
        expect(container.querySelectorAll('.calendar-day').length).toBeGreaterThan(0);
        expect(container.querySelector('.calendar-day-selected')).toHaveTextContent('15');
    });

    it('applies a consumer classNames map to the matching parts', () => {
        const { container } = render(
            <Calendar
                system="nepali"
                value={{ year: 2081, month: 1, day: 15 }}
                classNames={{
                    root: 'my-calendar',
                    day: 'my-day',
                    selectedDay: 'my-selected-day',
                    weekday: 'my-weekday',
                }}
                onChange={onChange}
            />,
        );

        expect(container.querySelector('.my-calendar')).toBeInTheDocument();
        expect(container.querySelectorAll('.my-weekday')).toHaveLength(7);
        expect(container.querySelectorAll('.my-day').length).toBeGreaterThan(0);
        expect(container.querySelector('.my-selected-day')).toHaveTextContent('15');
        expect(screen.getByText('15')).toHaveClass(styles.selected);
    });
});

describe('Calendar (design props)', () => {
    const onChange = vi.fn();

    beforeEach(() => {
        onChange.mockClear();
    });

    // Baishakh 2081 starts on a Saturday, so the default grid pads six leading cells.
    const renderCalendar = (props: Partial<CalendarProps> = {}) =>
        render(
            <Calendar
                system="nepali"
                value={{ year: 2081, month: 1, day: 15 }}
                onChange={onChange}
                {...props}
            />,
        );

    const weekdayLabels = (container: HTMLElement) =>
        Array.from(container.querySelectorAll(`.${styles.weekday}`)).map(
            (element) => element.textContent,
        );

    describe('weekStartsOn', () => {
        it('starts the week on Sunday by default', () => {
            const { container } = renderCalendar({ showOutsideDays: false });

            expect(weekdayLabels(container)).toEqual(['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']);
            expect(container.querySelectorAll(`.${styles.emptyDay}`)).toHaveLength(6);
        });

        it('reorders the weekday labels and the leading offset together', () => {
            const { container } = renderCalendar({ weekStartsOn: 1, showOutsideDays: false });

            expect(weekdayLabels(container)).toEqual(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);
            // Saturday moves from index 6 to index 5, so one fewer leading cell.
            expect(container.querySelectorAll(`.${styles.emptyDay}`)).toHaveLength(5);
            expect(container.querySelectorAll(`.${styles.day}`)).toHaveLength(31);
        });

        it('needs no leading cells when the month starts on the configured first day', () => {
            const { container } = renderCalendar({ weekStartsOn: 6, showOutsideDays: false });

            expect(weekdayLabels(container)[0]).toBe('Sat');
            expect(container.querySelectorAll(`.${styles.emptyDay}`)).toHaveLength(0);
        });

    });

    describe('showOutsideDays', () => {
        it('fills the leading and trailing cells with adjacent-month days by default', () => {
            const { container } = renderCalendar();

            const outsideDays = Array.from(
                container.querySelectorAll(`.${styles.outsideDay}`),
            ).map((element) => element.textContent);

            expect(container.querySelectorAll(`.${styles.emptyDay}`)).toHaveLength(0);
            expect(container.querySelectorAll(`.${styles.day}`)).toHaveLength(31);
            // Chaitra 2080 has 30 days, then Jestha 2081 pads the final week.
            expect(outsideDays).toEqual([
                '25', '26', '27', '28', '29', '30',
                '1', '2', '3', '4', '5',
            ]);
            // Six complete rows of seven.
            expect(container.querySelectorAll('.calendar-days > *')).toHaveLength(42);
        });

        it('renders blank padding cells and no adjacent-month days when disabled', () => {
            const { container } = renderCalendar({ showOutsideDays: false });

            expect(container.querySelectorAll(`.${styles.emptyDay}`)).toHaveLength(6);
            expect(container.querySelectorAll(`.${styles.outsideDay}`)).toHaveLength(0);
            expect(container.querySelector('.calendar-outside-day')).not.toBeInTheDocument();
        });

        it('keeps outside days non-interactive and hidden from assistive technology', () => {
            const { container } = renderCalendar();

            const firstOutsideDay = container.querySelector(
                `.${styles.outsideDay}`,
            ) as HTMLElement;

            // A disabled button rather than a div, so it matches the in-month cell metrics.
            expect(firstOutsideDay.tagName).toBe('BUTTON');
            expect(firstOutsideDay).toBeDisabled();
            expect(firstOutsideDay).toHaveAttribute('tabindex', '-1');
            expect(firstOutsideDay).toHaveAttribute('aria-hidden', 'true');

            fireEvent.click(firstOutsideDay);
            expect(onChange).not.toHaveBeenCalled();
        });

        it('pads the final week with blank cells past the maximum year', () => {
            const { container } = render(
                <Calendar
                    system="gregorian"
                    value={{ year: 2100, month: 12, day: 1 }}
                    showOutsideDays
                />,
            );

            // January 2101 is unsupported, so the trailing cell falls back to blank padding.
            expect(container.querySelectorAll('.calendar-days > *')).toHaveLength(35);
            expect(container.querySelectorAll(`.${styles.outsideDay}`)).toHaveLength(3);
            expect(container.querySelectorAll(`.${styles.emptyDay}`)).toHaveLength(1);
        });

        it('pads the first week with blank cells before the minimum year', () => {
            const { container } = render(
                <Calendar
                    system="gregorian"
                    value={{ year: 1900, month: 1, day: 1 }}
                    showOutsideDays
                />,
            );

            expect(container.querySelectorAll('.calendar-days > *')).toHaveLength(35);
            expect(container.querySelectorAll(`.${styles.emptyDay}`)).toHaveLength(1);
            expect(container.querySelectorAll(`.${styles.outsideDay}`)).toHaveLength(3);
        });

        it('reports outside days to renderDay so custom cells stay consistent', () => {
            const renderDay = vi.fn(
                (date, info) => `${date.month}/${date.day}${info.isOutsideMonth ? '*' : ''}`,
            );
            const { container } = renderCalendar({ showOutsideDays: true, renderDay });

            expect(container.querySelector(`.${styles.outsideDay}`)).toHaveTextContent('12/25*');
            expect(container.querySelector(`.${styles.day}`)).toHaveTextContent('1/1');
            expect(renderDay).toHaveBeenCalledWith(
                { year: 2081, month: 1, day: 15 },
                expect.objectContaining({ isSelected: true, isOutsideMonth: false }),
            );
        });
    });

    describe('hideYearNavigation', () => {
        it('renders both year steppers by default', () => {
            const { container } = renderCalendar();

            expect(container.querySelectorAll('.calendar-nav-button')).toHaveLength(4);
            expect(screen.getByLabelText('Previous year')).toBeInTheDocument();
            expect(screen.getByLabelText('Next year')).toBeInTheDocument();
        });

        it('drops the year steppers but keeps the month steppers when enabled', () => {
            const { container } = renderCalendar({ hideYearNavigation: true });

            expect(container.querySelectorAll('.calendar-nav-button')).toHaveLength(2);
            expect(screen.queryByLabelText('Previous year')).not.toBeInTheDocument();
            expect(screen.queryByLabelText('Next year')).not.toBeInTheDocument();

            fireEvent.click(screen.getByLabelText('Next month'));
            expect(screen.getByText('Jestha')).toBeInTheDocument();
        });
    });

    describe('classNames styling hooks', () => {
        it('adds no classes for the parts a consumer leaves out', () => {
            const { container } = renderCalendar({
                minimumDate: { year: 2081, month: 1, day: 10 },
            });

            const navigationButtons = container.querySelectorAll('.calendar-nav-button');
            expect(navigationButtons[0].className).toBe(
                `${styles.navigationButton} calendar-nav-button`,
            );
            expect(screen.getByText('9')).toBeDisabled();
            expect(screen.getByText('9').className).toBe(`${styles.day} calendar-day`);
        });

        it('targets each stepper, the disabled days, and the outside days', () => {
            const { container } = renderCalendar({
                showOutsideDays: true,
                minimumDate: { year: 2081, month: 1, day: 10 },
                classNames: {
                    previousYearButton: 'my-prev-year',
                    previousMonthButton: 'my-prev-month',
                    nextMonthButton: 'my-next-month',
                    nextYearButton: 'my-next-year',
                    disabledDay: 'my-disabled-day',
                    outsideDay: 'my-outside-day',
                },
            });

            expect(screen.getByLabelText('Previous year')).toHaveClass('my-prev-year');
            expect(screen.getByLabelText('Previous month')).toHaveClass('my-prev-month');
            expect(screen.getByLabelText('Next month')).toHaveClass('my-next-month');
            expect(screen.getByLabelText('Next year')).toHaveClass('my-next-year');
            // Days 1 to 9 fall before the minimum date.
            expect(container.querySelectorAll('.my-disabled-day')).toHaveLength(9);
            expect(container.querySelectorAll('.my-outside-day')).toHaveLength(11);
        });
    });
});

describe('Calendar (AD/BS system toggle)', () => {
    const onChange = vi.fn();

    beforeEach(() => {
        onChange.mockClear();
    });

    it('converts the visible window from AD to BS when no date is selected', () => {
        const adWindow = { year: 2026, month: 8, day: 1 };
        const bsWindow = convertGregorianToBikramSambat(
            new Date(adWindow.year, adWindow.month - 1, adWindow.day),
        );

        const { rerender, container } = render(
            <Calendar system="gregorian" value={null} viewDate={adWindow} onChange={onChange} />,
        );
        expect(screen.getByText(getGregorianMonthLabel(adWindow.month))).toBeInTheDocument();
        expect(screen.getByText(String(adWindow.year))).toBeInTheDocument();

        rerender(<Calendar system="nepali" value={null} onChange={onChange} />);

        expect(container.querySelector('.calendar-title-month')).toHaveTextContent(
            getBikramSambatMonthLabel(bsWindow.month),
        );
        expect(container.querySelector('.calendar-title-year')).toHaveTextContent(
            String(bsWindow.year),
        );
    });

    it('returns to the original AD window after an AD -> BS -> AD round trip', () => {
        const adWindow = { year: 2026, month: 8, day: 1 };
        const bsWindow = convertGregorianToBikramSambat(
            new Date(adWindow.year, adWindow.month - 1, adWindow.day),
        );

        const { rerender, container } = render(
            <Calendar system="gregorian" value={null} viewDate={adWindow} onChange={onChange} />,
        );

        rerender(<Calendar system="nepali" value={null} onChange={onChange} />);
        expect(container.querySelector('.calendar-title-month')).toHaveTextContent(
            getBikramSambatMonthLabel(bsWindow.month),
        );
        expect(container.querySelector('.calendar-title-year')).toHaveTextContent(
            String(bsWindow.year),
        );

        rerender(<Calendar system="gregorian" value={null} onChange={onChange} />);
        expect(container.querySelector('.calendar-title-month')).toHaveTextContent(
            getGregorianMonthLabel(adWindow.month),
        );
        expect(container.querySelector('.calendar-title-year')).toHaveTextContent(
            String(adWindow.year),
        );
    });

    it('keeps the visible window stable across repeated AD/BS toggles', () => {
        const adWindow = { year: 2026, month: 8, day: 1 };
        const bsWindow = convertGregorianToBikramSambat(
            new Date(adWindow.year, adWindow.month - 1, adWindow.day),
        );

        const { rerender, container } = render(
            <Calendar system="gregorian" value={null} viewDate={adWindow} onChange={onChange} />,
        );

        for (let round = 0; round < 4; round += 1) {
            rerender(<Calendar system="nepali" value={null} onChange={onChange} />);
            expect(container.querySelector('.calendar-title-month')).toHaveTextContent(
                getBikramSambatMonthLabel(bsWindow.month),
            );
            expect(container.querySelector('.calendar-title-year')).toHaveTextContent(
                String(bsWindow.year),
            );

            rerender(<Calendar system="gregorian" value={null} onChange={onChange} />);
            expect(container.querySelector('.calendar-title-month')).toHaveTextContent(
                getGregorianMonthLabel(adWindow.month),
            );
            expect(container.querySelector('.calendar-title-year')).toHaveTextContent(
                String(adWindow.year),
            );
        }
    });

    it('returns to the original BS window after a BS -> AD -> BS round trip', () => {
        const bsWindow = { year: 2083, month: 4, day: 1 };
        const adWindow = jsDateToGregorian(convertBikramSambatToGregorian(bsWindow));

        const { rerender, container } = render(
            <Calendar system="nepali" value={null} viewDate={bsWindow} onChange={onChange} />,
        );

        rerender(<Calendar system="gregorian" value={null} onChange={onChange} />);
        expect(container.querySelector('.calendar-title-year')).toHaveTextContent(
            String(adWindow.year),
        );

        rerender(<Calendar system="nepali" value={null} onChange={onChange} />);
        expect(container.querySelector('.calendar-title-month')).toHaveTextContent(
            getBikramSambatMonthLabel(bsWindow.month),
        );
        expect(container.querySelector('.calendar-title-year')).toHaveTextContent(
            String(bsWindow.year),
        );
    });

    it('converts the visible window from BS to AD when no date is selected', () => {
        const bsWindow = { year: 2083, month: 4, day: 1 };
        const adWindow = jsDateToGregorian(convertBikramSambatToGregorian(bsWindow));

        const { rerender, container } = render(
            <Calendar system="nepali" value={null} viewDate={bsWindow} onChange={onChange} />,
        );
        expect(screen.getByText(getBikramSambatMonthLabel(bsWindow.month))).toBeInTheDocument();
        expect(screen.getByText(String(bsWindow.year))).toBeInTheDocument();

        rerender(<Calendar system="gregorian" value={null} onChange={onChange} />);

        expect(container.querySelector('.calendar-title-month')).toHaveTextContent(
            getGregorianMonthLabel(adWindow.month),
        );
        expect(container.querySelector('.calendar-title-year')).toHaveTextContent(
            String(adWindow.year),
        );
    });

    it('clamps to the BS minimum year instead of throwing when the AD window is below it', () => {
        const adWindow = { year: 1905, month: 6, day: 1 };

        const { rerender, container } = render(
            <Calendar system="gregorian" value={null} viewDate={adWindow} onChange={onChange} />,
        );
        expect(screen.getByText(String(adWindow.year))).toBeInTheDocument();

        expect(() => {
            rerender(<Calendar system="nepali" value={null} onChange={onChange} />);
        }).not.toThrow();

        expect(container.querySelector('.calendar-title-year')).toHaveTextContent(
            String(MINIMUM_BIKRAM_SAMBAT_YEAR),
        );
        expect(container.querySelector('.calendar-title-month')).toHaveTextContent(
            getBikramSambatMonthLabel(1),
        );
    });

    it('clamps to the BS maximum year instead of throwing when the AD window is above it', () => {
        const adWindow = { year: 2090, month: 3, day: 1 };

        const { rerender, container } = render(
            <Calendar system="gregorian" value={null} viewDate={adWindow} onChange={onChange} />,
        );
        expect(screen.getByText(String(adWindow.year))).toBeInTheDocument();

        expect(() => {
            rerender(<Calendar system="nepali" value={null} onChange={onChange} />);
        }).not.toThrow();

        expect(container.querySelector('.calendar-title-year')).toHaveTextContent(
            String(MAXIMUM_BIKRAM_SAMBAT_YEAR),
        );
        expect(container.querySelector('.calendar-title-month')).toHaveTextContent(
            getBikramSambatMonthLabel(12),
        );
    });

    it('still tracks a selected date across an AD/BS toggle', () => {
        const adDate = { year: 2026, month: 8, day: 15 };
        const bsDate = convertGregorianToBikramSambat(
            new Date(adDate.year, adDate.month - 1, adDate.day),
        );

        const { rerender, container } = render(
            <Calendar system="gregorian" value={adDate} onChange={onChange} />,
        );
        expect(container.querySelector('.calendar-day-selected')).toHaveTextContent(
            String(adDate.day),
        );

        rerender(<Calendar system="nepali" value={bsDate} onChange={onChange} />);

        expect(container.querySelector('.calendar-title-month')).toHaveTextContent(
            getBikramSambatMonthLabel(bsDate.month),
        );
        expect(container.querySelector('.calendar-day-selected')).toHaveTextContent(
            String(bsDate.day),
        );
    });
});

// BS covers AD 1918-04-13 through AD 2044-04-12; AD dates outside that span have no BS counterpart.
describe('Calendar (AD/BS toggle with a selection outside the BS range)', () => {
    const onChange = vi.fn();

    beforeEach(() => {
        onChange.mockClear();
    });

    it('clamps the window to the BS maximum and leaves the AD value untouched', () => {
        const adDate = { year: 2050, month: 6, day: 15 };

        const { rerender, container } = render(
            <Calendar system="gregorian" value={adDate} onChange={onChange} />,
        );
        expect(container.querySelector('.calendar-title-year')).toHaveTextContent('2050');
        expect(container.querySelector('.calendar-day-selected')).toHaveTextContent('15');

        // The consumer has no BS date to hand over, so the BS leg opens with nothing selected.
        expect(() => {
            rerender(<Calendar system="nepali" value={null} onChange={onChange} />);
        }).not.toThrow();

        expect(container.querySelector('.calendar-title-year')).toHaveTextContent(
            String(MAXIMUM_BIKRAM_SAMBAT_YEAR),
        );
        expect(container.querySelector('.calendar-title-month')).toHaveTextContent(
            getBikramSambatMonthLabel(12),
        );
        // An unrepresentable date must not ghost onto a day of the clamped window.
        expect(container.querySelector('.calendar-day-selected')).toBeNull();

        rerender(<Calendar system="gregorian" value={adDate} onChange={onChange} />);
        expect(container.querySelector('.calendar-title-month')).toHaveTextContent(
            getGregorianMonthLabel(adDate.month),
        );
        expect(container.querySelector('.calendar-title-year')).toHaveTextContent('2050');
        expect(container.querySelector('.calendar-day-selected')).toHaveTextContent('15');
        expect(adDate).toEqual({ year: 2050, month: 6, day: 15 });
        expect(onChange).not.toHaveBeenCalled();
    });

    it('clamps the window to the BS minimum and leaves the AD value untouched', () => {
        // 1910 falls outside the BS year range, so the same object reads as no selection in BS.
        const adDate = { year: 1910, month: 3, day: 1 };

        const { rerender, container } = render(
            <Calendar system="gregorian" value={adDate} onChange={onChange} />,
        );
        expect(container.querySelector('.calendar-title-year')).toHaveTextContent('1910');
        expect(container.querySelector('.calendar-day-selected')).toHaveTextContent('1');

        expect(() => {
            rerender(<Calendar system="nepali" value={adDate} onChange={onChange} />);
        }).not.toThrow();

        expect(container.querySelector('.calendar-title-year')).toHaveTextContent(
            String(MINIMUM_BIKRAM_SAMBAT_YEAR),
        );
        expect(container.querySelector('.calendar-title-month')).toHaveTextContent(
            getBikramSambatMonthLabel(1),
        );
        expect(container.querySelector('.calendar-day-selected')).toBeNull();

        rerender(<Calendar system="gregorian" value={adDate} onChange={onChange} />);
        expect(container.querySelector('.calendar-title-month')).toHaveTextContent(
            getGregorianMonthLabel(adDate.month),
        );
        expect(container.querySelector('.calendar-title-year')).toHaveTextContent('1910');
        expect(container.querySelector('.calendar-day-selected')).toHaveTextContent('1');
        expect(adDate).toEqual({ year: 1910, month: 3, day: 1 });
        expect(onChange).not.toHaveBeenCalled();
    });

    it('keeps the value and the AD window exact across repeated clamped toggles', () => {
        const adDate = { year: 2050, month: 6, day: 15 };

        const { rerender, container } = render(
            <Calendar system="gregorian" value={adDate} onChange={onChange} />,
        );

        for (let round = 0; round < 4; round += 1) {
            rerender(<Calendar system="nepali" value={null} onChange={onChange} />);
            expect(container.querySelector('.calendar-title-year')).toHaveTextContent(
                String(MAXIMUM_BIKRAM_SAMBAT_YEAR),
            );
            expect(container.querySelector('.calendar-day-selected')).toBeNull();

            rerender(<Calendar system="gregorian" value={adDate} onChange={onChange} />);
            expect(container.querySelector('.calendar-title-month')).toHaveTextContent(
                getGregorianMonthLabel(adDate.month),
            );
            expect(container.querySelector('.calendar-title-year')).toHaveTextContent('2050');
            expect(container.querySelector('.calendar-day-selected')).toHaveTextContent('15');
        }

        expect(adDate).toEqual({ year: 2050, month: 6, day: 15 });
        expect(onChange).not.toHaveBeenCalled();
    });

    it('returns to the exact AD window after repeated clamped toggles at either bound', () => {
        const bounds = [
            { adWindow: { year: 2090, month: 3, day: 1 }, bsYear: MAXIMUM_BIKRAM_SAMBAT_YEAR, bsMonth: 12 },
            { adWindow: { year: 1905, month: 6, day: 1 }, bsYear: MINIMUM_BIKRAM_SAMBAT_YEAR, bsMonth: 1 },
        ];

        bounds.forEach(({ adWindow, bsYear, bsMonth }) => {
            const { rerender, container, unmount } = render(
                <Calendar system="gregorian" value={null} viewDate={adWindow} onChange={onChange} />,
            );

            for (let round = 0; round < 4; round += 1) {
                rerender(<Calendar system="nepali" value={null} onChange={onChange} />);
                expect(container.querySelector('.calendar-title-year')).toHaveTextContent(
                    String(bsYear),
                );
                expect(container.querySelector('.calendar-title-month')).toHaveTextContent(
                    getBikramSambatMonthLabel(bsMonth),
                );

                // The clamp lands on the window only; the anchor still holds the chosen AD month.
                rerender(<Calendar system="gregorian" value={null} onChange={onChange} />);
                expect(container.querySelector('.calendar-title-month')).toHaveTextContent(
                    getGregorianMonthLabel(adWindow.month),
                );
                expect(container.querySelector('.calendar-title-year')).toHaveTextContent(
                    String(adWindow.year),
                );
            }

            unmount();
        });

        expect(onChange).not.toHaveBeenCalled();
    });
});

describe('Calendar (AD/BS toggle with a viewDate held across the system change)', () => {
    const onChange = vi.fn();

    beforeEach(() => {
        onChange.mockClear();
    });

    // Only the round trip is pinned: an untagged viewDate held across the change still steers the BS leg.
    it('returns to the exact AD window across repeated toggles', () => {
        const viewDate = { year: 2090, month: 3 };

        const { rerender, container } = render(
            <Calendar system="gregorian" value={null} viewDate={viewDate} onChange={onChange} />,
        );
        expect(container.querySelector('.calendar-title-year')).toHaveTextContent('2090');

        for (let round = 0; round < 3; round += 1) {
            expect(() => {
                rerender(
                    <Calendar system="nepali" value={null} viewDate={viewDate} onChange={onChange} />,
                );
            }).not.toThrow();

            rerender(
                <Calendar system="gregorian" value={null} viewDate={viewDate} onChange={onChange} />,
            );
            expect(container.querySelector('.calendar-title-month')).toHaveTextContent(
                getGregorianMonthLabel(3),
            );
            expect(container.querySelector('.calendar-title-year')).toHaveTextContent('2090');
        }

        expect(onChange).not.toHaveBeenCalled();
    });
});
