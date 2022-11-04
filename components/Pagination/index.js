import React, { useState, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';

import cs from '../../cs';
import { transformToElement } from '../../utils';

import styles from './styles.module.scss';

const noop = () => {};

const LEFT_PAGE = 'LEFT';
const RIGHT_PAGE = 'RIGHT';

const range = (from, to, step = 1) => {
    let i = from;
    const range = [];

    while (i <= to) {
        range.push(i);
        i += step;
    }

    return range;
};

const fetchPageNumbers = (totalPages, currentPage, pageNeighbours) => {
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
            const extraPages = range(
                startPage - spillOffset,
                startPage - 1
            );
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

const Pagination = (props) => {
    const {
        showControlIcons,
        controlIconClassName,
        totalRecords,
        pageLimit,
        pageNeighbours,
        onChange,
        className,
        pageItemClassName,
        activePageItemClassName,
        pageNum,
        renderLeftControl,
        renderRightControl,
    } = props;

    const [currentPage, setCurrentPage] = useState(pageNum ?? 1);

    const totalPages = useMemo(() => Math.ceil(totalRecords / pageLimit) || 1, [totalRecords, pageLimit]);

    const pages = useMemo(() => fetchPageNumbers(totalPages, currentPage, pageNeighbours), [totalPages, currentPage, pageNeighbours]);

    const gotoPage = useCallback(page => {
        const currentPage = Math.max(1, Math.min(page, totalPages));

        setCurrentPage(currentPage);
        onChange({
            currentPage,
            totalPages,
            pageLimit,
            totalRecords
        });
    }, [onChange, currentPage, totalPages]);

    const handleClick = useCallback(page => evt => {
        evt.preventDefault();
        gotoPage(page);
    }, [gotoPage]);

    const handleLeftControlClick = useCallback((evt) => {
        evt.preventDefault();
        if(currentPage !== 1) {
            gotoPage(currentPage - 1);
        }
    }, [gotoPage, currentPage]);

    const handleRightControlClick = useCallback((evt) => {
        evt.preventDefault();
        if(currentPage !== totalPages) {
            gotoPage(currentPage + 1);
        }
    }, [gotoPage, currentPage, totalPages]);

    const handleMoveLeft = useCallback(evt => {
        evt.preventDefault();
        gotoPage(currentPage - pageNeighbours * 2 - 1);
    }, [gotoPage, currentPage, pageNeighbours]);

    const handleMoveRight = useCallback(evt => {
        evt.preventDefault();
        gotoPage(currentPage + pageNeighbours * 2 + 1);
    }, [gotoPage, currentPage, pageNeighbours]);

    if (!totalRecords || totalPages === 1) return null;

    return (
        <>
            <ul className={cs(styles.pagination, className)}>
                {showControlIcons && (
                    <li key="left_control" className={cs(styles.pageItem, {
                        [styles.disabled]: currentPage === 1
                    })}>
                        <a href="#" className={cs(styles.pageLink, controlIconClassName)} aria-label="Previous" onClick={handleLeftControlClick}>
                            {renderLeftControl ? transformToElement(renderLeftControl): <span aria-hidden="true">&lt;</span>}
                        </a>
                    </li>
                )}
                {pages.map((page) => {
                    if (page === LEFT_PAGE)
                        return (
                            <li key='left_page' className={styles.pageItem}>
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
                            <li key='right_page' className={styles.pageItem}>
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
                        <li
                            key={page}
                            className={cs(styles.pageItem)}
                        >
                            <a
                                className={cs(styles.pageLink, pageItemClassName, {
                                    [styles.active]: currentPage === page,
                                    [activePageItemClassName]: currentPage === page,
                                })}
                                href="#"
                                onClick={handleClick(page)}
                            >
                                {page}
                            </a>
                        </li>
                    );
                })}
                {showControlIcons && (
                    <li key="right_control" className={cs(styles.pageItem, {
                        [styles.disabled]: currentPage === totalPages
                    })}>
                        <a href="#" className={cs(styles.pageLink, controlIconClassName)} aria-label="Next" onClick={handleRightControlClick}>
                            {renderRightControl ? transformToElement(renderRightControl): <span aria-hidden="true">&gt;</span>}
                        </a>
                    </li>
                )}
            </ul>
        </>
    );
};

Pagination.propTypes = {
    showControlIcons: PropTypes.bool,
    controlIconClassName: PropTypes.string,
    className: PropTypes.string,
    totalRecords: PropTypes.number.isRequired,
    pageLimit: PropTypes.number.isRequired,
    pageNeighbours: PropTypes.number,
    onChange: PropTypes.func,
    pageItemClassName: PropTypes.string,
    activePageItemClassName: PropTypes.string,
    pageNum: PropTypes.number,
    renderLeftControl: PropTypes.func,
    renderRightControl: PropTypes.func,
};

Pagination.defaultProps = {
    pageNeighbours: 2,
    onChange: noop,
};

export default React.memo(Pagination);
