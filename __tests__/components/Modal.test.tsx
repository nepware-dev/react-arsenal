import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import { userEvent } from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import Modal from '../../components/Modal';

describe('Modal', () => {
    const mockOnClose = vi.fn();

    beforeEach(() => {
        document.body.style.overflow = '';
        vi.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
        document.body.style.overflow = '';
    });

    describe('Basic rendering', () => {
        it('renders modal with children when isVisible is true', () => {
            render(
                <Modal isVisible={true} onClose={mockOnClose}>
                    <div data-testid="modal-content">Modal Content</div>
                </Modal>,
            );

            expect(screen.getByTestId('modal-content')).toBeInTheDocument();
            expect(screen.getByText('Modal Content')).toBeInTheDocument();
        });

        it('does not render modal when isVisible is false', () => {
            render(
                <Modal isVisible={false} onClose={mockOnClose}>
                    <div data-testid="modal-content">Modal Content</div>
                </Modal>,
            );

            expect(screen.queryByTestId('modal-content')).not.toBeInTheDocument();
        });

        it('renders with custom className and overlayClassName', () => {
            render(
                <Modal
                    isVisible={true}
                    className="custom-modal"
                    overlayClassName="custom-overlay"
                    onClose={mockOnClose}
                >
                    <div data-testid="modal-content">Modal Content</div>
                </Modal>,
            );

            const modal = screen.getByTestId('modal-content').closest('.modal');
            expect(modal).toHaveClass('custom-modal');

            const overlay = screen.getByTestId('modal-content').closest('.overlay');
            expect(overlay).toHaveClass('custom-overlay');
        });
    });

    describe('Focus lock functionality', () => {
        it('should trap focus within the modal and prevent background interaction', async () => {
            const user = userEvent.setup();
            const onClose = vi.fn();

            const { rerender } = render(
                <div>
                    <button data-testid="bg-btn-1">Background 1</button>
                    <Modal isVisible={true} onClose={onClose}>
                        <button data-testid="modal-btn-1">Inside Modal 1</button>
                    </Modal>
                </div>,
            );

            const modalBtn1 = screen.getByTestId('modal-btn-1');
            const bgBtn1 = screen.getByTestId('bg-btn-1');

            expect(modalBtn1).toHaveFocus();

            await user.tab();
            expect(bgBtn1).not.toHaveFocus();

            await user.tab();
            expect(bgBtn1).not.toHaveFocus();

            rerender(
                <div>
                    <button data-testid="bg-btn-1">Background 1</button>
                    <Modal isVisible={false} onClose={onClose}>
                        <button data-testid="modal-btn-1">Inside Modal 1</button>
                    </Modal>
                </div>,
            );

            expect(modalBtn1).not.toHaveFocus();
        });
    });

    describe('Body scroll management', () => {
        it('disables body scrolling when modal is mounted', () => {
            const { unmount } = render(
                <Modal isVisible={true} onClose={mockOnClose}>
                    <div>Modal Content</div>
                </Modal>,
            );

            expect(document.body.style.overflow).toBe('hidden');

            unmount();
            expect(document.body.style.overflow).toBe('');
        });

        it('does not affect body scrolling when not visible', () => {
            const originalOverflow = document.body.style.overflow;

            render(
                <Modal isVisible={false} onClose={mockOnClose}>
                    <div>Modal Content</div>
                </Modal>,
            );

            expect(document.body.style.overflow).toBe(originalOverflow);
        });

       it('handles multiple modals correctly', () => {
            const { unmount: unmount1, getByText: getByText1 } = render(
                <Modal isVisible={true} onClose={mockOnClose}>
                    <div>Modal 1</div>
                </Modal>,
            );

            expect(getByText1('Modal 1')).toBeInTheDocument();
            expect(document.body.style.overflow).toBe('hidden');

            const { unmount: unmount2, getByText: getByText2 } = render(
                <Modal isVisible={true} onClose={mockOnClose}>
                    <div>Modal 2</div>
                </Modal>,
            );

            expect(getByText2('Modal 2')).toBeInTheDocument();
            expect(document.body.style.overflow).toBe('hidden');

            unmount1();
            unmount2();
        });
    });

    describe('Escape key functionality', () => {
        it('calls onClose with escape: true when Escape is pressed and closeOnEscape is true', () => {
            render(
                <Modal isVisible={true} closeOnEscape={true} onClose={mockOnClose}>
                    <div data-testid="modal-content">Modal Content</div>
                </Modal>,
            );

            fireEvent.keyDown(document, { key: 'Escape' });

            expect(mockOnClose).toHaveBeenCalledWith({ escape: true });
            expect(mockOnClose).toHaveBeenCalledTimes(1);
        });

        it('does not call onClose when Escape is pressed and closeOnEscape is undefined', () => {
            render(
                <Modal isVisible={true} onClose={mockOnClose}>
                    <div data-testid="modal-content">Modal Content</div>
                </Modal>,
            );

            fireEvent.keyDown(document, { key: 'Escape' });

            expect(mockOnClose).not.toHaveBeenCalled();
        });

        it('does not call onClose when other keys are pressed', () => {
            render(
                <Modal isVisible={true} closeOnEscape={true} onClose={mockOnClose}>
                    <div data-testid="modal-content">Modal Content</div>
                </Modal>,
            );

            fireEvent.keyDown(document, { key: 'Enter' });
            fireEvent.keyDown(document, { key: 'Space' });
            fireEvent.keyDown(document, { key: 'Tab' });

            expect(mockOnClose).not.toHaveBeenCalled();
        });
    });

    describe('Outside click functionality', () => {
        it('calls onClose with outsideClick: true when clicking outside modal and closeOnOutsideClick is true', () => {
            render(
                <Modal isVisible={true} closeOnOutsideClick={true} onClose={mockOnClose}>
                    <div data-testid="modal-content">Modal Content</div>
                </Modal>,
            );

            fireEvent.mouseDown(document.body);

            expect(mockOnClose).toHaveBeenCalledWith({ outsideClick: true });
            expect(mockOnClose).toHaveBeenCalledTimes(1);
        });

        it('does not call onClose when clicking inside the modal', () => {
            render(
                <Modal isVisible={true} closeOnOutsideClick={true} onClose={mockOnClose}>
                    <div data-testid="modal-content">Modal Content</div>
                </Modal>,
            );

            const modalContent = screen.getByTestId('modal-content');
            fireEvent.mouseDown(modalContent);

            expect(mockOnClose).not.toHaveBeenCalled();
        });

        it('does not call onClose when clicking outside and closeOnOutsideClick is undefined', () => {
            render(
                <Modal isVisible={true} onClose={mockOnClose}>
                    <div data-testid="modal-content">Modal Content</div>
                </Modal>,
            );

            fireEvent.mouseDown(document.body);

            expect(mockOnClose).not.toHaveBeenCalled();
        });
    });

    describe('Event listener management', () => {
        it('adds event listeners when modal is mounted', () => {
            const addEventListenerSpy = vi.spyOn(document, 'addEventListener');

            render(
                <Modal isVisible={true} onClose={mockOnClose}>
                    <div>Modal Content</div>
                </Modal>,
            );

            expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
            expect(addEventListenerSpy).toHaveBeenCalledWith('mousedown', expect.any(Function));

            addEventListenerSpy.mockRestore();
        });

        it('removes event listeners when modal is unmounted', () => {
            const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener');

            const { unmount } = render(
                <Modal isVisible={true} onClose={mockOnClose}>
                    <div>Modal Content</div>
                </Modal>,
            );

            unmount();

            expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
            expect(removeEventListenerSpy).toHaveBeenCalledWith('mousedown', expect.any(Function));

            removeEventListenerSpy.mockRestore();
        });
    });

    describe('Props combination scenarios', () => {
        it('works with both closeOnEscape and closeOnOutsideClick enabled', () => {
            render(
                <Modal
                    isVisible={true}
                    closeOnEscape={true}
                    closeOnOutsideClick={true}
                    onClose={mockOnClose}
                >
                    <div data-testid="modal-content">Modal Content</div>
                </Modal>,
            );

            fireEvent.keyDown(document, { key: 'Escape' });
            expect(mockOnClose).toHaveBeenCalledWith({ escape: true });

            mockOnClose.mockClear();

            fireEvent.mouseDown(document.body);
            expect(mockOnClose).toHaveBeenCalledWith({ outsideClick: true });
        });
    });

    describe('Edge cases', () => {
        it('handles rapid mount/unmount cycles correctly', () => {
            const { unmount } = render(
                <Modal isVisible={true} onClose={mockOnClose}>
                    <div>Modal Content</div>
                </Modal>,
            );

            expect(document.body.style.overflow).toBe('hidden');

            unmount();
            expect(document.body.style.overflow).toBe('');

            render(
                <Modal isVisible={true} onClose={mockOnClose}>
                    <div>Modal Content 2</div>
                </Modal>,
            );

            expect(document.body.style.overflow).toBe('hidden');
        });

        it('handles visibility changes correctly', () => {
            const { rerender } = render(
                <Modal isVisible={true} onClose={mockOnClose}>
                    <div data-testid="modal-content">Modal Content</div>
                </Modal>,
            );

            expect(screen.getByTestId('modal-content')).toBeInTheDocument();

            rerender(
                <Modal isVisible={false} onClose={mockOnClose}>
                    <div data-testid="modal-content">Modal Content</div>
                </Modal>,
            );

            expect(screen.queryByTestId('modal-content')).not.toBeInTheDocument();

            rerender(
                <Modal isVisible={true} onClose={mockOnClose}>
                    <div data-testid="modal-content">Modal Content</div>
                </Modal>,
            );

            expect(screen.getByTestId('modal-content')).toBeInTheDocument();
        });

        it('handles complex children structures', () => {
            render(
                <Modal isVisible={true} onClose={mockOnClose}>
                    <div data-testid="modal-content">
                        <h1>Modal Title</h1>
                        <p>Modal description</p>
                        <button type="button">Action Button</button>
                        <div>
                            <span>Nested content</span>
                            <ul>
                                <li>List item 1</li>
                                <li>List item 2</li>
                            </ul>
                        </div>
                    </div>
                </Modal>,
            );

            expect(screen.getByText('Modal Title')).toBeInTheDocument();
            expect(screen.getByText('Modal description')).toBeInTheDocument();
            expect(screen.getByText('Action Button')).toBeInTheDocument();
            expect(screen.getByText('Nested content')).toBeInTheDocument();
            expect(screen.getByText('List item 1')).toBeInTheDocument();
            expect(screen.getByText('List item 2')).toBeInTheDocument();
        });
    });
});
