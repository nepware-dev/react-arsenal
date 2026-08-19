import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import DatePickerInput from '../../../components/Form/DatePickerInput';
import {
    MAXIMUM_BIKRAM_SAMBAT_YEAR,
    MINIMUM_BIKRAM_SAMBAT_YEAR,
    getBikramSambatMonthLabel,
    getGregorianMonthLabel,
} from '../../../utils/date';

vi.mock('../../../components/Popup', () => ({
    default: ({ children, isVisible }: { children: React.ReactNode; isVisible: boolean }) => {
        if (!isVisible) return null;
        return <div data-testid="portal">{children}</div>;
    },
}));

describe('DatePickerInput iso value contract', () => {
    const onChange = vi.fn();

    beforeEach(() => {
        onChange.mockClear();
    });

    it('emits the iso date when a calendar day is picked', () => {
        const { container } = render(
            <DatePickerInput value="2024-01-15" onChange={onChange} />,
        );

        fireEvent.mouseDown(container.querySelector('input') as HTMLInputElement);
        fireEvent.focus(container.querySelector('input') as HTMLInputElement);
        fireEvent.click(screen.getByText('20'));

        expect(onChange).toHaveBeenCalledWith({ name: undefined, value: '2024-01-20' });
    });

    it('forwards the field name on the emitted payload', () => {
        const { container } = render(
            <DatePickerInput name="birthday" value="2024-01-15" onChange={onChange} />,
        );

        fireEvent.mouseDown(container.querySelector('input') as HTMLInputElement);
        fireEvent.focus(container.querySelector('input') as HTMLInputElement);
        fireEvent.click(screen.getByText('20'));

        expect(onChange).toHaveBeenCalledWith({ name: 'birthday', value: '2024-01-20' });
    });

    it('renders the iso value as text in the input', () => {
        const { container } = render(
            <DatePickerInput value="2024-01-15" onChange={onChange} />,
        );

        expect(container.querySelector('input')).toHaveValue('2024-01-15');
    });

    it('commits a typed iso value on blur', () => {
        const { container } = render(
            <DatePickerInput value="2024-01-15" onChange={onChange} />,
        );

        const input = container.querySelector('input') as HTMLInputElement;
        fireEvent.change(input, { target: { value: '2024-01-18' } });
        fireEvent.blur(input);

        expect(onChange).toHaveBeenCalledWith({ name: undefined, value: '2024-01-18' });
    });

    it('emits null and clears the input when the clear button is clicked', () => {
        const { container } = render(
            <DatePickerInput value="2024-01-15" onChange={onChange} />,
        );

        fireEvent.click(container.querySelector('.date-clear') as HTMLButtonElement);

        expect(onChange).toHaveBeenCalledWith({ name: undefined, value: null });
        expect(container.querySelector('input')).toHaveValue('');
    });
});

describe('DatePickerInput class names', () => {
    const onChange = vi.fn();

    beforeEach(() => {
        onChange.mockClear();
    });

    it('exposes stable global class names on the control parts', () => {
        const { container } = render(
            <DatePickerInput value="2024-01-15" onChange={onChange} />,
        );

        expect(container.querySelector('.date-control')).toBeInTheDocument();
        expect(container.querySelector('.date-input')).toBeInTheDocument();
        expect(container.querySelector('.date-clear')).toBeInTheDocument();
        expect(container.querySelector('.date-calendar-toggle')).toBeInTheDocument();

        fireEvent.mouseDown(container.querySelector('input') as HTMLInputElement);
        fireEvent.focus(container.querySelector('input') as HTMLInputElement);

        const portal = screen.getByTestId('portal');
        expect(portal.querySelector('.calendar')).toBeInTheDocument();
        expect(portal.querySelector('.calendar-day-selected')).toHaveTextContent('15');
    });

    it('hides the clear button when clearable is false', () => {
        const { container } = render(
            <DatePickerInput value="2024-01-15" clearable={false} onChange={onChange} />,
        );

        expect(container.querySelector('.date-clear')).not.toBeInTheDocument();
    });

    it('applies a consumer classNames map to the matching parts', () => {
        const { container } = render(
            <DatePickerInput
                value="2024-01-15"
                classNames={{
                    container: 'my-container',
                    control: 'my-control',
                    input: 'my-input',
                    clear: 'my-clear',
                    calendarToggle: 'my-calendar-toggle',
                }}
                onChange={onChange}
            />,
        );

        expect(container.querySelector('.my-container')).toBeInTheDocument();
        expect(container.querySelector('.my-control')).toBeInTheDocument();
        expect(container.querySelector('.my-input')).toBeInTheDocument();
        expect(container.querySelector('.my-clear')).toBeInTheDocument();
        expect(container.querySelector('.my-calendar-toggle')).toBeInTheDocument();
    });
});

