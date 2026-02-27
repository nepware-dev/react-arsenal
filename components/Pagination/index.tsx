import React, { useCallback, useMemo } from 'react';

import styles from './styles.module.scss';
import type { PaginationProps } from './types';
import cs from '../../cs';
import useControlledState from '../../hooks/useControlledState';
import { transformToElement } from '../../utils';

const noop = () => {};

const LEFT_PAGE = 'LEFT';
const RIGHT_PAGE = 'RIGHT';

const range = (from: number, to: number, step = 1): (string | number)[] => {
    let i = from;
    const range: (string | number)[] = [];

    while (i <= to) {
        range.push(i);
        i += step;
    }

    return range;
};

const fetchPageNumbers = (
    totalPages: number,
    currentPage: number,
    pageNeighbours: number,
): (number | string)[] => {
    const totalNumbers = pageNeighbours * 2 + 3;
    const totalBlocks = totalNumbers + 2;

    if (totalPages > totalBlocks) {
        const startPage = Math.max(2, currentPage - pageNeighbours);
        const endPage = Math.min(totalPages - 1, currentPage + pageNeighbours);

        let pages = range(startPage, endPage);

        const hasLeftSpill = startPage > 2;
        const hasRightSpill = totalPages - endPage > 1;
        const spillOffset = totalNumbers - (pages.length + 1);

        switch (true) {
            case hasLeftSpill && !hasRightSpill: {
                const extraPages = range(startPage - spillOffset, startPage - 1);
                pages = [LEFT_PAGE, ...extraPages, ...pages];
                break;
            }

            case !hasLeftSpill && hasRightSpill: {
                const extraPages = range(endPage + 1, endPage + spillOffset);
                pages = [...pages, ...extraPages, RIGHT_PAGE];
                break;
            }

            case hasLeftSpill && hasRightSpill:
            default: {
                pages = [LEFT_PAGE, ...pages, RIGHT_PAGE];
                break;
            }
        }

        return [1, ...pages, totalPages];
    }

    return range(1, totalPages);
};

const Pagination: React.FC<PaginationProps> = (props) => {
    const {
        showControlIcons,
        controlIconClassName,
        totalRecords,
        pageLimit,
        pageNeighbours = 2,
        onChange = noop,
        className,
        pageItemClassName,
        activePageItemClassName = '',
        pageNum,
        renderLeftControl,
        renderRightControl,
    } = props;

    const [currentPage, setCurrentPage] = useControlledState(pageNum ?? 1, {
        value: pageNum,
    });

    const totalPages = useMemo(
        () => Math.ceil(totalRecords / pageLimit) || 1,
        [totalRecords, pageLimit],
    );

    const pages = useMemo(
        () => fetchPageNumbers(totalPages, currentPage, pageNeighbours),
        [totalPages, currentPage, pageNeighbours],
    );

    const gotoPage = useCallback(
        (page: number) => {
            const activePage = Math.max(1, Math.min(page, totalPages));

            setCurrentPage(activePage);
            onChange({
                currentPage: activePage,
                totalPages,
                pageLimit,
                totalRecords,
            });
        },
        [onChange, totalPages, pageLimit, totalRecords],
    );

    const handleLeftControlClick = useCallback(
        (event: React.MouseEvent<HTMLAnchorElement>) => {
            event.preventDefault();
            if (currentPage !== 1) {
                gotoPage(currentPage - 1);
            }
        },
        [gotoPage, currentPage],
    );

    const handleRightControlClick = useCallback(
        (event: React.MouseEvent<HTMLAnchorElement>) => {
            event.preventDefault();
            if (currentPage !== totalPages) {
                gotoPage(currentPage + 1);
            }
        },
        [gotoPage, currentPage, totalPages],
    );

    const renderPage = useCallback(
        (page: number | string) => {
            return (
                <PageItem
                    key={page}
                    page={page}
                    currentPage={currentPage}
                    pageItemClassName={pageItemClassName}
                    activePageItemClassName={activePageItemClassName}
                    pageNeighbours={pageNeighbours}
                    goToPage={gotoPage}
                />
            );
        },
        [currentPage, pageItemClassName, activePageItemClassName, pageNeighbours, gotoPage],
    );

    if (!totalRecords || totalPages === 1) return null;

    return (
        <>
            <ul className={cs(styles.pagination, className)}>
                {showControlIcons && (
                    <li
                        key="left_control"
                        className={cs(styles.pageItem, {
                            [styles.disabled]: currentPage === 1,
                        })}
                    >
                        <a
                            href="#"
                            className={cs(styles.pageLink, controlIconClassName)}
                            data-testid="left-control"
                            aria-label="Previous"
                            onClick={handleLeftControlClick}
                        >
                            {renderLeftControl ? (
                                transformToElement(renderLeftControl)
                            ) : (
                                <span aria-hidden="true">&lt;</span>
                            )}
                        </a>
                    </li>
                )}
                {pages.map(renderPage)}
                {showControlIcons && (
                    <li
                        key="right_control"
                        className={cs(styles.pageItem, {
                            [styles.disabled]: currentPage === totalPages,
                        })}
                    >
                        <a
                            href="#"
                            className={cs(styles.pageLink, controlIconClassName)}
                            aria-label="Next"
                            data-testid="right-control"
                            onClick={handleRightControlClick}
                        >
                            {renderRightControl ? (
                                transformToElement(renderRightControl)
                            ) : (
                                <span aria-hidden="true">&gt;</span>
                            )}
                        </a>
                    </li>
                )}
            </ul>
        </>
    );
};

