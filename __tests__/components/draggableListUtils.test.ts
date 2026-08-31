import { describe, expect, it } from 'vitest';

import {
    buildAddChange,
    edgeScrollVelocity,
    findIndexIn,
    isPastTargetMidpoint,
    moveItem,
    buildRemoveChange,
    buildReorderChange,
    resolveHostedOrder,
    resolveReorder,
} from '../../components/DraggableList/utils';

type Item = { id: string; section?: string };

const items = (...ids: string[]): Item[] => ids.map((id) => ({ id }));
const keyExtractor = (item: Item) => item.id;
const ids = (list: Item[] | null) => list?.map((item) => item.id) ?? null;
const allDraggable = () => true;

const policy = (over: Partial<Parameters<typeof resolveReorder<Item>>[3]> = {}) => ({
    keyExtractor,
    isDraggable: allDraggable,
    isPastMidpoint: null as boolean | null,
    ...over,
});

const box = (left: number, top: number, width: number, height: number) =>
    ({ left, top, width, height, right: left + width, bottom: top + height }) as DOMRect;

describe('moveItem', () => {
    it('moves forwards', () => {
        expect(ids(moveItem(items('a', 'b', 'c'), 0, 2))).toEqual(['b', 'c', 'a']);
    });

    it('moves backwards', () => {
        expect(ids(moveItem(items('a', 'b', 'c'), 2, 0))).toEqual(['c', 'a', 'b']);
    });

    it('leaves the source list alone', () => {
        const list = items('a', 'b');
        moveItem(list, 0, 1);

        expect(ids(list)).toEqual(['a', 'b']);
    });
});

describe('findIndexIn', () => {
    it('finds by key', () => {
        expect(findIndexIn(items('a', 'b'), 'b', keyExtractor)).toBe(1);
    });

    it('reports a missing key as -1', () => {
        expect(findIndexIn(items('a'), 'z', keyExtractor)).toBe(-1);
    });
});

describe('isPastTargetMidpoint', () => {
    it('reads the horizontal half when the pointer is furthest from centre on x', () => {
        const rect = box(0, 0, 100, 100);

        expect(isPastTargetMidpoint(rect, 90, 55)).toBe(true);
        expect(isPastTargetMidpoint(rect, 10, 55)).toBe(false);
    });

    it('reads the vertical half when the pointer is furthest from centre on y', () => {
        const rect = box(0, 0, 100, 100);

        expect(isPastTargetMidpoint(rect, 55, 90)).toBe(true);
        expect(isPastTargetMidpoint(rect, 55, 10)).toBe(false);
    });

    it('picks the axis independently of the box shape', () => {
        // A wide, short row: a pointer near the right edge is horizontally past
        // centre even while it sits a few pixels below the vertical middle.
        expect(isPastTargetMidpoint(box(0, 0, 400, 40), 380, 25)).toBe(true);
    });

    it('has no answer for an unmeasurable box', () => {
        expect(isPastTargetMidpoint(box(0, 0, 0, 0), 5, 5)).toBeNull();
    });
});

