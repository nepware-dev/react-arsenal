import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import DateTimePickerInput from '../../../components/Form/DateTimePickerInput';

vi.mock('../../../components/Popup', () => ({
    default: ({ children, isVisible }: { children: React.ReactNode; isVisible: boolean }) => {
        if (!isVisible) return null;
        return <div data-testid="portal">{children}</div>;
    },
}));

describe('DateTimePickerInput styling API', () => {
    const onChange = vi.fn();

    beforeEach(() => {
        onChange.mockClear();
    });

    it('keeps the iso value contract when a time option is picked', () => {
        const { container } = render(
            <DateTimePickerInput value="2024-01-15T10:00" onChange={onChange} />,
        );

        fireEvent.mouseDown(container.querySelector('input') as HTMLInputElement);
        fireEvent.focus(container.querySelector('input') as HTMLInputElement);
        fireEvent.click(screen.getByText('10:30'));

        expect(onChange).toHaveBeenCalledWith({ name: undefined, value: '2024-01-15T10:30' });
    });

    it('exposes stable global class names on the control and time list parts', () => {
        const { container } = render(
            <DateTimePickerInput value="2024-01-15T10:00" onChange={onChange} />,
        );

        expect(container.querySelector('.date-time-control')).toBeInTheDocument();
        expect(container.querySelector('.date-time-input')).toBeInTheDocument();

        fireEvent.mouseDown(container.querySelector('input') as HTMLInputElement);
        fireEvent.focus(container.querySelector('input') as HTMLInputElement);

        const portal = screen.getByTestId('portal');
        expect(portal.querySelector('.date-time-column')).toBeInTheDocument();
        expect(portal.querySelectorAll('.date-time-option').length).toBeGreaterThan(0);
        expect(portal.querySelector('.date-time-option-selected')).toHaveTextContent('10:00');
    });

    it('applies a consumer classNames map to the matching parts', () => {
        const { container } = render(
            <DateTimePickerInput
                value="2024-01-15T10:00"
                classNames={{
                    control: 'my-control',
                    input: 'my-input',
                    timeColumn: 'my-time-column',
                    timeOption: 'my-time-option',
                    selectedTimeOption: 'my-selected-time-option',
                }}
                onChange={onChange}
            />,
        );

        expect(container.querySelector('.my-control')).toBeInTheDocument();
        expect(container.querySelector('.my-input')).toBeInTheDocument();

        fireEvent.mouseDown(container.querySelector('input') as HTMLInputElement);
        fireEvent.focus(container.querySelector('input') as HTMLInputElement);

        const portal = screen.getByTestId('portal');
        expect(portal.querySelector('.my-time-column')).toBeInTheDocument();
        expect(portal.querySelectorAll('.my-time-option').length).toBeGreaterThan(0);
        expect(portal.querySelector('.my-selected-time-option')).toHaveTextContent('10:00');
    });
});

describe('DateTimePickerInput parity props', () => {
    const onChange = vi.fn();

    beforeEach(() => {
        onChange.mockClear();
    });

    it('renders the placeholder on the input', () => {
        const { container } = render(
            <DateTimePickerInput placeholder="Pick a moment" onChange={onChange} />,
        );

        expect(container.querySelector('input')).toHaveAttribute('placeholder', 'Pick a moment');
    });

    it('hides the clear button when clearable is false', () => {
        const { container } = render(
            <DateTimePickerInput value="2024-01-15T10:00" clearable={false} onChange={onChange} />,
        );

        expect(container.querySelector('.date-time-clear')).not.toBeInTheDocument();
    });
});

