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
    onChange?: (params: {
        currentPage: number;
        totalPages: number;
        pageLimit: number;
        totalRecords: number;
    }) => void;
    renderLeftControl?: () => React.ReactNode;
    renderRightControl?: () => React.ReactNode;
}
