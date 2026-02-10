import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import Dropdown from '../../components/Dropdown';
import styles from '../../components/Dropdown/styles.module.scss';

describe('Dropdown', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.clearAllTimers();
        vi.useRealTimers();
        vi.clearAllMocks();
    });

    it('renders with default props', () => {
        render(
            <Dropdown label="Test Dropdown">
                <div>Dropdown content</div>
            </Dropdown>,
        );

        const button = screen.getByRole('button');
        expect(button).toBeInTheDocument();
        expect(screen.getByText('Test Dropdown')).toBeInTheDocument();
        expect(screen.getByText('Dropdown content')).toBeInTheDocument();
    });

    it('renders children correctly', () => {
        const testContent = (
            <ul>
                <li>Item 1</li>
                <li>Item 2</li>
                <li>Item 3</li>
            </ul>
        );

        render(<Dropdown label="Test Dropdown">{testContent}</Dropdown>);

        expect(screen.getByText('Item 1')).toBeInTheDocument();
        expect(screen.getByText('Item 2')).toBeInTheDocument();
        expect(screen.getByText('Item 3')).toBeInTheDocument();
    });

    it('toggles dropdown on button click', () => {
        render(
            <Dropdown label="Test Dropdown">
                <div>Dropdown content</div>
            </Dropdown>,
        );

        const button = screen.getByRole('button');

        const dropdown = button.closest(`.${styles.dropdown}`);

        expect(dropdown).not.toHaveClass(styles.open);

        fireEvent.click(button);
        expect(dropdown).toHaveClass(styles.open);
    });

    it('shows dropdown on hover when showOnHover is true', () => {
        render(
            <Dropdown label="Test Dropdown" showOnHover>
                <div>Dropdown content</div>
            </Dropdown>,
        );

        const button = screen.getByRole('button');
        const dropdown = button.closest(`.${styles.dropdown}`);

        expect(dropdown).not.toHaveClass(styles.open);

        fireEvent.mouseEnter(button);
        expect(dropdown).toHaveClass(styles.open);

        fireEvent.mouseLeave(button);
        expect(dropdown).not.toHaveClass(styles.open);
    });

    it('does not show dropdown on hover when showOnHover is false', () => {
        render(
            <Dropdown label="Test Dropdown" showOnHover={false}>
                <div>Dropdown content</div>
            </Dropdown>,
        );

        const button = screen.getByRole('button');
        const dropdown = button.closest(`.${styles.dropdown}`);

        fireEvent.mouseEnter(button);
        expect(dropdown).not.toHaveClass(styles.open);
    });

    it('closes dropdown when clicking outside', () => {
        render(
            <Dropdown label="Test Dropdown">
                <div>Dropdown content</div>
            </Dropdown>,
        );

        const button = screen.getByRole('button');
        const dropdown = button.closest(`.${styles.dropdown}`);

        fireEvent.click(button);
        expect(dropdown).toHaveClass(styles.open);

        act(() => {
            vi.advanceTimersByTime(50);
        });

        fireEvent.click(document.body);
        expect(dropdown).not.toHaveClass(styles.open);
    });

    it('renders with custom label renderer', () => {
        const customRenderer = () => <span>Custom Label</span>;

        render(
            <Dropdown renderLabel={customRenderer}>
                <div>Dropdown content</div>
            </Dropdown>,
        );

        expect(screen.getByText('Custom Label')).toBeInTheDocument();
        expect(screen.queryByText('Test Dropdown')).not.toBeInTheDocument();
    });

    it('applies correct alignment classes', () => {
        const { rerender } = render(
            <Dropdown label="Test" align="left">
                <div>Content</div>
            </Dropdown>,
        );

        let dropdownMenu = document.querySelector(`.${styles.dropdownMenu}`);
        expect(dropdownMenu).toHaveClass(styles.alignLeft);

        rerender(
            <Dropdown label="Test" align="right">
                <div>Content</div>
            </Dropdown>,
        );

        dropdownMenu = document.querySelector(`.${styles.dropdownMenu}`);
        expect(dropdownMenu).toHaveClass(styles.alignRight);

        rerender(
            <Dropdown label="Test" align="center">
                <div>Content</div>
            </Dropdown>,
        );

        dropdownMenu = document.querySelector(`.${styles.dropdownMenu}`);
        expect(dropdownMenu).toHaveClass(styles.alignCenter);
    });

    it('applies custom className and labelContainerClassName', () => {
        render(
            <Dropdown
                label="Test"
                className="custom-dropdown"
                labelContainerClassName="custom-button"
            >
                <div>Content</div>
            </Dropdown>,
        );

        const dropdown = document.querySelector(`.${styles.dropdown}`);
        const button = screen.getByRole('button');

        expect(dropdown).toHaveClass('custom-dropdown');
        expect(button).toHaveClass('custom-button');
    });

    it('cleans up event listeners on unmount', () => {
        const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener');

        const { unmount } = render(
            <Dropdown label="Test Dropdown">
                <div>Dropdown content</div>
            </Dropdown>,
        );

        const button = screen.getByRole('button');

        fireEvent.click(button);

        unmount();

        expect(removeEventListenerSpy).toHaveBeenCalled();
        removeEventListenerSpy.mockRestore();
    });

    it('handles useCapture prop correctly', () => {
        const addEventListenerSpy = vi.spyOn(document, 'addEventListener');

        render(
            <Dropdown label="Test Dropdown" useCapture={false}>
                <div>Dropdown content</div>
            </Dropdown>,
        );

        const button = screen.getByRole('button');

        fireEvent.click(button);

        act(() => {
            vi.advanceTimersByTime(50);
        });

        expect(addEventListenerSpy).toHaveBeenCalledWith('click', expect.any(Function), false);

        addEventListenerSpy.mockRestore();
    });
});
