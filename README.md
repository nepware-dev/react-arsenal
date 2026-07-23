# @nepware/react-arsenal

Shared React component and utility library.

## Installation

```sh
npm install @nepware/react-arsenal
# or
pnpm add @nepware/react-arsenal
```

Peer dependencies: `react >=18`, `react-dom >=18`, and optionally `react-router-dom ^5`.

## Usage

Everything is imported by subpath so bundlers only pull in what you use:

```jsx
import Dropdown from '@nepware/react-arsenal/components/Dropdown';
import Modal from '@nepware/react-arsenal/components/Modal';
import { defaultLocalizer } from '@nepware/react-arsenal/components/I18n';
```

## Styling

Component styles are pre-compiled with scoped class names baked into the shipped
JS, and emitted as plain `.css` files. There are two ways to consume them, and
they are not mutually exclusive.

### 1. Automatic (default, zero-config)

Each component's dist module side-effect-imports its own compiled stylesheet, so
just importing a component pulls in its CSS. No bundler configuration is needed
with Vite, webpack, or any bundler that follows the `sideEffects` field. This is
the recommended mode for standard client bundling and keeps the CSS payload
scoped to the components you actually use.

### 2. Aggregated stylesheet (SSR / RSC / test environments)

For environments that do not evaluate the side-effect CSS imports (some
server-side rendering, React Server Components, or test setups), import the
single aggregated stylesheet once at your app root:

```js
import '@nepware/react-arsenal/styles.css';
```

This ships every component's compiled styles in one file. The class names match
the shipped JS verbatim, so no re-scoping or CSS-module handling is required.
