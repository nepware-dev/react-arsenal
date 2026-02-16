import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

import Button from '../../components/Button';
import styles from '../../components/Button/styles.module.scss';

describe('Button', () => {
    describe('Basic rendering', () => {
        it('renders button with children', () => {
            render(<Button>Click Me</Button>);

            expect(screen.getByText('Click Me')).toBeInTheDocument();
            expect(screen.getByRole('button')).toBeInTheDocument();
        });

        it('renders button with default class', () => {
            const { container } = render(<Button>Click Me</Button>);
            const button = container.querySelector('button');

            expect(button).toHaveClass(styles.button);
            expect(button).toHaveClass('button');
        });

        it('applies custom className', () => {
            const { container } = render(<Button className="custom-button">Click Me</Button>);
            const button = container.querySelector('button');

            expect(button).toHaveClass('custom-button');
            expect(button).toHaveClass(styles.button);
        });

        it('applies custom style', () => {
            render(<Button style={{ backgroundColor: 'rgb(255, 0, 0)' }}>Click Me</Button>);
            const button = screen.getByRole('button');

            expect(button).toHaveStyle({ backgroundColor: 'rgb(255, 0, 0)' });
        });
    });

    describe('Click handling', () => {
        it('calls onClick handler when clicked', () => {
            const handleClick = vi.fn();
            render(<Button onClick={handleClick}>Click Me</Button>);

            const button = screen.getByRole('button');
            fireEvent.click(button);

            expect(handleClick).toHaveBeenCalledTimes(1);
        });

        it('does not throw error when onClick is not provided', () => {
            render(<Button>Click Me</Button>);

            const button = screen.getByRole('button');
            expect(() => fireEvent.click(button)).not.toThrow();
        });

        it('can be clicked multiple times', () => {
            const handleClick = vi.fn();
            render(<Button onClick={handleClick}>Click Me</Button>);

            const button = screen.getByRole('button');
            fireEvent.click(button);
            fireEvent.click(button);
            fireEvent.click(button);

            expect(handleClick).toHaveBeenCalledTimes(3);
        });
    });

    describe('Variant styles', () => {
        it('applies success variant class', () => {
            const { container } = render(<Button success>Success</Button>);
            const button = container.querySelector('button');

            expect(button).toHaveClass(styles.success);
        });

        it('applies warning variant class', () => {
            const { container } = render(<Button warning>Warning</Button>);
            const button = container.querySelector('button');

            expect(button).toHaveClass(styles.warning);
        });

        it('applies danger variant class', () => {
            const { container } = render(<Button danger>Danger</Button>);
            const button = container.querySelector('button');

            expect(button).toHaveClass(styles.danger);
        });

        it('applies outline style', () => {
            const { container } = render(<Button outline>Outline</Button>);
            const button = container.querySelector('button');

            expect(button).toHaveClass(styles.outline);
        });

        it('applies disabled style', () => {
            const { container } = render(<Button disabled>Disabled</Button>);
            const button = container.querySelector('button');

            expect(button).toHaveClass(styles.disabled);
        });

        it('applies multiple variant classes', () => {
            const { container } = render(
                <Button success outline>
                    Multi-variant
                </Button>,
            );
            const button = container.querySelector('button');

            expect(button).toHaveClass(styles.success);
            expect(button).toHaveClass(styles.outline);
        });
    });

    describe('HTML attributes', () => {
        it('passes through native button attributes', () => {
            render(
                <Button type="submit" disabled aria-label="Submit form">
                    Submit
                </Button>,
            );

            const button = screen.getByRole('button');
            expect(button).toHaveAttribute('type', 'submit');
            expect(button).toHaveAttribute('disabled');
            expect(button).toHaveAttribute('aria-label', 'Submit form');
        });

        it('supports multiple html attributes', () => {
            render(
                <Button
                    id="unique-button"
                    name="submit-button"
                    form="my-form"
                    data-testid="custom-test-id"
                >
                    Click Me
                </Button>,
            );
            const button = screen.getByRole('button');

            expect(screen.getByTestId('custom-test-id')).toBeInTheDocument();
            expect(button).toHaveAttribute('id', 'unique-button');
            expect(button).toHaveAttribute('name', 'submit-button');
            expect(button).toHaveAttribute('form', 'my-form');
        });
    });

    describe('Disabled state', () => {
        it('renders disabled button with disabled prop', () => {
            render(<Button disabled>Disabled</Button>);

            const button = screen.getByRole('button');
            expect(button).toBeDisabled();
        });

        it('does not call onClick when disabled (via disabled prop)', () => {
            const handleClick = vi.fn();
            render(
                <Button onClick={handleClick} disabled>
                    Disabled
                </Button>,
            );

            const button = screen.getByRole('button');
            fireEvent.click(button);

            expect(handleClick).not.toHaveBeenCalled();
        });
    });

    describe('Children rendering', () => {
        it('renders text children', () => {
            render(<Button>Text Content</Button>);

            expect(screen.getByText('Text Content')).toBeInTheDocument();
        });

        it('renders element children', () => {
            render(
                <Button>
                    <span data-testid="icon">Icon</span>
                    <span>Label</span>
                </Button>,
            );

            expect(screen.getByTestId('icon')).toBeInTheDocument();
            expect(screen.getByText('Label')).toBeInTheDocument();
        });

        it('renders multiple children', () => {
            render(
                <Button>
                    <span>First</span>
                    <span>Second</span>
                    <span>Third</span>
                </Button>,
            );

            expect(screen.getByText('First')).toBeInTheDocument();
            expect(screen.getByText('Second')).toBeInTheDocument();
            expect(screen.getByText('Third')).toBeInTheDocument();
        });
    });

    describe('Edge cases', () => {
        it('renders button without children', () => {
            const { container } = render(<Button />);
            const button = container.querySelector('button');

            expect(button).toBeInTheDocument();
            expect(button).toBeEmptyDOMElement();
        });

        it('handles undefined onClick gracefully', () => {
            render(<Button onClick={undefined}>Click Me</Button>);

            const button = screen.getByRole('button');
            expect(() => fireEvent.click(button)).not.toThrow();
        });

        it('combines all variant styles correctly', () => {
            const { container } = render(
                <Button success warning danger outline disabled className="custom">
                    All Variants
                </Button>,
            );
            const button = container.querySelector('button');

            expect(button).toHaveClass(styles.button);
            expect(button).toHaveClass(styles.success);
            expect(button).toHaveClass(styles.warning);
            expect(button).toHaveClass(styles.danger);
            expect(button).toHaveClass(styles.outline);
            expect(button).toHaveClass(styles.disabled);
            expect(button).toHaveClass('custom');
        });
    });
});
