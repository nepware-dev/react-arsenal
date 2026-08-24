import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import TimePickerInput from '../../../components/Form/TimePickerInput';

vi.mock('../../../components/Popup', () => ({
    default: ({ children, isVisible }: { children: React.ReactNode; isVisible: boolean }) => {
        if (!isVisible) return null;
        return <div data-testid="portal">{children}</div>;
    },
}));

const openPicker = (input: HTMLInputElement) => {
    fireEvent.mouseDown(input);
    fireEvent.focus(input);
};

describe('TimePickerInput styling API', () => {
    const onChange = vi.fn();

    beforeEach(() => {
        onChange.mockClear();
    });

    it('emits a normalized 24-hour value when a time option is picked', () => {
        const { container } = render(<TimePickerInput onChange={onChange} />);

        const input = container.querySelector('input') as HTMLInputElement;
        openPicker(input);
        fireEvent.click(screen.getByText('10:30 AM'));

        expect(onChange).toHaveBeenCalledWith({ name: undefined, value: '10:30' });
    });

    it('exposes stable global class names on the control and time list parts', () => {
        const { container } = render(<TimePickerInput value="10:00" onChange={onChange} />);

        expect(container.querySelector('.time-picker-control')).toBeInTheDocument();
        expect(container.querySelector('.time-picker-input')).toBeInTheDocument();
        expect(container.querySelector('.time-picker-indicator')).toBeInTheDocument();
        expect(container.querySelector('.time-picker-toggle')).toBeInTheDocument();

        const input = container.querySelector('input') as HTMLInputElement;
        openPicker(input);

        const portal = screen.getByTestId('portal');
        expect(portal.querySelector('.time-picker-body')).toBeInTheDocument();
        expect(portal.querySelector('.date-time-column')).toBeInTheDocument();
        expect(portal.querySelectorAll('.date-time-option').length).toBeGreaterThan(0);
        expect(portal.querySelector('.date-time-option-selected')).toHaveTextContent('10:00 AM');
    });

    it('applies a consumer classNames map to the matching parts', () => {
        const { container } = render(
            <TimePickerInput
                value="10:00"
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

        const input = container.querySelector('input') as HTMLInputElement;
        openPicker(input);

        const portal = screen.getByTestId('portal');
        expect(portal.querySelector('.my-time-column')).toBeInTheDocument();
        expect(portal.querySelectorAll('.my-time-option').length).toBeGreaterThan(0);
        expect(portal.querySelector('.my-selected-time-option')).toHaveTextContent('10:00 AM');
    });
});

describe('TimePickerInput parity props', () => {
    const onChange = vi.fn();

    beforeEach(() => {
        onChange.mockClear();
    });

    it('renders the placeholder on the input', () => {
        const { container } = render(<TimePickerInput placeholder="Pick a time" onChange={onChange} />);

        expect(container.querySelector('input')).toHaveAttribute('placeholder', 'Pick a time');
    });

    it('hides the clear button when clearable is false', () => {
        const { container } = render(
            <TimePickerInput value="10:00" clearable={false} onChange={onChange} />,
        );

        expect(container.querySelector('.time-picker-clear')).not.toBeInTheDocument();
    });

    it('clears the value when the clear button is clicked', () => {
        const { container } = render(<TimePickerInput value="10:00" onChange={onChange} />);

        fireEvent.click(container.querySelector('.time-picker-clear') as HTMLButtonElement);

        expect(onChange).toHaveBeenCalledWith({ name: undefined, value: null });
        expect(container.querySelector('input')).toHaveValue('');
    });

    it('disables the input and toggle when disabled is set', () => {
        const { container } = render(
            <TimePickerInput value="10:00" disabled onChange={onChange} />,
        );

        expect(container.querySelector('input')).toBeDisabled();
        expect(container.querySelector('.time-picker-toggle')).toBeDisabled();

        fireEvent.click(container.querySelector('.time-picker-toggle') as HTMLButtonElement);
        expect(screen.queryByTestId('portal')).not.toBeInTheDocument();
    });

    it('shows a required warning once touched and empty', () => {
        const { container, rerender } = render(
            <TimePickerInput required showRequired onChange={onChange} />,
        );

        expect(screen.getByText('Required')).toBeInTheDocument();

        rerender(<TimePickerInput required showRequired value="10:00" onChange={onChange} />);
        expect(screen.queryByText('Required')).not.toBeInTheDocument();
        expect(container).toBeTruthy();
    });
});

describe('TimePickerInput bounds and exclusions', () => {
    const onChange = vi.fn();

    beforeEach(() => {
        onChange.mockClear();
    });

    it('disables time options outside of minimumTime/maximumTime', () => {
        const { container } = render(
            <TimePickerInput minimumTime="09:00" maximumTime="17:00" onChange={onChange} />,
        );

        const input = container.querySelector('input') as HTMLInputElement;
        openPicker(input);

        expect(screen.getByText('8:30 AM')).toBeDisabled();
        expect(screen.getByText('9:00 AM')).toBeEnabled();
        expect(screen.getByText('5:30 PM')).toBeDisabled();
    });

    it('does not emit when an out-of-bounds option is clicked', () => {
        const { container } = render(
            <TimePickerInput minimumTime="09:00" maximumTime="17:00" onChange={onChange} />,
        );

        const input = container.querySelector('input') as HTMLInputElement;
        openPicker(input);
        fireEvent.click(screen.getByText('8:30 AM'));

        expect(onChange).not.toHaveBeenCalled();
    });

    it('disables options listed in excludeTimes', () => {
        const { container } = render(<TimePickerInput excludeTimes={['10:30']} onChange={onChange} />);

        const input = container.querySelector('input') as HTMLInputElement;
        openPicker(input);

        expect(screen.getByText('10:30 AM')).toBeDisabled();
    });

    it('respects a custom timeStepMinutes', () => {
        const { container } = render(<TimePickerInput timeStepMinutes={15} onChange={onChange} />);

        const input = container.querySelector('input') as HTMLInputElement;
        openPicker(input);

        expect(screen.getByText('12:15 AM')).toBeInTheDocument();
        expect(screen.getByText('12:45 AM')).toBeInTheDocument();
    });
});

describe('TimePickerInput typed value handling', () => {
    const onChange = vi.fn();

    beforeEach(() => {
        onChange.mockClear();
    });

    it('commits a valid, step-aligned typed value on blur', () => {
        const { container } = render(<TimePickerInput timeStepMinutes={30} onChange={onChange} />);

        const input = container.querySelector('input') as HTMLInputElement;
        openPicker(input);
        fireEvent.change(input, { target: { value: '2:30 PM' } });
        fireEvent.blur(input);

        expect(onChange).toHaveBeenCalledWith({ name: undefined, value: '14:30' });
    });

    it('reverts an unparseable typed value back to the committed display value', () => {
        const { container } = render(<TimePickerInput value="10:00" onChange={onChange} />);

        const input = container.querySelector('input') as HTMLInputElement;
        openPicker(input);
        fireEvent.change(input, { target: { value: 'not a time' } });
        fireEvent.blur(input);

        expect(onChange).not.toHaveBeenCalled();
        expect(input).toHaveValue('10:00 AM');
    });

    it('reverts a typed value that is not aligned to the configured step', () => {
        const { container } = render(
            <TimePickerInput value="10:00" timeStepMinutes={30} onChange={onChange} />,
        );

        const input = container.querySelector('input') as HTMLInputElement;
        openPicker(input);
        fireEvent.change(input, { target: { value: '10:07 AM' } });
        fireEvent.blur(input);

        expect(onChange).not.toHaveBeenCalled();
        expect(input).toHaveValue('10:00 AM');
    });

    it('clears the value when the input is emptied and blurred', () => {
        const { container } = render(<TimePickerInput value="10:00" onChange={onChange} />);

        const input = container.querySelector('input') as HTMLInputElement;
        openPicker(input);
        fireEvent.change(input, { target: { value: '' } });
        fireEvent.blur(input);

        expect(onChange).toHaveBeenCalledWith({ name: undefined, value: null });
    });

    it('does not clear the value when clearable is false and the input is emptied and blurred', () => {
        const { container } = render(
            <TimePickerInput value="10:00" clearable={false} onChange={onChange} />,
        );

        const input = container.querySelector('input') as HTMLInputElement;
        openPicker(input);
        fireEvent.change(input, { target: { value: '' } });
        fireEvent.blur(input);

        expect(onChange).not.toHaveBeenCalled();
        expect(input).toHaveValue('10:00 AM');
    });
});

describe('TimePickerInput keyboard interaction', () => {
    const onChange = vi.fn();

    beforeEach(() => {
        onChange.mockClear();
    });

    it('opens the popup on ArrowDown/Enter when closed', () => {
        const { container } = render(<TimePickerInput onChange={onChange} />);

        const input = container.querySelector('input') as HTMLInputElement;
        fireEvent.keyDown(input, { key: 'ArrowDown' });

        expect(screen.getByTestId('portal')).toBeInTheDocument();
    });

    it('commits the typed value and closes on Enter while open', () => {
        const { container } = render(<TimePickerInput timeStepMinutes={30} onChange={onChange} />);

        const input = container.querySelector('input') as HTMLInputElement;
        openPicker(input);
        fireEvent.change(input, { target: { value: '2:30 PM' } });
        fireEvent.keyDown(input, { key: 'Enter' });

        expect(onChange).toHaveBeenCalledWith({ name: undefined, value: '14:30' });
        expect(screen.queryByTestId('portal')).not.toBeInTheDocument();
    });

    it('closes without committing on Escape', () => {
        const { container } = render(<TimePickerInput value="10:00" onChange={onChange} />);

        const input = container.querySelector('input') as HTMLInputElement;
        openPicker(input);
        fireEvent.change(input, { target: { value: '2:30 PM' } });
        fireEvent.keyDown(input, { key: 'Escape' });

        expect(screen.queryByTestId('portal')).not.toBeInTheDocument();
        expect(onChange).not.toHaveBeenCalled();
    });
});

describe('TimePickerInput display formatting', () => {
    const onChange = vi.fn();

    beforeEach(() => {
        onChange.mockClear();
    });

    it('shows a 24-hour label when is24HourFormat is set', () => {
        const { container } = render(
            <TimePickerInput value="14:30" is24HourFormat onChange={onChange} />,
        );

        expect(container.querySelector('input')).toHaveValue('14:30');
    });

    it('shows a 12-hour label with AM/PM by default', () => {
        const { container } = render(<TimePickerInput value="14:30" onChange={onChange} />);

        expect(container.querySelector('input')).toHaveValue('2:30 PM');
    });

    it('renders Nepali digits and forces 24-hour format when language is ne', () => {
        const { container } = render(
            <TimePickerInput value="14:30" language="ne" onChange={onChange} />,
        );

        expect(container.querySelector('input')).toHaveValue('१४:३०');
    });

    it('accepts a typed Nepali-digit value', () => {
        const { container } = render(<TimePickerInput language="ne" onChange={onChange} />);

        const input = container.querySelector('input') as HTMLInputElement;
        openPicker(input);
        fireEvent.change(input, { target: { value: '१४:३०' } });
        fireEvent.blur(input);

        expect(onChange).toHaveBeenCalledWith({ name: undefined, value: '14:30' });
    });
});

describe('TimePickerInput native mode', () => {
    const onChange = vi.fn();

    beforeEach(() => {
        onChange.mockClear();
    });

    it('renders a native time field and commits on change', () => {
        const { container } = render(<TimePickerInput timeMode="native" onChange={onChange} />);

        const input = container.querySelector('input') as HTMLInputElement;
        openPicker(input);

        const nativeField = screen.getByTestId('portal').querySelector('.date-time-field') as HTMLInputElement;
        expect(nativeField).toBeInTheDocument();

        fireEvent.change(nativeField, { target: { value: '11:45' } });
        expect(onChange).toHaveBeenCalledWith({ name: undefined, value: '11:45' });
    });

    it('does not commit an out-of-bounds native time', () => {
        const { container } = render(
            <TimePickerInput timeMode="native" minimumTime="09:00" maximumTime="17:00" onChange={onChange} />,
        );

        const input = container.querySelector('input') as HTMLInputElement;
        openPicker(input);

        const nativeField = screen.getByTestId('portal').querySelector('.date-time-field') as HTMLInputElement;
        fireEvent.change(nativeField, { target: { value: '20:00' } });

        expect(onChange).not.toHaveBeenCalled();
    });
});