describe('edgeScrollVelocity', () => {
    // A 400x300 box at the origin, with zones well clear of each other.
    const rect = box(0, 0, 400, 300);
    const scrollPolicy = { threshold: 50, maxSpeed: 10 };
    const velocityAt = (clientX: number, clientY: number) =>
        edgeScrollVelocity(rect, clientX, clientY, scrollPolicy);

    it('stays still in the middle of the box', () => {
        expect(velocityAt(200, 150)).toEqual({ x: 0, y: 0 });
    });

    it('runs at full speed at each edge, towards it', () => {
        expect(velocityAt(200, 0).y).toBe(-10);
        expect(velocityAt(200, 300).y).toBe(10);
        expect(velocityAt(0, 150).x).toBe(-10);
        expect(velocityAt(400, 150).x).toBe(10);
    });

    it('ramps in proportion to the depth into the zone', () => {
        expect(velocityAt(200, 25).y).toBe(-5);
        expect(velocityAt(200, 40).y).toBeCloseTo(-2);
        expect(velocityAt(200, 275).y).toBe(5);
        expect(velocityAt(10, 150).x).toBe(-8);
    });

    it('holds still at the inner boundary of a zone', () => {
        expect(velocityAt(200, 50)).toEqual({ x: 0, y: 0 });
        expect(velocityAt(50, 150)).toEqual({ x: 0, y: 0 });
        expect(velocityAt(200, 250)).toEqual({ x: 0, y: 0 });
    });

    it('scrolls both axes at once in a corner', () => {
        expect(velocityAt(0, 0)).toEqual({ x: -10, y: -10 });
        expect(velocityAt(400, 300)).toEqual({ x: 10, y: 10 });
    });

    it('reads each axis independently of the other', () => {
        // Deep in the left zone, but nowhere near the top or bottom.
        expect(velocityAt(25, 150)).toEqual({ x: -5, y: 0 });
    });

    it('stays still once the pointer leaves the box', () => {
        expect(velocityAt(200, -20)).toEqual({ x: 0, y: 0 });
        expect(velocityAt(-20, 150)).toEqual({ x: 0, y: 0 });
        expect(velocityAt(200, 400)).toEqual({ x: 0, y: 0 });
        expect(velocityAt(500, 150)).toEqual({ x: 0, y: 0 });
    });

    it('halves the zones of an axis too short to hold both', () => {
        // 60px tall against a 50px threshold: the zones meet at the centre
        // rather than overlapping, so the midpoint is still neutral.
        const shortRect = box(0, 0, 400, 60);

        expect(edgeScrollVelocity(shortRect, 200, 30, scrollPolicy).y).toBe(0);
        expect(edgeScrollVelocity(shortRect, 200, 15, scrollPolicy).y).toBe(-5);
        expect(edgeScrollVelocity(shortRect, 200, 45, scrollPolicy).y).toBe(5);
    });

    it('has no velocity for an unmeasurable box', () => {
        expect(edgeScrollVelocity(box(0, 0, 0, 0), 0, 0, scrollPolicy)).toEqual({ x: 0, y: 0 });
    });
});

describe('resolveReorder', () => {
    it('moves the item onto the target', () => {
        expect(ids(resolveReorder(items('a', 'b', 'c'), 'a', 'c', policy()))).toEqual([
            'b',
            'c',
            'a',
        ]);
    });

    it('refuses a move onto itself', () => {
        expect(resolveReorder(items('a', 'b'), 'a', 'a', policy())).toBeNull();
    });

    it('refuses a key that is not in the order', () => {
        expect(resolveReorder(items('a', 'b'), 'a', 'z', policy())).toBeNull();
        expect(resolveReorder(items('a', 'b'), 'z', 'a', policy())).toBeNull();
    });

    it('refuses an inert target, so a pinned item keeps its place', () => {
        const isDraggable = (item: Item) => item.id !== 'a';

        expect(resolveReorder(items('a', 'b', 'c'), 'c', 'a', policy({ isDraggable }))).toBeNull();
    });

    it('refuses to cross a section boundary', () => {
        const list: Item[] = [
            { id: 'a', section: 'one' },
            { id: 'b', section: 'two' },
        ];
        const sectionExtractor = (item: Item) => item.section;

        expect(resolveReorder(list, 'a', 'b', policy({ sectionExtractor }))).toBeNull();
    });

    it('allows a move within one section', () => {
        const list: Item[] = [
            { id: 'a', section: 'one' },
            { id: 'b', section: 'one' },
        ];
        const sectionExtractor = (item: Item) => item.section;

        expect(ids(resolveReorder(list, 'a', 'b', policy({ sectionExtractor })))).toEqual([
            'b',
            'a',
        ]);
    });

    describe('swap threshold', () => {
        const list = items('a', 'b', 'c');

        it('takes a forward move once the pointer is past the target centre', () => {
            expect(ids(resolveReorder(list, 'a', 'c', policy({ isPastMidpoint: true })))).toEqual([
                'b',
                'c',
                'a',
            ]);
        });

        it('holds a forward move back while the pointer is still short of centre', () => {
            expect(resolveReorder(list, 'a', 'c', policy({ isPastMidpoint: false }))).toBeNull();
        });

        it('takes a backward move once the pointer is before the target centre', () => {
            expect(ids(resolveReorder(list, 'c', 'a', policy({ isPastMidpoint: false })))).toEqual([
                'c',
                'a',
                'b',
            ]);
        });

        it('holds a backward move back while the pointer is still past centre', () => {
            expect(resolveReorder(list, 'c', 'a', policy({ isPastMidpoint: true }))).toBeNull();
        });

        it('ignores the threshold when the target could not be measured', () => {
            expect(ids(resolveReorder(list, 'a', 'c', policy({ isPastMidpoint: null })))).toEqual([
                'b',
                'c',
                'a',
            ]);
        });
    });
});

