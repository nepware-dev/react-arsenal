import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import DatePickerInput from '../../../components/Form/DatePickerInput';

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

        fireEvent.focus(container.querySelector('input') as HTMLInputElement);
        fireEvent.click(screen.getByText('20'));

        expect(onChange).toHaveBeenCalledWith({ name: undefined, value: '2024-01-20' });
    });

    it('forwards the field name on the emitted payload', () => {
        const { container } = render(
            <DatePickerInput name="birthday" value="2024-01-15" onChange={onChange} />,
        );

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

        fireEvent.focus(container.querySelector('input') as HTMLInputElement);

        expect(screen.getByTestId('day-15')).toHaveAttribute('data-selected', 'true');
        expect(screen.getByTestId('day-20')).toHaveAttribute('data-disabled', 'true');
        expect(screen.getByTestId('day-19')).toHaveAttribute('data-disabled', 'false');
    });
});
