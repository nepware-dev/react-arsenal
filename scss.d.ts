// Ambient types for SCSS-module imports (e.g. `import styles from './styles.module.scss'`).
declare module '*.module.scss' {
    const classes: { readonly [key: string]: string };
    export default classes;
}

declare module '*.module.css' {
    const classes: { readonly [key: string]: string };
    export default classes;
}