export default React.memo(Pagination);

export type { PaginationProps, PageChangeCallback } from './types';

function PageItem({
    page,
    currentPage,
    pageItemClassName,
    activePageItemClassName = '',
    pageNeighbours,
    goToPage,
}: {
    page: number | string;
    currentPage: number;
    pageItemClassName?: string;
    activePageItemClassName?: string;
    pageNeighbours: number;
    goToPage: (page: number) => void;
}) {
    const handleMoveLeft = useCallback(
        (event: React.MouseEvent<HTMLAnchorElement>) => {
            event.preventDefault();
            goToPage(currentPage - pageNeighbours * 2 - 1);
        },
        [goToPage, currentPage, pageNeighbours],
    );

    const handleMoveRight = useCallback(
        (event: React.MouseEvent<HTMLAnchorElement>) => {
            event.preventDefault();
            goToPage(currentPage + pageNeighbours * 2 + 1);
        },
        [goToPage, currentPage, pageNeighbours],
    );

    const handleClick = useCallback(
        (event: React.MouseEvent<HTMLAnchorElement>) => {
            event.preventDefault();
            goToPage(page as number);
        },
        [page, goToPage],
    );

    if (page === LEFT_PAGE)
        return (
            <li className={styles.pageItem}>
                <a
                    className={cs(styles.pageLink, pageItemClassName)}
                    href="#"
                    aria-label="Previous"
                    onClick={handleMoveLeft}
                >
                    <span aria-hidden="true">...</span>
                </a>
            </li>
        );

    if (page === RIGHT_PAGE)
        return (
            <li className={styles.pageItem}>
                <a
                    className={cs(styles.pageLink, pageItemClassName)}
                    href="#"
                    aria-label="Next"
                    onClick={handleMoveRight}
                >
                    <span aria-hidden="true">...</span>
                </a>
            </li>
        );

    return (
        <li key={page} className={cs(styles.pageItem)}>
            <a
                className={cs(styles.pageLink, pageItemClassName, {
                    [styles.active]: currentPage === page,
                    [activePageItemClassName]: currentPage === page,
                })}
                href="#"
                onClick={handleClick}
            >
                {page}
            </a>
        </li>
    );
}
