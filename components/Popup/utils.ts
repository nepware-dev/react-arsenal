import { OriginPosition } from './types';

interface OverflowState {
    isOverflowing: boolean;
    isOverflowingTop: boolean;
    isOverflowingBottom: boolean;
    isOverflowingLeft: boolean;
    isOverflowingRight: boolean;
}

const NO_OVERFLOW_STATE = {
    isOverflowing: false,
    isOverflowingTop: false,
    isOverflowingBottom: false,
    isOverflowingLeft: false,
    isOverflowingRight: false,
};

interface Rect {
    top: number;
    left: number;
    right: number;
    bottom: number;
}

interface PopupPositionStyle extends React.CSSProperties {
    transformX: string;
    transformY: string;
}

interface OriginPair {
    anchorOrigin: OriginPosition;
    transformOrigin: OriginPosition;
}

function isOverflowElement(element: Element): boolean {
    const { overflow, overflowX, overflowY, display } = getComputedStyle(element);
    return (
        /auto|scroll|overlay|hidden|clip/.test(overflow + overflowY + overflowX) &&
        display !== 'inline' &&
        display !== 'contents'
    );
}

export function getClosestOverflowAncestor(element?: HTMLElement | null) {
    if (!element) {
        return null;
    }

    const isOverflowingElement = isOverflowElement(element);

    if (isOverflowingElement) {
        return element;
    }

    return getClosestOverflowAncestor(element?.parentElement);
}

function isPositionedAncestor(element: Element): boolean {
    const { position, transform, filter, perspective } = getComputedStyle(element);
    return (
        position === 'relative' ||
        position === 'absolute' ||
        position === 'fixed' ||
        position === 'sticky' ||
        transform !== 'none' ||
        filter !== 'none' ||
        perspective !== 'none'
    );
}

function getClosestPositionedAncestor(element?: HTMLElement | null) {
    if (!element) {
        return null;
    }

    const isPositionedElement = isPositionedAncestor(element);

    if (isPositionedElement) {
        return element;
    }

    return getClosestPositionedAncestor(element?.parentElement);
}

const VERTICAL_TRANSLATE_PERCENT = {
    top: '0',
    center: '-50%',
    bottom: '-100%',
};

const HORIZONTAL_TRANSLATE_PERCENT = {
    left: '0',
    center: '-50%',
    right: '-100%',
};

const TRANSLATE_RATIO_BY_PERCENT = {
    '0': 0,
    '-50%': -0.5,
    '-100%': -1,
};

const DEFAULT_OVERFLOW_OFFSET = 1;

const getRelativeRect = (rect: DOMRect, containerElement: HTMLElement | null) => {
    if (!containerElement) return rect;

    const containerRect = containerElement.getBoundingClientRect();

    return {
        top: rect.top - containerRect.top,
        left: rect.left - containerRect.left,
        right: rect.right - containerRect.left,
        bottom: rect.bottom - containerRect.top,
    };
};

export const getPopupStyle = (
    rect: DOMRect,
    anchorOrigin: OriginPosition,
    transformOrigin: OriginPosition,
    viewportElement: HTMLElement | null,
) => {
    const [anchorVertical, anchorHorizontal] = anchorOrigin.trim().split(' ');
    const [transformVertical, transformHorizontal] = transformOrigin.trim().split(' ');

    const closestPositionedAncestor = getClosestPositionedAncestor(viewportElement);
    const relativeRect = getRelativeRect(rect, closestPositionedAncestor);

    const anchorOriginY = {
        top: relativeRect.top,
        center: (relativeRect.top + relativeRect.bottom) / 2,
        bottom: relativeRect.bottom,
    };

    const anchorOriginX = {
        left: relativeRect.left,
        center: (relativeRect.left + relativeRect.right) / 2,
        right: relativeRect.right,
    };

    const translateXPercent =
        HORIZONTAL_TRANSLATE_PERCENT[transformHorizontal as keyof typeof HORIZONTAL_TRANSLATE_PERCENT];
    const translateYPercent = VERTICAL_TRANSLATE_PERCENT[transformVertical as keyof typeof VERTICAL_TRANSLATE_PERCENT];

    const scrollTop = closestPositionedAncestor ? closestPositionedAncestor.scrollTop : window.pageYOffset;
    const scrollLeft = closestPositionedAncestor ? closestPositionedAncestor.scrollLeft : window.pageXOffset;

    const positionStyle = {
        top: anchorOriginY[anchorVertical as keyof typeof anchorOriginY] + scrollTop,
        left: anchorOriginX[anchorHorizontal as keyof typeof anchorOriginX] + scrollLeft,
        transformX: translateXPercent,
        transformY: translateYPercent,
        transform: `translate(${translateXPercent}, ${translateYPercent})`,
    } as PopupPositionStyle;

    return positionStyle;
};