describe('DateTimePickerInput customization hooks', () => {
    const onChange = vi.fn();

    beforeEach(() => {
        onChange.mockClear();
    });

    it('disables calendar days flagged by isDateDisabled', () => {
        const { container } = render(
            <DateTimePickerInput
                value="2024-01-15T10:00"
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
            <DateTimePickerInput
                value="2024-01-15T10:00"
                isDateDisabled={(date) => date.day === 20}
                onChange={onChange}
            />,
        );

        fireEvent.mouseDown(container.querySelector('input') as HTMLInputElement);
        fireEvent.focus(container.querySelector('input') as HTMLInputElement);
        fireEvent.click(screen.getByText('20'));

        expect(onChange).not.toHaveBeenCalled();
    });

    it('renders custom day content with selection and disabled info', () => {
        const { container } = render(
            <DateTimePickerInput
                value="2024-01-15T10:00"
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
});

describe('DateTimePickerInput uncommitted typed date', () => {
    const onChange = vi.fn();

    beforeEach(() => {
        onChange.mockClear();
    });

    it('keeps a typed date that has not been committed when a time is typed', () => {
        const { container } = render(
            <DateTimePickerInput timeMode="native" onChange={onChange} />,
        );

        const dateInput = container.querySelector('input') as HTMLInputElement;
        fireEvent.mouseDown(dateInput);
        fireEvent.focus(dateInput);
        fireEvent.change(dateInput, { target: { value: '2024-01-15' } });

        fireEvent.change(container.querySelector('.date-time-field') as HTMLInputElement, {
            target: { value: '10:30' },
        });

        expect(onChange).not.toHaveBeenCalledWith({ name: undefined, value: null });
        expect(onChange).toHaveBeenLastCalledWith({ name: undefined, value: '2024-01-15T10:30' });
        expect(container.querySelector('.date-time-field')).toHaveValue('10:30');
        expect(dateInput).toHaveValue('2024-01-15 10:30');
    });

    it('keeps a typed date that has not been committed when a time option is picked', () => {
        const { container } = render(<DateTimePickerInput onChange={onChange} />);

        const dateInput = container.querySelector('input') as HTMLInputElement;
        fireEvent.mouseDown(dateInput);
        fireEvent.focus(dateInput);
        fireEvent.change(dateInput, { target: { value: '2024-01-15' } });

        fireEvent.click(screen.getByText('10:30'));

        expect(onChange).not.toHaveBeenCalledWith({ name: undefined, value: null });
        expect(onChange).toHaveBeenLastCalledWith({ name: undefined, value: '2024-01-15T10:30' });
        expect(dateInput).toHaveValue('2024-01-15 10:30');
    });

    it('reverts an unparseable typed date to the committed value when a time is typed', () => {
        const { container } = render(
            <DateTimePickerInput timeMode="native" value="2024-01-15T10:00" onChange={onChange} />,
        );

        const dateInput = container.querySelector('input') as HTMLInputElement;
        fireEvent.mouseDown(dateInput);
        fireEvent.focus(dateInput);
        fireEvent.change(dateInput, { target: { value: '2024-01' } });

        fireEvent.change(container.querySelector('.date-time-field') as HTMLInputElement, {
            target: { value: '11:30' },
        });

        expect(onChange).not.toHaveBeenCalledWith({ name: undefined, value: null });
        expect(onChange).toHaveBeenLastCalledWith({ name: undefined, value: '2024-01-15T11:30' });
    });
});

describe('DateTimePickerInput single emit per time entry', () => {
    const onChange = vi.fn();

    beforeEach(() => {
        onChange.mockClear();
    });

    it('emits null once when the date text is erased before a time option is picked', () => {
        const { container } = render(
            <DateTimePickerInput value="2024-01-15T10:00" onChange={onChange} />,
        );

        const dateInput = container.querySelector('input') as HTMLInputElement;
        fireEvent.mouseDown(dateInput);
        fireEvent.focus(dateInput);
        fireEvent.change(dateInput, { target: { value: '' } });

        fireEvent.click(screen.getByText('11:30'));

        expect(onChange).toHaveBeenCalledTimes(1);
        expect(onChange).toHaveBeenCalledWith({ name: undefined, value: null });
    });

    it('does not surface the typed time when a different time option is picked', () => {
        const { container } = render(<DateTimePickerInput onChange={onChange} />);

        const dateInput = container.querySelector('input') as HTMLInputElement;
        fireEvent.mouseDown(dateInput);
        fireEvent.focus(dateInput);
        fireEvent.change(dateInput, { target: { value: '2024-01-15 10:30' } });

        fireEvent.click(screen.getByText('11:30'));

        expect(onChange).not.toHaveBeenCalledWith({ name: undefined, value: '2024-01-15T10:30' });
        expect(onChange).toHaveBeenCalledTimes(1);
        expect(onChange).toHaveBeenCalledWith({ name: undefined, value: '2024-01-15T11:30' });
    });

    it('still emits the committed typed value when the entered time is out of bounds', () => {
        const { container } = render(
            <DateTimePickerInput
                timeMode="native"
                value="2024-01-15T10:00"
                minimumDate="2024-01-15T10:00"
                onChange={onChange}
            />,
        );

        const dateInput = container.querySelector('input') as HTMLInputElement;
        fireEvent.mouseDown(dateInput);
        fireEvent.focus(dateInput);
        fireEvent.change(dateInput, { target: { value: '2024-01-15 10:30' } });

        fireEvent.change(container.querySelector('.date-time-field') as HTMLInputElement, {
            target: { value: '09:30' },
        });

        expect(onChange).toHaveBeenCalledTimes(1);
        expect(onChange).toHaveBeenCalledWith({ name: undefined, value: '2024-01-15T10:30' });
    });
});

describe('DateTimePickerInput blank commit with no date', () => {
    const onChange = vi.fn();

    beforeEach(() => {
        onChange.mockClear();
    });

    it('resets and emits null when the date input blurs with a time but no date', () => {
        const { container } = render(
            <DateTimePickerInput timeMode="native" onChange={onChange} />,
        );

        const dateInput = container.querySelector('input') as HTMLInputElement;
        fireEvent.mouseDown(dateInput);
        fireEvent.focus(dateInput);
        fireEvent.change(container.querySelector('.date-time-field') as HTMLInputElement, {
            target: { value: '10:30' },
        });
        expect(container.querySelector('.date-time-field')).toHaveValue('10:30');

        onChange.mockClear();
        fireEvent.blur(dateInput);

        expect(onChange).toHaveBeenCalledWith({ name: undefined, value: null });
        expect(container.querySelector('.date-time-field')).toHaveValue('');
    });
});
