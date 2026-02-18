import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';

import TextareaInput from '../../../components/Form/TextareaInput';
import styles from '../../../components/Form/TextareaInput/styles.module.scss';

vi.mock('@ra/components/I18n/Localize', () => ({
    default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe('TextareaInput', () => {
    describe('Basic rendering', () => {
        it('renders textarea element', () => {
            render(<TextareaInput />);
            const textarea = screen.getByRole('textbox');
            expect(textarea).toBeInTheDocument();
        });

        it('applies custom className', () => {
            const { container } = render(<TextareaInput className="custom-textarea" containerClassName="custom-container" />);
            const textarea = container.querySelector('textarea');
            const wrapper = container.querySelector('.custom-container');

            expect(textarea).toHaveClass('custom-textarea');
            expect(textarea).toHaveClass(styles.textarea);

            expect(wrapper).toBeInTheDocument();
            expect(wrapper?.querySelector('textarea')).toBeInTheDocument();
        });

        it('renders with default rows attribute', () => {
            render(<TextareaInput />);
            const textarea = screen.getByRole('textbox');
            expect(textarea).toHaveAttribute('rows', '4');
        });

        it('applies disabled state', () => {
            render(<TextareaInput disabled />);
            const textarea = screen.getByRole('textbox');
            expect(textarea).toBeDisabled();
        });

        it('applies required attribute', () => {
            render(<TextareaInput required />);
            const textarea = screen.getByRole('textbox');
            expect(textarea).toBeRequired();
        });

        it('renders with placeholder', () => {
            render(<TextareaInput placeholder="Enter text here" />);
            const textarea = screen.getByRole('textbox');
            expect(textarea).toHaveAttribute('placeholder', 'Enter text here');
        });

        it('renders with initial value', () => {
            render(<TextareaInput value="Initial text" onChange={() => {}} />);
            const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
            expect(textarea.value).toBe('Initial text');
        });
    });

    describe('Change handling', () => {
        it('calls onChange handler when text is entered', () => {
            const handleChange = vi.fn();
            render(<TextareaInput onChange={handleChange} />);

            const textarea = screen.getByRole('textbox');
            fireEvent.change(textarea, { target: { value: 'New text' } });

            expect(handleChange).toHaveBeenCalledTimes(1);
            expect(handleChange).toHaveBeenCalledWith(textarea);
        });

        it('updates textarea value on change', () => {
            const { rerender } = render(<TextareaInput value="" onChange={() => {}} />);
            const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;

            expect(textarea.value).toBe('');

            rerender(<TextareaInput value="Updated text" onChange={() => {}} />);
            expect(textarea.value).toBe('Updated text');
        });

        it('clears error state on change', () => {
            const { container } = render(<TextareaInput errorMessage="Error message" />);

            expect(screen.getByText('Error message')).toBeInTheDocument();
            expect(container.querySelector('textarea')).toHaveClass(styles.textareaError);

            const textarea = screen.getByRole('textbox');
            fireEvent.change(textarea, { target: { value: 'Some text' } });

            waitFor(() => {
                expect(screen.queryByText('Error message')).not.toBeInTheDocument();
            });
        });
    });

    describe('Required field validation', () => {
        it('shows required warning when showRequired is true', () => {
            render(<TextareaInput showRequired />);
            expect(screen.getByText('Required')).toBeInTheDocument();
        });

        it('shows required warning when required and field is empty on change', () => {
            render(<TextareaInput required />);

            const textarea = screen.getByRole('textbox');
            fireEvent.change(textarea, { target: { value: '' } });

            waitFor(() => {
                expect(screen.getByText('Required')).toBeInTheDocument();
            });
        });

        it('clears required warning when value is provided', () => {
            const { rerender } = render(
                <TextareaInput showRequired value="" onChange={() => {}} />,
            );
            expect(screen.getByText('Required')).toBeInTheDocument();

            rerender(<TextareaInput showRequired value="Some text" onChange={() => {}} />);

            waitFor(() => {
                expect(screen.queryByText('Required')).not.toBeInTheDocument();
            });
        });

        it('shows required warning on invalid event for empty required field', () => {
            render(<TextareaInput required />);

            const textarea = screen.getByRole('textbox');
            fireEvent.invalid(textarea, { currentTarget: { value: '' } });

            waitFor(() => {
                expect(screen.getByText('Required')).toBeInTheDocument();
            });
        });
    });

    describe('Error handling', () => {
        it('displays error message when errorMessage prop is provided', () => {
            render(<TextareaInput errorMessage="This field has an error" />);
            expect(screen.getByText('This field has an error')).toBeInTheDocument();
        });

        it('displays error text with correct class', () => {
            const { container } = render(<TextareaInput errorMessage="Error message" />);
            const errorText = container.querySelector(`.${styles.errorText}`);
            expect(errorText).toBeInTheDocument();
            expect(errorText).toHaveClass('input-error');
        });

    });

    describe('Invalid input handling', () => {
        it('calls onInvalid handler when textarea becomes invalid', () => {
            const handleInvalid = vi.fn();
            render(<TextareaInput onInvalid={handleInvalid} />);

            const textarea = screen.getByRole('textbox');
            fireEvent.invalid(textarea);

            expect(handleInvalid).toHaveBeenCalledTimes(1);
        });

        it('shows "Invalid" error on invalid event for non-empty field', () => {
            render(<TextareaInput />);

            const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
            Object.defineProperty(textarea, 'value', { value: 'some text', writable: true });

            fireEvent.invalid(textarea, { currentTarget: { value: 'some text' } });

            waitFor(() => {
                expect(screen.getByText('Invalid')).toBeInTheDocument();
            });
        });

        it('prioritizes required warning over invalid error for empty required fields', () => {
            render(<TextareaInput required />);

            const textarea = screen.getByRole('textbox');
            fireEvent.invalid(textarea, { currentTarget: { value: '' } });

            waitFor(() => {
                expect(screen.getByText('Required')).toBeInTheDocument();
                expect(screen.queryByText('Invalid')).not.toBeInTheDocument();
            });
        });
    });

    describe('Warning display', () => {
        it('displays warning message with warning classes', () => {
            const { container } = render(<TextareaInput warning="Warning message" textClassName="custom-text"/>);

            expect(screen.getByText('Warning message')).toBeInTheDocument();

            const textarea = container.querySelector('textarea');
            expect(textarea).toHaveClass(styles.textareaWarning);

            const warningText = container.querySelector(`.${styles.warningText}`);
            expect(warningText).toBeInTheDocument();
            expect(warningText).toHaveClass('custom-text');
        });

    });

    describe('Info text display', () => {
        it('displays info text with info classes', () => {
            const { container } = render(<TextareaInput info="Info message" textClassName="custom-text"/>);
            const infoText = container.querySelector(`.${styles.infoText}`);

            expect(infoText).toBeInTheDocument();
            expect(infoText).toHaveClass('input-info');
            expect(infoText).toHaveClass('custom-text');

        });
    });

    describe('Additional HTML attributes', () => {
        it('passes through other HTML textarea attributes', () => {
            render(
                <TextareaInput
                    name="description"
                    maxLength={500}
                    autoComplete="off"
                    data-testid="custom-textarea"
                />,
            );

            const textarea = screen.getByRole('textbox');
            expect(textarea).toHaveAttribute('name', 'description');
            expect(textarea).toHaveAttribute('maxLength', '500');
            expect(textarea).toHaveAttribute('autoComplete', 'off');
            expect(textarea).toHaveAttribute('data-testid', 'custom-textarea');
        });

        it('applies custom rows attribute', () => {
            render(<TextareaInput rows={10} />);
            const textarea = screen.getByRole('textbox');
            expect(textarea).toHaveAttribute('rows', '10');
        });
    });

    describe('Edge cases', () => {
        it('handles both error and warning simultaneously (error takes precedence)', () => {
            const { container } = render(<TextareaInput errorMessage="Error" warning="Warning" />);

            expect(screen.getByText('Error')).toBeInTheDocument();

            const textarea = container.querySelector('textarea');
            expect(textarea).toHaveClass(styles.textareaError);
        });

        it('handles empty string values correctly', () => {
            render(<TextareaInput value="" onChange={() => {}} />);
            const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
            expect(textarea.value).toBe('');
        });

        it('handles undefined onChange gracefully', () => {
            render(<TextareaInput />);
            const textarea = screen.getByRole('textbox');

            expect(() => {
                fireEvent.change(textarea, { target: { value: 'Test' } });
            }).not.toThrow();
        });
    });
});