describe('DatePickerInput bounds behavior', () => {
    const onChange = vi.fn();

    beforeEach(() => {
        onChange.mockClear();
    });

    it('disables calendar days outside the minimum and maximum bounds', () => {
        const { container } = render(
            <DatePickerInput
                value="2024-01-15"
                minimumDate="2024-01-10"
                maximumDate="2024-01-20"
                onChange={onChange}
            />,
        );

        fireEvent.mouseDown(container.querySelector('input') as HTMLInputElement);
        fireEvent.focus(container.querySelector('input') as HTMLInputElement);

        expect(screen.getByText('9')).toBeDisabled();
        expect(screen.getByText('10')).toBeEnabled();
        expect(screen.getByText('20')).toBeEnabled();
        expect(screen.getByText('21')).toBeDisabled();
    });

    it('does not emit when a day outside the bounds is clicked', () => {
        const { container } = render(
            <DatePickerInput
                value="2024-01-15"
                minimumDate="2024-01-10"
                maximumDate="2024-01-20"
                onChange={onChange}
            />,
        );

        fireEvent.mouseDown(container.querySelector('input') as HTMLInputElement);
        fireEvent.focus(container.querySelector('input') as HTMLInputElement);
        fireEvent.click(screen.getByText('9'));

        expect(onChange).not.toHaveBeenCalled();
    });

    it('resets a typed out-of-bounds value on blur without emitting', () => {
        const { container } = render(
            <DatePickerInput
                value="2024-01-15"
                minimumDate="2024-01-10"
                maximumDate="2024-01-20"
                onChange={onChange}
            />,
        );

        const input = container.querySelector('input') as HTMLInputElement;
        fireEvent.change(input, { target: { value: '2024-02-15' } });
        fireEvent.blur(input);

        expect(onChange).not.toHaveBeenCalled();
        expect(input).toHaveValue('2024-01-15');
    });
});

