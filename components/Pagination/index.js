import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import cs from '../../cs';

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

const Pagination = ({
    totalRecords,
    pageLimit,
    pageNeighbours,
    onChange,
    className,
}) => {
    const [currentPage, setCurrentPage] = useState(1);

    const totalPages = Math.ceil(totalRecords / pageLimit);

    useEffect(() => {
        gotoPage(1);
    }, []);

    if (!totalRecords || totalPages === 1) return null;

    const pages = fetchPageNumbers(totalPages, currentPage, pageNeighbours);

    const gotoPage = page => {
        const currentPage = Math.max(0, Math.min(page, totalPages));

        setCurrentPage(currentPage);
        onChange({
            currentPage,
            totalPages,
            pageLimit,
            totalRecords
        });
    };

    const handleClick = page => evt => {
        evt.preventDefault();
        gotoPage(page);
    };

    const handleMoveLeft = evt => {
        evt.preventDefault();
        gotoPage(currentPage - pageNeighbours * 2 - 1);
    };

    const handleMoveRight = evt => {
        evt.preventDefault();
        gotoPage(currentPage + pageNeighbours * 2 + 1);
    };

    return (
        <>
            <ul className={cs(styles.pagination, className)}>
                {pages.map((page) => {
                    if (page === LEFT_PAGE)
                        return (
                            <li key='left_page' className={styles.pageItem}>
                                <a
                                    className={styles.pageLink}
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
                                    className={styles.pageLink}
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
                            className={styles.pageItem}
                        >
                            <a
                                className={cs(styles.pageLink, {
                                    [styles.active]: currentPage === page
                                })}
                                href="#"
                                onClick={handleClick(page)}
                            >
                                {page}
                            </a>
                        </li>
                    );
                })}
            </ul>
        </>
    );
};

Pagination.propTypes = {
    className: PropTypes.string,
    totalRecords: PropTypes.number.isRequired,
    pageLimit: PropTypes.number.isRequired,
    pageNeighbours: PropTypes.number,
    onChange: PropTypes.func
};

Pagination.defaultProps = {
    pageNeighbours: 2,
    onChange: noop,
};

export default React.memo(Pagination);
