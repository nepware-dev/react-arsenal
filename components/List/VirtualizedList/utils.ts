export const binarySearch = (
    rangeStart: number,
    rangeEnd: number,
    predicate: (index: number) => boolean,
    defaultValue: number,
): number => {
    let result = defaultValue;
    while (rangeStart <= rangeEnd) {
        const mid = Math.floor((rangeStart + rangeEnd) / 2);
        if (predicate(mid)) {
            result = mid;
            rangeEnd = mid - 1;
        } else {
            rangeStart = mid + 1;
        }
    }
    return result;
};

export const findVisibleRange = (offsets: number[], count: number, scrollTop: number, viewportEnd: number) => {
    const start = binarySearch(0, count - 1, (i) => offsets[i + 1] > scrollTop, 0);
    const end = binarySearch(start, count - 1, (i) => offsets[i] >= viewportEnd, count) - 1;
    return { start, end };
};