function getPopupRect(positionStyle: PopupPositionStyle, popupSize?: { width: number; height: number }) {
    const { top, left, transformX, transformY } = positionStyle;

    const translateXRatio = TRANSLATE_RATIO_BY_PERCENT[transformX as keyof typeof TRANSLATE_RATIO_BY_PERCENT];
    const translateYRatio = TRANSLATE_RATIO_BY_PERCENT[transformY as keyof typeof TRANSLATE_RATIO_BY_PERCENT];

    const popupHeight = popupSize?.height ?? 0;
    const popupWidth = popupSize?.width ?? 0;

    const popupTop = Number(top) + popupHeight * translateYRatio;
    const popupLeft = Number(left) + popupWidth * translateXRatio;
    const popupBottom = popupTop + popupHeight;
    const popupRight = popupLeft + popupWidth;

    return {
        top: popupTop,
        left: popupLeft,
        right: popupRight,
        bottom: popupBottom,
        height: popupHeight,
        width: popupWidth,
    } as DOMRect;
}

/**
 * Computes the popup's rect and the boundaries (screen + optional scroll-container)
 * it should be checked against, both in a shared coordinate system.
 *
 * Coordinate system: all calculations use viewport-relative (client) coordinates.
 * The popup rect is initially computed in page coordinates (via getPopupStyle which
 * adds scroll offset), then adjusted back to viewport space by subtracting
 * window.pageYOffset / window.pageXOffset. The boundary rects (viewport element's
 * getBoundingClientRect and window.innerWidth/innerHeight) are inherently
 * viewport-relative, so all rects returned share the same coordinate system.
 *
 * document.documentElement is used as the viewport element passed to getPopupStyle
 * to have a common reference between child and parent element when computing the
 * popup rect here.
 */
function getPopupBoundaries(
    anchorRect: DOMRect,
    popupSize: { width: number; height: number } | undefined,
    viewportElement: HTMLElement | null,
    anchorOrigin: OriginPosition,
    transformOrigin: OriginPosition,
): { popupRect: Rect; boundaries: Rect[] } {
    const positionStyle = getPopupStyle(anchorRect, anchorOrigin, transformOrigin, document.documentElement);
    const popupRect = getPopupRect(positionStyle, popupSize);

    // Adjust the child rect to account for the scroll position of the document
    const adjustedPopupRect = {
        top: popupRect.top - window.pageYOffset,
        left: popupRect.left - window.pageXOffset,
        right: popupRect.right - window.pageXOffset,
        bottom: popupRect.bottom - window.pageYOffset,
    };

    const boundaries: Rect[] = [{ top: 0, left: 0, right: window.innerWidth, bottom: window.innerHeight }];

    if (viewportElement) {
        const viewportRect = viewportElement.getBoundingClientRect();
        boundaries.push({
            top: viewportRect.top,
            left: viewportRect.left,
            right: viewportRect.left + viewportElement.clientWidth,
            bottom: viewportRect.top + viewportElement.clientHeight,
        });
    }

    return { popupRect: adjustedPopupRect, boundaries };
}

/**
 * Checks whether the popup overflows the browser viewport (visible screen area)
 * and/or the scroll-container (viewportElement) boundaries.
 */
