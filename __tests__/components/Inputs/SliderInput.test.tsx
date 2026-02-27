import { render, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';

import SliderInput from '../../../components/Form/SliderInput';
import styles from '../../../components/Form/SliderInput/styles.module.scss';
import { ListRenderItem } from '../../../components/List';

describe('SliderInput', () => {
    describe('Basic rendering', () => {
        it('renders slider component with default props', () => {
            const { container } = render(<SliderInput />);
            const sliderContainer = container.querySelector(`.${styles.container}`);
            const track = container.querySelector(`.${styles.track}`);
            const thumb = container.querySelector(`.${styles.thumb}`);

            expect(sliderContainer).toBeInTheDocument();
            expect(track).toBeInTheDocument();
            expect(thumb).toBeInTheDocument();
        });

        it('renders with custom containerClassName and style', () => {
            const marks = [0, 5, 10];

            const customStyle = { width: '300px', backgroundColor: '#2e7d32' };

            const renderMark: ListRenderItem<number> = ({ item }) => (
                <span className="custom-mark">{item}%</span>
            );

            const { container } = render(
                <SliderInput
                    marks={marks}
                    containerClassName="custom-container"
                    containerStyle={customStyle}
                    tooltipClassName="custom-tooltip"
                    marksContainerClassName="custom-marks"
                    renderMark={renderMark}
                    showTooltip
                />,
            );
            const sliderContainer = container.querySelector(`.${styles.container}`) as HTMLElement;
            const tooltip = container.querySelector(`.${styles.tooltip}`);
            const marksContainer = container.querySelector(`.${styles.marks}`);
            const customMarks = container.querySelectorAll('.custom-mark');

            expect(sliderContainer).toHaveClass('custom-container');
            expect(sliderContainer).toHaveClass(styles.container);
            expect(sliderContainer).toHaveStyle({ width: '300px', backgroundColor: '#2e7d32' });

            expect(tooltip).toHaveClass('custom-tooltip');
            expect(tooltip).toHaveClass(styles.tooltip);

            expect(marksContainer).toHaveClass('custom-marks');

            expect(customMarks).toHaveLength(3);
            expect(customMarks[0]).toHaveTextContent('0%');
        });

        it('applies y-axis classes when axis is y', () => {
            const { container } = render(<SliderInput axis="y" />);
            const track = container.querySelector(`.${styles.track}`);
            const thumb = container.querySelector(`.${styles.thumb}`);

            expect(track).toHaveClass(styles.trackY);
            expect(thumb).toHaveClass(styles.thumbY);
        });
    });

    describe('Default value and controlled behavior', () => {
        it('uses default value when provided', () => {
            const { container } = render(<SliderInput defaultValue={7} inputRange={[0, 10]} />);
            const thumb = container.querySelector('[role="slider"]');

            expect(thumb).toBeInTheDocument();
        });

        it('respects controlled value prop', () => {
            const { container } = render(<SliderInput value={8} inputRange={[0, 10]} />);
            const thumb = container.querySelector('[role="slider"]');

            expect(thumb).toBeInTheDocument();
        });

        it('updates when controlled value changes', () => {
            const { container, rerender } = render(<SliderInput value={5} inputRange={[0, 10]} />);

            rerender(<SliderInput value={8} inputRange={[0, 10]} />);
            const thumb = container.querySelector('[role="slider"]');

            expect(thumb).toBeInTheDocument();
        });
    });

    describe('onChange handling', () => {
        it('calls onChange when value changes via keyboard', () => {
            const handleChange = vi.fn();
            const { container } = render(
                <SliderInput
                    name="test-slider"
                    onChange={handleChange}
                    defaultValue={5}
                    step={1}
                    inputRange={[0, 10]}
                />,
            );
            const thumb = container.querySelector('[role="slider"]') as HTMLElement;

            thumb.focus();
            fireEvent.keyDown(thumb, { key: 'ArrowRight' });

            expect(handleChange).toHaveBeenCalled();
            expect(handleChange.mock.calls[0][0]).toEqual({
                name: 'test-slider',
                value: 6,
            });
        });
    });

    describe('Keyboard navigation', () => {
        it('updates value with arrow keys', () => {
            const handleChange = vi.fn();
            const { container } = render(
                <SliderInput
                    onChange={handleChange}
                    defaultValue={5}
                    step={1}
                    inputRange={[0, 10]}
                />,
            );
            const thumb = container.querySelector('[role="slider"]') as HTMLElement;

            thumb.focus();
            fireEvent.keyDown(thumb, { key: 'ArrowRight' });
            expect(handleChange).toHaveBeenCalledWith({
                name: undefined,
                value: 6,
            });

            fireEvent.keyDown(thumb, { key: 'ArrowLeft' });
            expect(handleChange).toHaveBeenCalledWith({
                name: undefined,
                value: 5,
            });

            fireEvent.keyDown(thumb, { key: 'ArrowUp' });
            expect(handleChange).toHaveBeenCalledWith({
                name: undefined,
                value: 6,
            });

            fireEvent.keyDown(thumb, { key: 'ArrowDown' });
            expect(handleChange).toHaveBeenCalledWith({
                name: undefined,
                value: 5,
            });

            fireEvent.keyDown(thumb, { key: 'Home' });
            expect(handleChange).toHaveBeenCalledWith({
                name: undefined,
                value: 0,
            });

            fireEvent.keyDown(thumb, { key: 'End' });
            expect(handleChange).toHaveBeenCalledWith({
                name: undefined,
                value: 10,
            });
        });

        it('respects reverse direction for keyboard navigation', () => {
            const handleChange = vi.fn();
            const { container } = render(
                <SliderInput
                    onChange={handleChange}
                    defaultValue={5}
                    step={1}
                    inputRange={[0, 10]}
                    reverse={true}
                />,
            );
            const thumb = container.querySelector('[role="slider"]') as HTMLElement;

            thumb.focus();
            fireEvent.keyDown(thumb, { key: 'ArrowRight' });

            expect(handleChange).toHaveBeenCalledWith({
                name: undefined,
                value: 4,
            });
        });
    });

    describe('Mouse interaction', () => {
        it('updates value when clicking on track', () => {
            const handleChange = vi.fn();
            const { container } = render(
                <SliderInput onChange={handleChange} step={1} inputRange={[0, 10]} />,
            );
            const sliderContainer = container.querySelector(`.${styles.container}`) as HTMLElement;

            vi.spyOn(sliderContainer, 'getBoundingClientRect').mockReturnValue({
                width: 200,
                height: 20,
                left: 0,
                top: 0,
                right: 200,
                bottom: 20,
                x: 0,
                y: 0,
                toJSON: () => {},
            });

            fireEvent.mouseDown(sliderContainer, { clientX: 100, clientY: 10 });

            expect(handleChange).toHaveBeenCalled();
            expect(handleChange.mock.calls[0][0].value).toBe(5);
        });
    });

    describe('Disabled state', () => {
        it('applies disabled className when disabled is true', () => {
            const { container } = render(<SliderInput disabled={true} />);
            const sliderContainer = container.querySelector(`.${styles.container}`);

            expect(sliderContainer).toHaveClass(styles.containerDisabled);
        });

        it('does not call onChange when disabled and keyboard is used', () => {
            const handleChange = vi.fn();
            const { container } = render(
                <SliderInput
                    onChange={handleChange}
                    disabled={true}
                    defaultValue={5}
                    step={1}
                    inputRange={[0, 10]}
                />,
            );
            const thumb = container.querySelector('[role="slider"]') as HTMLElement;

            thumb.focus();
            fireEvent.keyDown(thumb, { key: 'ArrowRight' });

            expect(handleChange).not.toHaveBeenCalled();
        });
    });

    describe('Step behavior', () => {
        it('respects step value when changing', () => {
            const handleChange = vi.fn();
            const { container } = render(
                <SliderInput
                    onChange={handleChange}
                    defaultValue={5}
                    step={2}
                    inputRange={[0, 10]}
                />,
            );
            const thumb = container.querySelector('[role="slider"]') as HTMLElement;

            thumb.focus();
            fireEvent.keyDown(thumb, { key: 'ArrowRight' });

            expect(handleChange).toHaveBeenCalledWith({
                name: undefined,
                value: 7,
            });
        });
    });

    describe('Value clamping', () => {
        it('clamps value to minimum when decreasing below min', () => {
            const handleChange = vi.fn();
            const { container } = render(
                <SliderInput
                    onChange={handleChange}
                    defaultValue={0}
                    step={1}
                    inputRange={[0, 10]}
                />,
            );
            const thumb = container.querySelector('[role="slider"]') as HTMLElement;

            thumb.focus();
            fireEvent.keyDown(thumb, { key: 'ArrowLeft' });

            expect(handleChange).toHaveBeenCalledWith({
                name: undefined,
                value: 0,
            });
        });

        it('clamps value to maximum when increasing above max', () => {
            const handleChange = vi.fn();
            const { container } = render(
                <SliderInput
                    onChange={handleChange}
                    defaultValue={10}
                    step={1}
                    inputRange={[0, 10]}
                />,
            );
            const thumb = container.querySelector('[role="slider"]') as HTMLElement;

            thumb.focus();
            fireEvent.keyDown(thumb, { key: 'ArrowRight' });

            expect(handleChange).toHaveBeenCalledWith({
                name: undefined,
                value: 10,
            });
        });
    });

    describe('Range input mode', () => {
        it('renders two thumbs when isRangeInput is true', () => {
            const { container } = render(
                <SliderInput isRangeInput={true} defaultValue={5} inputRange={[0, 10]} />,
            );
            const thumbs = container.querySelectorAll('[role="slider"]');

            expect(thumbs).toHaveLength(2);
        });

        it('handles range values correctly', () => {
            const handleChange = vi.fn();
            const { container } = render(
                <SliderInput
                    isRangeInput={true}
                    value={[3, 7]}
                    inputRange={[0, 10]}
                    onChange={handleChange}
                    step={1}
                />,
            );
            const thumbs = container.querySelectorAll<HTMLElement>('[role="slider"]');

            thumbs[0].focus();
            fireEvent.keyDown(thumbs[0], { key: 'ArrowRight' });

            expect(handleChange).toHaveBeenCalledWith({
                name: undefined,
                value: [4, 7],
            });
        });

        it('prevents thumbs from crossing each other', () => {
            const handleChange = vi.fn();
            const { container } = render(
                <SliderInput
                    isRangeInput={true}
                    value={[5, 6]}
                    inputRange={[0, 10]}
                    onChange={handleChange}
                    step={1}
                />,
            );
            const thumbs = container.querySelectorAll<HTMLElement>('[role="slider"]');
            const [firstThumb, secondThumb] = Array.from(thumbs);

            firstThumb.focus();
            fireEvent.keyDown(firstThumb, { key: 'ArrowRight' });
            fireEvent.keyDown(firstThumb, { key: 'ArrowRight' });

            secondThumb.focus();
            fireEvent.keyDown(secondThumb, { key: 'ArrowLeft' });
            fireEvent.keyDown(secondThumb, { key: 'ArrowLeft' });

            expect(handleChange).not.toHaveBeenCalled();

        });
    });

    describe('Tooltip', () => {
        it('does not render tooltip when showTooltip is false', () => {
            const { container } = render(<SliderInput showTooltip={false} />);
            const tooltip = container.querySelector(`.${styles.tooltip}`);

            expect(tooltip).not.toBeInTheDocument();
        });

        it('renders tooltip when showTooltip is true', () => {
            const { container } = render(<SliderInput showTooltip={true} defaultValue={5} />);
            const tooltip = container.querySelector(`.${styles.tooltip}`);

            expect(tooltip).toBeInTheDocument();
        });

        it('uses tooltipValueExtractor to format tooltip content', () => {
            const { container } = render(
                <SliderInput
                    showTooltip={true}
                    tooltipValueExtractor={(value) => `$${value}`}
                    defaultValue={5}
                />,
            );
            const tooltip = container.querySelector(`.${styles.tooltip}`);

            expect(tooltip).toHaveTextContent('$5');
        });
    });

    describe('Marks/Labels', () => {
        it('renders marks when marks array is provided', () => {
            const marks = ['0', '2', '4', '6', '8', '10'];
            const { container } = render(<SliderInput marks={marks} />);
            const marksContainer = container.querySelector(`.${styles.marks}`);
            const markElements = container.querySelectorAll(`.${styles.trackLabel}`);

            expect(marksContainer).toBeInTheDocument();
            expect(markElements).toHaveLength(6);
        });

        it('reverses marks when reverse is true', () => {
            const marks = ['0', '5', '10'];
            const { container } = render(<SliderInput marks={marks} reverse={true} />);
            const markElements = container.querySelectorAll(`.${styles.trackLabel}`);

            expect(markElements[0]).toHaveTextContent('10');
            expect(markElements[2]).toHaveTextContent('0');
        });
    });

    describe('Edge cases', () => {
        it('handles inputRange with negative values', () => {
            const handleChange = vi.fn();
            const { container } = render(
                <SliderInput
                    onChange={handleChange}
                    defaultValue={0}
                    step={1}
                    inputRange={[-10, 10]}
                />,
            );
            const thumb = container.querySelector('[role="slider"]') as HTMLElement;

            thumb.focus();
            fireEvent.keyDown(thumb, { key: 'ArrowLeft' });

            expect(handleChange).toHaveBeenCalledWith({
                name: undefined,
                value: -1,
            });
        });

        it('handles very small step values', () => {
            const handleChange = vi.fn();
            const { container } = render(
                <SliderInput
                    onChange={handleChange}
                    defaultValue={5}
                    step={0.01}
                    inputRange={[0, 10]}
                />,
            );
            const thumb = container.querySelector('[role="slider"]') as HTMLElement;

            thumb.focus();
            fireEvent.keyDown(thumb, { key: 'ArrowRight' });

            expect(handleChange).toHaveBeenCalledWith({
                name: undefined,
                value: 5.01,
            });
        });

        it('handles rapid keyboard input', () => {
            const handleChange = vi.fn();
            const { container } = render(
                <SliderInput
                    onChange={handleChange}
                    defaultValue={5}
                    step={1}
                    inputRange={[0, 10]}
                />,
            );
            const thumb = container.querySelector('[role="slider"]') as HTMLElement;

            thumb.focus();
            fireEvent.keyDown(thumb, { key: 'ArrowRight' });
            fireEvent.keyDown(thumb, { key: 'ArrowRight' });
            fireEvent.keyDown(thumb, { key: 'ArrowRight' });

            expect(handleChange).toHaveBeenCalledTimes(3);
        });

        it('handles empty marks array', () => {
            const { container } = render(<SliderInput marks={[]} />);
            const marksContainer = container.querySelector(`.${styles.marks}`);

            expect(marksContainer).toBeInTheDocument();
            expect(marksContainer?.children).toHaveLength(0);
        });
    });
});
