import { render, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import Icon from '../../components/Icon';
import styles from '../../components/Icon/styles.module.scss';

describe('Icon', () => {
    it('renders correctly with the provided name class', () => {
        const { container } = render(<Icon name="home-icon" />);
        const span = container.querySelector('span');

        expect(span).toBeDefined();
        expect(span?.className).toContain('home-icon');
        expect(span?.className).not.toContain('mock-icon');
    });

    it('applies additional className from props', () => {
        const { container } = render(<Icon name="user" className="custom-class" />);
        const span = container.querySelector('span');

        expect(span?.className).toContain('custom-class');
    });

    it('applies the clickable class and calls onClick when clicked', () => {
        const handleClick = vi.fn();
        const { container } = render(<Icon name="settings" onClick={handleClick} />);
        const span = container.querySelector('span') as HTMLElement;

        expect(span.className).toContain(styles.clickable);

        fireEvent.click(span);
        expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('does not have the clickable class when onClick is absent', () => {
        const { container } = render(<Icon name="settings" />);
        const span = container.querySelector('span');

        expect(span?.className).not.toContain(styles.clickable);
    });
});