export function getOverflowState(
    anchorRect: DOMRect,
    viewportElement: HTMLElement | null,
    options: {
        anchorOrigin: OriginPosition;
        transformOrigin: OriginPosition;
        popupSize?: {
            width: number;
            height: number;
        };
    },
) {
    const { anchorOrigin, transformOrigin, popupSize } = options;
    const { popupRect, boundaries } = getPopupBoundaries(
        anchorRect,
        popupSize,
        viewportElement,
        anchorOrigin,
        transformOrigin,
    );

    const isOverflowingTop = boundaries.some((boundary) => popupRect.top - boundary.top < -DEFAULT_OVERFLOW_OFFSET);
    const isOverflowingBottom = boundaries.some(
        (boundary) => popupRect.bottom - boundary.bottom > DEFAULT_OVERFLOW_OFFSET,
    );
    const isOverflowingLeft = boundaries.some((boundary) => popupRect.left - boundary.left < -DEFAULT_OVERFLOW_OFFSET);
    const isOverflowingRight = boundaries.some(
        (boundary) => popupRect.right - boundary.right > DEFAULT_OVERFLOW_OFFSET,
    );

    return {
        isOverflowing: isOverflowingTop || isOverflowingBottom || isOverflowingLeft || isOverflowingRight,
        isOverflowingTop,
        isOverflowingBottom,
        isOverflowingLeft,
        isOverflowingRight,
    };
}

function intersectBoundaries(boundaries: Rect[]): Rect {
    return boundaries.reduce((acc, boundary) => ({
        top: Math.max(acc.top, boundary.top),
        left: Math.max(acc.left, boundary.left),
        right: Math.min(acc.right, boundary.right),
        bottom: Math.min(acc.bottom, boundary.bottom),
    }));
}

function getOverflowScore(
    anchorRect: DOMRect,
    popupSize: { width: number; height: number } | undefined,
    viewportElement: HTMLElement | null,
    origins: OriginPair,
): number {
    const { popupRect, boundaries } = getPopupBoundaries(
        anchorRect,
        popupSize,
        viewportElement,
        origins.anchorOrigin,
        origins.transformOrigin,
    );
    const clippedBoundary = intersectBoundaries(boundaries);

    let total = 0;
    if (popupRect.top - clippedBoundary.top < -DEFAULT_OVERFLOW_OFFSET) total += clippedBoundary.top - popupRect.top;
    if (popupRect.bottom - clippedBoundary.bottom > DEFAULT_OVERFLOW_OFFSET)
        total += popupRect.bottom - clippedBoundary.bottom;
    if (popupRect.left - clippedBoundary.left < -DEFAULT_OVERFLOW_OFFSET)
        total += clippedBoundary.left - popupRect.left;
    if (popupRect.right - clippedBoundary.right > DEFAULT_OVERFLOW_OFFSET)
        total += popupRect.right - clippedBoundary.right;
    return total;
}

const VERTICAL_ALIGNMENT_RATIO: Record<string, number> = {
    top: 0,
    center: 0.5,
    bottom: 1,
};
const HORIZONTAL_ALIGNMENT_RATIO: Record<string, number> = {
    left: 0,
    center: 0.5,
    right: 1,
};

const axisOverlaps = (anchorRatio: number, transformRatio: number) =>
    !((anchorRatio === 0 && transformRatio === 1) || (anchorRatio === 1 && transformRatio === 0));

function doOriginsOverlap(anchorPosition: OriginPosition, transformPosition: OriginPosition): boolean {
    const [anchorVertical, anchorHorizontal] = anchorPosition.split(' ');
    const [transformVertical, transformHorizontal] = transformPosition.split(' ');

    return (
        axisOverlaps(VERTICAL_ALIGNMENT_RATIO[anchorVertical], VERTICAL_ALIGNMENT_RATIO[transformVertical]) &&
        axisOverlaps(HORIZONTAL_ALIGNMENT_RATIO[anchorHorizontal], HORIZONTAL_ALIGNMENT_RATIO[transformHorizontal])
    );
}

const flipOriginKeyword = (originKeyword: string, from: string, to: string) =>
    originKeyword.replace(new RegExp(`^(${from}|center)`), to);

