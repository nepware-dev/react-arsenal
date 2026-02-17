import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach, afterEach, type Mock } from 'vitest';

import Trap, { type TrapProps } from '../../components/Trap';

const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
    if (shouldThrow) {
        throw new Error('Test error message');
    }
    return <div data-testid="normal-content">Normal content</div>;
};

describe('Trap (Error Boundary)', () => {
    let mockOnCatchError: Mock<NonNullable<TrapProps['onCatchError']>>;
    const reloadMock = vi.fn();

    beforeEach(() => {
        mockOnCatchError = vi.fn();
        vi.stubGlobal('location', { reload: reloadMock });
    });

    afterEach(() => {
        cleanup();
        vi.clearAllMocks();
        vi.unstubAllGlobals();
        vi.restoreAllMocks();
    });

    describe('Normal operation', () => {
        it('renders children correctly when no error occurs', () => {
            render(
                <Trap>
                    <div data-testid="child-1">Child 1</div>
                    <div data-testid="child-2">Child 2</div>
                    <span data-testid="child-3">Child 3</span>
                </Trap>,
            );

            expect(screen.getByTestId('child-1')).toBeInTheDocument();
            expect(screen.getByTestId('child-2')).toBeInTheDocument();
            expect(screen.getByTestId('child-3')).toBeInTheDocument();
        });

        it('does not render error UI when no error occurs', () => {
            render(
                <Trap>
                    <div>Normal content</div>
                </Trap>,
            );

            expect(screen.queryByText('Something went wrong.')).not.toBeInTheDocument();
            expect(screen.queryByText('Click to reload!')).not.toBeInTheDocument();
        });
    });

    describe('Error handling', () => {
        it('catches errors and displays error UI', () => {
            render(
                <Trap>
                    <ThrowError shouldThrow={true} />
                </Trap>,
            );

            expect(screen.getByText('Something went wrong.')).toBeInTheDocument();
            expect(
                screen.getByText('Please be patient, we are currently trying to fix the problem.'),
            ).toBeInTheDocument();
            expect(
                screen.getByText('In meanwhile you can refresh the page or wait a few minutes.'),
            ).toBeInTheDocument();
        });

        it('displays error details in details element', async () => {
            render(
                <Trap>
                    <ThrowError shouldThrow={true} />
                </Trap>,
            );

            const detailsElement = screen.getByRole('group');
            expect(detailsElement).toBeInTheDocument();
            expect(screen.getByText(/Test error message/i)).toBeInTheDocument();
        });

        it('calls onCatchError callback when error is caught', () => {
            render(
                <Trap onCatchError={mockOnCatchError}>
                    <ThrowError shouldThrow={true} />
                </Trap>,
            );

            expect(mockOnCatchError).toHaveBeenCalledTimes(1);
            expect(mockOnCatchError).toHaveBeenCalledWith(
                expect.any(Error),
                expect.objectContaining({
                    componentStack: expect.any(String),
                }),
            );

            const [error, errorInfo] = mockOnCatchError.mock.calls[0];
            expect(error.message).toBe('Test error message');
            expect(errorInfo.componentStack).toBeDefined();
        });

        it('does not call onCatchError when no callback is provided', () => {
            expect(() => {
                render(
                    <Trap>
                        <ThrowError shouldThrow={true} />
                    </Trap>,
                );
            }).not.toThrow();
        });
    });

    describe('Refresh functionality', () => {
        it('calls window.location.reload when refresh button is clicked', () => {
            render(
                <Trap>
                    <ThrowError shouldThrow={true} />
                </Trap>,
            );

            const reloadButton = screen.getByText('Click to reload!');
            fireEvent.click(reloadButton);

            expect(reloadMock).toHaveBeenCalledTimes(1);
        });
    });

    describe('Error boundary behavior', () => {
        it('switches from normal render to error render when child throws', () => {
            const { rerender } = render(
                <Trap>
                    <ThrowError shouldThrow={false} />
                </Trap>,
            );

            expect(screen.getByTestId('normal-content')).toBeInTheDocument();
            expect(screen.queryByText('Something went wrong.')).not.toBeInTheDocument();

            rerender(
                <Trap>
                    <ThrowError shouldThrow={true} />
                </Trap>,
            );

            expect(screen.queryByTestId('normal-content')).not.toBeInTheDocument();
            expect(screen.getByText('Something went wrong.')).toBeInTheDocument();
        });

        it('handles errors in deeply nested components', () => {
            const DeepChild = () => {
                throw new Error('Deep error');
            };

            render(
                <Trap onCatchError={mockOnCatchError}>
                    <div>
                        <div>
                            <div>
                                <DeepChild />
                            </div>
                        </div>
                    </div>
                </Trap>,
            );

            expect(screen.getByText('Something went wrong.')).toBeInTheDocument();
            expect(mockOnCatchError).toHaveBeenCalledWith(
                expect.objectContaining({ message: 'Deep error' }),
                expect.any(Object),
            );
        });

        it('shows component stack in error info', () => {
            render(
                <Trap>
                    <ThrowError shouldThrow={true} />
                </Trap>,
            );

            const detailsElement = screen.getByRole('group');
            expect(detailsElement).toBeInTheDocument();
            expect(detailsElement?.textContent).toMatch(/ThrowError/);
        });
    });

    describe('Edge cases', () => {
        it('handles errors with empty error messages', () => {
            const EmptyErrorChild = () => {
                throw new Error('');
            };

            render(
                <Trap>
                    <EmptyErrorChild />
                </Trap>,
            );

            expect(screen.getByText('Something went wrong.')).toBeInTheDocument();
        });

        it('handles null/undefined children gracefully', () => {
            expect(() => {
                render(
                    <Trap>
                        {null}
                        {undefined}
                    </Trap>,
                );
            }).not.toThrow();
        });

        it('preserves error state after props change', () => {
            const { rerender } = render(
                <Trap onCatchError={mockOnCatchError}>
                    <ThrowError shouldThrow={true} />
                </Trap>,
            );

            expect(screen.getByText('Something went wrong.')).toBeInTheDocument();

            rerender(
                <Trap onCatchError={vi.fn()}>
                    <div>Different content</div>
                </Trap>,
            );

            expect(screen.getByText('Something went wrong.')).toBeInTheDocument();
        });
    });
});