describe('resolveHostedOrder', () => {
    const arriving: Item = { id: 'x' };
    const hostPolicy = { keyExtractor, isDraggable: allDraggable };

    it('inserts before the hovered target', () => {
        const result = resolveHostedOrder(items('a', 'b'), arriving, 'x', 'b', hostPolicy);

        expect(result).toMatchObject({ accepted: true });
        expect(ids(result.accepted ? result.order : null)).toEqual(['a', 'x', 'b']);
    });

    it('parks at the end for a null target', () => {
        const result = resolveHostedOrder(items('a', 'b'), arriving, 'x', null, hostPolicy);

        expect(ids(result.accepted ? result.order : null)).toEqual(['a', 'b', 'x']);
    });

    it('leaves an item it already holds in place for a null target', () => {
        const held = [{ id: 'a' }, arriving, { id: 'b' }];
        const result = resolveHostedOrder(held, arriving, 'x', null, hostPolicy);

        expect(result).toEqual({ accepted: true, order: null });
    });

    it('accepts into an empty list', () => {
        const result = resolveHostedOrder([], arriving, 'x', null, hostPolicy);

        expect(ids(result.accepted ? result.order : null)).toEqual(['x']);
    });

    it('moves an item it already holds rather than inserting a second copy', () => {
        const held = [{ id: 'a' }, arriving, { id: 'b' }];
        const result = resolveHostedOrder(held, arriving, 'x', 'a', hostPolicy);

        expect(ids(result.accepted ? result.order : null)).toEqual(['x', 'a', 'b']);
    });

    it('reports no work when the item already sits at the target', () => {
        const held = [{ id: 'a' }, arriving];
        const result = resolveHostedOrder(held, arriving, 'x', 'x', hostPolicy);

        expect(result).toEqual({ accepted: true, order: null });
    });

    it('rejects an inert target, leaving the caller to park it', () => {
        const isDraggable = (item: Item) => item.id !== 'a';
        const result = resolveHostedOrder(items('a', 'b'), arriving, 'x', 'a', {
            keyExtractor,
            isDraggable,
        });

        expect(result).toEqual({ accepted: false });
    });

    it('rejects a target that is not in the order', () => {
        const result = resolveHostedOrder(items('a'), arriving, 'x', 'z', hostPolicy);

        expect(result).toEqual({ accepted: false });
    });
});

describe('buildRemoveChange', () => {
    it('reports the item leaving and the data without it', () => {
        expect(buildRemoveChange(items('a', 'b', 'c'), 'b', keyExtractor)).toEqual({
            action: 'remove',
            data: [{ id: 'a' }, { id: 'c' }],
            item: { id: 'b' },
            from: 1,
        });
    });

    it('reports nothing for a key the list does not hold', () => {
        expect(buildRemoveChange(items('a'), 'z', keyExtractor)).toBeNull();
    });
});

describe('buildReorderChange', () => {
    const data = items('a', 'b', 'c');

    it('reports the move against the committed order', () => {
        const order = items('b', 'c', 'a');

        expect(buildReorderChange(data, order, 'a', keyExtractor)).toEqual({
            action: 'reorder',
            data: order,
            item: { id: 'a' },
            from: 0,
            to: 2,
        });
    });

    it('reports nothing when the item ended where it started', () => {
        expect(buildReorderChange(data, items('a', 'b', 'c'), 'a', keyExtractor)).toBeNull();
    });

    it('reports nothing when the item is missing from either order', () => {
        expect(buildReorderChange(data, items('a', 'b'), 'c', keyExtractor)).toBeNull();
        expect(buildReorderChange(items('a'), data, 'c', keyExtractor)).toBeNull();
    });
});

describe('buildAddChange', () => {
    it('carries the index the item left and the one it arrived at', () => {
        const order = items('a', 'x', 'b');

        expect(buildAddChange(order, 1, 4)).toEqual({
            action: 'add',
            data: order,
            item: { id: 'x' },
            from: 4,
            to: 1,
        });
    });
});
