import { describe, it, expect, vi, beforeEach, afterEach, type Mock } from 'vitest';
import { render, screen, fireEvent, cleanup, act, within } from '@testing-library/react';
import '@testing-library/jest-dom';

import DatePickerInput from '../../../components/Form/DatePickerInput';
import DateTimePickerInput from '../../../components/Form/DateTimePickerInput';
import SelectInput from '../../../components/Form/SelectInput';
import useRect from '../../../hooks/useRect';

// Popup is left unmocked: both defects need the calendar and its SelectInput on real portals.
vi.mock('../../../hooks/useRect', () => ({
    default: vi.fn(),
}));

vi.mock('react-focus-lock', () => ({
    default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

const mockUseRect = useRect as Mock;

const getDatePopup = () => document.querySelector('.date-popup');
const getDateTimePopup = () => document.querySelector('.date-time-popup');

describe('Picker popup interaction', () => {
    const onChange = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();

        mockUseRect.mockReturnValue({
            top: 100,
            left: 200,
            right: 400,
            bottom: 150,
            width: 200,
            height: 50,
        } as DOMRect);
    });

    afterEach(() => {
        cleanup();
        vi.clearAllMocks();
    });

    describe('nested select inside the calendar popup', () => {
        const renderWithMonthDropdown = () =>
            render(
                <DatePickerInput
                    value="2024-01-15"
                    onChange={onChange}
                    calendarProps={{ enableMonthDropdown: true }}
                />,
            );

        const openMonthOptions = () => {
            const monthSelect = document.querySelector(
                '.calendar-header-select',
            ) as HTMLElement;
            fireEvent.click(
                monthSelect.querySelector('.select-control') as HTMLElement,
            );
            return monthSelect;
        };

        it('keeps the calendar open when a month option is picked', () => {
            const { container } = renderWithMonthDropdown();

            const input = container.querySelector('input') as HTMLInputElement;
            fireEvent.mouseDown(input);
            fireEvent.focus(input);
            const monthSelect = openMonthOptions();

            const marchOption = within(
                document.querySelector('.select_options') as HTMLElement,
            ).getByText('March');
            fireEvent.mouseDown(marchOption);
            fireEvent.click(marchOption);

            expect(getDatePopup()).toBeInTheDocument();
            expect(within(monthSelect).getByText('March')).toBeInTheDocument();
        });

        it('still closes the calendar when the click lands outside every popup', () => {
            const { container } = renderWithMonthDropdown();

            const input = container.querySelector('input') as HTMLInputElement;
            fireEvent.mouseDown(input);
            fireEvent.focus(input);
            openMonthOptions();
            fireEvent.mouseDown(document.body);

            expect(getDatePopup()).not.toBeInTheDocument();
        });
    });

    describe('focus handling on close', () => {
        it('returns focus to the date input after a day is picked', () => {
            const { container } = render(
                <DatePickerInput value="2024-01-15" onChange={onChange} />,
            );
            const input = container.querySelector('input') as HTMLInputElement;

            fireEvent.mouseDown(input);
            fireEvent.focus(input);
            expect(getDatePopup()).toBeInTheDocument();

            // Pressing a day moves focus off the input in a real browser.
            expect(document.activeElement).not.toBe(input);
            fireEvent.click(screen.getByText('20'));

            expect(onChange).toHaveBeenCalledWith({
                name: undefined,
                value: '2024-01-20',
            });
            expect(document.activeElement).toBe(input);
            expect(getDatePopup()).not.toBeInTheDocument();
        });

        it('returns focus to the date time input after a time is picked', () => {
            const { container } = render(
                <DateTimePickerInput
                    value="2024-01-15T10:00"
                    onChange={onChange}
                    timeStepMinutes={60}
                />,
            );
            const input = container.querySelector('input') as HTMLInputElement;

            fireEvent.mouseDown(input);
            fireEvent.focus(input);
            expect(getDateTimePopup()).toBeInTheDocument();

            fireEvent.click(screen.getByText('14:00'));

            expect(document.activeElement).toBe(input);
            expect(getDateTimePopup()).not.toBeInTheDocument();
        });

        it('does not reopen the date time calendar when focus returns without a gesture', () => {
            const { container } = render(
                <DateTimePickerInput
                    value="2024-01-15T10:00"
                    onChange={onChange}
                    timeStepMinutes={60}
                />,
            );
            const input = container.querySelector('input') as HTMLInputElement;

            fireEvent.mouseDown(input);
            fireEvent.focus(input);
            fireEvent.click(screen.getByText('14:00'));
            expect(getDateTimePopup()).not.toBeInTheDocument();

            act(() => {
                input.blur();
                input.focus();
            });

            expect(getDateTimePopup()).not.toBeInTheDocument();
        });

        it('leaves focus alone when an outside click closes the calendar', () => {
            const { container } = render(
                <>
                    <DatePickerInput value="2024-01-15" onChange={onChange} />
                    <button type="button" data-testid="other-control">
                        Other
                    </button>
                </>,
            );
            const input = container.querySelector('input') as HTMLInputElement;
            const otherControl = screen.getByTestId('other-control');

            fireEvent.mouseDown(input);
            fireEvent.focus(input);
            act(() => otherControl.focus());
            fireEvent.mouseDown(otherControl);

            expect(getDatePopup()).not.toBeInTheDocument();
            expect(document.activeElement).toBe(otherControl);
        });

        it('does not reopen the calendar when focus returns to the input without a gesture', () => {
            const { container } = render(
                <DatePickerInput value="2024-01-15" onChange={onChange} />,
            );
            const input = container.querySelector('input') as HTMLInputElement;

            fireEvent.mouseDown(input);
            fireEvent.focus(input);
            fireEvent.click(screen.getByText('20'));
            expect(getDatePopup()).not.toBeInTheDocument();

            // A re-render or a neighboring dropdown's dismissal handing focus back is not user intent.
            act(() => {
                input.blur();
                input.focus();
            });

            expect(getDatePopup()).not.toBeInTheDocument();
        });

        it('reopens the calendar when the user deliberately focuses the input again', () => {
            const { container } = render(
                <DatePickerInput value="2024-01-15" onChange={onChange} />,
            );
            const input = container.querySelector('input') as HTMLInputElement;

            fireEvent.mouseDown(input);
            fireEvent.focus(input);
            fireEvent.click(screen.getByText('20'));
            expect(getDatePopup()).not.toBeInTheDocument();

            act(() => input.blur());
            fireEvent.mouseDown(input);
            fireEvent.focus(input);

            expect(getDatePopup()).toBeInTheDocument();
        });

        it('opens the calendar on ArrowDown while the input is already focused', () => {
            const { container } = render(
                <DatePickerInput value="2024-01-15" onChange={onChange} />,
            );
            const input = container.querySelector('input') as HTMLInputElement;

            fireEvent.mouseDown(input);
            fireEvent.focus(input);
            fireEvent.click(screen.getByText('20'));
            expect(getDatePopup()).not.toBeInTheDocument();
            expect(document.activeElement).toBe(input);

            fireEvent.keyDown(input, { key: 'ArrowDown' });

            expect(getDatePopup()).toBeInTheDocument();
        });

        it('does not reopen when a neighboring dropdown is dismissed and hands focus back', () => {
            const { container } = render(
                <>
                    <DatePickerInput value="2024-01-15" onChange={onChange} />
                    <SelectInput
                        options={[{ id: '1', label: 'Option' }]}
                        keyExtractor={(item) => item.id}
                        valueExtractor={(item) => item.label}
                        onChange={vi.fn()}
                    />
                </>,
            );
            const input = container.querySelector('input') as HTMLInputElement;
            const selectWrapper = container.querySelector(
                '[tabindex]',
            ) as HTMLElement;

            fireEvent.mouseDown(input);
            fireEvent.focus(input);
            fireEvent.click(screen.getByText('20'));
            expect(getDatePopup()).not.toBeInTheDocument();

            // Dismissing a neighboring dropdown hands focus back with no gesture on this field.
            fireEvent.mouseDown(selectWrapper);
            fireEvent.focusIn(selectWrapper);
            fireEvent.keyDown(selectWrapper, { key: 'Escape' });
            act(() => input.focus());

            expect(getDatePopup()).not.toBeInTheDocument();
        });
    });
});