describe('DatePickerInput customization hooks', () => {
    const onChange = vi.fn();

    beforeEach(() => {
        onChange.mockClear();
    });

    it('disables calendar days flagged by isDateDisabled', () => {
        const { container } = render(
            <DatePickerInput
                value="2024-01-15"
                isDateDisabled={(date) => date.day === 20}
                onChange={onChange}
            />,
        );

        fireEvent.mouseDown(container.querySelector('input') as HTMLInputElement);
        fireEvent.focus(container.querySelector('input') as HTMLInputElement);

        expect(screen.getByText('20')).toBeDisabled();
        expect(screen.getByText('19')).toBeEnabled();
    });

    it('does not emit when a disabled day is clicked', () => {
        const { container } = render(
            <DatePickerInput
                value="2024-01-15"
                isDateDisabled={(date) => date.day === 20}
                onChange={onChange}
            />,
        );

        fireEvent.mouseDown(container.querySelector('input') as HTMLInputElement);
        fireEvent.focus(container.querySelector('input') as HTMLInputElement);
        fireEvent.click(screen.getByText('20'));

        expect(onChange).not.toHaveBeenCalled();
    });

    it('resets a typed disabled date on blur without emitting', () => {
        const { container } = render(
            <DatePickerInput
                value="2024-01-15"
                isDateDisabled={(date) => date.day === 20}
                onChange={onChange}
            />,
        );

        const input = container.querySelector('input') as HTMLInputElement;
        fireEvent.change(input, { target: { value: '2024-01-20' } });
        fireEvent.blur(input);

        expect(onChange).not.toHaveBeenCalled();
        expect(input).toHaveValue('2024-01-15');
    });

    it('renders custom day content with selection and disabled info', () => {
        const { container } = render(
            <DatePickerInput
                value="2024-01-15"
                isDateDisabled={(date) => date.day === 20}
                renderDay={(date, info) => (
                    <span
                        data-testid={`day-${date.day}`}
                        data-selected={info.isSelected}
                        data-disabled={info.isDisabled}
                    >
                        {date.day}
                    </span>
                )}
                onChange={onChange}
            />,
        );

        fireEvent.mouseDown(container.querySelector('input') as HTMLInputElement);
        fireEvent.focus(container.querySelector('input') as HTMLInputElement);

        expect(screen.getByTestId('day-15')).toHaveAttribute('data-selected', 'true');
        expect(screen.getByTestId('day-20')).toHaveAttribute('data-disabled', 'true');
        expect(screen.getByTestId('day-19')).toHaveAttribute('data-disabled', 'false');
    });

    it('shows the default calendar layout when no calendarProps are passed', () => {
        const { container } = render(
            <DatePickerInput value="2024-01-15" onChange={onChange} />,
        );

        fireEvent.mouseDown(container.querySelector('input') as HTMLInputElement);
        fireEvent.focus(container.querySelector('input') as HTMLInputElement);

        expect(container.querySelectorAll('.calendar-nav-button')).toHaveLength(4);
        // Outside days render by default; a consumer opts out with `showOutsideDays: false`.
        expect(container.querySelector('.calendar-outside-day')).toBeInTheDocument();
        expect(container.querySelectorAll('.calendar-weekday')[0]).toHaveTextContent('Sun');
    });

    it('hides adjacent-month days when calendarProps opts out of showOutsideDays', () => {
        const { container } = render(
            <DatePickerInput
                value="2024-01-15"
                calendarProps={{ showOutsideDays: false }}
                onChange={onChange}
            />,
        );

        fireEvent.mouseDown(container.querySelector('input') as HTMLInputElement);
        fireEvent.focus(container.querySelector('input') as HTMLInputElement);

        expect(container.querySelector('.calendar-outside-day')).not.toBeInTheDocument();
    });

    it('forwards the calendar design props through calendarProps', () => {
        const { container } = render(
            <DatePickerInput
                value="2024-01-15"
                calendarProps={{
                    weekStartsOn: 1,
                    showOutsideDays: true,
                    hideYearNavigation: true,
                    classNames: { outsideDay: 'my-outside-day' },
                }}
                onChange={onChange}
            />,
        );

        fireEvent.mouseDown(container.querySelector('input') as HTMLInputElement);
        fireEvent.focus(container.querySelector('input') as HTMLInputElement);

        expect(container.querySelectorAll('.calendar-nav-button')).toHaveLength(2);
        expect(container.querySelectorAll('.calendar-weekday')[0]).toHaveTextContent('Mon');
        expect(container.querySelectorAll('.my-outside-day').length).toBeGreaterThan(0);
    });
});

