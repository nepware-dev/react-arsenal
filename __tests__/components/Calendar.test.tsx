import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import Calendar from '../../components/Calendar';
import I18nProvider from '../../components/I18n';
import styles from '../../components/Calendar/styles.module.scss';

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
        expect(container.querySelectorAll(`.${styles.emptyDay}`)).toHaveLength(6);
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
