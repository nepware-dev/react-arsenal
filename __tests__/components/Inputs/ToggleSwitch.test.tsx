import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';

import ToggleSwitch from '../../../components/Form/ToggleSwitch';
import styles from '../../../components/Form/ToggleSwitch/styles.module.scss';

describe('ToggleSwitch', () => {
    describe('Basic rendering', () => {
        it('renders toggle switch component', () => {
            const { container } = render(<ToggleSwitch />);
            const checkbox = container.querySelector('input[type="checkbox"]');

            expect(checkbox).toBeInTheDocument();
            expect(checkbox).toHaveClass(styles.checkbox);
        });

        it('applies custom className to toggle switch and thumb', () => {
            const { container } = render(<ToggleSwitch containerClassName="custom-container" className="custom-switch" thumbClassName="custom-thumb" />);
            const containerDiv = container.firstChild;
            const switchDiv = container.querySelector(`.${styles.toggleSwitch}`);
            const thumb = container.querySelector(`.${styles.thumb}`);

            expect(containerDiv).toHaveClass('custom-container');
            expect(containerDiv).toHaveClass(styles.container);

            expect(switchDiv).toHaveClass('custom-switch');
            expect(switchDiv).toHaveClass(styles.toggleSwitch);

            expect(thumb).toHaveClass('custom-thumb');
            expect(thumb).toHaveClass(styles.thumb);
        });
    });

    describe('onChange handling', () => {
        it('calls onChange with correct values when toggled on and off', () => {
            const handleChange = vi.fn();

            const { container, rerender } = render(
                <ToggleSwitch name="test-toggle" onChange={handleChange} value={false} />,
            );
            const checkbox = container.querySelector('input[type="checkbox"]') as HTMLInputElement;

            fireEvent.click(checkbox);
            expect(handleChange).toHaveBeenLastCalledWith({
                name: 'test-toggle',
                value: true,
            });

            rerender(<ToggleSwitch name="test-toggle" onChange={handleChange} value={true} />);

            fireEvent.click(checkbox);
            expect(handleChange).toHaveBeenLastCalledWith({
                name: 'test-toggle',
                value: false,
            });

            expect(handleChange).toHaveBeenCalledTimes(2);
        });
    });

    describe('Controlled behavior', () => {
        it('updates when value prop changes', () => {
            const { container, rerender } = render(<ToggleSwitch value={false} />);
            const checkbox = container.querySelector('input[type="checkbox"]') as HTMLInputElement;

            expect(checkbox.checked).toBe(false);

            rerender(<ToggleSwitch value={true} />);
            expect(checkbox.checked).toBe(true);

            rerender(<ToggleSwitch value={false} />);
            expect(checkbox.checked).toBe(false);
        });

        it('handles value undefined correctly', () => {
            const { container } = render(<ToggleSwitch value={undefined} />);
            const checkbox = container.querySelector('input[type="checkbox"]') as HTMLInputElement;

            expect(checkbox).toBeInTheDocument();
        });
    });

    describe('onByDefault behavior', () => {
        it('sets initial checked state when onByDefault is true', async () => {
            const { container } = render(<ToggleSwitch onByDefault={true} />);
            const checkbox = container.querySelector('input[type="checkbox"]') as HTMLInputElement;

            await waitFor(() => {
                expect(checkbox.checked).toBe(true);
            });
        });

        it('does not set initial checked state when onByDefault is false', () => {
            const { container } = render(<ToggleSwitch onByDefault={false} />);
            const checkbox = container.querySelector('input[type="checkbox"]') as HTMLInputElement;

            expect(checkbox.checked).toBe(false);
        });

        it('onByDefault is overridden by value prop', () => {
            const { container } = render(<ToggleSwitch onByDefault={true} value={false} />);
            const checkbox = container.querySelector('input[type="checkbox"]') as HTMLInputElement;

            expect(checkbox.checked).toBe(false);
        });
    });

    describe('Disabled state', () => {
        it('disables the checkbox when disabled prop is true', () => {
            const { container } = render(<ToggleSwitch disabled={true} />);
            const checkbox = container.querySelector('input[type="checkbox"]') as HTMLInputElement;

            expect(checkbox).toBeDisabled();
        });

        it('does not call onChange when disabled and clicked', async () => {
            const user = userEvent.setup();
            const handleChange = vi.fn();
            const { container } = render(<ToggleSwitch disabled={true} onChange={handleChange} />);
            const checkbox = container.querySelector('input[type="checkbox"]') as HTMLInputElement;

            await user.click(checkbox);

            expect(handleChange).not.toHaveBeenCalled();
        });

        it('checkbox is enabled when disabled prop is false', () => {
            const { container } = render(<ToggleSwitch disabled={false} />);
            const checkbox = container.querySelector('input[type="checkbox"]') as HTMLInputElement;

            expect(checkbox).not.toBeDisabled();
        });
    });

    describe('Size customization', () => {
        it('updates CSS variable when size prop changes', () => {
            const { container, rerender } = render(<ToggleSwitch size={50} />);
            const switchDiv = container.querySelector(`.${styles.toggleSwitch}`) as HTMLElement;

            expect(switchDiv.style.getPropertyValue('--track-length')).toBe('50px');

            rerender(<ToggleSwitch size={100} />);
            expect(switchDiv.style.getPropertyValue('--track-length')).toBe('100px');
        });
    });

    describe('Edge cases', () => {
        it('handles rapid toggling', () => {
            const handleChange = vi.fn();
            const { container } = render(<ToggleSwitch onChange={handleChange} />);
            const checkbox = container.querySelector('input[type="checkbox"]') as HTMLInputElement;

            fireEvent.click(checkbox);
            fireEvent.click(checkbox);
            fireEvent.click(checkbox);

            expect(handleChange).toHaveBeenCalledTimes(3);
        });

        it('renders correctly with all props combined', () => {
            const handleChange = vi.fn();
            const { container } = render(
                <ToggleSwitch
                    name="full-test"
                    value={true}
                    disabled={false}
                    size={60}
                    containerClassName="test-container"
                    className="test-switch"
                    thumbClassName="test-thumb"
                    onChange={handleChange}
                />,
            );
            const checkbox = container.querySelector('input[type="checkbox"]') as HTMLInputElement;

            expect(checkbox).toBeInTheDocument();
            expect(checkbox.checked).toBe(true);
            expect(checkbox).toHaveAttribute('name', 'full-test');
            expect(checkbox).not.toBeDisabled();
        });

        it('handles switching from uncontrolled to controlled', () => {
            const { container, rerender } = render(<ToggleSwitch />);
            const checkbox = container.querySelector('input[type="checkbox"]') as HTMLInputElement;

            fireEvent.click(checkbox);
            expect(checkbox.checked).toBe(true);

            rerender(<ToggleSwitch value={false} />);
            expect(checkbox.checked).toBe(false);
        });
    });
});
