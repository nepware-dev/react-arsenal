import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import Portal from '../../components/Portal';

describe('Portal', () => {
    it('uses document.body as default container', () => {
        render(
            <Portal>
                <span>Default Container Content</span>
            </Portal>,
        );

        expect(document.body.textContent).toContain('Default Container Content');
    });

    it('renders children into provided container', () => {
        const container = document.createElement('div');
        document.body.appendChild(container);

        render(
            <Portal container={container}>
                <span>Portal Content</span>
            </Portal>,
        );

        expect(container.textContent).toBe('Portal Content');
        document.body.removeChild(container);
    });

    it('renders multiple children correctly', () => {
        const container = document.createElement('div');
        document.body.appendChild(container);
        render(
            <Portal container={container}>
                <span>Child 1</span>
                <span>Child 2</span>
            </Portal>,
        );
        expect(container.textContent).toContain('Child 1');
        expect(container.textContent).toContain('Child 2');
        document.body.removeChild(container);
    });
});
