import type { MouseEvent } from 'react';

const KEEPS_OWN_DEFAULT = [
    'a[href]',
    'area[href]',
    'button:enabled',
    'input:enabled',
    'select:enabled',
    'textarea:enabled',
    'label',
    'summary',
    'iframe',
    'object',
    'embed',
    'audio[controls]',
    'video[controls]',
    '[contenteditable]:not([contenteditable="false"])',
    '[tabindex]:not(:disabled)',
    '[draggable="true"]',
    '[data-selectable]',
].join(', ');

// A native scrollbar press targets the scrollable element itself and lands in the gutter, outside
// its client box. clientLeft/clientTop absorb that gutter when the scrollbar sits on the leading
// edge, as a vertical one does under RTL, so the client box is located the same way either way.
const isScrollbarPress = (event: MouseEvent<HTMLElement>, target: Element) => {
    const rect = target.getBoundingClientRect();
    const x = event.clientX - rect.left - target.clientLeft;
    const y = event.clientY - rect.top - target.clientTop;

    return (target.scrollHeight > target.clientHeight && (x < 0 || x >= target.clientWidth))
        || (target.scrollWidth > target.clientWidth && (y < 0 || y >= target.clientHeight));
};

// A press on anything else would blur to the body, losing the keyboard handling on whatever opened
// the popup, and letting an enclosing focus trap reclaim focus to its own first field and scroll to it.
export function preserveFocusOnPress(event: MouseEvent<HTMLElement>) {
    const { currentTarget } = event;
    const target = event.target as Element;

    if (event.button !== 0) {
        return;
    }

    // React bubbles a portalled popup's events on through the component tree, so a press inside a
    // nested popup reaches this handler too. That popup has already decided for its own content.
    if (!currentTarget.contains(target)) {
        return;
    }

    if (isScrollbarPress(event, target)) {
        return;
    }

    for (let node: Element | null = target; node && node !== currentTarget; node = node.parentElement) {
        if (node.matches(KEEPS_OWN_DEFAULT)) {
            return;
        }
    }

    event.preventDefault();
}
