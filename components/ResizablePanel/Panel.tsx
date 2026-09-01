import { useCallback, useContext } from 'react';

import styles from './styles.module.scss';
import type { PanelProps } from './types';
import { PanelIndexContext, usePanelGroupContext } from './PanelGroupContext';
import cs from '../../cs';

const Panel: React.FC<PanelProps> = (props) => {
    const { children, className, style, ref, ...otherProps } = props;

    const index = useContext(PanelIndexContext);
    const { registerPanel, getPanelId } = usePanelGroupContext();

    const setRef = useCallback(
        (el: HTMLDivElement | null) => {
            registerPanel(index, el);

            if (typeof ref === 'function') {
                ref(el);
            } else if (ref) {
                ref.current = el;
            }
        },
        [index, ref, registerPanel],
    );

    return (
        <div
            {...otherProps}
            id={getPanelId(index)}
            ref={setRef}
            className={cs(styles.panel, className)}
            style={style}
        >
            {children}
        </div>
    );
};

Panel.displayName = 'Panel';

export default Panel;
