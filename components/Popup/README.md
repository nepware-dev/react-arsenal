## Popup positioning

A popup is placed relative to an `anchor` element using two origins: `anchorOrigin`
picks the point on the anchor to position from, and `transformOrigin` picks the
point on the popup that gets placed there. Both take a `"<vertical>
<horizontal>"` pair (`top | center | bottom` and `left | center | right`).

```jsx
const anchorRef = useRef(null);

<button ref={anchorRef}>Open</button>
<Popup
    anchor={anchorRef}
    anchorOrigin="bottom left"
    transformOrigin="top left"
    onClose={() => setOpen(false)}
>
    Menu content
</Popup>;
```

`anchorOrigin="bottom left"` + `transformOrigin="top left"` anchors the popup's
top-left corner to the anchor's bottom-left corner — the popup drops down
below the anchor, left-aligned. Both default to `"bottom right"`.

### Portal target

The popup renders through a `Portal`, not inline. Where it portals to is
resolved in order:

1. `container`, if provided
2. the closest scrollable overflow ancestor of the anchor, if
   `useOverflowAncestor` is true
3. `document.body`

That target also doubles as the boundary the popup is kept inside of (see
below) — pass `container` explicitly when the popup should stay clipped to a
scrollable panel rather than the whole viewport.

### Keeping the popup on screen

Position isn't just the static `anchorOrigin`/`transformOrigin` calculation —
after every anchor/size change, the popup checks whether it would overflow
the browser viewport and the portal container, and picks better origins if
so:

- **No overflow:** use `anchorOrigin`/`transformOrigin` as given.
- **Overflowing on one axis only** (e.g. it runs past the bottom edge but not
  left/right): flip that axis to its opposite side (`bottom` ↔ `top`, `left`
  ↔ `right`) and keep the flip only if it actually reduces overflow —
  otherwise fall back to the original origins.
- **Overflowing on both axes:** try progressively more flipped candidates,
  scoring each by how far it overflows the boundaries, and keep the
  best-scoring one so far:
  1. Start with the given `anchorOrigin`/`transformOrigin` as the current
     best candidate.
  2. Flip its horizontal side (`left` ↔ `right`) and score the result. If
     that scores better, it replaces the current best candidate; otherwise
     the unflipped pair is kept.
  3. Take the current best candidate and additionally flip its vertical side
     (`top` ↔ `bottom`), then score that. If it scores better, it becomes
     the new best candidate.
  4. Use whichever pair of origins ended up best after both steps — even if
     it still overflows somewhat, it's the least-bad option tried.

Flipping an axis swaps both origins on that axis together, since flipping
only one would move the popup somewhere unrelated to the anchor. If the
anchor origin is already on the side being flipped to (or centered), it's
pushed to the *opposite* side instead of left alone, so it doesn't end up
stacked on top of the transform origin.

When the chosen position still overflows, the popup's margin on the
overflowing side(s) is negated so it hugs that edge instead of spilling past
it.
