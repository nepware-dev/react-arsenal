import * as React from 'react';

export type PageChangeCallback = (payload: {
    currentPage: number,
    totalPages: number,
    pageLimit: number,
    totalRecords: number
}) => void;

export interface PaginationProps {
    className?: string,
    totalRecords?: number,
    pageLimit?: number,
    pageNeighbours: number,
    onChange?: PageChangeCallback,
    pageItemClassName?: string,
    activePageItemClassName?: string,
    pageNum?: number,
}

declare const Pagination;

export default Pagination;
