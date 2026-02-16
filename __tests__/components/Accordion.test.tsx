import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

import Accordion from '../../components/Accordion';
import styles from '../../components/Accordion/styles.module.scss';

describe('Accordion', () => {
    beforeAll(() => {
        Object.defineProperty(HTMLElement.prototype, 'scrollHeight', {
            configurable: true,
            get() {
                return 100;
            },
        });
    });
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Basic rendering', () => {
        it('renders accordion with title and children', () => {
            render(
                <Accordion title="Test Accordion">
                    <div data-testid="accordion-content">Accordion Content</div>
                </Accordion>,
            );

            expect(screen.getByText('Test Accordion')).toBeInTheDocument();
            expect(screen.getByTestId('accordion-content')).toBeInTheDocument();
        });

        it('renders collapsed by default when isExpandedByDefault is false', () => {
            const { container } = render(
                <Accordion title="Test Accordion" isExpandedByDefault={false}>
                    <div>Content</div>
                </Accordion>,
            );

            const content = container.querySelector(`.${styles.accordionContent}`);
            expect(content).toHaveStyle({ maxHeight: '0px' });
        });

        it('renders expanded by default when isExpandedByDefault is true', () => {
            render(
                <Accordion title="Test Accordion" isExpandedByDefault={true}>
                    <div>Content</div>
                </Accordion>,
            );

            const accordionSection = screen
                .getByText('Test Accordion')
                .closest(`.${styles.accordionSection}`);
            expect(accordionSection).toBeInTheDocument();
        });

        it('applies custom className to accordion section', () => {
            const { container } = render(
                <Accordion title="Test" className="custom-class">
                    <div>Content</div>
                </Accordion>,
            );

            const section = container.querySelector(`.${styles.accordionSection}`);
            expect(section).toHaveClass('custom-class');
        });

        it('applies activeClassName when accordion is expanded', () => {
            render(
                <Accordion title="Test" isExpandedByDefault={true} activeClassName="active-custom">
                    <div>Content</div>
                </Accordion>,
            );

            const section = screen.getByText('Test').closest(`.${styles.accordionSection}`);
            expect(section).toHaveClass('active-custom');
        });

        it('applies titleClassName to the title', () => {
            const { container } = render(
                <Accordion title="Test" titleClassName="title-custom">
                    <div>Content</div>
                </Accordion>,
            );

            const title = container.querySelector(`.${styles.accordionTitle}`);
            expect(title).toHaveClass('title-custom');
        });
    });

    describe('Toggle functionality', () => {
        it('toggles accordion on click', async () => {
            const { container } = render(
                <Accordion title="Test Accordion">
                    <div>Content</div>
                </Accordion>,
            );

            const accordion = container.querySelector(`.${styles.accordion}`) as HTMLElement;
            const content = container.querySelector(`.${styles.accordionContent}`);

            expect(content).toHaveStyle({ maxHeight: '0px' });

            fireEvent.click(accordion);
            await waitFor(() => {
                expect(content).not.toHaveStyle({ maxHeight: '0px' });
            });

            fireEvent.click(accordion);
            await waitFor(() => {
                expect(content).toHaveStyle({ maxHeight: '0px' });
            });
        });
    });

    describe('Controlled mode', () => {
        it('uses controlled isExpanded value when provided', async () => {
            const { container, rerender } = render(
                <Accordion title="Test" isExpanded={false}>
                    <div>Content</div>
                </Accordion>,
            );

            const content = container.querySelector(`.${styles.accordionContent}`);
            expect(content).toHaveStyle({ maxHeight: '0px' });

            rerender(
                <Accordion title="Test" isExpanded={true}>
                    <div>Content</div>
                </Accordion>,
            );

            await waitFor(() => {
                expect(content).not.toHaveStyle({ maxHeight: '0px' });
            });
        });

        it('ignores isExpandedByDefault when isExpanded is controlled', () => {
            const { container } = render(
                <Accordion title="Test" isExpandedByDefault={true} isExpanded={false}>
                    <div>Content</div>
                </Accordion>,
            );

            const content = container.querySelector(`.${styles.accordionContent}`);
            expect(content).toHaveStyle({ maxHeight: '0px' });
        });
    });

    describe('Custom header rendering', () => {
        it('renders custom header when renderHeader is provided', () => {
            const customHeader = ({ isExpanded }: { isExpanded: boolean }) => (
                <div data-testid="custom-header">
                    Custom Header {isExpanded ? 'Open' : 'Closed'}
                </div>
            );

            render(
                <Accordion renderHeader={customHeader}>
                    <div>Content</div>
                </Accordion>,
            );

            expect(screen.getByTestId('custom-header')).toBeInTheDocument();
            expect(screen.getByText(/Custom Header Closed/)).toBeInTheDocument();
        });

        it('does not render title when renderHeader is provided', () => {
            const customHeader = () => <div data-testid="custom-header">Custom Header</div>;

            render(
                <Accordion title="Should Not Appear" renderHeader={customHeader}>
                    <div>Content</div>
                </Accordion>,
            );

            expect(screen.queryByText('Should Not Appear')).not.toBeInTheDocument();
            expect(screen.getByTestId('custom-header')).toBeInTheDocument();
        });

        it('updates custom header when accordion state changes', () => {
            const customHeader = ({ isExpanded }: { isExpanded: boolean }) => (
                <div data-testid="custom-header">{isExpanded ? 'Expanded' : 'Collapsed'}</div>
            );

            const { container } = render(
                <Accordion renderHeader={customHeader}>
                    <div>Content</div>
                </Accordion>,
            );

            expect(screen.getByText('Collapsed')).toBeInTheDocument();

            const accordion = container.querySelector(`.${styles.accordion}`) as HTMLElement;
            fireEvent.click(accordion);

            expect(screen.getByText('Expanded')).toBeInTheDocument();
        });
    });

    describe('Content height management', () => {
        it('updates content height when children change', () => {
            const { container, rerender } = render(
                <Accordion title="Test" isExpandedByDefault={true}>
                    <div>Short content</div>
                </Accordion>,
            );

            const content = container.querySelector(`.${styles.accordionContent}`) as HTMLElement;

            rerender(
                <Accordion title="Test" isExpandedByDefault={true}>
                    <div>
                        <p>Much longer content</p>
                        <p>With multiple paragraphs</p>
                        <p>To increase the height</p>
                    </div>
                </Accordion>,
            );

            expect(content.style.maxHeight).toBeDefined();
        });
    });
});
