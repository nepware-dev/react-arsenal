import React from 'react';

export interface PaginationProps {
    totalRecords: number;
    pageLimit: number;
    pageNum?: number;
    pageNeighbours?: number;
    className?: string;
    pageItemClassName?: string;
    activePageItemClassName?: string;
    controlIconClassName?: string;
    showControlIcons?: boolean;
    onChange?: PageChangeCallback;
    renderLeftControl?: () => React.ReactNode;
    renderRightControl?: () => React.ReactNode;
}

export type PageChangeCallback = (payload: {
    currentPage: number,
    totalPages: number,
    pageLimit: number,
    totalRecords: number
}) => void;
