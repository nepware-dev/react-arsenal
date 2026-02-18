import { describe, it, expect, vi, beforeEach, afterEach, type Mock } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';

import Tabs, { Tab } from '../../components/Tabs';
import * as ScrollUtils from '../../utils';

interface MockIntersectionObserver {
    observe: Mock;
    unobserve: Mock;
    disconnect: Mock;
}

const mockScrollToElement = vi.spyOn(ScrollUtils, 'scrollToElement');

describe('Tabs', () => {
    let mockIntersectionObserver: MockIntersectionObserver;

    beforeEach(() => {
        vi.clearAllMocks();

        mockIntersectionObserver = {
            observe: vi.fn(),
            unobserve: vi.fn(),
            disconnect: vi.fn(),
        };

        const MockObserver = vi.fn().mockImplementation(function () {
            return {
                observe: mockIntersectionObserver.observe,
                unobserve: mockIntersectionObserver.unobserve,
                disconnect: mockIntersectionObserver.disconnect,
                takeRecords: vi.fn(),
                root: null,
                rootMargin: '',
                thresholds: [],
            };
        });

        vi.stubGlobal('IntersectionObserver', MockObserver);
    });

    afterEach(() => {
        cleanup();
        vi.clearAllMocks();
        vi.unstubAllGlobals();
    });

    describe('Basic rendering', () => {
        it('renders tabs with children', () => {
            render(
                <Tabs>
                    <Tab label="tab1" title="Tab 1">
                        <div>Content 1</div>
                    </Tab>
                    <Tab label="tab2" title="Tab 2">
                        <div>Content 2</div>
                    </Tab>
                    <Tab label="tab3" title="Tab 3">
                        <div>Content 3</div>
                    </Tab>
                </Tabs>,
            );

            expect(screen.getByText('Tab 1')).toBeInTheDocument();
            expect(screen.getByText('Tab 2')).toBeInTheDocument();
            expect(screen.getByText('Tab 3')).toBeInTheDocument();
        });

        it('renders first tab content by default', () => {
            render(
                <Tabs>
                    <Tab label="tab1" title="Tab 1">
                        <div>Content 1</div>
                    </Tab>
                    <Tab label="tab2" title="Tab 2">
                        <div>Content 2</div>
                    </Tab>
                </Tabs>,
            );

            expect(screen.getByText('Content 1')).toBeInTheDocument();
            expect(screen.queryByText('Content 2')).not.toBeInTheDocument();
        });
    });

    describe('Tab switching (uncontrolled)', () => {
        it('switches tabs on click', () => {
            render(
                <Tabs>
                    <Tab label="tab1" title="Tab 1">
                        <div>Content 1</div>
                    </Tab>
                    <Tab label="tab2" title="Tab 2">
                        <div>Content 2</div>
                    </Tab>
                    <Tab label="tab3" title="Tab 3">
                        <div>Content 3</div>
                    </Tab>
                </Tabs>,
            );

            expect(screen.getByText('Content 1')).toBeInTheDocument();
            expect(screen.queryByText('Content 2')).not.toBeInTheDocument();

            fireEvent.click(screen.getByText('Tab 2'));

            expect(screen.queryByText('Content 1')).not.toBeInTheDocument();
            expect(screen.getByText('Content 2')).toBeInTheDocument();

            fireEvent.click(screen.getByText('Tab 3'));

            expect(screen.queryByText('Content 2')).not.toBeInTheDocument();
            expect(screen.getByText('Content 3')).toBeInTheDocument();
        });

        it('calls onChange when tab is switched', () => {
            const onChange = vi.fn();

            render(
                <Tabs onChange={onChange}>
                    <Tab label="tab1" title="Tab 1">
                        <div>Content 1</div>
                    </Tab>
                    <Tab label="tab2" title="Tab 2">
                        <div>Content 2</div>
                    </Tab>
                </Tabs>,
            );

            fireEvent.click(screen.getByText('Tab 2'));

            expect(onChange).toHaveBeenCalledWith({
                activeTab: 'tab2',
                previousTab: 'tab1',
            });
        });
    });

    describe('Default active tab', () => {
        it('uses defaultActiveTab prop when provided', () => {
            render(
                <Tabs defaultActiveTab="tab2">
                    <Tab label="tab1" title="Tab 1">
                        <div>Content 1</div>
                    </Tab>
                    <Tab label="tab2" title="Tab 2">
                        <div>Content 2</div>
                    </Tab>
                    <Tab label="tab3" title="Tab 3">
                        <div>Content 3</div>
                    </Tab>
                </Tabs>,
            );

            expect(screen.queryByText('Content 1')).not.toBeInTheDocument();
            expect(screen.getByText('Content 2')).toBeInTheDocument();
            expect(screen.queryByText('Content 3')).not.toBeInTheDocument();
        });
    });

    describe('Controlled tabs', () => {
        it('uses activeTab prop when provided (controlled mode)', () => {
            const { rerender } = render(
                <Tabs activeTab="tab1">
                    <Tab label="tab1" title="Tab 1">
                        <div>Content 1</div>
                    </Tab>
                    <Tab label="tab2" title="Tab 2">
                        <div>Content 2</div>
                    </Tab>
                </Tabs>,
            );

            expect(screen.getByText('Content 1')).toBeInTheDocument();

            rerender(
                <Tabs activeTab="tab2">
                    <Tab label="tab1" title="Tab 1">
                        <div>Content 1</div>
                    </Tab>
                    <Tab label="tab2" title="Tab 2">
                        <div>Content 2</div>
                    </Tab>
                </Tabs>,
            );

            expect(screen.queryByText('Content 1')).not.toBeInTheDocument();
            expect(screen.getByText('Content 2')).toBeInTheDocument();
        });

        it('does not change tabs on click in controlled mode', () => {
            const onChange = vi.fn();

            render(
                <Tabs activeTab="tab1" onChange={onChange}>
                    <Tab label="tab1" title="Tab 1">
                        <div>Content 1</div>
                    </Tab>
                    <Tab label="tab2" title="Tab 2">
                        <div>Content 2</div>
                    </Tab>
                </Tabs>,
            );

            expect(screen.getByText('Content 1')).toBeInTheDocument();

            fireEvent.click(screen.getByText('Tab 2'));

            expect(onChange).toHaveBeenCalledWith({
                activeTab: 'tab2',
                previousTab: 'tab1',
            });

            expect(screen.getByText('Content 1')).toBeInTheDocument();
        });
    });

    describe('Custom render header', () => {
        it('uses custom renderHeader when provided', () => {
            const renderHeader = vi.fn(({ title, active }) => (
                <div className={active ? 'custom-active' : 'custom-inactive'}>Custom: {title}</div>
            ));

            render(
                <Tabs renderHeader={renderHeader}>
                    <Tab label="tab1" title="Tab 1">
                        <div>Content 1</div>
                    </Tab>
                    <Tab label="tab2" title="Tab 2">
                        <div>Content 2</div>
                    </Tab>
                </Tabs>,
            );

            expect(screen.getByText('Custom: Tab 1')).toBeInTheDocument();
            expect(screen.getByText('Custom: Tab 2')).toBeInTheDocument();
            expect(renderHeader).toHaveBeenCalled();
        });
    });

    describe('Pre and Post Header Components', () => {
        it('renders both Pre and Post Header Components', () => {
            const PreHeader = () => <div>Before Tabs</div>;
            const PostHeader = () => <div>After Tabs</div>;

            render(
                <Tabs PreHeaderComponent={PreHeader} PostHeaderComponent={PostHeader}>
                    <Tab label="tab1" title="Tab 1">
                        <div>Content 1</div>
                    </Tab>
                </Tabs>,
            );

            expect(screen.getByText('Before Tabs')).toBeInTheDocument();
            expect(screen.getByText('After Tabs')).toBeInTheDocument();
        });
    });

    describe('Scroll mode', () => {
        it('calls scrollToElement when tab is clicked in scroll mode', () => {
            render(
                <Tabs mode="scroll">
                    <Tab label="tab1" title="Tab 1">
                        <div style={{ height: '500px' }}>Content 1</div>
                    </Tab>
                    <Tab label="tab2" title="Tab 2">
                        <div style={{ height: '200px' }}>Content 2</div>
                    </Tab>
                </Tabs>,
            );

            fireEvent.click(screen.getByText('Tab 2'));

            expect(mockScrollToElement).toHaveBeenCalled();
        });

        it('renders all tab content in scroll mode', () => {
            render(
                <Tabs mode="scroll">
                    <Tab label="tab1" title="Tab 1">
                        <div>Content 1</div>
                    </Tab>
                    <Tab label="tab2" title="Tab 2">
                        <div>Content 2</div>
                    </Tab>
                    <Tab label="tab3" title="Tab 3">
                        <div>Content 3</div>
                    </Tab>
                </Tabs>,
            );

            expect(screen.getByText('Content 1')).toBeInTheDocument();
            expect(screen.getByText('Content 2')).toBeInTheDocument();
            expect(screen.getByText('Content 3')).toBeInTheDocument();
        });
    });

    describe('DisableUnmount prop', () => {
        it('keeps inactive tab content in DOM when disableUnmount is true', () => {
            render(
                <Tabs disableUnmount>
                    <Tab label="tab1" title="Tab 1">
                        <div>Content 1</div>
                    </Tab>
                    <Tab label="tab2" title="Tab 2">
                        <div>Content 2</div>
                    </Tab>
                </Tabs>,
            );

            expect(screen.getByText('Content 1')).toBeInTheDocument();
            expect(screen.getByText('Content 2')).toBeInTheDocument();

            const content2Parent = screen.getByText('Content 2').parentElement;
            expect(content2Parent).toHaveStyle({ display: 'none' });
        });

        it('shows active tab content when disableUnmount is true', () => {
            render(
                <Tabs disableUnmount>
                    <Tab label="tab1" title="Tab 1">
                        <div>Content 1</div>
                    </Tab>
                    <Tab label="tab2" title="Tab 2">
                        <div>Content 2</div>
                    </Tab>
                </Tabs>,
            );

            const content1Parent = screen.getByText('Content 1').parentElement;
            expect(content1Parent).not.toHaveStyle({ display: 'none' });
        });
    });

    describe('Edge cases', () => {
        it('handles empty children gracefully', () => {
            expect(() => {
                render(<Tabs>{[]}</Tabs>);
            }).not.toThrow();
        });

        it('handles tab click with missing label attribute', () => {
            const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

            const { container } = render(
                <Tabs>
                    <Tab label="tab1" title="Tab 1">
                        <div>Content 1</div>
                    </Tab>
                </Tabs>,
            );

            const tabHeader = container.querySelector('[label="tab1"]');
            if (tabHeader) {
                tabHeader.removeAttribute('label');
                fireEvent.click(tabHeader);
            }

            expect(consoleWarnSpy).toHaveBeenCalledWith(
                'Selected tab does not have a label attribute',
            );

            consoleWarnSpy.mockRestore();
        });

        it('handles multiple rapid tab switches', () => {
            render(
                <Tabs>
                    <Tab label="tab1" title="Tab 1">
                        <div>Content 1</div>
                    </Tab>
                    <Tab label="tab2" title="Tab 2">
                        <div>Content 2</div>
                    </Tab>
                    <Tab label="tab3" title="Tab 3">
                        <div>Content 3</div>
                    </Tab>
                </Tabs>,
            );

            fireEvent.click(screen.getByText('Tab 2'));
            fireEvent.click(screen.getByText('Tab 3'));
            fireEvent.click(screen.getByText('Tab 1'));

            expect(screen.getByText('Content 1')).toBeInTheDocument();
        });

        it('maintains tab state when switching back and forth', () => {
            render(
                <Tabs disableUnmount>
                    <Tab label="tab1" title="Tab 1">
                        <input data-testid="input1" defaultValue="test1" />
                    </Tab>
                    <Tab label="tab2" title="Tab 2">
                        <input data-testid="input2" defaultValue="test2" />
                    </Tab>
                </Tabs>,
            );

            const input1 = screen.getByTestId('input1') as HTMLInputElement;
            fireEvent.change(input1, { target: { value: 'changed' } });

            expect(input1.value).toBe('changed');

            fireEvent.click(screen.getByText('Tab 2'));
            fireEvent.click(screen.getByText('Tab 1'));

            expect((screen.getByTestId('input1') as HTMLInputElement).value).toBe('changed');
        });
    });

    describe('Tab component', () => {
        it('Tab component returns null when used standalone', () => {
            const { container } = render(<Tab label="tab1" title="Tab 1" />);

            expect(container.firstChild).toBeNull();
        });
    });
});