// BS spans AD 1918-04-13 to AD 2044-04-12; an AD selection outside it has no BS spelling.
describe('DatePickerInput AD/BS toggle with a selection outside the BS range', () => {
    const onChange = vi.fn();

    beforeEach(() => {
        onChange.mockClear();
    });

    const openToggleOptions = (container: HTMLElement) => {
        fireEvent.mouseDown(container.querySelector('input') as HTMLInputElement);
        fireEvent.focus(container.querySelector('input') as HTMLInputElement);
        const [adOption, bsOption] = Array.from(
            container.querySelectorAll('.date-system-toggle-option'),
        ) as HTMLButtonElement[];
        return { adOption, bsOption };
    };

    const windowOf = (container: HTMLElement) => ({
        month: container.querySelector('.calendar-title-month')?.textContent,
        year: container.querySelector('.calendar-title-year')?.textContent,
    });

    it('clamps the window to the BS maximum and keeps the AD value through a round trip', () => {
        const { container } = render(
            <DatePickerInput mode="toggle" value="2050-06-15" onChange={onChange} />,
        );
        const { adOption, bsOption } = openToggleOptions(container);

        expect(windowOf(container)).toEqual({
            month: getGregorianMonthLabel(6),
            year: '2050',
        });

        expect(() => fireEvent.click(bsOption)).not.toThrow();

        expect(windowOf(container)).toEqual({
            month: getBikramSambatMonthLabel(12),
            year: String(MAXIMUM_BIKRAM_SAMBAT_YEAR),
        });
        // The date has no BS spelling, so the field reads blank and no day may ghost as selected.
        expect(container.querySelector('input')).toHaveValue('');
        expect(container.querySelector('.calendar-day-selected')).toBeNull();

        fireEvent.click(adOption);

        expect(windowOf(container)).toEqual({
            month: getGregorianMonthLabel(6),
            year: '2050',
        });
        expect(container.querySelector('input')).toHaveValue('2050-06-15');
        expect(container.querySelector('.calendar-day-selected')).toHaveTextContent('15');
        expect(onChange).not.toHaveBeenCalled();
    });

    it('clamps the window to the BS minimum and keeps the AD value through a round trip', () => {
        const { container } = render(
            <DatePickerInput mode="toggle" value="1910-03-01" onChange={onChange} />,
        );
        const { adOption, bsOption } = openToggleOptions(container);

        expect(() => fireEvent.click(bsOption)).not.toThrow();

        expect(windowOf(container)).toEqual({
            month: getBikramSambatMonthLabel(1),
            year: String(MINIMUM_BIKRAM_SAMBAT_YEAR),
        });
        expect(container.querySelector('input')).toHaveValue('');
        expect(container.querySelector('.calendar-day-selected')).toBeNull();

        fireEvent.click(adOption);

        expect(windowOf(container)).toEqual({
            month: getGregorianMonthLabel(3),
            year: '1910',
        });
        expect(container.querySelector('input')).toHaveValue('1910-03-01');
        expect(container.querySelector('.calendar-day-selected')).toHaveTextContent('1');
        expect(onChange).not.toHaveBeenCalled();
    });

    it('does not commit the unspellable blank as a clear on blur', () => {
        const { container } = render(
            <DatePickerInput mode="toggle" value="2050-06-15" onChange={onChange} />,
        );
        const { adOption, bsOption } = openToggleOptions(container);
        fireEvent.click(bsOption);

        const input = container.querySelector('input') as HTMLInputElement;
        fireEvent.blur(input);

        expect(onChange).not.toHaveBeenCalled();

        fireEvent.mouseDown(input);
        fireEvent.focus(input);
        fireEvent.click(adOption);
        expect(container.querySelector('input')).toHaveValue('2050-06-15');
    });

    it('does not commit the unspellable blank as a clear on Enter', () => {
        const { container } = render(
            <DatePickerInput mode="toggle" value="2050-06-15" onChange={onChange} />,
        );
        const { bsOption } = openToggleOptions(container);
        fireEvent.click(bsOption);

        fireEvent.keyDown(container.querySelector('input') as HTMLInputElement, {
            key: 'Enter',
        });

        expect(onChange).not.toHaveBeenCalled();
        expect(container.querySelector('input')).toHaveValue('');
    });

    it('keeps the value and both windows exact across repeated toggles', () => {
        const { container } = render(
            <DatePickerInput mode="toggle" value="2050-06-15" onChange={onChange} />,
        );
        const { adOption, bsOption } = openToggleOptions(container);

        for (let round = 0; round < 4; round += 1) {
            fireEvent.click(bsOption);
            expect(windowOf(container)).toEqual({
                month: getBikramSambatMonthLabel(12),
                year: String(MAXIMUM_BIKRAM_SAMBAT_YEAR),
            });
            expect(container.querySelector('.calendar-day-selected')).toBeNull();

            fireEvent.click(adOption);
            expect(windowOf(container)).toEqual({
                month: getGregorianMonthLabel(6),
                year: '2050',
            });
            expect(container.querySelector('input')).toHaveValue('2050-06-15');
        }

        expect(onChange).not.toHaveBeenCalled();
    });

    it('returns to the exact typed AD window across repeated clamped toggles with no selection', () => {
        const { container } = render(<DatePickerInput mode="toggle" onChange={onChange} />);
        const { adOption, bsOption } = openToggleOptions(container);

        // A year past the BS range moves the window without selecting anything.
        fireEvent.change(container.querySelector('input') as HTMLInputElement, {
            target: { value: '2090-03' },
        });
        expect(windowOf(container)).toEqual({
            month: getGregorianMonthLabel(3),
            year: '2090',
        });

        for (let round = 0; round < 3; round += 1) {
            fireEvent.click(bsOption);
            expect(windowOf(container)).toEqual({
                month: getBikramSambatMonthLabel(12),
                year: String(MAXIMUM_BIKRAM_SAMBAT_YEAR),
            });

            // The clamp lands on the window only; the anchor still holds the chosen AD month.
            fireEvent.click(adOption);
            expect(windowOf(container)).toEqual({
                month: getGregorianMonthLabel(3),
                year: '2090',
            });
        }

        expect(onChange).not.toHaveBeenCalled();
    });
});
