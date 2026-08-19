import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, cleanup, act, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

import DatePickerInput from '../../components/Form/DatePickerInput';
import DateTimePickerInput from '../../components/Form/DateTimePickerInput';
import SelectInput from '../../components/Form/SelectInput';
import Modal from '../../components/Modal';

// react-focus-lock is left unmocked: a stubbed FocusLock cannot show how the real trap treats a portalled popup.

const noop = () => {};

const SERVICES = [
    { id: '1', label: 'General Medicine' },
    { id: '2', label: 'Orthopedic' },
];

const renderInModal = (picker: React.ReactNode) =>
    render(
        <Modal isVisible onClose={noop}>
            <SelectInput
                options={SERVICES}
                keyExtractor={(item) => item.id}
                valueExtractor={(item) => item.label}
                onChange={noop}
            />
            {picker}
        </Modal>,
    );

// The trap pulls focus back from a deferred timer, so the yank only shows up after it runs.
const flushFocusTrap = async () => {
    await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 5));
    });
};

const openMonthOptions = async (popupSelector: string) => {
    const popup = document.querySelector(popupSelector) as HTMLElement;
    const navigationButton = popup.querySelector('.calendar-nav-button') as HTMLElement;

    // Any control inside the calendar will do: it is the first thing to move focus out of the modal's own DOM.
    act(() => {
        navigationButton.focus();
    });

    const monthSelect = popup.querySelector('.calendar-header-select') as HTMLElement;
    const monthSearch = monthSelect.querySelector('input') as HTMLInputElement;

    act(() => {
        fireEvent.mouseDown(monthSearch);
        monthSearch.focus();
    });
    await flushFocusTrap();

    return monthSearch;
};

describe('Picker calendar inside a modal', () => {
    afterEach(() => {
        cleanup();
        vi.clearAllMocks();
    });

    it('keeps focus inside the date calendar when its month dropdown opens', async () => {
        renderInModal(
            <DatePickerInput
                value="2024-01-15"
                onChange={noop}
                calendarProps={{ enableMonthDropdown: true }}
            />,
        );

        const dateInput = document.querySelector('.date-input') as HTMLInputElement;
        act(() => {
            fireEvent.mouseDown(dateInput);
            dateInput.focus();
        });
        expect(document.querySelector('.date-popup')).toBeInTheDocument();

        const monthSearch = await openMonthOptions('.date-popup');

        expect(document.activeElement).toBe(monthSearch);
        expect(document.querySelector('.date-popup')).toContainElement(
            document.activeElement as HTMLElement,
        );
        // The month options popup, and nothing else, opened on top of the calendar.
        expect(document.querySelectorAll('.popup')).toHaveLength(2);
    });

    it('keeps focus inside the date time calendar when its month dropdown opens', async () => {
        renderInModal(
            <DateTimePickerInput
                value="2024-01-15T10:00"
                onChange={noop}
                timeStepMinutes={60}
                calendarProps={{ enableMonthDropdown: true }}
            />,
        );

        const dateTimeInput = document.querySelector('.date-time-input') as HTMLInputElement;
        act(() => {
            fireEvent.mouseDown(dateTimeInput);
            dateTimeInput.focus();
        });
        expect(document.querySelector('.date-time-popup')).toBeInTheDocument();

        const monthSearch = await openMonthOptions('.date-time-popup');

        expect(document.activeElement).toBe(monthSearch);
        expect(document.querySelector('.date-time-popup')).toContainElement(
            document.activeElement as HTMLElement,
        );
        expect(document.querySelectorAll('.popup')).toHaveLength(2);
    });

    it('still returns focus to the picker input when the calendar closes', async () => {
        renderInModal(
            <DatePickerInput
                value="2024-01-15"
                onChange={noop}
                calendarProps={{ enableMonthDropdown: true }}
            />,
        );

        const dateInput = document.querySelector('.date-input') as HTMLInputElement;
        act(() => {
            fireEvent.mouseDown(dateInput);
            dateInput.focus();
        });

        const day = Array.from(document.querySelectorAll('.date-popup button')).find(
            (button) => button.textContent === '20',
        ) as HTMLElement;
        act(() => {
            fireEvent.click(day);
        });
        await flushFocusTrap();

        expect(document.querySelector('.date-popup')).not.toBeInTheDocument();
        expect(document.activeElement).toBe(dateInput);
    });

    it('keeps the picker text input typeable while the calendar is open', async () => {
        renderInModal(<DatePickerInput value="2024-01-15" onChange={noop} />);

        const dateInput = document.querySelector('.date-input') as HTMLInputElement;
        act(() => {
            fireEvent.mouseDown(dateInput);
            dateInput.focus();
        });
        expect(document.querySelector('.date-popup')).toBeInTheDocument();

        act(() => {
            fireEvent.change(dateInput, { target: { value: '2024-02-20' } });
        });
        await flushFocusTrap();

        expect(document.activeElement).toBe(dateInput);
        expect(dateInput).toHaveValue('2024-02-20');
    });
});