// Flips the given axis (0 = vertical, 1 = horizontal) of anchor/transform origin towards
// `target` (the side away from the overflow). The transform origin always flips to `target`.
// The anchor origin flips too, unless doing so would newly make it overlap the (now flipped)
// transform origin — which happens when the anchor was already on `target` or centered, since
// then the "flip" is a no-op and it ends up stacked on the same side as the transform. In that
// case the anchor is pushed to the opposite (`opposite`) side instead.
function resolveAxisOverflow(
    anchorOrigin: OriginPosition,
    transformOrigin: OriginPosition,
    axis: 0 | 1,
    target: string,
    opposite: string,
): { anchorOrigin: OriginPosition; transformOrigin: OriginPosition } {
    const anchorParts = anchorOrigin.split(' ');
    const transformParts = transformOrigin.split(' ');
    const wasOverlapping = doOriginsOverlap(anchorOrigin, transformOrigin);

    transformParts[axis] = flipOriginKeyword(transformParts[axis], opposite, target);
    const updatedTransformOrigin = transformParts.join(' ') as OriginPosition;

    const flippedAnchorParts = [...anchorParts];
    flippedAnchorParts[axis] = flipOriginKeyword(anchorParts[axis], opposite, target);
    let updatedAnchorOrigin = flippedAnchorParts.join(' ') as OriginPosition;

    if (!wasOverlapping && doOriginsOverlap(updatedAnchorOrigin, updatedTransformOrigin)) {
        const revertedAnchorParts = [...anchorParts];
        revertedAnchorParts[axis] = flipOriginKeyword(anchorParts[axis], target, opposite);
        updatedAnchorOrigin = revertedAnchorParts.join(' ') as OriginPosition;
    }

    return {
        anchorOrigin: updatedAnchorOrigin,
        transformOrigin: updatedTransformOrigin,
    };
}

const resolveOverflowingOrigins = (
    anchorOrigin: OriginPosition,
    transformOrigin: OriginPosition,
    overflowState: OverflowState,
) => {
    const { isOverflowingTop, isOverflowingBottom, isOverflowingLeft, isOverflowingRight } = overflowState;

    let updatedAnchorOrigin = anchorOrigin;
    let updatedTransformOrigin = transformOrigin;

    if (isOverflowingBottom || isOverflowingTop) {
        const [target, opposite] = isOverflowingBottom ? ['bottom', 'top'] : ['top', 'bottom'];

        const { anchorOrigin: resolvedAnchorOrigin, transformOrigin: resolvedTransformOrigin } = resolveAxisOverflow(
            updatedAnchorOrigin,
            updatedTransformOrigin,
            0,
            target,
            opposite,
        );
        updatedAnchorOrigin = resolvedAnchorOrigin;
        updatedTransformOrigin = resolvedTransformOrigin;
    }

    if (isOverflowingRight || isOverflowingLeft) {
        const [target, opposite] = isOverflowingRight ? ['right', 'left'] : ['left', 'right'];

        const { anchorOrigin: resolvedAnchorOrigin, transformOrigin: resolvedTransformOrigin } = resolveAxisOverflow(
            updatedAnchorOrigin,
            updatedTransformOrigin,
            1,
            target,
            opposite,
        );
        updatedAnchorOrigin = resolvedAnchorOrigin;
        updatedTransformOrigin = resolvedTransformOrigin;
    }

    return {
        anchorOrigin: updatedAnchorOrigin,
        transformOrigin: updatedTransformOrigin,
    };
};

function getAxisOverflowState(overflowState: OverflowState, axis: 'vertical' | 'horizontal'): OverflowState {
    if (axis === 'vertical') {
        return {
            ...NO_OVERFLOW_STATE,
            isOverflowing: overflowState.isOverflowingTop || overflowState.isOverflowingBottom,
            isOverflowingTop: overflowState.isOverflowingTop,
            isOverflowingBottom: overflowState.isOverflowingBottom,
        };
    }

    return {
        ...NO_OVERFLOW_STATE,
        isOverflowing: overflowState.isOverflowingLeft || overflowState.isOverflowingRight,
        isOverflowingLeft: overflowState.isOverflowingLeft,
        isOverflowingRight: overflowState.isOverflowingRight,
    };
}

