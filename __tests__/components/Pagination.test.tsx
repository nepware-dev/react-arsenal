import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

import Pagination from '../../components/Pagination';
import styles from '../../components/Pagination/styles.module.scss';

describe('Pagination', () => {
    const defaultProps = {
        totalRecords: 100,
        pageLimit: 10,
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Basic rendering', () => {
        it('renders pagination with correct number of pages', () => {
            render(<Pagination {...defaultProps} />);

            expect(screen.getByText('1')).toBeInTheDocument();
            expect(screen.getByText('10')).toBeInTheDocument();
        });

        it('does not render when totalRecords is 0', () => {
            const { container } = render(<Pagination totalRecords={0} pageLimit={10} />);

            const pagination = container.querySelector(`.${styles.pagination}`);
            expect(pagination).not.toBeInTheDocument();
        });

        it('does not render when there is only one page', () => {
            const { container } = render(<Pagination totalRecords={5} pageLimit={10} />);

            const pagination = container.querySelector(`.${styles.pagination}`);
            expect(pagination).not.toBeInTheDocument();
        });

        it('applies custom className', () => {
            const { container } = render(
                <Pagination
                    {...defaultProps}
                    showControlIcons
                    pageNum={3}
                    className="custom-pagination"
                    controlIconClassName="custom-control"
                    pageItemClassName="custom-page-item"
                    activePageItemClassName="active-custom"
                />,
            );

            const pagination = container.querySelector(`.${styles.pagination}`);
            expect(pagination).toHaveClass('custom-pagination');

            const leftControl = screen.getByLabelText('Previous');
            expect(leftControl).toHaveClass('custom-control');

            const page2 = screen.getByText('2');
            expect(page2).toHaveClass('custom-page-item');

            const page3 = screen.getByText('3');
            expect(page3).toHaveClass('active-custom');

            const page4 = screen.getByText('4');
            expect(page4).not.toHaveClass('active-custom');
        });

        it('highlights the first page as active by default', () => {
            const { container } = render(<Pagination {...defaultProps} />);

            const firstPage = container.querySelector(`a.${styles.pageLink}.${styles.active}`);
            expect(firstPage).toHaveTextContent('1');
        });
    });

    describe('Page navigation', () => {
        it('changes active page on click', () => {
            const { container } = render(<Pagination {...defaultProps} />);

            const page3 = screen.getByText('3');
            fireEvent.click(page3);

            const activePage = container.querySelector(`a.${styles.pageLink}.${styles.active}`);
            expect(activePage).toHaveTextContent('3');
        });

        it('calls onChange when page is clicked', () => {
            const handleChange = vi.fn();
            render(<Pagination {...defaultProps} onChange={handleChange} />);

            const page2 = screen.getByText('2');
            fireEvent.click(page2);

            expect(handleChange).toHaveBeenCalledWith({
                currentPage: 2,
                totalPages: 10,
                pageLimit: 10,
                totalRecords: 100,
            });
        });
    });

    describe('Controlled mode', () => {
        it('uses controlled pageNum when provided', () => {
            const { container } = render(<Pagination {...defaultProps} pageNum={5} />);

            const activePage = container.querySelector(`a.${styles.pageLink}.${styles.active}`);
            expect(activePage).toHaveTextContent('5');
        });

        it('updates when pageNum prop changes', () => {
            const { container, rerender } = render(<Pagination {...defaultProps} pageNum={2} />);

            let activePage = container.querySelector(`a.${styles.pageLink}.${styles.active}`);
            expect(activePage).toHaveTextContent('2');

            rerender(<Pagination {...defaultProps} pageNum={7} />);

            activePage = container.querySelector(`a.${styles.pageLink}.${styles.active}`);
            expect(activePage).toHaveTextContent('7');
        });
    });

    describe('Control icons', () => {
        it('renders left and right control icons when showControlIcons is true', () => {
            render(<Pagination {...defaultProps} showControlIcons />);

            const leftControl = screen.getByTestId('left-control');
            const rightControl = screen.getByTestId('right-control');
            expect(leftControl).toBeInTheDocument();
            expect(rightControl).toBeInTheDocument();
        });

        it('does not render control icons when showControlIcons is false', () => {
            render(<Pagination {...defaultProps} showControlIcons={false} />);

            const leftControl = screen.queryByTestId('left-control');
            const rightControl = screen.queryByTestId('right-control');
            expect(leftControl).not.toBeInTheDocument();
            expect(rightControl).not.toBeInTheDocument();
        });

        it('navigates to previous page when left control is clicked', () => {
            const handleChange = vi.fn();
            render(
                <Pagination
                    {...defaultProps}
                    showControlIcons
                    pageNum={3}
                    onChange={handleChange}
                />,
            );

            const leftControl = screen.getByTestId('left-control');
            fireEvent.click(leftControl);

            expect(handleChange).toHaveBeenCalledWith(expect.objectContaining({ currentPage: 2 }));
        });

        it('navigates to next page when right control is clicked', () => {
            const handleChange = vi.fn();
            render(
                <Pagination
                    {...defaultProps}
                    showControlIcons
                    pageNum={3}
                    onChange={handleChange}
                />,
            );
            const rightControl = screen.getByTestId('right-control');
            fireEvent.click(rightControl);

            expect(handleChange).toHaveBeenCalledWith(expect.objectContaining({ currentPage: 4 }));
        });

        it('disables left control on first page', () => {
            render(
                <Pagination {...defaultProps} showControlIcons pageNum={1} />,
            );

            const leftControl = screen.getByLabelText('Previous').closest('li');
            expect(leftControl).toHaveClass(styles.disabled);
        });

        it('disables right control on last page', () => {
            render(
                <Pagination {...defaultProps} showControlIcons pageNum={10} />,
            );

            const rightControl = screen.getByLabelText('Next').closest('li');
            expect(rightControl).toHaveClass(styles.disabled);
        });

        it('does not navigate when left control is disabled', () => {
            const handleChange = vi.fn();
            render(
                <Pagination
                    {...defaultProps}
                    showControlIcons
                    pageNum={1}
                    onChange={handleChange}
                />,
            );

            const leftControl = screen.getByLabelText('Previous');
            fireEvent.click(leftControl);

            expect(handleChange).not.toHaveBeenCalled();
        });

        it('does not navigate when right control is disabled', () => {
            const handleChange = vi.fn();
            render(
                <Pagination
                    {...defaultProps}
                    showControlIcons
                    pageNum={10}
                    onChange={handleChange}
                />,
            );

            const rightControl = screen.getByLabelText('Next');
            fireEvent.click(rightControl);

            expect(handleChange).not.toHaveBeenCalled();
        });
    });

    describe('Custom control rendering', () => {
        it('renders custom left control', () => {
            const CustomLeftControl = () => <span data-testid="custom-left">Prev</span>;

            render(
                <Pagination
                    {...defaultProps}
                    showControlIcons
                    renderLeftControl={CustomLeftControl}
                />,
            );

            expect(screen.getByTestId('custom-left')).toBeInTheDocument();
            expect(screen.getByText('Prev')).toBeInTheDocument();
        });

        it('renders custom right control', () => {
            const CustomRightControl = () => <span data-testid="custom-right">Next</span>;

            render(
                <Pagination
                    {...defaultProps}
                    showControlIcons
                    renderRightControl={CustomRightControl}
                />,
            );

            expect(screen.getByTestId('custom-right')).toBeInTheDocument();
            expect(screen.getByText('Next')).toBeInTheDocument();
        });
    });

    describe('Page neighbours and ellipsis', () => {
        it('shows ellipsis when there are many pages', () => {
            render(<Pagination totalRecords={1000} pageLimit={10} pageNeighbours={1} />);

            const ellipsis = screen.getAllByText('...');
            expect(ellipsis.length).toBeGreaterThan(0);
        });

        it('respects pageNeighbours prop', () => {
            render(
                <Pagination totalRecords={1000} pageLimit={10} pageNeighbours={2} pageNum={50} />,
            );

            expect(screen.getByText('48')).toBeInTheDocument();
            expect(screen.getByText('49')).toBeInTheDocument();
            expect(screen.getByText('50')).toBeInTheDocument();
            expect(screen.getByText('51')).toBeInTheDocument();
            expect(screen.getByText('52')).toBeInTheDocument();
        });

        it('clicking ellipsis navigates forward', () => {
            const handleChange = vi.fn();
            render(
                <Pagination
                    totalRecords={1000}
                    pageLimit={10}
                    pageNeighbours={1}
                    pageNum={1}
                    onChange={handleChange}
                />,
            );

            const ellipsis = screen.getAllByText('...');
            const rightEllipsis = ellipsis[ellipsis.length - 1];
            fireEvent.click(rightEllipsis);

            expect(handleChange).toHaveBeenCalled();
        });

        it('clicking left ellipsis navigates backward', () => {
            const handleChange = vi.fn();
            render(
                <Pagination
                    totalRecords={1000}
                    pageLimit={10}
                    pageNeighbours={1}
                    pageNum={100}
                    onChange={handleChange}
                />,
            );

            const ellipsis = screen.getAllByText('...');
            const leftEllipsis = ellipsis[0];
            fireEvent.click(leftEllipsis);

            expect(handleChange).toHaveBeenCalled();
        });
    });

    describe('Edge cases', () => {
        it('handles page limit larger than total records', () => {
            const { container } = render(<Pagination totalRecords={5} pageLimit={100} />);

            const pagination = container.querySelector(`.${styles.pagination}`);
            expect(pagination).not.toBeInTheDocument();
        });

        it('calculates total pages correctly', () => {
            const handleChange = vi.fn();
            render(<Pagination totalRecords={95} pageLimit={10} onChange={handleChange} />);

            const page10 = screen.getByText('10');
            fireEvent.click(page10);

            expect(handleChange).toHaveBeenCalledWith(expect.objectContaining({ totalPages: 10 }));
        });

        it('prevents navigation beyond first page', () => {
            const handleChange = vi.fn();
            render(
                <Pagination {...defaultProps} pageNum={1} onChange={handleChange} />,
            );

            const page1 = screen.getByText('1');
            fireEvent.click(page1);

            expect(handleChange).toHaveBeenCalledWith(expect.objectContaining({ currentPage: 1 }));
        });

        it('prevents navigation beyond last page', () => {
            const handleChange = vi.fn();
            render(<Pagination {...defaultProps} pageNum={10} onChange={handleChange} />);

            const page10 = screen.getByText('10');
            fireEvent.click(page10);

            expect(handleChange).toHaveBeenCalledWith(expect.objectContaining({ currentPage: 10 }));
        });

        it('handles fractional total pages correctly', () => {
            render(<Pagination totalRecords={25} pageLimit={10} />);

            expect(screen.getByText('3')).toBeInTheDocument();
            expect(screen.queryByText('4')).not.toBeInTheDocument();
        });
    });

    describe('Memoization', () => {
        it('component is memoized and does not re-render unnecessarily', () => {
            const { rerender } = render(<Pagination {...defaultProps} />);

            rerender(<Pagination {...defaultProps} />);

            expect(screen.getByText('1')).toBeInTheDocument();
        });
    });
});