// Flips `candidate`'s origins on the given axis when doing so scores lower (less overflow).
// Keeps `candidate` unchanged when that axis isn't overflowing, or when flipping doesn't help.
function pickBetterOrigins(
    rect: DOMRect,
    popupSize: { width: number; height: number } | undefined,
    viewportElement: HTMLElement | null,
    candidateOrigins: OriginPair,
    axisOverflow: OverflowState,
): OriginPair {
    if (!axisOverflow.isOverflowing) {
        return candidateOrigins;
    }

    const flippedOrigins = resolveOverflowingOrigins(
        candidateOrigins.anchorOrigin,
        candidateOrigins.transformOrigin,
        axisOverflow,
    );

    const currentScore = getOverflowScore(rect, popupSize, viewportElement, candidateOrigins);
    const flippedScore = getOverflowScore(rect, popupSize, viewportElement, flippedOrigins);

    return flippedScore < currentScore ? flippedOrigins : candidateOrigins;
}

/**
 * Picks the anchor/transform origin pair that overflows least, trying flips in sequence:
 * horizontal first, then vertical on top of whichever origins that left us with. Each flip is
 * only kept if it actually reduces overflow, so a single-axis overflow naturally results in
 * only the relevant axis flipping.
 */
function getBestOriginPosition(
    rect: DOMRect,
    popupSize: { width: number; height: number } | undefined,
    viewportElement: HTMLElement | null,
    anchorOrigin: OriginPosition,
    transformOrigin: OriginPosition,
    overflowState: OverflowState,
): OriginPair {
    const original: OriginPair = { anchorOrigin, transformOrigin };

    const horizontallyResolvedOrigins = pickBetterOrigins(
        rect,
        popupSize,
        viewportElement,
        original,
        getAxisOverflowState(overflowState, 'horizontal'),
    );

    return pickBetterOrigins(
        rect,
        popupSize,
        viewportElement,
        horizontallyResolvedOrigins,
        getAxisOverflowState(overflowState, 'vertical'),
    );
}

export function getPopupOriginPosition(
    rect: DOMRect,
    popupSize: { width: number; height: number } | undefined,
    viewportElement: HTMLElement | null,
    anchorOrigin: OriginPosition,
    transformOrigin: OriginPosition,
) {
    const overflowState = getOverflowState(rect, viewportElement, {
        anchorOrigin,
        transformOrigin,
        popupSize,
    });

    if (!overflowState.isOverflowing) {
        return { anchorOrigin, transformOrigin };
    }

    const bestOrigins = getBestOriginPosition(
        rect,
        popupSize,
        viewportElement,
        anchorOrigin,
        transformOrigin,
        overflowState,
    );

    return bestOrigins;
}

const originalPopupMargins = new WeakMap<HTMLElement, { top: string; bottom: string; left: string; right: string }>();

function getOriginAxisKeyword(origin: OriginPosition, axis: 0 | 1): string {
    return origin.trim().split(' ')[axis];
}

export function handleBoundaryStyling(
    overflowState: OverflowState,
    origins: { original: OriginPair; resolved: OriginPair },
    popupElement?: HTMLElement | null,
) {
    const { isOverflowingTop, isOverflowingBottom, isOverflowingLeft, isOverflowingRight } = overflowState;

    if (!popupElement) return;

    let originalMargin = originalPopupMargins.get(popupElement);

    if (!originalMargin) {
        const { marginTop, marginBottom, marginLeft, marginRight } = getComputedStyle(popupElement);
        originalMargin = {
            top: marginTop,
            bottom: marginBottom,
            left: marginLeft,
            right: marginRight,
        };
        originalPopupMargins.set(popupElement, originalMargin);
    }

    const flippedVertical =
        getOriginAxisKeyword(origins.original.transformOrigin, 0) !==
        getOriginAxisKeyword(origins.resolved.transformOrigin, 0);
    const flippedHorizontal =
        getOriginAxisKeyword(origins.original.transformOrigin, 1) !==
        getOriginAxisKeyword(origins.resolved.transformOrigin, 1);

    popupElement.style.marginBottom =
        flippedVertical && isOverflowingTop ? `-${originalMargin.bottom}` : originalMargin.bottom;
    popupElement.style.marginTop =
        flippedVertical && isOverflowingBottom ? `-${originalMargin.top}` : originalMargin.top;
    popupElement.style.marginRight =
        flippedHorizontal && isOverflowingLeft ? `-${originalMargin.right}` : originalMargin.right;
    popupElement.style.marginLeft =
        flippedHorizontal && isOverflowingRight ? `-${originalMargin.left}` : originalMargin.left;
}
